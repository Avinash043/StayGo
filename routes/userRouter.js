const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");
const router= express.Router();
const User = require("../models/user.js");

const userController = require("../controller/users.js");

router
    .route("/signup")
    .get(userController.renderSignup)
    .post(wrapAsync (userController.signUp));

router
    .route("/login")
    .get(userController.renderLogin)
    .post(saveRedirectUrl, passport.authenticate("local",{
        failureRedirect: "/login",
        failureFlash: true,
        }),
        userController.login
    );

router.get("/logout",userController.logout );



module.exports = router;