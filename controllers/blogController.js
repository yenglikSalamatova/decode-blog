const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Blogs = require("../models/blogModel");
const Bookmark = require("../models/bookmarkModel");
// const User = require("../models/userModel");
// const Category = require("../models/categoryModel");
const APIFeatures = require("./../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const trimmingTags = (bodyTags) => {
  const tagsArr = bodyTags.split(",");
  const trimmedTagsArr = tagsArr.map((tag) => tag.trim());
  return trimmedTagsArr;
};

exports.aliasTopBlogs = catchAsync(async (req, res, next) => {
  req.query.sort = "-views";
  next();
});

exports.getAllBlogs = catchAsync(async (req, res, next) => {
  // console.log(req.query);

  // Execute query
  const features = new APIFeatures(
    Blogs.find().populate("author").populate("category"),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const blogs = await features.query;
  // console.log(blogs);

  res.status(200).json({
    status: "success",
    results: blogs.length,
    data: {
      blogs,
    },
  });
});

exports.createBlog = catchAsync(async (req, res, next) => {
  if (req.user.isBlocked) {
    return next(new AppError("Вы заблокированы"));
  }
  const trimmedTagsArr = trimmingTags(req.body.tags);
  let expiryDate;
  if (req.user.role === "admin") {
    expiryDate = null;
  } else {
    expiryDate = Date.now() + 30 * 60 * 1000;
    // expiryDate = Date.now() + 60 * 1000;
  }

  const newBlog = await Blogs.create({
    title: req.body.blog_title,
    text: req.body.editor,
    author: req.user.id,
    category: req.body.category,
    description: req.body.newblog_description,
    image: `/images/blog/${req.file.filename}`,
    views: 0,
    tags: trimmedTagsArr,
    expiryDate: expiryDate,
  });

  if (!newBlog) {
    return next(new AppError("Не удалось создать новый блог"));
  }

  res.status(201).json({
    status: "success",
    data: {
      newBlog,
    },
  });
});

exports.uploadCKEditor = catchAsync(async (req, res, next) => {
  try {
    const imageUrl = "/images/blog/" + req.file.filename;
    console.log(imageUrl);
    res.status(201).json({ uploaded: true, url: imageUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

exports.getBlog = catchAsync(async (req, res, next) => {
  const blog = await Blogs.findById(req.params.id);
  if (!blog) {
    return next(new AppError("No blog found with that ID", 404));
  }

  res.status(200).json({
    status: "ok",
    data: { blog },
  });
});

exports.updateBlog = catchAsync(async (req, res, next) => {
  // console.log(req.params.id);
  // console.log(req.body);
  const blog = await Blogs.findById(req.params.id);

  if (!blog) {
    return next(new AppError("No blog found with that ID", 404));
  }

  let { image } = blog;
  if (req.file) {
    image = `/images/blog/${req.file.filename}`;
  }
  const trimmedTagsArr = trimmingTags(req.body.tags);

  const updatedBlog = {
    title: req.body.blog_title,
    category: req.body.category,
    description: req.body.newblog_description,
    image: image,
    author: blog.author,
    text: req.body.editor,
    tags: trimmedTagsArr,
  };

  Object.assign(blog, updatedBlog);
  const updated = await blog.save();

  res.status(201).json({
    status: "success",
    data: {
      blog: updated,
    },
  });
});

exports.deleteBlog = catchAsync(async (req, res, next) => {
  const blog = await Blogs.findByIdAndDelete(req.params.id);
  fs.unlink(path.join(__dirname, "../public", blog.image), (err) => {
    if (err) {
      console.error("Ошибка при удалении файла:", err);
    } else {
      console.log("Файл успешно удален");
    }
  });
  const bookmarks = await Bookmark.find({ blog: req.params.id });
  console.log(bookmarks);
  if (!blog) {
    return next(new AppError("No blog found with that ID", 404));
  }
  if (bookmarks.length > 0) {
    await Bookmark.deleteMany({ blog: req.params.id });
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});
