function success(data, message = "OK", statusCode = 200) {
  return {
    message,
    statusCode,
    meta: {
        error: false,
    },
    data,
  };
}

function error(message = "Server error", statusCode = 500) {
  return {
    message,
    statusCode,
    meta: {
      error: true,
    },
  };
}
  
module.exports = {
    success,
    error,
};  