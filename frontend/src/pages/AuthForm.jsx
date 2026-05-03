import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {toast} from 'react-hot-toast'
import axios from 'axios'
import { Spinner } from "../components/LoadingSpinner";

function AuthForm({ type }) {
  const isSignup = type === "signup";
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
  });

  async function handleSubmit(e) {
  e.preventDefault();

  const url = isSignup
    ? `${import.meta.env.VITE_BACKEND_URL}/signup`
    : `${import.meta.env.VITE_BACKEND_URL}/signin`;

  const payload = isSignup
    ? userData
    : { email: userData.email, password: userData.password };

  try {
    setSubmitting(true);
    const res = await axios.post(url, payload)
    localStorage.setItem("user",JSON.stringify(res.data.user))
    localStorage.setItem("token",JSON.stringify(res.data.token))
    window.dispatchEvent(new CustomEvent("blogsphere:user-updated"))
    toast.success(res.data.message);
    navigate("/");

  } catch (error) {
    toast.error(error.response?.data?.message || "Something went wrong");
    console.error(error);
  } finally {
    setSubmitting(false);
  }
}


  return (
    <div className="flex min-h-[calc(100vh-2rem)] items-center justify-center bg-gray-50 px-4 py-10 dark:bg-gray-950 sm:min-h-[calc(100vh-4rem)] sm:py-14">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-md flex-col gap-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-gray-900 sm:p-8"
      >
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-50">
          {isSignup ? "Sign Up" : "Sign In"}
        </h1>

        {isSignup && (
          <input
            type="text"
            placeholder="Enter your name"
            required
            disabled={submitting}
            onChange={(e) =>
              setUserData((prev) => ({ ...prev, name: e.target.value }))
            }
            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
          />
        )}

        <input
          type="email"
          placeholder="Enter your Email"
          required
          disabled={submitting}
          onChange={(e) =>
            setUserData((prev) => ({ ...prev, email: e.target.value }))
          }
          className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
        />

        <input
          type="password"
          placeholder="Enter your Password"
          required
          disabled={submitting}
          onChange={(e) =>
            setUserData((prev) => ({ ...prev, password: e.target.value }))
          }
          className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
        />

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? (
            <>
              <Spinner size="sm" variant="light" />
              {isSignup ? "Creating account…" : "Signing in…"}
            </>
          ) : isSignup ? (
            "Register"
          ) : (
            "Login"
          )}
        </button>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <Link to="/signin" className="text-blue-600 hover:underline">
                Sign In
              </Link>
            </>
          ) : (
            <>
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="text-blue-600 hover:underline">
                Sign Up
              </Link>
            </>
          )}
        </p>
      </form>
    </div>
  );
}

export default AuthForm;
