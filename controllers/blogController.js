const mongoose = require("mongoose");
const Blogs = require("../models/blogModel");
const Bookmark = require("../models/bookmarkModel");
// const User = require("../models/userModel");
// const Category = require("../models/categoryModel");
const APIFeatures = require("./../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

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
      blogs
    }
  });
});

const trimmingTags = (bodyTags) => {
  const tagsArr = bodyTags.split(",");
  const trimmedTagsArr = tagsArr.map((tag) => tag.trim());
  return trimmedTagsArr;
};

exports.createBlog = catchAsync(async (req, res, next) => {
  const trimmedTagsArr = trimmingTags(req.body.tags);

  const newBlog = await Blogs.create({
    title: req.body.blog_title,
    text: req.body.editor,
    author: req.user._id,
    category: req.body.category,
    description: req.body.newblog_description,
    image: `/images/blog/${req.file.filename}`,
    views: 0,
    tags: trimmedTagsArr
  });

  res.status(201).json({
    status: "success",
    data: {
      newBlog
    }
  });
});

exports.getBlog = catchAsync(async (req, res, next) => {
  const blog = await Blogs.findById(req.params.id);

  if (!blog) {
    return next(new AppError("No blog found with that ID", 404));
  }

  res.status(200).json({
    status: "ok",
    data: { blog }
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
    tags: trimmedTagsArr
  };

  Object.assign(blog, updatedBlog);
  const updated = await blog.save();

  res.status(201).json({
    status: "success",
    data: {
      blog: updated
    }
  });
});

exports.deleteBlog = catchAsync(async (req, res, next) => {
  const blog = await Blogs.findByIdAndDelete(req.params.id);
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
    data: null
  });
});

exports.getBlogStats = catchAsync(async (req, res, next) => {
  const stats = await Blogs.aggregate([
    {
      $match: {}
    },
    {
      $group: {
        _id: "$author",
        numBlogs: { $sum: 1 },
        avgView: { $avg: "$views" },
        minViews: { $min: "$views" },
        maxViews: { $max: "$views" }
      }
    },
    {
      $sort: {
        minViews: 1
      }
    }
  ]);

  res.status(200).json({
    status: "ok",
    data: { stats }
  });
});

exports.getBlogsByYear = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const blog = await Blogs.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        numBlogs: { $sum: 1 },
        blogs: { $push: "$title" }
      }
    },
    {
      $addFields: {
        month: "$_id"
      }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { numBlogs: -1 }
    }
  ]);
  res.status(200).json({
    status: "ok",
    data: { blog }
  });
});
