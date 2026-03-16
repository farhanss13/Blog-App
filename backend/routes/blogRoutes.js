const express = require("express")
const {postBlog,getBlogs,getBlogsById,updateblog,deleteBlog, likeBlog}=require("../controllers/blogController")
const verifyUser = require("../middlewares/auth")
const { addComment, deleteComment, editComment, likeComment } = require("../controllers/commentController")
const upload = require("../utilities/multer")

const route = express.Router()

//blogs
route.post("/blogs",verifyUser,upload.single("image"),postBlog)
route.get("/blogs",getBlogs)
route.get("/blogs/:blogId", getBlogsById)
route.patch("/blogs/:blogId",verifyUser,upload.single("image"),updateblog)
route.delete("/blogs/:blogId",verifyUser,deleteBlog);

//likes
route.post("/blogs/:blogId/like",verifyUser,likeBlog)

//comments
route.post("/blogs/:blogId/comments",verifyUser,addComment)
route.delete("/comments/:commentId",verifyUser,deleteComment)
route.patch("/comments/:commentId",verifyUser,editComment)
route.post("/comments/:commentId/like",verifyUser,likeComment)

module.exports = route