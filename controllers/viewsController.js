const Blog = require("../models/blogModel");
const Category = require("../models/categoryModel");
const User = require("../models/userModel");
const Bookmark = require("../models/bookmarkModel");
const Comment = require("../models/commentModel");
const catchAsync = require("../utils/catchAsync");

exports.getHomePage = catchAsync(async (req, res, next) => {
  let selectedCategory;
  let search;

  const page = parseInt(req.query.page) || 1;
  const limit = 4;

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  let filter = {};

  if (req.query.category) {
    const category = await Category.findOne({ slug: req.query.category });
    const categoryId = category ? category._id : null;

    if (categoryId) {
      filter.category = categoryId;
      selectedCategory = category;
    }
  }
  if (req.query.search) {
    search = req.query.search;
    filter["$or"] = [
      {
        title: { $regex: req.query.search, $options: "i" }
      }
    ];
  }
  const blogs = await Blog.find(filter)
    .populate("author")
    .populate("category")
    .skip(startIndex)
    .limit(limit);
  const bookmarks = await Bookmark.find({ user: req.user });
  const totalBlogs = await Blog.countDocuments(filter);
  const totalPages = Math.ceil(totalBlogs / limit);

  res.status(200).render("index", {
    title: `${selectedCategory?.title || "Блог про программирование"} `,
    blogs,
    bookmarks,
    selectedCategory,
    currentPage: page,
    totalPages,
    search
  });
});

exports.getBlog = catchAsync(async (req, res, next) => {
  const blog = await Blog.findOne({ slug: req.params.slug })
    .populate("author")
    .populate("category")
    .populate({
      path: "comments",
      populate: {
        path: "user",
        model: "User",
        select: "username photo"
      }
    });

  const bookmark = await Bookmark.findOne({ user: req.user, blog: blog._id });
  await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } });
  res.status(200).render("logged-blog-1", {
    title: blog.title,
    blog,
    bookmark: bookmark || 0
  });
});

exports.getLoginPage = catchAsync(async (req, res, next) => {
  res.status(200).render("login", {
    title: "Вход"
  });
});

exports.getRegisterPage = catchAsync(async (req, res, next) => {
  res.status(200).render("register", {
    title: "Регистрация"
  });
});

exports.getProfile = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ username: req.params.username });
  let blogs;

  if (
    req.user &&
    req.user.role === "admin" &&
    req.params.username === req.user.username
  ) {
    blogs = await Blog.find().populate("author").populate("category");
  } else {
    blogs = await Blog.find({ author: user._id })
      .populate("author")
      .populate("category");
  }
  res.status(200).render("profile", {
    title: user.username,
    profileUser: user,
    blogs
  });
});

exports.getNewBlogPage = catchAsync(async (req, res, next) => {
  res.status(200).render("newblog", {
    title: "Создать новый блог"
  });
});

exports.getEditBlogPage = catchAsync(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id).populate("category");
  res.status(200).render("editblog", {
    title: "Редактировать блог",
    blog
  });
});

exports.getBookmarks = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ username: req.params.username });
  const bookmarks = await Bookmark.find({ user: user._id })
    .populate("blog")
    .populate({
      path: "blog",
      populate: [
        {
          path: "author",
          model: "User"
        },
        {
          path: "category",
          model: "Category"
        }
      ]
    });
  // console.log(bookmarks.length);
  const blogsLength = await Blog.find({ author: user._id }).countDocuments();
  res.status(200).render("bookmarks", {
    title: "Закладки",
    profileUser: user,
    bookmarks: bookmarks.length ? bookmarks : 0,
    blogsLength
  });
});

exports.getComments = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ username: req.params.username });
  const comments = await Comment.find({ user: user._id })
    .populate("blog")
    .populate("user");
  const blogsLength = await Blog.find({ author: user._id }).countDocuments();
  res.status(200).render("comments", {
    title: "Комментарии",
    profileUser: user,
    comments,
    blogsLength
  });
});

exports.getEditProfilePage = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ username: req.params.username });
  res.status(200).render("edit-profile", {
    title: "Редактировать профиль",
    user
  });
});

exports.getUsersForAdmin = catchAsync(async (req, res, next) => {
  const users = await User.find({ role: { $ne: "admin" } });
  const user = await User.findById(req.user._id);
  const blogsLength = await Blog.find({ author: user._id }).countDocuments();
  res.status(200).render("adminUsers", {
    title: "Пользователи",
    users,
    profileUser: user,
    blogsLength
  });
});
