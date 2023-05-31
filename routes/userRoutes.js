const express = require("express");
const passport = require("passport");
const userController = require("./../controllers/userController");
// const createAdmin = require("../seeds/userSeed");
const { isAuth, isAdmin, checkAccountAccess } = require("../utils/middlewares");
const { upload } = require("../utils/multer");
const router = express.Router();

// Вход, регистрация, выход
router.post("/signup", userController.signUp);
router.post(
  "/signin",
  passport.authenticate("local", {
    failureRedirect: "/login"
  }),
  userController.signIn
);
router.get("/signout", userController.signOut);

// Пароль
router.post("/forgotPassword", userController.forgotPassword);
router.patch("/resetPassword/:token", userController.resetPassword);
router.patch("/updateMyPassword/", isAuth, userController.updatePassword);
router.patch("/blockUser", isAdmin, userController.blockUser);
router.patch("/unblockUser", isAdmin, userController.unblockUser);

// Обновление и удаление профиля юзера
router.patch(
  "/updateMe",
  upload.single("user-img"),
  isAuth,
  userController.updateMe
);
router.delete("/deleteMe", isAuth, userController.deleteMe);

router.route("/").get(userController.getAllUsers);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(checkAccountAccess, userController.updateUser)
  .delete(checkAccountAccess, userController.deleteUser);

router
  .route("/bookmark/:id")
  .post(isAuth, userController.addBookmark)
  .delete(isAuth, userController.deleteBookmark);

// createAdmin();
module.exports = router;
