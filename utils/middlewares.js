const Blog = require("../models/blogModel");
const AppError = require("../utils/appError");
const catchAsync = require("./catchAsync");

const isAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return next(new AppError("Unauth Passport Error", 401));
};

const isAdmin = (req, res, next) => {
  // console.log(req.user);
  if (req.user.role !== "admin") {
    return next(new AppError("У вас нет прав для этого действия", 403));
  }
  return next();
};

const checkBlogAccess = catchAsync(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id).populate("author");
  const userId = req.user.id;
  if (req.user.role === "admin") {
    return next();
  }
  if (blog.author.id !== userId) {
    return next(new AppError("У вас нет прав", 403));
  }
  return next();
});

const checkAccountAccess = (req, res, next) => {
  const userId = req.params.id;
  if (req.user.role === "admin" || userId === req.user.id) {
    next();
  } else {
    return next(new AppError("У вас нет прав для этого действия", 403));
  }
};

const ensureAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  return next();
};

module.exports = {
  isAuth,
  isAdmin,
  ensureAuth,
  checkBlogAccess,
  checkAccountAccess,
};
