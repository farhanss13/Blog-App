import { useEffect, useState } from "react";
import axios from "axios";
import { Link, Links } from "react-router-dom";

function HomePage() {
  const [blogs, setBlogs] = useState([]);

  async function fetchBlogs() {
    let res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/blogs`);
    setBlogs(res.data.blog);
  }

  useEffect(() => {
    fetchBlogs();
  }, []);

  return (
    
    <div className="ml-9 w-[60%] flex flex-col gap-6">
      {blogs.map((blog) => (
        <Link to={"blog/"+blog.blogId}>
        <div
          key={blog._id}
          className="bg-white rounded-xl shadow-sm  p-6 flex gap-6 hover:shadow-md transition"
        >
          {/* Left Content */}
          <div className="flex flex-col flex-1 gap-3">
            {/* Author */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-300"></div>
              <p className="text-sm font-medium text-gray-700">
                {blog.creator?.name}
              </p>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 hover:text-gray-700 cursor-pointer">
              {blog.title}
            </h2>

            {/* Description */}
            <p className="text-gray-600 text-sm line-clamp-3">
              {blog.description}
            </p>

            {/* Meta */}
            <div className="flex items-center gap-4 text-sm text-gray-500 pt-2">
              <p>{new Date(blog.createdAt).toDateString()}</p>
              <p>• {blog.likes || 0} likes</p>
              <p>• {blog.comments?.length || 0} comments</p>
            </div>
          </div>

          {/* Image */}
          <div className="w-40 h-28 bg-gray-200 rounded-lg shrink-0">
            <img
              src={blog.image || ""}
              alt="blog"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        </div>
        </Link>
      ))}
    </div>
  );
}

export default HomePage;
