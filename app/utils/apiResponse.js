function success(data, message = "OK", status_code = 200) {
  return {
    message,
    status_code,
    meta: {
        error: false,
    },
    data,
  };
}

function error(message = "Server error", status_code = 500) {
  return {
    message,
    status_code,
    meta: {
      error: true,
    },
  };
}
  
module.exports = {
    success,
    error,
};  