import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import * as adminService from '../services/admin.service.js';

export const getStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getDashboardStats();
  return ApiResponse.success(res, stats, 'Dashboard statistics retrieved successfully.');
});

export const listReservations = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, date, status, search } = req.query;
  const result = await adminService.getReservationsAdmin({ page, limit, date, status, search });

  return ApiResponse.paginated(
    res,
    result.items,
    page,
    limit,
    result.totalItems,
    'Reservations list retrieved successfully.'
  );
});

export const updateReservation = asyncHandler(async (req, res) => {
  const reservation = await adminService.updateReservationAdmin(req.params.id, req.body);
  return ApiResponse.success(res, reservation, 'Reservation details updated successfully.');
});

export const cancelReservation = asyncHandler(async (req, res) => {
  const reservation = await adminService.cancelReservationAdmin(req.params.id);
  return ApiResponse.success(res, reservation, 'Reservation cancelled successfully.');
});
