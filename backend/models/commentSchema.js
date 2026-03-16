const mongoose = require("mongoose");
const commentSchema = mongoose.Schema({
    
    comment:{
        type:String,
        required:true
    },

    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        default: null
    },
    
    blog:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Blog"
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    likes:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"User"
            }
        ]

},{timestamps: true})
const Comment = mongoose.model("Comment",commentSchema);
module.exports = Comment;