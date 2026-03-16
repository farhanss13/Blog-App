const mongoose = require("mongoose")
const userSchema = mongoose.Schema({
  name: {
    type: String,
  },
  email:{
    type:String,
    required:true
  },
  password:String,
  avatar: {
    type: String,
    default: null,
  },
  avatarId: {
    type: String,
    default: null,
  },
  blogs:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:"Blog"
    }
  ]
})
const User = mongoose.model("User",userSchema)
module.exports = User