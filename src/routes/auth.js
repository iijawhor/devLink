const express = require("express");
const authRouter = express.Router();
const { validateSignupData } = require("../utils/validation");
const User = require("../models/user");
const { validate } = require("../utils/validation");
const validator = require("validator");
const bcrypt = require("bcrypt");
const { userAuth } = require("../middlewares/auth");
authRouter.post("/signup", async (req, res) => {
  // creating new instance of user model
  try {
    const { firstName, lastName, email, password } = req.body;
    console.log(firstName);

    // validation of the data
    validateSignupData(req);
    // encrypt the password
    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      email,
      password: passwordHash
    });
    const savedUser = await user.save();
    // res.send(user);
    const token = await savedUser.getJWT();
    res.cookie("token", token, {
      expries: new Date(Date.now() + 8 * 360000)
    });
    // res.cookie("token", token, { httpOnly: true }); // you can expire cookie alsos

    res.status(200).json({ message: "Sign Up successfully", savedUser });
  } catch (error) {
    console.log("Error while creating new user !!" + error.message);
    return res.status(400).json({ error: error.message });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Pas", password, "Email", email);

    if (!validator.isEmail(email)) {
      throw new Error("Email is not valid!");
    }
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error(" Invalid Credential! ");
    }
    // const isPasswordValid = await bcrypt.compare(password, user.password);
    const isPasswordValid = await user.validatePassword(password);
    if (isPasswordValid) {
      //
      // create a JWT token
      // const token = await jwt.sign({ _id: user._id }, "dev@akdjo834", {
      //   expiresIn: "7d"
      // });
      const token = await user.getJWT();
      console.log(token);
      // const isTokenValid = await jwt.verify(token, "dev@akdjo834");
      // console.log(isTokenValid);

      // cookie
      res.cookie("token", token, { httpOnly: true }); // you can expire cookie alsos
      // res.send(user);
      res.status(200).json({ message: "Login successful", user });
    }
  } catch (error) {
    console.log("ERRRRRRRRRR>" + error);
    return res.status(400).json({ error: error.message });
  }
});

authRouter.post("/logout", async (req, res) => {
  res
    .cookie("token", null, {
      expires: new Date(Date.now())
    })
    .send();
});
authRouter.patch("/update-password", userAuth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).send("User not found!");
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).send("Old password is incorrect!");
    }

    const isStrong = validator.isStrongPassword(newPassword);
    if (!isStrong) {
      return res.status(400).send("Please enter a strong password!");
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    res.send("Password updated successfully");
  } catch (error) {
    res.status(500).send("Password not updated: " + error.message);
  }
});

module.exports = authRouter;
