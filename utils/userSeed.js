const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");

async function createAdmin() {
  const findAdmin = await userModel.find({ isAdmin: true }).count();
  if (findAdmin == 0) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash("1", salt);
    const newUser = await userModel.create({
      email: "master@mail.ru",
      full_name: "Master",
      password: hash,
      isAdmin: true,
    });
  }
}
module.exports = createAdmin;
