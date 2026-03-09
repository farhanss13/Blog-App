const express = require("express")
const {postBlog,getBlogs,getBlogsById,updateblog,deleteBlog, likeBlog}=require("../controllers/blogController")
const Blog = require("../models/blogSchema")
const verifyUser = require("../middlewares/auth")
const { addComment, deleteComment, editComment, likeComment } = require("../controllers/commentController")
const upload = require("../utilities/multer")

const route = express.Router()

//blogs
route.post("/blogs",verifyUser,upload.single("image"),postBlog)
route.get("/blogs",getBlogs)
route.get("/blogs/:blogId", getBlogsById)
route.patch("/blogs/:blogId",verifyUser,updateblog)
route.delete("/blogs/:id",verifyUser,deleteBlog);

//likes
route.post("/blogs/like/:id",verifyUser,likeBlog)

//comments
route.post("/blogs/comment/:id",verifyUser,addComment)
route.delete("/blogs/comment/:id",verifyUser,deleteComment)
route.patch("/blogs/edit-comment/:id",verifyUser,editComment)
route.post("/blogs/like-comment/:id",verifyUser,likeComment)

module.exports = route