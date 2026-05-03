import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { PageLoader, Spinner } from "../components/LoadingSpinner";

function AddBlog() {
  const { id } = useParams();
  const [blogData, setBlogData] = useState({
    title: "",
    description: "",
    image: null,
  });

  const [preview, setPreview] = useState(null);
  const [loadingEdit, setLoadingEdit] = useState(Boolean(id));
  const [submitting, setSubmitting] = useState(false);

  const token = JSON.parse(localStorage.getItem("token"));
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/signin");
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("title", blogData.title);
      formData.append("description", blogData.description);
      if (blogData.image instanceof File) {
        formData.append("image", blogData.image);
      }

      const url = id
        ? `${import.meta.env.VITE_BACKEND_URL}/blogs/${id}`
        : `${import.meta.env.VITE_BACKEND_URL}/blogs`;

      const method = id ? "patch" : "post";
      const res = await axios[method](url, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(res.data.message);
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }
  async function fetchBlogById() {
    try {
      setLoadingEdit(true);
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/blogs/${id}`);
      setBlogData({
        title: res.data.blog.title,
        description: res.data.blog.description,
        image: null,
      });
      setPreview(res.data.blog.image || null);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not load blog");
      navigate("/");
    } finally {
      setLoadingEdit(false);
    }
  }

  useEffect(() => {
    if (id) {
      fetchBlogById();
    }
  }, []);

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setBlogData((prev) => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file)); // preview
    }
  }

  if (loadingEdit) {
    return <PageLoader label="Loading editor…" />;
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl justify-center px-0 pb-8 pt-2 sm:pt-6">
      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8"
      >
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-50 text-center">
          {id ? "Edit Blog" : "Create Blog"}
        </h2>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Title</label>
          <input
            type="text"
            placeholder="Enter blog title"
            value={blogData.title}
            disabled={submitting}
            className="rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-60 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
            onChange={(e) =>
              setBlogData((prev) => ({ ...prev, title: e.target.value }))
            }
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Description
          </label>
          <textarea
            rows="4"
            placeholder="Enter blog description"
            value={blogData.description}
            disabled={submitting}
            className="resize-none rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-60 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
            onChange={(e) =>
              setBlogData((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Upload Image
          </label>

          <label
            className="w-full h-48 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer overflow-hidden hover:border-gray-400 transition dark:border-gray-800 dark:hover:border-gray-700"
          >
            {preview ? (
              <img
                src={preview}
                alt="preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-400 dark:text-gray-500">
                Click to upload image
              </span>
            )}

            <input
              type="file"
              accept=".png, .jpg, .jpeg"
              disabled={submitting}
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-800 py-2 text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          {submitting ? (
            <>
              <Spinner size="sm" variant="light" />
              {id ? "Saving…" : "Publishing…"}
            </>
          ) : id ? (
            "Save Changes"
          ) : (
            "Post Blog"
          )}
        </button>
      </form>
    </div>
  );
}

export default AddBlog;
