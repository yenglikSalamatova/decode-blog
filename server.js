const mongoose = require("mongoose");
const dotenv = require("dotenv");

process.on("uncaughtException", (err) => {
  console.log("Неперехваченное Исключение! Выход...");
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: "./config.env" });

const app = require("./app");

const DB = process.env.DATABASE_LOCAL;

mongoose.connect(DB).then(() => {
  console.log("MongoDB connection successful!");
});

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("НЕОБРАБОТАННАЯ ОШИБКА! Выход...");
  server.close(() => {
    process.exit(1);
  });
});
