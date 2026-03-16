import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams, Link } from "react-router-dom";

function BlogPage() {
  const [blogData, setBlogData] = useState(null);
  const [loading, setLoading] = useState(true);
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

  async function fetchBlogById() {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/blogs/${blogId}`);
      setBlogData(res.data.blog);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load blog");
    } finally {
      setLoading(false);
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
    fetchBlogById();
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
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/${blogId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message);
      fetchBlogById();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to like");
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
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/${blogId}/comments`,
        { comment: text, parentCommentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message || "Comment added");
      setNewComment("");
      setReplyTo(null);
      setReplyText("");
      fetchBlogById();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to comment");
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
      fetchBlogById();
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
      fetchBlogById();
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
      fetchBlogById();
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
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-gray-600 dark:text-gray-300">
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
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Replying to{" "}
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    {node.parentAuthorName}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleLikeComment(node._id)}
                className="text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800/80 border border-gray-200/70 dark:border-gray-700 text-gray-700 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
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
                className="w-full border rounded-lg p-2 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-100"
                rows={2}
                placeholder="Write a reply..."
              />
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => submitComment(node._id)}
                  className="px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition text-sm"
                >
                  Reply
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

  if (loading) return <h1 className="text-gray-900 dark:text-gray-100">Loading...</h1>;
  if (!blogData) return <h1 className="text-gray-900 dark:text-gray-100">Not found</h1>;

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)] gap-8">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">{blogData.title}</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              By <span className="font-medium">{blogData.creator?.name}</span>{" "}
              <span className="text-gray-400">•</span>{" "}
              {new Date(blogData.createdAt).toDateString()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleLikeBlog}
              className="px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 hover:bg-gray-200 dark:hover:bg-gray-900 transition text-sm"
            >
              Like ({blogData.likes?.length || 0})
            </button>
            {isOwner && (
              <>
                <Link
                  to={`/edit-blog/${blogData.blogId}`}
                  className="px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition text-sm"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={deleteBlog}
                  className="px-3 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700 transition text-sm"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        <img src={blogData.image} alt="" className="mt-5 w-full max-h-[480px] object-cover rounded-xl" />
        <p className="mt-5 text-gray-800 dark:text-gray-100 whitespace-pre-wrap">{blogData.description}</p>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
            Comments ({blogData.comments?.length || 0})
          </h2>
        </div>

        <div className="mt-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full border rounded-lg p-3 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-100"
            rows={3}
            placeholder="Write a comment..."
          />
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Tip: reply to create nested threads.
            </p>
            <button
              type="button"
              onClick={() => submitComment(null)}
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition text-sm"
            >
              Comment
            </button>
          </div>
        </div>

        <div className="mt-2">
          {commentTree.length ? (
            commentTree.map((node) => <CommentNode key={node._id} node={node} />)
          ) : (
            <p className="mt-4 text-gray-600 dark:text-gray-300">No comments yet.</p>
          )}
        </div>
      </div>

      <aside className="space-y-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4">
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
                  className="block rounded-lg px-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-950 transition border border-transparent hover:border-gray-200 dark:hover:border-gray-800"
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
                    {b.title}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                    {b.description.length > 80
                      ? b.description.slice(0, 80) + "..."
                      : b.description}
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No other posts yet.
              </p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4">
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
  );
}

export default BlogPage