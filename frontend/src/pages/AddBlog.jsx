import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function AddBlog() {
  const [blogData, setBlogData] = useState({
    title: "",
    description: "",
    image: null,
  });

  const [preview, setPreview] = useState(null);

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
      const formData = new FormData();
      formData.append("title", blogData.title);
      formData.append("description", blogData.description);
      formData.append("image", blogData.image);

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/blogs`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(res.data.message);
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setBlogData((prev) => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file)); // preview
    }
  }

  return (
    <div className="flex justify-center mt-10">
      <form
        onSubmit={handleSubmit}
        className="w-125 bg-white p-8 rounded-xl shadow-md  flex flex-col gap-5"
      >
        <h2 className="text-2xl font-bold text-gray-800 text-center">
          Create Blog
        </h2>

        {/* Title */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-600">Title</label>
          <input
            type="text"
            placeholder="Enter blog title"
            className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
            onChange={(e) =>
              setBlogData((prev) => ({ ...prev, title: e.target.value }))
            }
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-600">
            Description
          </label>
          <textarea
            rows="4"
            placeholder="Enter blog description"
            className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
            onChange={(e) =>
              setBlogData((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
          />
        </div>

        {/* Image Upload Box */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-600">
            Upload Image
          </label>

          <label
            className="w-full h-48 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer overflow-hidden hover:border-gray-400 transition"
          >
            {preview ? (
              <img
                src={preview}
                alt="preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-400">
                Click to upload image
              </span>
            )}

            <input
              type="file"
              accept=".png, .jpg, .jpeg"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Button */}
        <button
          type="submit"
          className="bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-700 transition"
        >
          Post Blog
        </button>
      </form>
    </div>
  );
}

export default AddBlog;
