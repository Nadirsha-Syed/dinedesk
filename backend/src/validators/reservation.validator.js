import { z } from 'zod';

const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

export const createReservationSchema = z
  .object({
    reservationDate: z
      .string({ required_error: 'Reservation date is required.' })
      .refine((dateStr) => {
        const parsedDate = new Date(dateStr);
        return !isNaN(parsedDate.getTime());
      }, 'Invalid date format.')
      .refine((dateStr) => {
        const targetDate = new Date(dateStr);
        targetDate.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return targetDate >= today;
      }, 'Reservation date cannot be in the past.'),
    startTime: z
      .string({ required_error: 'Start time is required.' })
      .regex(timeRegex, 'Start time must be in 24-hour format HH:MM.'),
    endTime: z
      .string({ required_error: 'End time is required.' })
      .regex(timeRegex, 'End time must be in 24-hour format HH:MM.'),
    numberOfGuests: z
      .number({ required_error: 'Number of guests is required.' })
      .int('Number of guests must be a whole number.')
      .positive('Number of guests must be greater than zero.'),
  })
  .refine(
    (data) => {
      const [startHour, startMin] = data.startTime.split(':').map(Number);
      const [endHour, endMin] = data.endTime.split(':').map(Number);

      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      return endMinutes > startMinutes;
    },
    {
      message: 'End time must be after the start time.',
      path: ['endTime'],
    }
  );

export const updateReservationSchema = z
  .object({
    reservationDate: z
      .string()
      .refine((dateStr) => {
        const parsedDate = new Date(dateStr);
        return !isNaN(parsedDate.getTime());
      }, 'Invalid date format.')
      .refine((dateStr) => {
        const targetDate = new Date(dateStr);
        targetDate.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return targetDate >= today;
      }, 'Reservation date cannot be in the past.')
      .optional(),
    startTime: z.string().regex(timeRegex, 'Start time must be in 24-hour format HH:MM.').optional(),
    endTime: z.string().regex(timeRegex, 'End time must be in 24-hour format HH:MM.').optional(),
    numberOfGuests: z
      .number()
      .int('Number of guests must be a whole number.')
      .positive('Number of guests must be greater than zero.')
      .optional(),
    status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).optional(),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        const [startHour, startMin] = data.startTime.split(':').map(Number);
        const [endHour, endMin] = data.endTime.split(':').map(Number);

        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;

        return endMinutes > startMinutes;
      }
      return true;
    },
    {
      message: 'End time must be after the start time.',
      path: ['endTime'],
    }
  );
