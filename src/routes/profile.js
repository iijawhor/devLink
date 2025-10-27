const express = require("express");

const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const { validate } = require("../models/user");
const {
  validateSignupData,
  validateProfileData
} = require("../utils/validation");
profileRouter.get("/get-profile", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    throw new Error("User not found!" + error.message);
  }
});
profileRouter.patch("/edit-profile", userAuth, async (req, res) => {
  try {
    if (!validateProfileData(req)) {
      throw new Error("Invalid Edit request!");
    }

    const user = req.user;
    Object.keys(req.body).forEach((key) => (user[key] = req.body[key]));
    user.save();
    res.send(`${user.firstName} , your profile  updated successfully`);
  } catch (error) {
    res.status(400).send("Error : ..." + error);
  }
});

module.exports = profileRouter;
