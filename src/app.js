const express = require("express");
const cors = require("cors");
const app = express();
const http = require("http");
app.use(express.json());
const socket = require("socket.io");
const connectDB = require("./config/database.js");
const User = require("./models/user.js");
const { validateSignupData } = require("./utils/validation.js");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const { userAuth } = require("./middlewares/auth.js");
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5174", // your React frontend port
    credentials: true
  })
);

const authRouter = require("./routes/auth.js");
const profileRouter = require("./routes/profile.js");
const requestRouter = require("./routes/request.js");
const userRouter = require("./routes/user.js");
const initializeSocket = require("./utils/socket.js");
const chatRouter = require("./routes/chat.js");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", chatRouter);

app.patch("/user", async (req, res) => {
  const userId = req.body.userId;
  const data = req.body;
  const ALLOWED_UPDATES = ["photoUrl", "about", "gender", "age", "skills"];
  const isUpdateAlllowed = Object.keys(data).every((k) =>
    ALLOWED_UPDATES.includes(k)
  );
  if (!isUpdateAlllowed) {
    res.send(400).send("Update is not allowed");
  }
  if (data?.skills.length > 10) {
    throw new Error("Skills can not be more than 10!");
  }
  try {
    const user = await User.findByIdAndUpdate({ _id: userId }, data, {
      returnDocument: "after",
      runValidators: true
    });
    console.log(user);
  } catch (error) {
    res.status(400).send("Update Failed:" + err.message);
  }
});
const server = http.createServer(app);
initializeSocket(server);
connectDB()
  .then(() => {
    console.log("Database connection established...");

    server.listen(3000, () => {
      console.log("Server is listening on port 3000");
    });
  })
  .catch((err) => {
    console.log(err);
    console.log("Database can not be connected!!");
  });
