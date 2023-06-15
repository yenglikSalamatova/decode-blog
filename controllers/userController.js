const User = require("./../models/userModel");
const catchAsync = require("../utils/catchAsync");
const Blog = require("../models/blogModel");
const AppError = require("../utils/appError");
const Bookmark = require("../models/bookmarkModel");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.signUp = catchAsync(async (req, res, next) => {
  console.log(req.body);
  // Хэширование пароля  в User Model
  if (
    req.body.email.length > 5 &&
    req.body.username &&
    req.body.password &&
    req.body.re_password
  ) {
    const newUser = await User.create({
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      re_password: req.body.re_password,
    });
    res.status(201).json({
      status: "success",
      data: {
        newUser,
      },
    });
  } else {
    return next(new AppError("Произошла ошибка при создании аккаунта", 400));
  }
});

exports.signIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.signOut = catchAsync(async (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);
    req.user = null;
    res.redirect("/");
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: "success",
    data: {
      users,
    },
  });
});

exports.getUser = catchAsync(async (req, res) => {
  // const user = await User.findById(req.params.id);
  res.status(200).json({
    status: "success",
    data: {
      // user
    },
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getAdminProfile = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);
  const blogs = await Blog.find().populate("author").populate("category");
  res.render("adminProfile", { user: user, blogs });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // Ищем юзера по его айди, включая пароль
  const user = await User.findById(req.user.id).select("+password");
  // Проверяем есть ли юзер а также правильно ли он ввел пароль
  if (
    !user ||
    !(await user.correctPassword(req.body.confirmPassword, user.password))
  ) {
    return next(new AppError("Неправильный пароль", 400));
  }
  // Обновляем данные и обязательно сохраняем, чтобы сработал pre save
  user.password = req.body.password;
  user.re_password = req.body.re_password;
  await user.save();
  // Выходим с аккаунта т.к пароль обновлен
  req.logout(function (err) {
    if (err) console.log(err);
  });
  res.status(200).json({
    status: "success",
    message: "Пароль изменен",
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // При обновлении данных нельзя обновить пароль, для этого есть другой маршрут
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppError(
        "Этот маршрут не для обновления пароля. Пожалуйста используйся /updateMyPassword",
        400
      )
    );
  }

  // Фильтрация чтобы пользователь не мог написать, что он например админ и т.д
  const filteredBody = filterObj(req.body, "username", "email", "description");
  if (req.file) {
    filteredBody["photo"] = `/images/blog/${req.file.filename}`;
  }

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      updatedUser,
    },
    message: "Данные обновлены",
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  console.log(req.params.id);
  await User.deleteOne({ _id: req.params.id });
  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.addBookmark = catchAsync(async (req, res, next) => {
  const newBookmark = await Bookmark.create({
    user: req.user.id,
    blog: req.params.id,
    state: "active",
  });
  await Blog.findByIdAndUpdate(req.params.id, {
    $inc: { bookmarksCount: 1 },
  });

  res.status(200).json({
    status: "success",
    data: newBookmark,
  });
});

exports.deleteBookmark = catchAsync(async (req, res, next) => {
  const deletedBookmark = await Bookmark.findOneAndDelete({
    user: req.user.id,
    blog: req.params.id,
  });
  if (!deletedBookmark) {
    return next(new AppError("Блог не найден", 404));
  }
  await Blog.findByIdAndUpdate(req.params.id, {
    $inc: { bookmarksCount: -1 },
  });
  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.blockUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.body.userId, {
    isBlocked: true,
  });
  res.status(200).json({
    status: "success",
  });
});

exports.unblockUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.body.userId, {
    isBlocked: false,
  });
  res.status(200).json({
    status: "success",
  });
});
