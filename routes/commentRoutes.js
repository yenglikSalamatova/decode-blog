const express = require("express");
const Comments = require("../models/commentModel");
const commentController = require("../controllers/commentController");

const router = express.Router();

router
  .route("/")
  .post(commentController.createComment)
  .patch(commentController.editComment)
  .delete(commentController.deleteComment);

module.exports = router;
