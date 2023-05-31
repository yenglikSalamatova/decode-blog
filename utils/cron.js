const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const User = require("../models/userModel");
const Blog = require("../models/blogModel");

function fsUnlinkPhoto(path) {
  fs.unlink(path.join(__dirname, "../public", path), (err) => {
    if (err) {
      console.error("Ошибка при удалении файла:", err);
    } else {
      console.log("Файл успешно удален");
    }
  });
}

// Запуск задачи каждые 30 минут
cron.schedule("*/30 * * * *", async () => {
  try {
    const expiredUsers = await User.find({ expiryDate: { $lte: new Date() } });
    const expiredBlogs = await Blog.find({ expiryDate: { $lte: new Date() } });

    for (const user of expiredUsers) {
      await User.findByIdAndRemove(user._id);
      fsUnlinkPhoto(user.photo);
    }
    for (const blog of expiredBlogs) {
      await Blog.findByIdAndDelete(blog._id);
      const blogImagePath = path.join(__dirname, "../public", blog.image);
      fsUnlinkPhoto(blogImagePath);
      const blogContent = blog.text;
      const imgSrcRegex = /<img[^>]+src="?([^"\s]+)"?\s*\/?>/g;

      const imagePaths = blogContent.match(imgSrcRegex)?.map((imgTag) => {
        const imgSrcMatch = imgTag.match(/src="?([^"\s]+)"?/);
        return imgSrcMatch && imgSrcMatch[1];
      });

      if (imagePaths) {
        for (const imagePath of imagePaths) {
          fsUnlinkPhoto(imagePath);
        }
      }
    }
    console.log("Удаление истекших данных выполнено успешно");
  } catch (error) {
    console.error("Ошибка при удалении истекших данных:", error);
  }
});
module.exports = cron;
