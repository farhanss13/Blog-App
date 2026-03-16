import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

function AddBlog() {
  const{id}=useParams()
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
    }
  }
  async function fetchBlogById(){
      try {
         let res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/blogs/${id}`)
         setBlogData({
          title: res.data.blog.title,
          description: res.data.blog.description,
          image: null
         })
         setPreview(res.data.blog.image || null)
      } catch (error) {
        toast.error(error)
      }
    }
  
 useEffect(()=>{
  if(id){
    fetchBlogById()
  }
},[])

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
        className="w-125 bg-white dark:bg-gray-900 p-8 rounded-xl shadow-md  flex flex-col gap-5 border border-transparent dark:border-gray-800"
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
            className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-100"
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
            className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none dark:bg-gray-950 dark:border-gray-800 dark:text-gray-100"
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
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>

        <button
          type="submit"
          className="bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-700 transition dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          {id ? "Save Changes" : "Post Blog"}
        </button>
      </form>
    </div>
  );
}

export default AddBlog;
