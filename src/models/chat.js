const mongoose = require("mongoose");
const { type } = require("os");

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  text: { type: String, requred: true }
});

const chatSchema = new mongoose.Schema(
  {
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
    ],
    messages: [messageSchema]
  },
  { timestamps: true }
);
const Chat = mongoose.model("Chat", chatSchema);
module.exports = { Chat };
