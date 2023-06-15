const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

const app = require("./app");

mongoose
  .connect(process.env.DATABASE_LOCAL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((e) => {
    console.log("Failed to connect to MongoDB");
    console.log(e.message);
  });

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, "localhost", () => {
  console.log(`Server listening on port ${PORT}`);
});
