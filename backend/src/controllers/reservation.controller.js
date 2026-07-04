import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import * as reservationService from '../services/reservation.service.js';

export const create = asyncHandler(async (req, res) => {
  const reservation = await reservationService.createReservation(req.user.id, req.body);
  return ApiResponse.created(res, reservation, 'Reservation created and confirmed successfully.');
});

export const listUpcoming = asyncHandler(async (req, res) => {
  const reservations = await reservationService.getUpcomingReservations(req.user.id);
  return ApiResponse.success(res, reservations, 'Upcoming reservations retrieved successfully.');
});

export const listPast = asyncHandler(async (req, res) => {
  const reservations = await reservationService.getPastReservations(req.user.id);
  return ApiResponse.success(res, reservations, 'Past reservations history retrieved successfully.');
});

export const cancel = asyncHandler(async (req, res) => {
  const reservation = await reservationService.cancelOwnReservation(req.user.id, req.params.id);
  return ApiResponse.success(res, reservation, 'Reservation cancelled successfully.');
});

export const getDetails = asyncHandler(async (req, res) => {
  const reservation = await reservationService.getReservationDetails(req.user.id, req.params.id);
  return ApiResponse.success(res, reservation, 'Reservation details retrieved successfully.');
});
