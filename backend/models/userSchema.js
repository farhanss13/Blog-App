const mongoose = require("mongoose")
const userSchema = mongoose.Schema({
  name:String,
  email:{
    type:String,
    required:true
  },
  password:String,
  blogs:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:"Blog"
    }
  ]
})
const User = mongoose.model("User",userSchema)
module.exports = User