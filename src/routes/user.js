const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const userRouter = express.Router();
// get all the pending connection reqyest for the logged in user
userRouter.get("/user/requests/:id", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user._id;
    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser,
      status: "interested"
    }).populate("fromUserId", ["firstName", "lastName"]);
    console.log(connectionRequests);

    res.status(200).json({
      message: "Data fetched successfully ",
      data: connectionRequests
    });
  } catch (error) {
    res.status(400).send("Error : " + error);
  }
});
// get connections

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user._id;
    const connections = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser, status: "accepted" },
        { fromUserId: loggedInUser, status: "accepted" }
      ]
    })
      .populate("fromUserId", "firstName lastName")
      .populate("toUserId", "firstName lastName");
    const data = connections.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });
    res.json({ message: "Connections...", data: data });
  } catch (error) {
    res.status(400).send("Connection not found! : " + error);
  }
});
userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    // user should see other user card except
    // his own card
    // his connection
    // ignored people
    // already sent to connection request to
    const loggedInUser = req.user;
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    limit = limit > 50 ? 50 : limit;
    // find all connection request (sent ,received)
    const connectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }]
    })
      .select("fromUSerId toUserId")
      .populate("fromUserId", "firstName")
      .populate("toUserId", "firstName");
    const hideUserFromFeed = new Set();
    connectionRequests.forEach((req) => {
      hideUserFromFeed.add(req.fromUserId);
      hideUserFromFeed.add(req.toUserId);
    });
    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUserFromFeed) } },
        { _id: { $ne: loggedInUser._id } }
      ]
    })
      .select("firstName lastName")
      .skip(skip)
      .limit(limit);
    res.status(200).json({ message: "Feed fetched successful", users });
  } catch (error) {
    res.status(400).send("Faild to load feed! " + error);
  }
});

module.exports = userRouter;
