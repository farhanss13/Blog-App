import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
function HomeFeedSkeleton() {
  return (
    <>
      {[0, 1, 2].map((key) => (
        <div
          key={key}
          className="flex animate-pulse flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:gap-6 sm:p-6"
        >
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 shrink-0 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-3 w-20 rounded bg-gray-100 dark:bg-gray-800" />
              </div>
            </div>
            <div className="h-6 w-4/5 rounded bg-gray-200 dark:bg-gray-700 sm:h-7" />
            <div className="space-y-2">
              <div className="h-3 w-full rounded bg-gray-100 dark:bg-gray-800" />
              <div className="h-3 w-full rounded bg-gray-100 dark:bg-gray-800" />
              <div className="h-3 w-2/3 rounded bg-gray-100 dark:bg-gray-800" />
            </div>
            <div className="flex gap-3 pt-1">
              <div className="h-3 w-24 rounded bg-gray-100 dark:bg-gray-800" />
              <div className="h-3 w-16 rounded bg-gray-100 dark:bg-gray-800" />
            </div>
          </div>
          <div className="h-44 w-full shrink-0 rounded-xl bg-gray-200 dark:bg-gray-700 sm:h-auto sm:w-44 md:w-52" />
        </div>
      ))}
    </>
  );
}

function HomePage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchBlogs() {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/blogs`);
      setBlogs(res.data.blog || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Could not load posts.");
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBlogs();
  }, []);

  const showEmpty = !loading && !error && blogs.length === 0;

  return (
    <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)] xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex min-w-0 flex-col gap-5 sm:gap-6">
        {loading ? <HomeFeedSkeleton /> : null}

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/50 dark:bg-red-950/30">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
            <button
              type="button"
              onClick={() => fetchBlogs()}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        ) : null}

        {showEmpty ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-gray-700 dark:bg-gray-900">
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-50">No posts yet</p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Sign in and publish the first story on BlogSphere.
            </p>
          </div>
        ) : null}

        {!loading &&
          blogs.map((blog) => (
            <Link key={blog._id} to={"blog/" + blog.blogId} className="block">
              <article className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 sm:flex-row sm:gap-6 sm:p-6">
                <div className="flex min-w-0 flex-1 flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-gray-200 ring-2 ring-gray-100 dark:bg-gray-700 dark:ring-gray-800">
                      {blog.creator?.avatar ? (
                        <img
                          src={blog.creator.avatar}
                          alt={blog.creator.name || ""}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-gray-600 dark:text-gray-300">
                          {(blog.creator?.name || "?").slice(0, 1).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {blog.creator?.name}
                      </p>
                      {blog.creator?.occupation ? (
                        <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                          {blog.creator.occupation}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-2xl">
                    {blog.title}
                  </h2>

                  <p className="line-clamp-3 text-sm text-gray-600 dark:text-gray-300 sm:text-base">
                    {blog.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                    <span>{new Date(blog.createdAt).toDateString()}</span>
                    <span>• {blog.likes?.length || 0} likes</span>
                    <span>• {blog.comments?.length || 0} comments</span>
                  </div>
                </div>

                <div className="h-44 w-full shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 sm:h-auto sm:w-44 md:w-52">
                  <img src={blog.image || ""} alt="" className="h-full w-full object-cover" />
                </div>
              </article>
            </Link>
          ))}
      </div>

      <aside className="min-w-0 space-y-4 lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">
            About BlogSphere
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            Share stories, tutorials, and ideas. Comment, reply in threads, and connect with other writers.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">
            Popular topics
          </h3>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {["Web Dev", "React", "JavaScript", "Backend", "MongoDB", "Design"].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">
            Writing tips
          </h3>
          <ul className="mt-3 space-y-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400 sm:text-sm">
            <li>Use clear titles that describe your post.</li>
            <li>Break long posts into short paragraphs.</li>
            <li>Add a cover image for stronger first impressions.</li>
            <li>End with a question to spark discussion.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

export default HomePage;
