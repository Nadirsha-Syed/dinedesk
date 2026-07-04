import { z } from 'zod';

export const createTableSchema = z.object({
  tableNumber: z
    .number({ required_error: 'Table number is required' })
    .int('Table number must be a whole number')
    .positive('Table number must be greater than zero'),
  capacity: z
    .number({ required_error: 'Capacity is required' })
    .int('Capacity must be a whole number')
    .min(1, 'Capacity must be at least 1 person'),
  isActive: z.boolean().optional(),
});

export const updateTableSchema = z.object({
  tableNumber: z
    .number()
    .int('Table number must be a whole number')
    .positive('Table number must be greater than zero')
    .optional(),
  capacity: z
    .number()
    .int('Capacity must be a whole number')
    .min(1, 'Capacity must be at least 1 person')
    .optional(),
  isActive: z.boolean().optional(),
});
