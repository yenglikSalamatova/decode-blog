const cron = require("node-cron");
const User = require("../models/userModel");

// Запуск задачи каждый день
cron.schedule("0 0 * * *", async () => {
  try {
    const expiredUsers = await User.find({ expiryDate: { $lte: new Date() } });

    for (const user of expiredUsers) {
      await User.findByIdAndRemove(user._id);
    }
    console.log("Удаление истекших учетных записей выполнено успешно");
  } catch (error) {
    console.error("Ошибка при удалении истекших учетных записей:", error);
  }
});
module.exports = cron;
