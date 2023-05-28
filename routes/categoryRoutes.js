const express = require("express");
const categoryController = require("./../controllers/categoryController");

const router = express.Router();

categoryController.writeDataCategories();
router.get("/", categoryController.getAllCategories);

module.exports = router;
