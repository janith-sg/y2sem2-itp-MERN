const mongoose = require("mongoose");

const dburl =
  "mongodb+srv://janith:1234@cluster0.eykrh0b.mongodb.net/test?retryWrites=true&w=majority";

mongoose.set("strictQuery", true);

const connection = async () => {
  try {
    await mongoose.connect(dburl);
    console.log("MongoDB Connected~");
  } catch (e) {
    console.error("MongoDB Connection Error:", e.message);
    process.exit(1);
  }
};

module.exports = connection;