const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

const app = require("./app");

const DB = process.env.MONGODB_URI;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB CLUSTER");
  })
  .catch((e) => {
    console.log("Failed to connect to MongoDB");
    console.error(e);
  });

// mongoose
//   .connect(process.env.DATABASE_LOCAL)
//   .then(() => {
//     console.log("Connected to MongoDB");
//   })
//   .catch((e) => {
//     console.log("Failed to connect to MongoDB");
//     console.log(e.message);
//   });

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}`);
});
