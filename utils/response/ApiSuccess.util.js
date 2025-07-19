class ApiSuccess {
  constructor(data = {}, message = 'Request successful', statusCode = 200) {
    this.success = true;
    this.message = message;
    this.statusCode = statusCode;
    this.data = data;
  }

}

module.exports = ApiSuccess;