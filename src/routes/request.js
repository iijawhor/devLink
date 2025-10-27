const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const requestRouter = express.Router();
const User = require("../models/user");
requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const allowedStatus = ["ignore", "interested"];
      if (!allowedStatus.includes(status)) {
        return res
          .status(400)
          .json({ message: "Invalid status type : " + status });
      }
      if (fromUserId === toUserId) {
        return res.status(400).json({ message: "" });
      }
      // check if there is an existing connection request
      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(400).json({ message: "User ot found!" });
      }
      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId }
        ]
      });
      if (existingConnectionRequest) {
        return res
          .status(400)
          .send({ message: "Connection request is already exist" });
      }
      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status
      });

      const data = await connectionRequest.save();
      res.json({
        message:
          req.user.firstName + " is " + status + " in " + toUser.firstName,
        data
      });
    } catch (error) {
      res.status(404).send("Error : " + error.message);
    }
  }
);
// accept requests
requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    // a=>b
    // loggedInId=>toUserId
    // status==>interested
    // validate the status
    // request id shuld be valid
    try {
      const loggedInUser = req.user;
      const { status, requestId } = req.params;
      console.log(status, requestId, loggedInUser._id);

      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: "Status not allowed!" });
      }
      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested"
      });
      if (!connectionRequest) {
        return res
          .status(404)
          .json({ message: "Connection request not found" });
      }
      connectionRequest.status = status;
      const data = await connectionRequest.save();
      // res.json({ message: "Connection request accepted" + data });
      res.status(200).json({ message: "Connection request accepted", data });
    } catch (error) {
      res.status(400).send("Error : " + error);
    }
  }
);
// get connections

module.exports = requestRouter;
