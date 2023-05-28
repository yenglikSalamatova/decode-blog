const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const User = require("../models/userModel");

passport.use(
  new LocalStrategy(
    {
      usernameField: "email"
    },
    function (email, password, done) {
      User.findOne({ email })
        .select("+password")
        .then((user) => {
          if (!user) {
            return done(null, false, {
              message: "Неправильный email или пароль."
            });
          }
          bcrypt.compare(password, user.password, function (err, res) {
            if (err) return done(err);
            if (res) return done(null, user);
            return done(null, false, {
              message: "Неправильный email или пароль."
            });
          });
        })
        .catch((err) => {
          return done(err);
        });
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user._id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id).then((user, err) => {
    done(err, user);
  });
});
