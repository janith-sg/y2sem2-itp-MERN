const mongoose = require("mongoose");

const dburl =
  "mongodb+srv://janith:1234@cluster0.eykrh0b.mongodb.net/test?retryWrites=true&w=majority";

// strictQuery on (පරණ query warnings avoid කරන්න)
mongoose.set("strictQuery", true);

const connection = async () => {
  try {
    await mongoose.connect(dburl); // ✅ no extra options needed
    console.log("MongoDB Connected~");
  } catch (e) {
    console.error("MongoDB Connection Error:", e.message);
    process.exit(1);
  }
};

module.exports = connection;
