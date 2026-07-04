import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import * as tableService from '../services/table.service.js';

export const create = asyncHandler(async (req, res) => {
  const table = await tableService.createTable(req.body);
  return ApiResponse.created(res, table, 'Table created successfully.');
});

export const list = asyncHandler(async (req, res) => {
  const filters = {};
  // Enable filtering active tables for booking options
  if (req.query.isActive !== undefined) {
    filters.isActive = req.query.isActive === 'true';
  }
  const tables = await tableService.getAllTables(filters);
  return ApiResponse.success(res, tables, 'Tables list retrieved successfully.');
});

export const getById = asyncHandler(async (req, res) => {
  const table = await tableService.getTableById(req.params.id);
  return ApiResponse.success(res, table, 'Table details retrieved successfully.');
});

export const update = asyncHandler(async (req, res) => {
  const table = await tableService.updateTable(req.params.id, req.body);
  return ApiResponse.success(res, table, 'Table details updated successfully.');
});

export const remove = asyncHandler(async (req, res) => {
  await tableService.deleteTable(req.params.id);
  return ApiResponse.success(res, null, 'Table deleted successfully.');
});
