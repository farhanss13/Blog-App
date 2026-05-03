import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { PageLoader, Spinner } from "../components/LoadingSpinner";

function ProfilePage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [occupation, setOccupation] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  const token = JSON.parse(localStorage.getItem("token") || "null");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user") || "null");
    const tok = JSON.parse(localStorage.getItem("token") || "null");
    if (!tok || !stored?.id) {
      navigate("/signin");
      return;
    }

    async function load() {
      try {
        setProfileLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/users/${stored.id}`
        );
        const u = res.data.user;
        setName(u.name || "");
        setEmail(u.email || "");
        setOccupation(u.occupation || "");
        setBio(u.bio || "");
        setLocation(u.location || "");
        setWebsite(u.website || "");
        if (u.avatar) setAvatarPreview(u.avatar);
      } catch {
        setName(stored.name || "");
        setEmail(stored.email || "");
        setOccupation(stored.occupation || "");
        setBio(stored.bio || "");
        setLocation(stored.location || "");
        setWebsite(stored.website || "");
        if (stored.avatar) setAvatarPreview(stored.avatar);
      } finally {
        setProfileLoading(false);
      }
    }

    load();
  }, [navigate]);

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
      formData.append("occupation", occupation);
      formData.append("bio", bio);
      formData.append("location", location);
      formData.append("website", website);
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
      window.dispatchEvent(new CustomEvent("blogsphere:user-updated"));
      navigate("/");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  }

  if (profileLoading) {
    return <PageLoader label="Loading profile…" />;
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-3xl">
          Your profile
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Update how readers see you across BlogSphere. Email cannot be changed.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col items-center text-center">
            <div className="relative h-28 w-28 overflow-hidden rounded-full bg-gray-100 ring-4 ring-gray-100 dark:bg-gray-800 dark:ring-gray-800">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-3xl font-semibold text-gray-400">
                  {(name || "?").slice(0, 1).toUpperCase()}
                </span>
              )}
            </div>
            <p className="mt-4 font-semibold text-gray-900 dark:text-gray-50">{name || "Your name"}</p>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{email}</p>
            {occupation ? (
              <p className="mt-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                {occupation}
              </p>
            ) : null}
            {location ? (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{location}</p>
            ) : null}
          </div>
        </aside>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Profile picture
              </label>
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.webp"
                onChange={handleAvatarChange}
                className="mt-2 block w-full text-xs text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-xs file:font-medium file:text-white hover:file:bg-blue-700 dark:text-gray-300 dark:file:bg-blue-500 dark:hover:file:bg-blue-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Display name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Email
              </label>
              <input
                type="email"
                value={email}
                disabled
                readOnly
                className="mt-1 w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-400"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Email is tied to your account and cannot be edited here.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Occupation
              </label>
              <input
                type="text"
                placeholder="e.g. Software engineer"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Location
              </label>
              <input
                type="text"
                placeholder="City, country"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Website
              </label>
              <input
                type="url"
                placeholder="https://"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Bio
              </label>
              <textarea
                rows={4}
                placeholder="A short introduction..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={500}
                className="mt-1 w-full resize-none rounded-lg border border-gray-300 p-2.5 text-sm dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              />
              <p className="mt-1 text-xs text-gray-500">{bio.length}/500</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Spinner size="sm" variant="light" />
                  Saving…
                </>
              ) : (
                "Save profile"
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfilePage;
