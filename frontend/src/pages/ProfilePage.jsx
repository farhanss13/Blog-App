import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

function ProfilePage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const token = JSON.parse(localStorage.getItem("token") || "null");

  useEffect(() => {
    if (!token || !storedUser?.id) {
      navigate("/signin");
      return;
    }

    async function load() {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/users/${storedUser.id}`
        );
        const u = res.data.user;
        setName(u.name || "");
        setEmail(u.email || "");
        if (u.avatar) {
          setAvatarPreview(u.avatar);
        }
      } catch {
        // fallback to local
        setName(storedUser.name || "");
        setEmail(storedUser.email || "");
        if (storedUser.avatar) {
          setAvatarPreview(storedUser.avatar);
        }
      }
    }

    load();
  }, []);

  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!token) {
      toast.error("Please sign in");
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", name);
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }
      const res = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(res.data.message);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50 mb-4">
        Profile
      </h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
            {avatarPreview && (
              <img
                src={avatarPreview}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Profile picture
            </label>
            <input
              type="file"
              accept=".png,.jpg,.jpeg"
              onChange={handleAvatarChange}
              className="mt-1 block text-xs text-gray-600 dark:text-gray-300"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full border rounded-lg p-2 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Email
          </label>
          <input
            type="email"
            value={email}
            disabled
            className="mt-1 w-full border rounded-lg p-2 bg-gray-50 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-400"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition text-sm disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}

export default ProfilePage;

