import { useState } from "react";
import { data, Link } from "react-router-dom";
import {toast} from 'react-hot-toast'
import axios from 'axios'

function AuthForm({ type }) {
  const isSignup = type === "signup";

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
    
    const res = await axios.post(url,userData)
    localStorage.setItem("user",JSON.stringify(res.data.user))
    localStorage.setItem("token",JSON.stringify(res.data.token))
    toast.success(res.data.message);
    console.log(res);

  } catch (error) {
    toast.error(error.response.data.message);
    console.error(error);
  }
}


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-6"
      >
        <h1 className="text-3xl font-bold text-center text-gray-800">
          {isSignup ? "Sign Up" : "Sign In"}
        </h1>

        {isSignup && (
          <input
            type="text"
            placeholder="Enter your name"
            required
            onChange={(e) =>
              setUserData((prev) => ({ ...prev, name: e.target.value }))
            }
            className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        )}

        <input
          type="email"
          placeholder="Enter your Email"
          required
          onChange={(e) =>
            setUserData((prev) => ({ ...prev, email: e.target.value }))
          }
          className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 outline-none"
        />

        <input
          type="password"
          placeholder="Enter your Password"
          required
          onChange={(e) =>
            setUserData((prev) => ({ ...prev, password: e.target.value }))
          }
          className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 outline-none"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          {isSignup ? "Register" : "Login"}
        </button>

        <p className="text-center text-sm text-gray-500">
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
