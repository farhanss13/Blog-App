const mongoose = require("mongoose");
async function dbConnect() {
  try {
    await mongoose.connect("mongodb://localhost:27017/blogDatabase");
    console.log("DB Connected Successfully")
  } catch (error) {
    console.log(error)
  }
}
module.exports = dbConnect;
