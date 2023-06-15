const mongoose = require("mongoose");

const bookmarkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  blog: {
    type: mongoose.Schema.ObjectId,
    ref: "Blog",
  },
  state: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
});

const Bookmark = mongoose.model("Bookmark", bookmarkSchema);
module.exports = Bookmark;
