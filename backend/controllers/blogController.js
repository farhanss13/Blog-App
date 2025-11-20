const { get } = require("mongoose");

async function postBlog (req,res){
    blogs.push({...req.body, id:blogs.length+1})
    return res.json({"message":"Blog Created Successfully"})
}
async function getBlogs (req,res){
    let publicBlogs = blogs.filter(blog=>!blogs.draft)    
    return res.json({publicBlogs})
}
async function getBlogsById (req,res){
    const{id}=req.params;
    let searchBlog = blogs.filter(blog=>blog.id==id)    
    return res.json({searchBlog})
}
async function updateblog (req,res){
     const{id}=req.params;
    let index = blogs.findIndex(blog=>blog.id==id)   
    blogs[index] = {...blogs[index], ...req.body} 
    return res.json({message:"Blog Updated Successfully"})
}
async function deleteBlog  (req, res)  {
  const { id } = req.params;
  const index = blogs.findIndex(blog => blog.id == id);
  blogs.splice(index, 1);
  return res.json({ message: "Blog Deleted Successfully" });
}

module.exports = {postBlog,getBlogs,getBlogsById,updateblog,deleteBlog}