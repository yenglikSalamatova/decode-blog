const express = require("express");
const viewsController = require("../controllers/viewsController");
const { isAuth } = require("../utils/middlewares");

const router = express.Router();

router.get("/", viewsController.getHomePage);
router.get("/blog/:slug", viewsController.getBlog);

router.get("/user/:username", viewsController.getProfile);
router.get("/user/bookmarks/:username", isAuth, viewsController.getBookmarks);
router.get("/user/comments/:username", isAuth, viewsController.getComments);

router.get("/login", viewsController.getLoginPage);
router.get("/register", viewsController.getRegisterPage);
router.get("/new-blog", isAuth, viewsController.getNewBlogPage);
router.get(
  "/edit-profile/:username",
  isAuth,
  viewsController.getEditProfilePage
);
router.get("/blog/edit/:id", isAuth, viewsController.getEditBlogPage);

module.exports = router;
