class ApiError extends Error {
  constructor(statusCode = 500, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.success = false;

    Error.captureStackTrace(this, this.constructor);
  }

}

module.exports = ApiError;