class ApiSuccess {
  constructor(statusCode = 200, message = 'Request Successful', data = {}) {
    this.success = true;
    this.message = message;
    this.statusCode = statusCode;
    this.data = data;
  }

}

module.exports = ApiSuccess;