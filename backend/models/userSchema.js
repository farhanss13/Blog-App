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
  occupation: {
    type: String,
    default: "",
    trim: true,
  },
  bio: {
    type: String,
    default: "",
    trim: true,
    maxlength: 500,
  },
  location: {
    type: String,
    default: "",
    trim: true,
  },
  website: {
    type: String,
    default: "",
    trim: true,
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