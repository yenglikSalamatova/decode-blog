const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "У комментария должен быть автор"]
  },
  blog: {
    type: mongoose.Schema.ObjectId,
    ref: "Blog",
    required: [true, "Комменатрий должен быть привязан к блогу"]
  },
  content: {
    type: String,
    required: [true, "Комментарий не должен быть пустым"],
    trim: true,
    maxlength: [400, "До 400 символов"],
    minlength: [10, "От 10 символов"]
  },
  createdAt: { type: Date, default: Date.now }
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
