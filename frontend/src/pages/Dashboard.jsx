import React, { useState, useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../api/axiosClient';
import { AuthContext } from '../contexts/AuthContext';
import { Calendar, Users, Clock, Trash2, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

const bookingSchema = z.object({
  reservationDate: z.string().min(1, 'Date is required.'),
  startTime: z.string().min(1, 'Start time is required.'),
  endTime: z.string().min(1, 'End time is required.'),
  numberOfGuests: z.number().int().min(1, 'Must be at least 1 guest.'),
});

const timeSlots = [];
for (let hour = 11; hour <= 22; hour++) {
  const pad = (num) => String(num).padStart(2, '0');
  timeSlots.push(`${pad(hour)}:00`);
  if (hour < 22) {
    timeSlots.push(`${pad(hour)}:30`);
  }
}

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [loadingLists, setLoadingLists] = useState(true);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      reservationDate: new Date().toISOString().split('T')[0],
      startTime: '18:00',
      endTime: '19:30',
      numberOfGuests: 2,
    },
  });

  const fetchReservations = async () => {
    try {
      setLoadingLists(true);
      const upcomingRes = await axiosClient.get('/api/v1/reservations/upcoming');
      const pastRes = await axiosClient.get('/api/v1/reservations/past');
      if (upcomingRes.success) setUpcoming(upcomingRes.data);
      if (pastRes.success) setPast(pastRes.data);
    } catch (err) {
      console.error('[Dashboard] Error fetching bookings:', err.message);
    } finally {
      setLoadingLists(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleBooking = async (data) => {
    setBookingError('');
    setBookingSuccess('');
    try {
      const response = await axiosClient.post('/api/v1/reservations', data);
      if (response.success) {
        setBookingSuccess(`Table ${response.data.table.tableNumber} booked successfully!`);
        reset();
        fetchReservations();
      }
    } catch (err) {
      setBookingError(err.message || 'No tables available for the selected time.');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      const response = await axiosClient.patch(`/api/v1/reservations/${id}/cancel`);
      if (response.success) {
        alert('Reservation cancelled successfully.');
        fetchReservations();
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel reservation.');
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
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-violet-900/20 to-indigo-900/10 border border-slate-900 p-8 rounded-2xl">
        <h1 className="text-3xl font-extrabold text-white">Hello, {user?.name}!</h1>
        <p className="text-slate-400 mt-1">Book dinner tables or keep track of your reservation schedules below.</p>
      </div>

      {/* Primary Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Reservation Booking Form Card */}
        <div className="bg-slate-900 border border-slate-900 p-6 rounded-2xl shadow-lg space-y-5 h-fit">
          <div className="border-b border-slate-850 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-violet-400" />
              <span>Book a Table</span>
            </h2>
          </div>

          {bookingError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-450 p-4 rounded-xl flex items-start space-x-2 text-sm">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-400" />
              <span>{bookingError}</span>
            </div>
          )}

          {bookingSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 p-4 rounded-xl flex items-start space-x-2 text-sm">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5 text-emerald-400" />
              <span>{bookingSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(handleBooking)} className="space-y-4">
            {/* Date Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-450 uppercase tracking-wider" htmlFor="date">
                Date
              </label>
              <input
                id="date"
                type="date"
                {...register('reservationDate')}
                className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 text-white px-4 py-2.5 rounded-lg focus:outline-none transition text-sm"
              />
              {errors.reservationDate && <span className="text-red-450 text-xs">{errors.reservationDate.message}</span>}
            </div>

            {/* Time Slot Selectors */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-450 uppercase tracking-wider" htmlFor="start">
                  From
                </label>
                <select
                  id="start"
                  {...register('startTime')}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 text-white px-3 py-2.5 rounded-lg focus:outline-none transition text-sm"
                >
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-450 uppercase tracking-wider" htmlFor="end">
                  To
                </label>
                <select
                  id="end"
                  {...register('endTime')}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 text-white px-3 py-2.5 rounded-lg focus:outline-none transition text-sm"
                >
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Guest Count */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-450 uppercase tracking-wider" htmlFor="guests">
                Number of Guests
              </label>
              <input
                id="guests"
                type="number"
                min="1"
                {...register('numberOfGuests', { valueAsNumber: true })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 text-white px-4 py-2.5 rounded-lg focus:outline-none transition text-sm"
              />
              {errors.numberOfGuests && <span className="text-red-450 text-xs">{errors.numberOfGuests.message}</span>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center space-x-2 bg-violet-650 hover:bg-violet-600 disabled:bg-violet-800 text-white font-semibold py-3 rounded-lg transition shadow-lg shadow-violet-900/30"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <span>Confirm Booking</span>
              )}
            </button>
          </form>
        </div>

        {/* Dashboard Lists View */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Upcoming Reservations */}
          <div className="bg-slate-900 border border-slate-900 p-6 rounded-2xl shadow-lg space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Clock className="h-5 w-5 text-indigo-400" />
              <span>Upcoming Bookings</span>
            </h2>

            {loadingLists ? (
              <div className="py-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-violet-400" /></div>
            ) : upcoming.length === 0 ? (
              <p className="text-slate-500 py-4 text-center">No upcoming reservations found.</p>
            ) : (
              <div className="divide-y divide-slate-850">
                {upcoming.map((booking) => (
                  <div key={booking._id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-3">
                        <span className="text-white font-bold text-lg">Table {booking.table.tableNumber}</span>
                        <span className="px-2 py-0.5 bg-violet-500/20 text-violet-400 text-xs border border-violet-500/20 rounded-full">
                          {booking.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-400 text-sm">
                        <span className="flex items-center space-x-1"><Calendar className="h-4 w-4" /> <span>{formatDate(booking.reservationDate)}</span></span>
                        <span className="flex items-center space-x-1"><Clock className="h-4 w-4" /> <span>{booking.startTime} - {booking.endTime}</span></span>
                        <span className="flex items-center space-x-1"><Users className="h-4 w-4" /> <span>{booking.numberOfGuests} Guests</span></span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCancel(booking._id)}
                      className="flex items-center space-x-1 text-red-400 hover:text-red-300 font-semibold text-sm px-3 py-1.5 rounded-lg border border-red-500/10 hover:border-red-500/30 transition bg-red-500/5"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Booking History */}
          <div className="bg-slate-900 border border-slate-900 p-6 rounded-2xl shadow-lg space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-400" />
              <span>Booking History</span>
            </h2>

            {loadingLists ? (
              <div className="py-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-violet-400" /></div>
            ) : past.length === 0 ? (
              <p className="text-slate-500 py-4 text-center">No past booking records available.</p>
            ) : (
              <div className="divide-y divide-slate-850">
                {past.map((booking) => (
                  <div key={booking._id} className="py-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-3">
                        <span className="text-slate-300 font-semibold">Table {booking.table.tableNumber}</span>
                        <span className={`px-2.5 py-0.5 text-xs rounded-full border ${
                          booking.status === 'CANCELLED'
                            ? 'bg-red-550/10 text-red-400 border-red-500/10'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-500 text-xs">
                        <span>{formatDate(booking.reservationDate)}</span>
                        <span>{booking.startTime} - {booking.endTime}</span>
                        <span>{booking.numberOfGuests} Guests</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
