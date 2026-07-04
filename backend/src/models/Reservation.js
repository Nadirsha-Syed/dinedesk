import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer reference is required.'],
      index: true,
    },
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      required: [true, 'Table reference is required.'],
      index: true,
    },
    reservationDate: {
      type: Date,
      required: [true, 'Reservation date is required.'],
      index: true,
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required.'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in 24-hour format HH:MM.'],
      index: true,
    },
    endTime: {
      type: String,
      required: [true, 'End time is required.'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in 24-hour format HH:MM.'],
      index: true,
    },
    numberOfGuests: {
      type: Number,
      required: [true, 'Number of guests is required.'],
      min: [1, 'Number of guests must be at least 1.'],
    },
    status: {
      type: String,
      enum: {
        values: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
        message: '{VALUE} is not a valid status.',
      },
      default: 'CONFIRMED', // Set to CONFIRMED on successful table allocation
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// High-performance compound index for reservation overlaps queries
reservationSchema.index({ table: 1, reservationDate: 1, status: 1 });

export const Reservation = mongoose.model('Reservation', reservationSchema);
