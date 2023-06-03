const Comments = require("../models/commentModel");
const Blogs = require("../models/blogModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.createComment = catchAsync(async (req, res, next) => {
  if (req.user.isBlocked) {
    return next(new AppError("Вы заблокированы!"));
  }
  // console.log(req.body.blogId);
  const newComment = await Comments.create({
    user: req.user.id,
    blog: req.body.blogId,
    content: req.body.newCommentText,
  });
  await newComment.populate("user");

  const blog = await Blogs.findById(req.body.blogId);
  blog.comments.push(newComment.id);
  await blog.save();

  res.status(200).json({
    status: "success",
    newComment,
  });
});

exports.editComment = catchAsync(async (req, res, next) => {
  const comment = await Comments.findByIdAndUpdate(req.body.commentId, {
    content: req.body.updated,
    createdAt: Date.now(),
  });
  res.status(200).json({
    status: "success",
    comment,
  });
});

exports.deleteComment = catchAsync(async (req, res, next) => {
  const comment = await Comments.findByIdAndDelete(req.query.commentId);
  await Blogs.findByIdAndUpdate(req.query.blogId, {
    $pull: { comments: req.query.commentId },
  });
  res.status(200).json({
    status: "success",
    data: null,
  });
});
