const { get } = require("mongoose");
const Blog = require("../models/blogSchema");
const User = require("../models/userSchema");
const Comment = require("../models/commentSchema");
const { decodeJWT } = require("../utilities/generateToken");
const ShortUniqueId = require("short-unique-id")
const { randomUUID } = new ShortUniqueId({ length: 10 });

const {
  uploadImage,
  deleteImagefromCloudinary,
} = require("../utilities/uploadimage");
const fs = require("fs");
const path = require("path");

async function postBlog(req, res) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];
    const decodedUser = decodeJWT(token);
    const creator = decodedUser.id;

    const { title, description, draft } = req.body;
    const image = req.file;
    console.log({ title, description, draft, image });
    if (!title) {
      return res.status(400).json({
        message: "please fill title field",
      });
    }
    if (!description) {
      return res.status(400).json({
        message: "please fill description field",
      });
    }
    const findUser = await User.findById(creator);
    // console.log(findUser)
    if (!findUser) {
      return res.status(500).json({ message: "Who are you?" });
    }

    const { secure_url, public_id } = await uploadImage(image.path);
    fs.unlinkSync(image.path);
    const blogId = title.toLowerCase().split(" ").join("-") + "-" + randomUUID()


    const blog = await Blog.create({
      description,
      title,
      draft,
      creator,
      image: secure_url,
      imageId: public_id,
      blogId
    });
    await User.findByIdAndUpdate(creator, { $push: { blogs: blog._id } });
    return res.status(201).json({ message: "Blog Created Successfully", blog });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
async function getBlogs(req, res) {
  try {
    const blog = await Blog.find({ draft: false })
      .populate({
        path: "creator",
        select: "-password",
      })
      .populate({
        path: "likes",
        select: "email name",
      });
    return res
      .status(201)
      .json({ message: "Blogs Fetched Successfully", blog });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
async function getBlogsById(req, res) {
  try {// const { blogId } = req.params;
    // let blog = await Blog.findOne({blogId})
    const { blogId } = req.params;
    let blog = await Blog.findOne({ blogId })
      .populate({
        path: "comments",
        populate: [
          {
            path: "user",
            select: "name email avatar occupation",
          },
          {
            path: "parentComment",
            populate: {
              path: "user",
              select: "name email avatar occupation",
            },
          },
        ],
      })
      .populate({
        path: "creator",
        select: "-password",
      });
    return res.status(200).json({ message: "Blog Fetched Successfully", blog });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
async function updateblog(req, res) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];
    const decodedUser = decodeJWT(token);
    const creator = decodedUser.id;
    const { blogId } = req.params;
    const { title, description, draft } = req.body;

    const blog = await Blog.findOne({ blogId });

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    if (blog.creator.toString() !== creator) {
      return res
        .status(403)
        .json({ message: "You are not authorized for this action" });
    }

    if (title !== undefined) blog.title = title;
    if (description !== undefined) blog.description = description;
    if (draft !== undefined) blog.draft = draft;

    if (req.file) {
      const { secure_url, public_id } = await uploadImage(req.file.path);
      fs.unlinkSync(req.file.path);
      await deleteImagefromCloudinary(blog.imageId);
      blog.image = secure_url;
      blog.imageId = public_id;
    }

    await blog.save();

    return res.status(200).json({
      message: "Blog Updated Successfully",
      blog,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
async function deleteBlog(req, res) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];
    const decodedUser = decodeJWT(token);
    const creator = decodedUser.id;
    const { blogId } = req.params;

    const blog = await Blog.findOne({ blogId });

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    if (blog.creator.toString() !== creator) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this blog" });
    }

    await deleteImagefromCloudinary(blog.imageId);
    await Comment.deleteMany({ blog: blog._id });
    await Blog.findByIdAndDelete(blog._id);
    await User.findByIdAndUpdate(creator, {
      $pull: { blogs: blog._id },
    });

    return res.status(200).json({
      message: "Blog Deleted Successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
async function likeBlog(req, res) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];
    const decodedUser = decodeJWT(token);
    const creator = decodedUser.id;
    const { blogId } = req.params;

    const blog = await Blog.findOne({ blogId });

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    if (!blog.likes.includes(creator)) {
      await Blog.findByIdAndUpdate(blog._id, { $push: { likes: creator } });
      return res.status(200).json({
        message: "Blog Liked!",
      });
    } else {
      await Blog.findByIdAndUpdate(blog._id, { $pull: { likes: creator } });
      return res.status(200).json({
        message: "Blog Disliked!",
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = {
  postBlog,
  getBlogs,
  getBlogsById,
  updateblog,
  deleteBlog,
  likeBlog,
};
