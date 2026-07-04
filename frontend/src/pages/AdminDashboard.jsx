import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import {
  Calendar,
  Users,
  Clock,
  Trash2,
  AlertTriangle,
  Loader2,
  TrendingUp,
  Sliders,
  Search,
  Plus,
  Landmark,
} from 'lucide-react';

const formatTime12h = (time24) => {
  if (!time24) return '';
  const [hourStr, minStr] = time24.split(':');
  const hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minStr} ${ampm}`;
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('reservations');
  const [stats, setStats] = useState({
    todayReservations: 0,
    upcomingReservations: 0,
    cancelledReservations: 0,
    totalCustomers: 0,
    totalTables: 0,
    occupancyPercentage: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Reservations State
  const [bookings, setBookings] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Tables State
  const [tables, setTables] = useState([]);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState('2');
  const [addingTable, setAddingTable] = useState(false);
  const [tableError, setTableError] = useState('');
  const [loadingTables, setLoadingTables] = useState(true);

  // Load stats
  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await axiosClient.get('/api/v1/admin/stats');
      if (res.success) setStats(res.data);
    } catch (err) {
      console.error('[Admin] Error fetching stats:', err.message);
    } finally {
      setLoadingStats(false);
    }
  };

  // Load bookings
  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);
      const params = {
        page,
        limit: 8,
        search,
        status: statusFilter,
      };
      if (dateFilter) {
        params.date = dateFilter;
      }
      const res = await axiosClient.get('/api/v1/admin/reservations', { params });
      if (res.success) {
        setBookings(res.data.items);
        setTotalPages(res.data.pagination.totalPages);
        setTotalItems(res.data.pagination.totalItems);
      }
    } catch (err) {
      console.error('[Admin] Error fetching bookings:', err.message);
    } finally {
      setLoadingBookings(false);
    }
  };

  // Load tables
  const fetchTables = async () => {
    try {
      setLoadingTables(true);
      const res = await axiosClient.get('/api/v1/tables');
      if (res.success) setTables(res.data);
    } catch (err) {
      console.error('[Admin] Error fetching tables:', err.message);
    } finally {
      setLoadingTables(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'reservations') {
      fetchBookings();
    } else if (activeTab === 'tables') {
      fetchTables();
    }
  }, [activeTab, page, statusFilter, dateFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBookings();
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const res = await axiosClient.patch(`/api/v1/admin/reservations/${id}/cancel`);
      if (res.success) {
        alert('Booking cancelled successfully.');
        fetchBookings();
        fetchStats();
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel booking.');
    }
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    setTableError('');
    setAddingTable(true);
    try {
      const res = await axiosClient.post('/api/v1/tables', {
        tableNumber: parseInt(newTableNumber, 10),
        capacity: parseInt(newTableCapacity, 10),
      });
      if (res.success) {
        alert(`Table ${res.data.tableNumber} added successfully.`);
        setNewTableNumber('');
        fetchTables();
        fetchStats();
      }
    } catch (err) {
      setTableError(err.message || 'Failed to add table.');
    } finally {
      setAddingTable(false);
    }
  };

  const handleDeleteTable = async (id) => {
    if (!window.confirm('Are you sure you want to delete this table?')) return;
    try {
      const res = await axiosClient.delete(`/api/v1/tables/${id}`);
      if (res.success) {
        alert('Table deleted successfully.');
        fetchTables();
        fetchStats();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete table.');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    });
  };

  return (
    <div className="space-y-10">
      
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">Admin Dashboard</h1>
        <p className="text-slate-450 mt-1">Real-time statistics dashboard, scheduling overrides, and restaurant configuration manager.</p>
      </div>

      {/* Analytics Statistics Panel Grid */}
      {loadingStats ? (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-slate-900 h-24 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          
          {/* Card: Today's Bookings */}
          <div className="bg-slate-900 border border-slate-900 p-4 rounded-xl flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-450 uppercase tracking-wider">Today's Bookings</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold text-white">{stats.todayReservations}</span>
              <Calendar className="h-4 w-4 text-violet-400" />
            </div>
          </div>

          {/* Card: Upcoming Bookings */}
          <div className="bg-slate-900 border border-slate-900 p-4 rounded-xl flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-450 uppercase tracking-wider">Upcoming Bookings</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold text-white">{stats.upcomingReservations}</span>
              <Clock className="h-4 w-4 text-indigo-400" />
            </div>
          </div>

          {/* Card: Cancelled */}
          <div className="bg-slate-900 border border-slate-900 p-4 rounded-xl flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-450 uppercase tracking-wider">Cancellations</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold text-white">{stats.cancelledReservations}</span>
              <Trash2 className="h-4 w-4 text-red-400" />
            </div>
          </div>

          {/* Card: Customers */}
          <div className="bg-slate-900 border border-slate-900 p-4 rounded-xl flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-450 uppercase tracking-wider">Total Customers</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold text-white">{stats.totalCustomers}</span>
              <Users className="h-4 w-4 text-purple-400" />
            </div>
          </div>

          {/* Card: Tables */}
          <div className="bg-slate-900 border border-slate-900 p-4 rounded-xl flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-450 uppercase tracking-wider">Total Tables</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold text-white">{stats.totalTables}</span>
              <Landmark className="h-4 w-4 text-emerald-400" />
            </div>
          </div>

          {/* Card: Occupancy today */}
          <div className="bg-slate-900 border border-slate-900 p-4 rounded-xl flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-450 uppercase tracking-wider">Occupancy Today</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold text-white">{stats.occupancyPercentage}%</span>
              <TrendingUp className="h-4 w-4 text-cyan-400" />
            </div>
          </div>

        </div>
      )}

      {/* Tabs Menu Controller */}
      <div className="flex border-b border-slate-900 space-x-8">
        <button
          onClick={() => setActiveTab('reservations')}
          className={`pb-4 text-sm font-semibold tracking-wide border-b-2 transition ${
            activeTab === 'reservations'
              ? 'border-violet-500 text-white'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Reservations Manager
        </button>
        <button
          onClick={() => setActiveTab('tables')}
          className={`pb-4 text-sm font-semibold tracking-wide border-b-2 transition ${
            activeTab === 'tables'
              ? 'border-violet-500 text-white'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Restaurant Tables Configuration
        </button>
      </div>

      {/* Tab Contents: Reservations Manager */}
      {activeTab === 'reservations' && (
        <div className="space-y-6">
          
          {/* Filters and search Form block */}
          <form onSubmit={handleSearchSubmit} className="bg-slate-900 border border-slate-900 p-4 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-4 items-end shadow-md">
            
            {/* Search customer Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Search Client</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Name or Email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-805 text-white pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:border-violet-500 transition"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              </div>
            </div>

            {/* Date Picker Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Date Filter</label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-805 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-violet-500 transition"
              />
            </div>

            {/* Status Dropdown Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Status Filter</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-805 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-violet-500 transition"
              >
                <option value="">All statuses</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="PENDING">PENDING</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>

            {/* Search Trigger buttons */}
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-grow flex items-center justify-center space-x-1.5 bg-violet-650 hover:bg-violet-600 text-white font-semibold py-2 rounded-lg text-sm transition"
              >
                <span>Search</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setDateFilter('');
                  setStatusFilter('');
                  setPage(1);
                }}
                className="px-4 py-2 border border-slate-800 hover:border-slate-700 text-slate-350 hover:text-white rounded-lg text-sm font-semibold transition"
              >
                Clear
              </button>
            </div>

          </form>

          {/* Bookings listing table panels */}
          <div className="bg-slate-900 border border-slate-900 rounded-xl overflow-hidden shadow-lg">
            
            {loadingBookings ? (
              <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-violet-400" /></div>
            ) : bookings.length === 0 ? (
              <p className="text-slate-500 py-16 text-center">No reservations match search criteria.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-900 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                      <th className="px-6 py-4">Client Details</th>
                      <th className="px-6 py-4">Table Alloc</th>
                      <th className="px-6 py-4">Reserved Date</th>
                      <th className="px-6 py-4">Schedules Window</th>
                      <th className="px-6 py-4">Guests</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Overrides</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-sm">
                    {bookings.map((booking) => (
                      <tr key={booking._id} className="hover:bg-slate-850/30 transition duration-150">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-100">{booking.customer?.name || 'Deleted Customer'}</div>
                          <div className="text-xs text-slate-450">{booking.customer?.email || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-300">Table {booking.table?.tableNumber || 'Deleted'}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-300">{formatDate(booking.reservationDate)}</td>
                        <td className="px-6 py-4 font-medium text-slate-300">{formatTime12h(booking.startTime)} - {formatTime12h(booking.endTime)}</td>
                        <td className="px-6 py-4 text-slate-300">{booking.numberOfGuests} Guests</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${
                            booking.status === 'CONFIRMED'
                              ? 'bg-violet-500/10 text-violet-450 border-violet-500/20'
                              : booking.status === 'CANCELLED'
                              ? 'bg-red-550/10 text-red-400 border-red-550/20'
                              : 'bg-slate-800 text-slate-450 border-slate-700'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
                            <button
                              onClick={() => handleCancelBooking(booking._id)}
                              className="text-red-400 hover:text-red-300 border border-red-550/10 hover:border-red-550/30 bg-red-550/5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition"
                            >
                              Force Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls Footer */}
            {!loadingBookings && totalPages > 1 && (
              <div className="bg-slate-950 px-6 py-4 border-t border-slate-900 flex items-center justify-between">
                <span className="text-xs text-slate-400">Showing page {page} of {totalPages} ({totalItems} total bookings)</span>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="px-3 py-1.5 border border-slate-800 hover:border-slate-700 disabled:opacity-40 text-slate-350 hover:text-white rounded-lg text-xs font-semibold transition"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    className="px-3 py-1.5 border border-slate-800 hover:border-slate-700 disabled:opacity-40 text-slate-350 hover:text-white rounded-lg text-xs font-semibold transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* Tab Contents: Restaurant Tables */}
      {activeTab === 'tables' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Add physical Table Form card */}
          <div className="bg-slate-900 border border-slate-900 p-6 rounded-2xl shadow-lg h-fit space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Plus className="h-5 w-5 text-violet-400" />
              <span>Add Dining Table</span>
            </h2>

            {tableError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-450 p-4 rounded-xl flex items-start space-x-2 text-sm">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-400" />
                <span>{tableError}</span>
              </div>
            )}

            <form onSubmit={handleAddTable} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Table Number</label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 16"
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-805 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-violet-500 transition text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Seating Capacity</label>
                <select
                  value={newTableCapacity}
                  onChange={(e) => setNewTableCapacity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-805 text-white px-3 py-2.5 rounded-lg focus:outline-none focus:border-violet-500 transition text-sm"
                >
                  <option value="2">2 Guests</option>
                  <option value="4">4 Guests</option>
                  <option value="6">6 Guests</option>
                  <option value="8">8 Guests</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={addingTable}
                className="w-full flex items-center justify-center bg-violet-650 hover:bg-violet-600 disabled:bg-violet-850 text-white font-semibold py-2.5 rounded-lg text-sm transition shadow-lg shadow-violet-900/35"
              >
                {addingTable ? <Loader2 className="h-5 w-5 animate-spin" /> : <span>Create Table</span>}
              </button>
            </form>
          </div>

          {/* Tables listing view panel */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-900 p-6 rounded-2xl shadow-lg space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Sliders className="h-5 w-5 text-indigo-400" />
              <span>Restaurant Layout Manager</span>
            </h2>

            {loadingTables ? (
              <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-violet-400" /></div>
            ) : tables.length === 0 ? (
              <p className="text-slate-500 py-12 text-center">No tables configured in system layout.</p>
            ) : (
              <div className="divide-y divide-slate-850">
                {tables.map((table) => (
                  <div key={table._id} className="py-3.5 flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-3">
                        <span className="text-white font-extrabold text-base">Table {table.tableNumber}</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full border ${
                          table.isActive
                            ? 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20'
                            : 'bg-slate-800 text-slate-500 border-slate-700'
                        }`}>
                          {table.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-450 mt-0.5">Capacity: {table.capacity} guests limit</div>
                    </div>

                    <button
                      onClick={() => handleDeleteTable(table._id)}
                      className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-550/10 transition border border-transparent hover:border-red-550/10"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
