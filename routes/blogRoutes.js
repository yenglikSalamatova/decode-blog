const express = require("express");

const router = express.Router();
const blogController = require("./../controllers/blogController");
const { upload } = require("../utils/multer");
const { isAuth, checkBlogAccess } = require("../utils/middlewares");

router
  .route("/")
  .get(blogController.getAllBlogs)
  .post(isAuth, upload.single("blog-img"), blogController.createBlog);

// CKEditor Image Upload
router.post(
  "/upload-image",
  upload.single("upload"),
  blogController.uploadCKEditor
);

router
  .route("/:id")
  .get(blogController.getBlog)
  .patch(
    isAuth,
    checkBlogAccess,
    upload.single("blog-img"),
    blogController.updateBlog
  )
  .delete(isAuth, checkBlogAccess, blogController.deleteBlog);

module.exports = router;
