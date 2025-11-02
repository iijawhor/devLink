const socket = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");
const ConnectionRequest = require("../models/connectionRequest");
const getSecureRoom = (userId, targetUserId) => {
  return crypto
    .createHash("sha256") // ✅ correct spelling
    .update([userId, targetUserId].sort().join("_"))
    .digest("hex");
};

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: { origin: "http://localhost:5174", credentials: true }
  });

  io.on("connection", (socket) => {
    // handle events
    socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
      // create a room
      // const room = [userId, targetUserId].sort().join("_"); // room id
      const room = getSecureRoom(userId, targetUserId); // room id
      console.log(firstName + "joined Room.." + room);
      socket.join(room);
    });
    socket.on(
      "sendMessage",
      async ({ firstName, lastName, userId, targetUserId, text }) => {
        // const room = [userId, targetUserId].sort().join("_");

        // save message to the DB

        try {
          const room = getSecureRoom(userId, targetUserId); // room id
          console.log(firstName + " " + text);
          // check userid and targetUserId is connected
          // const isConnected = await ConnectionRequest.findOne({
          //   fromUserId: userId,
          //   toUserId: "targetUserId", // need to write or metohd to check [this is not the correct ]
          //   status: "accepted"
          // });

          // while saving the chats in DB find the existing chat if present then just push in it if not create a new one

          let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] }
          });
          if (!chat) {
            chat = new Chat({
              participants: [userId, targetUserId],
              messages: []
            });
          }

          chat.messages.push({ senderId: userId, text });
          await chat.save();
          io.to(room).emit("messageReceived", { firstName, lastName, text });
        } catch (error) {
          console.log("Saving in DB ERROR......", error);
        }
      }
    );
    socket.on("disconnect", () => {});
  });
};
module.exports = initializeSocket;
