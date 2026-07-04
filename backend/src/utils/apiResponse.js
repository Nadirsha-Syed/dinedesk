export class ApiResponse {
  constructor(statusCode, data = null, message = 'Success', success = true) {
    this.success = success;
    this.statusCode = statusCode;
    this.message = message;
    if (data !== null) {
      this.data = data;
    }
  }

  static success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json(new ApiResponse(statusCode, data, message, true));
  }

  static created(res, data = null, message = 'Resource created successfully') {
    return res.status(201).json(new ApiResponse(201, data, message, true));
  }

  static paginated(res, items, page, limit, totalItems, message = 'Success') {
    const totalPages = Math.ceil(totalItems / limit);
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          items,
          pagination: {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            totalItems,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        },
        message,
        true
      )
    );
  }
}
