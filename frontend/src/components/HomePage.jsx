import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

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
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)] gap-8">
      <div className="flex flex-col gap-6">
        {blogs.map((blog) => (
          <Link key={blog._id} to={"blog/" + blog.blogId}>
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm  p-6 flex gap-6 hover:shadow-md transition border border-transparent dark:border-gray-800">
              {/* Left Content */}
              <div className="flex flex-col flex-1 gap-3">
                {/* Author */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden">
                    {blog.creator?.avatar && (
                      <img
                        src={blog.creator.avatar}
                        alt={blog.creator.name || "avatar"}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {blog.creator?.name}
                  </p>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer">
                  {blog.title}
                </h2>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
                  {blog.description}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 pt-2">
                  <p>{new Date(blog.createdAt).toDateString()}</p>
                  <p>• {blog.likes?.length || 0} likes</p>
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

      <aside className="space-y-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">
            About this blog
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            A place to share ideas, stories, and tutorials. Create posts, discuss in the comments,
            and explore what others are writing.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">
            Popular topics
          </h3>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {["Web Dev", "React", "JavaScript", "Backend", "MongoDB", "Design"].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">
            Writing tips
          </h3>
          <ul className="mt-2 space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
            <li>• Use clear titles that describe your post.</li>
            <li>• Break long posts into sections.</li>
            <li>• Add images to make posts more engaging.</li>
            <li>• Encourage discussion with a question at the end.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

export default HomePage;
