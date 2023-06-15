// MODULES
const path = require("path");
const express = require("express");
const morgan = require("morgan");
const session = require("express-session");
const mongooseStore = require("connect-mongo");
const passport = require("passport");
const cors = require("cors");

// Errors import
// const AppError = require("./utils/appError");
// const globalErrorHandler = require("./controllers/errorController");

// Routes import
const viewRouter = require("./routes/viewRoutes");
const blogRouter = require("./routes/blogRoutes");
const categoryRouter = require("./routes/categoryRoutes");
const userRouter = require("./routes/userRoutes");
const commentRouter = require("./routes/commentRoutes");
const categoryController = require("./controllers/categoryController");

// Application express
const app = express();

//CORS
// app.use(cors());

// Static files
app.use(express.static(path.join(__dirname, "public")));

// View engine
app.set("view engine", "ejs");

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Автоматически запуск задачи каждый день -- выключено
// require("./utils/cron");

// Auth middlewares session and passport
require("./config/passport");

app.use(
  session({
    name: "decode-blog.session",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: mongooseStore.create({
      mongoUrl: process.env.DATABASE_LOCAL,
    }),
    // cookie: {
    //   secure: true, // set secure to true in production
    //   httpOnly: true,
    //   maxAge: 3600000 * 24,
    // },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Locale categories Middleware
app.use(categoryController.categoryMiddleware);

// ROUTES
app.use("/", viewRouter);
app.use("/api/blogs", blogRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/users", userRouter);
app.use("/api/comments", commentRouter);

// Global Error Handler
// app.all("*", (req, res, next) => {
//   next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
// });

// app.use(globalErrorHandler);

module.exports = app;
