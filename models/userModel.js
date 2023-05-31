const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Пожалуйста введите вашу почту!"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Пожалуйста напишите действительный email"]
  },
  username: {
    type: String,
    unique: true,
    lowercase: true,
    required: [true, "Пожалуйста введите ваш ник, он должен быть уникальным!"],
    validate: {
      validator: validator.isAlphanumeric,
      message: "Username должен содержать только английские буквы и цифры"
    }
  },
  photo: {
    type: String,
    default: "/images/default_user_avatar.png"
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  password: {
    type: String,
    required: [true, "Напишите пароль"],
    minlength: 8,
    select: false
  },
  re_password: {
    type: String,
    required: [true, "Повторите пароль"],
    validate: {
      // Работает только при создании и сохранении (create, save)
      validator: function (el) {
        return el === this.password;
      },
      message: "Пароли не совпадают"
    }
  },
  passwordChangedAt: Date,
  description: {
    type: String,
    trim: true
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  },
  expiryDate: {
    type: Date,
    default: function () {
      return Date.now() + 24 * 60 * 60 * 1000;
    }
  }
});

UserSchema.pre("save", async function (next) {
  // Запускается только если пароль модифицирован
  if (!this.isModified("password")) return next();
  // Хэширует пароль с 12
  this.password = await bcrypt.hash(this.password, 12);
  // Удаляет повторение пароля
  this.re_password = undefined;
  next();
});

UserSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

UserSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

UserSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  // console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //10 min
  return resetToken;
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
