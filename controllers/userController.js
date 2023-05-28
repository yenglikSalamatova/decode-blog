const crypto = require("crypto");
const User = require("./../models/userModel");
const catchAsync = require("../utils/catchAsync");
const Blog = require("../models/blogModel");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");
const Bookmark = require("../models/bookmarkModel");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.signUp = catchAsync(async (req, res) => {
  // Хэширование пароля и валидатор сделаны в User Model
  const newUser = await User.create({
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
    re_password: req.body.re_password,
    passwordChangedAt: req.body.passwordChangedAt
  });

  res.status(201).json({
    status: "success",
    data: {
      newUser
    }
  });
});

exports.signIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  console.log(email, password);

  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  res.status(201).json({
    status: "success",
    data: {
      user
    }
  });
});

exports.signOut = (req, res) => {
  req.logout(function (err) {
    if (err) console.log(err);
    req.user = undefined;
    res.clearCookie("decode-blog.session").redirect("/");
  });
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: "success",
    data: {
      users
    }
  });
});

exports.getUser = catchAsync(async (req, res) => {
  // const user = await User.findById(req.params.id);
  res.status(200).json({
    status: "success",
    data: {
      // user
    }
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user
    }
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null
  });
});

exports.getAdminProfile = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  const blogs = await Blog.find().populate("author").populate("category");
  res.render("adminProfile", { user: user, blogs });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("Такого пользователя не существует", 404));
  }
  // Реализуем смену пароля благодаря токену, который мы пришлем через имейл
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/resetPassword/${resetToken}`;

  const message = `Забыли пароль? Сделайте PATCH запрос с вашим новым паролем и подвердите пароль для ${resetURL}.\n Если вы не забыли пароль, то игнорируйте письмо! `;
  try {
    await sendEmail({
      email: user.email,
      subject: "Ваш токен для сброса пароля (действителен 10 минут)",
      message
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email"
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError("Ошибка при отправке письма. Попробуйте позже", 500)
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError("Токен не действителен или истек", 400));
  }

  user.password = req.body.password;
  user.re_password = req.body.re_password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Пароль изменен"
  });
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
    message: "Пароль изменен"
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

  console.log(filteredBody);

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: "success",
    data: {
      updatedUser
    },
    message: "Данные обновлены"
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  // Фактически не удаляем пользователя, деактивируем аккаунт
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: "success",
    data: null
  });
});

exports.addBookmark = catchAsync(async (req, res, next) => {
  const currentUser = req.user.id;
  const currentBlog = req.params.id;

  const newBookmark = await Bookmark.create({
    user: currentUser,
    blog: currentBlog,
    state: "active"
  });
  await Blog.findByIdAndUpdate(req.params.id, {
    $inc: { bookmarksCount: 1 }
  });

  res.status(200).json({
    status: "success",
    data: newBookmark
  });
});

exports.deleteBookmark = catchAsync(async (req, res, next) => {
  const currentUser = req.user.id;
  const currentBlog = req.params.id;
  const deletedBookmark = await Bookmark.findOneAndDelete({
    user: currentUser,
    blog: currentBlog
  });
  if (!deletedBookmark) {
    return next(new AppError("Блог не найден", 404));
  }
  await Blog.findByIdAndUpdate(req.params.id, {
    $inc: { bookmarksCount: -1 }
  });
  res.status(204).json({
    status: "success",
    data: null
  });
});
