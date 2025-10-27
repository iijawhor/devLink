const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://jawhorali1:fWkhLLrpVcQMYhWM@nodejs.exk2sbm.mongodb.net/devLink"
  );
};

module.exports = connectDB;
