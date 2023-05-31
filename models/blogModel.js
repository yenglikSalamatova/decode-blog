const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const slugify = require("slugify");
// const validator = require("validator");
const transliteration = require("transliteration");

const Bookmarks = require("../models/bookmarkModel");

const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "У блога должно быть название"],
    unique: true,
    trim: true,
    maxlength: [
      100,
      "У блога должно быть название меньше или ровно 100 символов"
    ],
    minlength: [5, "У блога должно быть название больше 5 символов"]
    // validate: [validator.isAlpha, "Блог должен состоять только из букв"],
  },
  text: {
    type: String,
    trim: true,
    required: [true, "У блога должен быть контент"],
    minlength: [300, "У блога должно быть текст больше 300 символов"]
  },
  author: { type: Schema.Types.ObjectId, ref: "User" },
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: [true, "У блога должна быть категория"]
  },

  description: {
    type: String,
    trim: true,
    required: [true, "У блога должно быть описание"]
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  image: {
    type: String,
    required: [true, "У блога должна быть картинка"]
  },
  views: Number,
  comments: [{ type: mongoose.Schema.ObjectId, ref: "Comment" }],
  tags: { type: Array, required: [true, "Укажите хотя бы один тег"] },
  slug: String,
  secretBlog: {
    type: Boolean,
    default: false
  },
  bookmarksCount: {
    type: Number,
    default: 0
  },
  expiryDate: Date
});

// BlogSchema.virtual('')

// Document middleware : runs before .save() and .create()
BlogSchema.pre("save", function (next) {
  this.slug = slugify(
    transliteration.transliterate(this.title).replace(/[^a-zA-Z0-9-\s]/g, ""),
    {
      lower: true
    }
  );
  next();
});

// Query Middleware - все запросы начинающиеся с find
BlogSchema.pre(/^find/, function (next) {
  this.find({ secretBlog: { $ne: true } });
  next();
});

BlogSchema.pre(/^find/, async function (next) {
  const bookmarksCount = await Bookmarks.countDocuments({ blog: this.id });
  // console.log(bookmarksCount);
  this.bookmarksCount = bookmarksCount;
  next();
});

// Aggregation MiddleWare
BlogSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { secretBlog: { $ne: true } } });

  next();
});

const Blog = mongoose.model("Blog", BlogSchema);

module.exports = Blog;
