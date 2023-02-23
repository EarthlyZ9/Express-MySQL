class HttpError extends Error {
  constructor(message, cause, errorCode) {
    super(message); // Adds a "message" property
    this.cause = cause;
    this.code = errorCode; // Adds a "code" property

    if (!this.cause) {
      this.cause = message;
    }
  }
}

module.exports = HttpError;
