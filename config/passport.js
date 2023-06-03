const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github").Strategy;
const bcrypt = require("bcrypt");
const User = require("../models/userModel");

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
    },
    function (email, password, done) {
      User.findOne({ email })
        .select("+password")
        .then((user) => {
          if (!user) {
            return done(null, false, {
              message: "Неправильный email или пароль.",
            });
          }
          bcrypt.compare(password, user.password, function (err, res) {
            if (err) return done(err);
            if (res) return done(null, user);
            return done(null, false, {
              message: "Неправильный email или пароль.",
            });
          });
        })
        .catch((err) => {
          return done(err);
        });
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8000/api/users/auth/google/callback",
      scope: ["email", "profile"],
    },
    async function (accessToken, refreshToken, profile, cb) {
      // console.log(profile);

      let user = await User.findOne({ googleId: profile.id });
      if (user) {
        return cb(null, user);
      }
      const username = String(profile.displayName)
        .toLowerCase()
        .replace(/\s/g, "");
      user = new User({
        email: profile.emails[0].value,
        username: username,
        photo: profile.photos[0].value,
        googleId: profile.id,
      });
      await user.save();
      return cb(null, user);
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:8000/api/users/auth/github/callback",
    },
    async function (accessToken, refreshToken, profile, cb) {
      // console.log(profile);

      let user = await User.findOne({ githubId: profile.id });
      if (user) {
        return cb(null, user);
      }
      user = new User({
        githubId: profile.id,
        username: profile.username + "github",
        photo: profile._json.avatar_url,
      });
      await user.save();
      return cb(null, user);
    }
  )
);

passport.serializeUser(function (user, done) {
  return done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id)
    .then((user) => {
      // console.log(user);
      done(null, user);
    })
    .catch((err) => {
      done(err, null);
    });
});
