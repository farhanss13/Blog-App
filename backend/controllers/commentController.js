const Blog = require("../models/blogSchema");
const Comment = require("../models/commentSchema");
const { decodeJWT } = require("../utilities/generateToken");

async function addComment(req, res) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];
    const decodedUser = decodeJWT(token);
    const creator = decodedUser.id;
    const { id } = req.params;
    const { comment } = req.body;
    if(!comment){
      return res.status(400).json({ message: "Please Enter a Comment!" });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    const newComment = await Comment.create({comment,blog:id,user:creator})
    await Blog.findByIdAndUpdate(id,{
      $push:{comments: newComment._id}
    })
    return res.status(200).json({ succes:true, message: "Comment Added Successfully!" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
async function deleteComment(req, res) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];
    const decodedUser = decodeJWT(token);
    const userId = decodedUser.id;

    const { id } = req.params; // comment id

    const comment = await Comment.findById(id).populate({
      path: "blog",
      select: "creator"
    });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    if (
      comment.user.toString() !== userId &&
      comment.blog.creator.toString() !== userId
    ) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this comment" });
    }

    await Blog.findByIdAndUpdate(comment.blog._id, {
      $pull: { comments: comment._id }
    });
    await Comment.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Comment Deleted Successfully"
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
async function editComment(req, res) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];
    const decodedUser = decodeJWT(token);
    const userId = decodedUser.id;

    const { id } = req.params;
    const { comment } = req.body; // same key as addComment

    if (!comment) {
      return res.status(400).json({ message: "Updated comment is required!" });
    }

    const existingComment = await Comment.findById(id);

    if (!existingComment) {
      return res.status(404).json({ message: "Comment Not Found!" });
    }

    if (existingComment.user.toString() !== userId) {
      return res.status(403).json({ message: "You are not allowed to edit this comment!" });
    }

    const updated = await Comment.findByIdAndUpdate(
      id,
      { comment: comment },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Comment Updated Successfully!",
      updatedComment: updated
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
async function likeComment(req, res) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];
    const decodedUser = decodeJWT(token);
    const userId = decodedUser.id;
    const { id } = req.params;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    if(!comment.likes.includes(userId)){
      await Comment.findByIdAndUpdate(id,{$push:{likes:userId}})
      return res.status(200).json({
      message: "Comment Liked!"
    });
    }else{
      await Blog.findByIdAndUpdate(id,{$pull:{likes:userId}})
      return res.status(200).json({
      message: "Comment Disliked!"
    });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}


module.exports = {addComment,deleteComment,editComment,likeComment}