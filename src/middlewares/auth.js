const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const cookie = req.cookies;
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).send("Please Login");
    }
    const decoddedMessage = await jwt.verify(token, "dev@akdjo834");
    const { _id } = decoddedMessage;
    const user = await User.findById({ _id });
    if (!user) {
      throw new Error("User not found!");
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized: " + error.message });
  }
};

module.exports = { userAuth };
