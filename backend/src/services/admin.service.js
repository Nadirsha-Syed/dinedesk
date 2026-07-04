import { Reservation } from '../models/Reservation.js';
import { Table } from '../models/Table.js';
import { User } from '../models/User.js';
import { ApiError } from '../errors/ApiError.js';

const normalizeDate = (dateVal) => {
  const normalized = new Date(dateVal);
  normalized.setUTCHours(0, 0, 0, 0);
  return normalized;
};

/**
 * Gather real-time administration dashboard statistics metrics
 */
export const getDashboardStats = async () => {
  const today = normalizeDate(new Date());

  // Today's active bookings count
  const todayCount = await Reservation.countDocuments({
    reservationDate: today,
    status: { $in: ['PENDING', 'CONFIRMED'] },
  });

  // Upcoming active bookings count
  const upcomingCount = await Reservation.countDocuments({
    reservationDate: { $gt: today },
    status: { $in: ['PENDING', 'CONFIRMED'] },
  });

  // Cancelled bookings count (total historical cancellations)
  const cancelledCount = await Reservation.countDocuments({
    status: 'CANCELLED',
  });

  // Total customer users count
  const customersCount = await User.countDocuments({ role: 'customer' });

  // Total active restaurant tables count
  const totalTables = await Table.countDocuments({ isActive: true });

  // Occupancy rate calculation today: unique booked tables / total active tables
  const uniqueBookedTables = await Reservation.distinct('table', {
    reservationDate: today,
    status: { $in: ['PENDING', 'CONFIRMED'] },
  });

  const occupancyRate = totalTables > 0 ? (uniqueBookedTables.length / totalTables) * 100 : 0;

  return {
    todayReservations: todayCount,
    upcomingReservations: upcomingCount,
    cancelledReservations: cancelledCount,
    totalCustomers: customersCount,
    totalTables,
    occupancyPercentage: Math.round(occupancyRate * 100) / 100, // round to 2 decimals
  };
};

/**
 * Retrieve paginated, searchable, and filtered reservations list
 */
export const getReservationsAdmin = async (queryParams) => {
  const { page = 1, limit = 10, date, status, search } = queryParams;
  const query = {};

  if (status) {
    query.status = status;
  }

  if (date) {
    query.reservationDate = normalizeDate(date);
  }

  // Cross-reference search across customer name or email properties
  if (search) {
    const matchedUsers = await User.find({
      role: 'customer',
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ],
    }).select('_id');

    const userIds = matchedUsers.map((u) => u._id);
    query.customer = { $in: userIds };
  }

  const skipIndex = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const totalItems = await Reservation.countDocuments(query);

  const items = await Reservation.find(query)
    .populate('customer', 'name email')
    .populate('table', 'tableNumber capacity')
    .sort({ reservationDate: 1, startTime: 1 })
    .skip(skipIndex)
    .limit(parseInt(limit, 10));

  return { items, totalItems };
};

/**
 * Force update reservation details with override conflict checks
 */
export const updateReservationAdmin = async (id, updateData) => {
  const reservation = await Reservation.findById(id);
  if (!reservation) {
    throw ApiError.notFound('Reservation record not found.');
  }

  const guests = updateData.numberOfGuests ?? reservation.numberOfGuests;
  const dateStr = updateData.reservationDate ?? reservation.reservationDate;
  const targetDate = normalizeDate(dateStr);
  const start = updateData.startTime ?? reservation.startTime;
  const end = updateData.endTime ?? reservation.endTime;
  const tableId = updateData.table ?? reservation.table;

  // Verify physical capacity on target table
  const targetTable = await Table.findById(tableId);
  if (!targetTable) {
    throw ApiError.notFound('Selected table does not exist.');
  }
  if (!targetTable.isActive) {
    throw ApiError.badRequest('Selected table is inactive.');
  }
  if (targetTable.capacity < guests) {
    throw ApiError.badRequest(`Selected table capacity (${targetTable.capacity}) is too small for ${guests} guests.`);
  }

  // Verify timing overlap conflicts, ignoring current booking record itself
  const conflictBookings = await Reservation.find({
    _id: { $ne: id },
    table: tableId,
    reservationDate: targetDate,
    status: { $in: ['PENDING', 'CONFIRMED'] },
  });

  const hasOverlap = conflictBookings.some((booking) => {
    return booking.startTime < end && booking.endTime > start;
  });

  if (hasOverlap) {
    throw ApiError.conflict('No tables available for the selected time.');
  }

  // Execute update
  const updated = await Reservation.findByIdAndUpdate(
    id,
    {
      table: tableId,
      reservationDate: targetDate,
      startTime: start,
      endTime: end,
      numberOfGuests: guests,
      status: updateData.status ?? reservation.status,
    },
    { new: true, runValidators: true }
  )
    .populate('customer', 'name email')
    .populate('table', 'tableNumber capacity');

  return updated;
};

/**
 * Force cancel any reservation
 */
export const cancelReservationAdmin = async (id) => {
  const reservation = await Reservation.findById(id);
  if (!reservation) {
    throw ApiError.notFound('Reservation record not found.');
  }

  if (reservation.status === 'CANCELLED') {
    throw ApiError.badRequest('This reservation has already been cancelled.');
  }

  reservation.status = 'CANCELLED';
  await reservation.save();

  return await Reservation.findById(id)
    .populate('customer', 'name email')
    .populate('table', 'tableNumber capacity');
};
