const AppError = require("../utils/appError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  console.log(value);
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Неправильные данные. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handlePassportError = () =>
  new AppError("Для доступа к ресурсу необходимо авторизоваться", 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const handleAdminRouteError = () => {
  return new AppError("Для доступа нужны права администратора", 401);
};

const sendErrorProd = (err, res) => {
  // Operational error
  // console.log(err.isOperational);
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    console.error("ERROR", err);
    res.status(500).json({
      status: "error",
      message: "Что-то пошло не так!"
    });
  }
};

module.exports = (err, req, res, next) => {
  // console.log("Error in error handling middleware:", err);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    // console.log(err);
    let error = {
      ...err,
      name: err.name,
      code: err.code,
      message: err.message
    };
    // console.log("Error in production:", error);
    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.name === "MongoServerError" && error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);
    if (error.message === "Unauth Passport Error")
      error = handlePassportError(error);
    if (error.message === "Admin Route Error") error = handleAdminRouteError();
    // console.log("Error after handling:", error);
    sendErrorProd(error, res);
  }
};
