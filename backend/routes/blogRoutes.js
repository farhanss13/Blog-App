const express = require("express")
const {postBlog,getBlogs,getBlogsById,updateblog,deleteBlog}=require("../controllers/blogController")

const route = express.Router()

route.post("/blogs",postBlog )
route.get("/blogs",getBlogs )
route.get("/blogs/:id",getBlogsById )
route.patch("/blogs/:id",updateblog)
route.delete("/blogs/:id",deleteBlog);
module.exports = route