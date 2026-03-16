const Blog = require("../models/blogSchema");
const Comment = require("../models/commentSchema");
const { decodeJWT } = require("../utilities/generateToken");

async function addComment(req, res) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];
    const decodedUser = decodeJWT(token);
    const creator = decodedUser.id;
    const { blogId } = req.params;
    const { comment, parentCommentId } = req.body;
    if(!comment){
      return res.status(400).json({ message: "Please Enter a Comment!" });
    }

    const blog = await Blog.findOne({ blogId });

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    if (parentCommentId) {
      const parent = await Comment.findById(parentCommentId);
      if (!parent) return res.status(404).json({ message: "Parent comment not found" });
      if (parent.blog.toString() !== blog._id.toString()) {
        return res.status(400).json({ message: "Parent comment does not belong to this blog" });
      }
    }

    const newComment = await Comment.create({
      comment,
      blog: blog._id,
      user: creator,
      parentComment: parentCommentId || null,
    });

    await Blog.findByIdAndUpdate(blog._id,{
      $push:{comments: newComment._id}
    })
    return res.status(200).json({ succes:true, message: "Comment Added Successfully!" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

function collectDescendantCommentIds(commentId, childrenByParent) {
  const stack = [commentId];
  const all = new Set([commentId]);
  while (stack.length) {
    const current = stack.pop();
    const children = childrenByParent.get(current) || [];
    for (const childId of children) {
      if (!all.has(childId)) {
        all.add(childId);
        stack.push(childId);
      }
    }
  }
  return Array.from(all);
}

async function deleteComment(req, res) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];
    const decodedUser = decodeJWT(token);
    const userId = decodedUser.id;

    const { commentId } = req.params; // comment id

    const comment = await Comment.findById(commentId).populate({
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
      // will pull descendants below too
      $pull: { comments: comment._id }
    });

    const allComments = await Comment.find({ blog: comment.blog._id }).select("_id parentComment");
    const childrenByParent = new Map();
    for (const c of allComments) {
      const parent = c.parentComment ? c.parentComment.toString() : null;
      if (!parent) continue;
      const key = parent;
      const arr = childrenByParent.get(key) || [];
      arr.push(c._id.toString());
      childrenByParent.set(key, arr);
    }

    const toDeleteIds = collectDescendantCommentIds(comment._id.toString(), childrenByParent);

    await Blog.findByIdAndUpdate(comment.blog._id, {
      $pull: { comments: { $in: toDeleteIds } }
    });
    await Comment.deleteMany({ _id: { $in: toDeleteIds } });

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

    const { commentId } = req.params;
    const { comment } = req.body; // same key as addComment

    if (!comment) {
      return res.status(400).json({ message: "Updated comment is required!" });
    }

    const existingComment = await Comment.findById(commentId);

    if (!existingComment) {
      return res.status(404).json({ message: "Comment Not Found!" });
    }

    if (existingComment.user.toString() !== userId) {
      return res.status(403).json({ message: "You are not allowed to edit this comment!" });
    }

    const updated = await Comment.findByIdAndUpdate(
      commentId,
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
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    if(!comment.likes.includes(userId)){
      await Comment.findByIdAndUpdate(commentId,{$push:{likes:userId}})
      return res.status(200).json({
      message: "Comment Liked!"
    });
    }else{
      await Comment.findByIdAndUpdate(commentId,{$pull:{likes:userId}})
      return res.status(200).json({
      message: "Comment Disliked!"
    });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}


module.exports = {addComment,deleteComment,editComment,likeComment}