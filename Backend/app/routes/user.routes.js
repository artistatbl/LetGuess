const express = require('express');
const users = require("../controller/user.controller");
const auth = require('../lib/authentication');
const discordAuth = require('../lib/disordauth');

module.exports = function (app) {
  app.route("/users")
    .post(users.create);

  app.get("/users/:username", users.getUserInfo);

  app.post('/picture', discordAuth.authenticate(), auth.isAuthenticated, users.saveProfilePicture);

  app.route("/login")
    .post(users.login);

  // app.route("/users/resetPassword")
  //   .post(auth.isAuthenticated, users.resetPassword);

  app.route("/logout")
    .post(auth.isAuthenticated, users.logout);

  // app.route("/verify-email/:verificationToken")
  //   .get(users.verifyEmail);
};
