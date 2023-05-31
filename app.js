// MODULES
const path = require("path");
const express = require("express");
const morgan = require("morgan");
const session = require("express-session");
const mongooseStore = require("connect-mongo");
const passport = require("passport");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const compression = require("compression");

// Errors import
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

// Routes import
const blogRouter = require("./routes/blogRoutes");
const categoryRouter = require("./routes/categoryRoutes");
const userRouter = require("./routes/userRoutes");
const viewRouter = require("./routes/viewRoutes");
const commentRouter = require("./routes/commentRoutes");
const categoryController = require("./controllers/categoryController");
const { currentUserMiddleware } = require("./utils/middlewares");

// Application express
const app = express();

// Static files
app.use(express.static(path.join(__dirname, "public")));

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Security HTTP headers
// app.use(helmet());
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       "script-src": [
//         "'self'",
//         "https://cdnjs.cloudflare.com",
//         "https://cdn.ckeditor.com/",
//         "https://cdn.ckbox.io",
//         "'unsafe-inline'"
//       ],
//       "default-src": ["'self'"],
//       "connect-src": ["'self'", "ws:"],
//       "img-src": ["'self'", "https://sp.tinymce.com", "data:"]
//     }
//   })
// );

// Body parser
app.use(express.json({ limit: "20kb" })); // MiddleWare - Анализ JSON в req.body
app.use(express.urlencoded({ extended: true }));

// Ограничение посещения с одного IP - час
const limiter = rateLimit({
  max: 150,
  windowMs: 60 * 60 * 1000,
  message: "Слишком много запросов с этого IP, пожалуйста попробуйте через час"
});

app.use("/api", limiter);

// Санитизация данных от инъекций NOSQL-запросов - очищает всякие символы для взаимодействия с MongoDB например $gte и т.д
app.use(mongoSanitize());

// Санитизация данных от XSS - очищает вредоностный HTML-код с форм и т.д
app.use(xss());

// Очищает повторяющиеся параметры
app.use(
  hpp({
    whitelist: ["views", "author", "category", "createdAt", "comments"]
  })
);

// Автоматически запуск задачи каждый день
require("./utils/cron");

// Auth middlewares session and passport
require("./config/passport");

app.use(
  session({
    name: "decode-blog.session",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: mongooseStore.create({
      mongoUrl: process.env.MONGO_URL
    })
    // cookie: {
    //   // secure: true, // set secure to true in production
    //   httpOnly: true,
    //   maxAge: 3600000 * 24
    // }
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Locale categories Middleware
app.use(currentUserMiddleware);
app.use(categoryController.categoryMiddleware);

// ROUTES
app.use("/", viewRouter);
app.use("/api/blogs", blogRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/users", userRouter);
app.use("/api/comments", commentRouter);

app.use(compression());

// Global Error Handler
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
