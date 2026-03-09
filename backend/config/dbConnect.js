const mongoose = require("mongoose");
async function dbConnect(dbUrl) {
  try {
    await mongoose.connect(dbUrl);
    console.log("DB Connected Successfully")
  } catch (error) {
    console.log(error)
  }
}
module.exports = dbConnect;
