import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import logoFullBlack from "../assets/Logo Full Black.png";
import logoFullWhite from "../assets/Logo Full White.png";

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "null")
  );

  const isAuthed = Boolean(localStorage.getItem("token"));

  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem("user") || "null"));
  }, [location.pathname]);

  useEffect(() => {
    function syncUser() {
      setUser(JSON.parse(localStorage.getItem("user") || "null"));
    }
    window.addEventListener("blogsphere:user-updated", syncUser);
    return () => window.removeEventListener("blogsphere:user-updated", syncUser);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/signin");
  }

  const logoSrc = theme === "dark" ? logoFullWhite : logoFullBlack;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-800 shadow-sm">
  <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">

    {/* Logo */}
    <Link to="/" className="flex items-center">
      <img
        src={logoSrc}
        alt="BlogSphere"
        className="h-8 sm:h-9 md:h-10 w-auto"
      />
    </Link>

    {/* Actions */}
    <nav className="flex items-center gap-2 sm:gap-3">

      {/* Theme toggle */}
      <button
        onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        className="rounded-md bg-gray-100 px-2.5 py-1 text-xs text-gray-700 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
        type="button"
      >
        {theme === "dark" ? "Light" : "Dark"}
      </button>

      {isAuthed ? (
        <>
          {/* Profile */}
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 rounded-md px-2 py-1 text-xs text-gray-700 transition hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
          >
            <div className="h-7 w-7 overflow-hidden rounded-full bg-gray-200 ring-2 ring-gray-200 dark:bg-gray-700 dark:ring-gray-600">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || "avatar"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-xs font-semibold">
                  {(user?.name || "?").slice(0, 1).toUpperCase()}
                </span>
              )}
            </div>

            <span className="max-w-[120px] truncate text-sm font-medium">
              {user?.name || "Profile"}
            </span>
          </button>

          {/* New blog */}
          <Link
            to="/add-blog"
            className="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-blue-700"
          >
            New blog
          </Link>

          {/* Logout */}
          <button
            onClick={logout}
            className="rounded-md bg-gray-100 px-3 py-1 text-xs text-gray-700 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
            type="button"
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <Link
            to="/signin"
            className="rounded-md bg-gray-100 px-3 py-1 text-xs text-gray-700 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-blue-700"
          >
            Sign up
          </Link>
        </>
      )}
    </nav>
  </div>
</header>

      <div className="min-h-[calc(100vh-4rem)] w-full bg-gray-50 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </div>
    </>
  );
}

export default NavBar;
