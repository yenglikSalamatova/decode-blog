const express = require("express");
const viewsController = require("../controllers/viewsController");
const { isAuth, isAdmin } = require("../utils/middlewares");

const router = express.Router();

router.get("/", viewsController.getHomePage);
router.get("/blog/:slug", viewsController.getBlog);

router.get("/user/:username", viewsController.getProfile);
router.get("/user/bookmarks/:username", viewsController.getBookmarks);
router.get("/user/comments/:username", viewsController.getComments);

router.get("/login", viewsController.getLoginPage);
router.get("/register", viewsController.getRegisterPage);
router.get("/new-blog", isAuth, viewsController.getNewBlogPage);
router.get(
  "/edit-profile/:username",
  isAuth,
  viewsController.getEditProfilePage
);
router.get("/users", isAdmin, viewsController.getUsersForAdmin);
router.get("/blog/edit/:id", isAuth, viewsController.getEditBlogPage);

module.exports = router;
