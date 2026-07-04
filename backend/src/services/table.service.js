import { Table } from '../models/Table.js';
import { ApiError } from '../errors/ApiError.js';
import mongoose from 'mongoose';

export const createTable = async (tableData) => {
  const { tableNumber, capacity, isActive } = tableData;

  // Prevent duplicate table numbers
  const existingTable = await Table.findOne({ tableNumber });
  if (existingTable) {
    throw ApiError.conflict(`Table number ${tableNumber} already exists.`);
  }

  return await Table.create({
    tableNumber,
    capacity,
    isActive,
  });
};

export const getAllTables = async (filters = {}) => {
  return await Table.find(filters).sort({ tableNumber: 1 });
};

export const getTableById = async (id) => {
  const table = await Table.findById(id);
  if (!table) {
    throw ApiError.notFound('Table record not found.');
  }
  return table;
};

export const updateTable = async (id, updateData) => {
  const { tableNumber } = updateData;

  // Uniqueness check for tableNumber change
  if (tableNumber !== undefined) {
    const duplicateTable = await Table.findOne({ tableNumber, _id: { $ne: id } });
    if (duplicateTable) {
      throw ApiError.conflict(`Table number ${tableNumber} is already registered on another table.`);
    }
  }

  const table = await Table.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  if (!table) {
    throw ApiError.notFound('Table record not found.');
  }
  return table;
};

export const deleteTable = async (id) => {
  const table = await Table.findById(id);
  if (!table) {
    throw ApiError.notFound('Table record not found.');
  }

  // Safeguard check: prevent deleting tables with upcoming active bookings
  const Reservation = mongoose.models.Reservation;
  if (Reservation) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeBookings = await Reservation.findOne({
      table: id,
      status: { $in: ['PENDING', 'CONFIRMED'] },
      reservationDate: { $gte: today },
    });

    if (activeBookings) {
      throw ApiError.badRequest(
        'Cannot delete table because it has active or upcoming reservations assigned to it.'
      );
    }
  }

  await Table.findByIdAndDelete(id);
  return { id };
};
