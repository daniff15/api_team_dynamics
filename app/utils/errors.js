const { error } = require('./apiResponse');

function BadRequestError(message) {
  const errorCode = 400;
  const errorMessage = message || "Bad request";

  return error(errorMessage, errorCode);
}

function NotFoundError(message) {
  const errorCode = 404;
  const errorMessage = message || "Not found";

  return error(errorMessage, errorCode);
}

function ServerError(message) {
  const errorCode = 500;
  const errorMessage = message || "Server error";

  return error(errorMessage, errorCode);
}

function UnauthorizedError(message) {
  const errorCode = 401;
  const errorMessage = message || "Unauthorized";

  return error(errorMessage, errorCode);
}

function ForbiddenError(message) {
  const errorCode = 403;
  const errorMessage = message || "Forbidden";

  return error(errorMessage, errorCode);
}

function ConflictError(message) {
  const errorCode = 409;
  const errorMessage = message || "Conflict";

  return error(errorMessage, errorCode);
}
  
module.exports = {
    BadRequestError,
    NotFoundError,
    ServerError,
    UnauthorizedError,
    ForbiddenError,
    ConflictError,
};
  
  