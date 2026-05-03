import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams, Link } from "react-router-dom";
import { PageLoader, Spinner } from "../components/LoadingSpinner";

function BlogPage() {
  const [blogData, setBlogData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [blogLikeBusy, setBlogLikeBusy] = useState(false);
  const [suggested, setSuggested] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null); // commentId
  const [replyText, setReplyText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const { id: blogId } = useParams();
  const navigate = useNavigate();
  const token = JSON.parse(localStorage.getItem("token"));
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  const isOwner = useMemo(() => {
    if (!blogData?.creator?.email || !currentUser?.email) return false;
    return blogData.creator.email === currentUser.email;
  }, [blogData, currentUser]);

  async function fetchBlogById(silent = false) {
    try {
      if (!silent) setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/blogs/${blogId}`);
      setBlogData(res.data.blog);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load blog");
    } finally {
      if (!silent) setLoading(false);
    }
  }

  async function fetchSuggestions() {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/blogs`);
      const all = res.data.blog || [];
      const others = all.filter((b) => b.blogId !== blogId).slice(0, 4);
      setSuggested(others);
    } catch (error) {
      // suggestions are non-critical
    }
  }

  useEffect(() => {
    setBlogData(null);
    fetchBlogById(false);
    fetchSuggestions();
  }, [blogId]);

  const commentTree = useMemo(() => {
    const comments = blogData?.comments || [];
    const byId = new Map();
    const roots = [];

    for (const c of comments) {
      const parentAuthorName = c.parentComment?.user?.name || null;
      byId.set(c._id, { ...c, parentAuthorName, children: [] });
    }
    for (const c of comments) {
      const node = byId.get(c._id);
      const parentId = c.parentComment?._id || c.parentComment;
      if (parentId && byId.has(parentId)) {
        byId.get(parentId).children.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  }, [blogData]);

  async function toggleLikeBlog() {
    if (!token) return toast.error("Please sign in");
    if (blogLikeBusy) return;
    try {
      setBlogLikeBusy(true);
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/${blogId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message);
      await fetchBlogById(true);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to like");
    } finally {
      setBlogLikeBusy(false);
    }
  }

  async function deleteBlog() {
    if (!token) return toast.error("Please sign in");
    try {
      const res = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/blogs/${blogId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(res.data.message);
      navigate("/");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete");
    }
  }

  async function submitComment(parentCommentId = null) {
    if (!token) return toast.error("Please sign in");
    const text = parentCommentId ? replyText : newComment;
    if (!text.trim()) return toast.error("Please enter a comment");
    try {
      setCommentSubmitting(true);
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/${blogId}/comments`,
        { comment: text, parentCommentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message || "Comment added");
      setNewComment("");
      setReplyTo(null);
      setReplyText("");
      await fetchBlogById(true);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to comment");
    } finally {
      setCommentSubmitting(false);
    }
  }

  async function toggleLikeComment(commentId) {
    if (!token) return toast.error("Please sign in");
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/comments/${commentId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message);
      await fetchBlogById(true);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to like comment");
    }
  }

  async function removeComment(commentId) {
    if (!token) return toast.error("Please sign in");
    try {
      const res = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(res.data.message);
      await fetchBlogById(true);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete comment");
    }
  }

  async function saveEditComment(commentId) {
    if (!token) return toast.error("Please sign in");
    if (!editingText.trim()) return toast.error("Updated comment is required");
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/comments/${commentId}`,
        { comment: editingText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message);
      setEditingCommentId(null);
      setEditingText("");
      await fetchBlogById(true);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to edit comment");
    }
  }

  function CommentNode({ node, depth = 0 }) {
    const canEdit = currentUser?.email && node?.user?.email === currentUser.email;
    const indent = Math.min(depth, 6) * 16;

    return (
      <div style={{ marginLeft: indent }} className="mt-4">
        <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 flex-1 gap-3">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-200 ring-2 ring-gray-100 dark:bg-gray-700 dark:ring-gray-800">
                {node.user?.avatar ? (
                  <img
                    src={node.user.avatar}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-gray-600 dark:text-gray-300">
                    {(node.user?.name || "?").slice(0, 1).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0 text-sm text-gray-600 dark:text-gray-300">
                <div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {node.user?.name || "User"}
                  </span>{" "}
                  <span className="text-gray-400">•</span>{" "}
                  <span className="text-gray-500 dark:text-gray-400">
                    {new Date(node.createdAt).toLocaleString()}
                  </span>
                </div>
                {node.parentAuthorName && (
                  <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    Replying to{" "}
                    <span className="font-medium text-gray-700 dark:text-gray-200">
                      {node.parentAuthorName}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => toggleLikeComment(node._id)}
                className="rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700"
              >
                Like ({node.likes?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => {
                  setReplyTo(node._id);
                  setReplyText("");
                  setEditingCommentId(null);
                }}
                className="text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800/80 border border-gray-200/70 dark:border-gray-700 text-gray-700 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                Reply
              </button>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingCommentId(node._id);
                    setEditingText(node.comment || "");
                    setReplyTo(null);
                  }}
                  className="text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800/80 border border-gray-200/70 dark:border-gray-700 text-gray-700 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  Edit
                </button>
              )}
              {(canEdit || isOwner) && (
                <button
                  type="button"
                  onClick={() => removeComment(node._id)}
                  className="text-xs px-3 py-1 rounded-full bg-red-600/90 text-white hover:bg-red-700 transition"
                >
                  Delete
                </button>
              )}
            </div>
          </div>

          {editingCommentId === node._id ? (
            <div className="mt-3">
              <textarea
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                className="w-full border rounded-lg p-2 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-100"
                rows={3}
              />
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => saveEditComment(node._id)}
                  className="px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition text-sm"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingCommentId(null);
                    setEditingText("");
                  }}
                  className="px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 hover:bg-gray-200 dark:hover:bg-gray-900 transition text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-gray-800 dark:text-gray-100 whitespace-pre-wrap">
              {node.comment}
            </p>
          )}

          {replyTo === node._id && (
            <div className="mt-3">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                disabled={commentSubmitting}
                className="w-full rounded-lg border border-gray-300 p-2 disabled:opacity-60 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
                rows={2}
                placeholder="Write a reply..."
              />
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  disabled={commentSubmitting}
                  onClick={() => submitComment(node._id)}
                  className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {commentSubmitting ? (
                    <>
                      <Spinner size="sm" variant="light" />
                      Sending…
                    </>
                  ) : (
                    "Reply"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReplyTo(null);
                    setReplyText("");
                  }}
                  className="px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 hover:bg-gray-200 dark:hover:bg-gray-900 transition text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {node.children?.length ? (
          <div className="mt-2">
            {node.children.map((child) => (
              <CommentNode key={child._id} node={child} depth={depth + 1} />
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  if (loading) {
    return <PageLoader label="Loading article…" />;
  }
  if (!blogData) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-gray-900 dark:text-gray-100">
        Not found
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)] xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-8">
          <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6 lg:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 gap-3 sm:gap-4">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-200 ring-2 ring-gray-100 dark:bg-gray-700 dark:ring-gray-800 sm:h-14 sm:w-14">
                  {blogData.creator?.avatar ? (
                    <img
                      src={blogData.creator.avatar}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-lg font-semibold text-gray-600 dark:text-gray-300">
                      {(blogData.creator?.name || "?").slice(0, 1).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-3xl lg:text-4xl">
                    {blogData.title}
                  </h1>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {blogData.creator?.name}
                    </span>
                    {blogData.creator?.occupation ? (
                      <span className="text-gray-500 dark:text-gray-400">
                        {" "}
                        · {blogData.creator.occupation}
                      </span>
                    ) : null}
                    <span className="text-gray-400"> · </span>
                    {new Date(blogData.createdAt).toDateString()}
                  </p>
                </div>
              </div>

              <div className="flex flex-shrink-0 flex-wrap gap-2 sm:justify-end">
                <button
                  type="button"
                  disabled={blogLikeBusy}
                  onClick={toggleLikeBlog}
                  className="inline-flex min-w-[7rem] items-center justify-center gap-2 rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {blogLikeBusy ? <Spinner size="sm" variant="light" /> : null}
                  Like ({blogData.likes?.length || 0})
                </button>
                {isOwner && (
                  <>
                    <Link
                      to={`/edit-blog/${blogData.blogId}`}
                      className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={deleteBlog}
                      className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>

            <img
              src={blogData.image}
              alt=""
              className="mt-6 w-full max-h-[min(480px,55vh)] rounded-xl object-cover"
            />
            <p className="mt-6 whitespace-pre-wrap text-gray-800 dark:text-gray-100">
              {blogData.description}
            </p>
          </article>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
                Comments ({blogData.comments?.length || 0})
              </h2>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 sm:p-5">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={commentSubmitting}
                className="w-full rounded-lg border border-gray-300 p-3 text-sm disabled:opacity-60 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                rows={3}
                placeholder="Write a comment..."
              />
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                  Reply to comments to create nested threads.
                </p>
                <button
                  type="button"
                  disabled={commentSubmitting}
                  onClick={() => submitComment(null)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                >
                  {commentSubmitting ? (
                    <>
                      <Spinner size="sm" variant="light" />
                      Posting…
                    </>
                  ) : (
                    "Comment"
                  )}
                </button>
              </div>
            </div>

            <div>
              {commentTree.length ? (
                commentTree.map((node) => <CommentNode key={node._id} node={node} />)
              ) : (
                <p className="mt-2 text-gray-600 dark:text-gray-300">No comments yet.</p>
              )}
            </div>
          </section>
        </div>

        <aside className="min-w-0 space-y-4 lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">
            More from this blog
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Discover other posts you might like.
          </p>
          <div className="mt-3 space-y-3">
            {suggested.length ? (
              suggested.map((b) => (
                <Link
                  key={b._id}
                  to={`/blog/${b.blogId}`}
                  className="flex gap-3 rounded-lg border border-transparent px-2 py-2 transition hover:border-gray-200 hover:bg-gray-50 dark:hover:border-gray-800 dark:hover:bg-gray-950"
                >
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    {b.creator?.avatar ? (
                      <img src={b.creator.avatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-300">
                        {(b.creator?.name || "?").slice(0, 1).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                      {b.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-gray-600 dark:text-gray-400">
                      {b.description.length > 80
                        ? b.description.slice(0, 80) + "..."
                        : b.description}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No other posts yet.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">
            Reading tips
          </h3>
          <ul className="mt-2 space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
            <li>• Use comments to ask follow-up questions.</li>
            <li>• Reply to others to keep discussions threaded.</li>
            <li>• Like posts and comments you find helpful.</li>
          </ul>
        </div>
        </aside>
      </div>
    </div>
  );
}

export default BlogPage