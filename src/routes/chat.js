const express = require("express");
const { Chat } = require("../models/chat");
const { userAuth } = require("../middlewares/auth");
const chatRouter = express.Router();
module.exports = chatRouter;
chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
  const { targetUserId } = req.params;
  const userId = req.user?._id;
  console.log("UserId........", userId);

  try {
    let chat = await Chat.findOne({
      participants: { $all: [userId, targetUserId] }
    }).populate({ path: "messages.senderId", select: "firstName lastName" });
    if (!chat) {
      chat = new Chat({
        participants: [userId, targetUserId],
        message: []
      });
      await chat.save();
    }
    res.json(chat);
  } catch (error) {
    console.log("Erroooorr.........", error);
  }
});
