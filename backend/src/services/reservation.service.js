import { Reservation } from '../models/Reservation.js';
import { Table } from '../models/Table.js';
import { ApiError } from '../errors/ApiError.js';

/**
 * Normalizes a date by stripping hours, minutes, seconds, and milliseconds
 * to ensure date matches strictly at calendar day level.
 */
const normalizeDate = (dateVal) => {
  const normalized = new Date(dateVal);
  normalized.setUTCHours(0, 0, 0, 0);
  return normalized;
};

/**
 * Core Booking Engine Algorithm
 * 1. Find all active tables with capacity >= guests.
 * 2. Sort tables by capacity ascending.
 * 3. Inspect tables sequentially for overlapping active reservations.
 * 4. Assign the first free table or return 409 Conflict.
 */
export const createReservation = async (userId, bookingData) => {
  const { reservationDate, startTime, endTime, numberOfGuests } = bookingData;
  const targetDate = normalizeDate(reservationDate);

  // Step 1 & 2: Query active tables with capacity >= guests, sorted by capacity ascending, then tableNumber
  const eligibleTables = await Table.find({
    capacity: { $gte: numberOfGuests },
    isActive: true,
  }).sort({ capacity: 1, tableNumber: 1 });

  if (eligibleTables.length === 0) {
    throw ApiError.conflict('No tables available with capacity for the requested number of guests.');
  }

  let assignedTable = null;

  // Step 3 & 4: Loop through eligible tables to check for scheduling overlaps
  for (const table of eligibleTables) {
    // Retrieve active bookings on this table for this date
    const activeBookings = await Reservation.find({
      table: table._id,
      reservationDate: targetDate,
      status: { $in: ['PENDING', 'CONFIRMED'] },
    });

    // Check conflict rules: overlap exists if existing.startTime < requested.endTime AND existing.endTime > requested.startTime
    const hasConflict = activeBookings.some((booking) => {
      return booking.startTime < endTime && booking.endTime > startTime;
    });

    if (!hasConflict) {
      assignedTable = table;
      break; // Suitable table located, exit allocation loop
    }
  }

  if (!assignedTable) {
    throw ApiError.conflict('No tables available for the selected time.');
  }

  // Create confirmed reservation
  const reservation = await Reservation.create({
    customer: userId,
    table: assignedTable._id,
    reservationDate: targetDate,
    startTime,
    endTime,
    numberOfGuests,
    status: 'CONFIRMED',
  });

  return await Reservation.findById(reservation._id)
    .populate('table', 'tableNumber capacity')
    .populate('customer', 'name email');
};

/**
 * Retrieve customer active upcoming bookings
 */
export const getUpcomingReservations = async (userId) => {
  const today = normalizeDate(new Date());
  return await Reservation.find({
    customer: userId,
    reservationDate: { $gte: today },
    status: { $in: ['PENDING', 'CONFIRMED'] },
  })
    .populate('table', 'tableNumber capacity')
    .sort({ reservationDate: 1, startTime: 1 });
};

/**
 * Retrieve customer past historical bookings (older than today or status completed/cancelled)
 */
export const getPastReservations = async (userId) => {
  const today = normalizeDate(new Date());
  return await Reservation.find({
    customer: userId,
    $or: [
      { reservationDate: { $lt: today } },
      { status: { $in: ['CANCELLED', 'COMPLETED'] } },
    ],
  })
    .populate('table', 'tableNumber capacity')
    .sort({ reservationDate: -1, startTime: -1 });
};

/**
 * Cancel a customer's own booking with timing rules
 */
export const cancelOwnReservation = async (userId, reservationId) => {
  const reservation = await Reservation.findOne({
    _id: reservationId,
    customer: userId,
  });

  if (!reservation) {
    throw ApiError.notFound('Reservation booking not found.');
  }

  if (reservation.status === 'CANCELLED') {
    throw ApiError.badRequest('This reservation has already been cancelled.');
  }

  if (reservation.status === 'COMPLETED') {
    throw ApiError.badRequest('Completed reservations cannot be cancelled.');
  }

  // Prevent cancelling bookings that occurred in the past
  const today = normalizeDate(new Date());
  if (reservation.reservationDate < today) {
    throw ApiError.badRequest('Past reservations cannot be cancelled.');
  }

  reservation.status = 'CANCELLED';
  await reservation.save();

  return await Reservation.findById(reservation._id)
    .populate('table', 'tableNumber capacity')
    .populate('customer', 'name email');
};

/**
 * Retrieve a specific reservation details
 */
export const getReservationDetails = async (userId, reservationId) => {
  const reservation = await Reservation.findOne({
    _id: reservationId,
    customer: userId,
  }).populate('table', 'tableNumber capacity');

  if (!reservation) {
    throw ApiError.notFound('Reservation booking not found.');
  }

  return reservation;
};
