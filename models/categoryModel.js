const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "У категории должно быть название"]
  },
  slug: String,
  key: Number
});

const Category = mongoose.model("Category", categorySchema);
module.exports = Category;
