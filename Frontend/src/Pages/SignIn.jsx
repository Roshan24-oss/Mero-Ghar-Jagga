import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axiosInstance from "../api/axiosInstance.js";

import {
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
  FaArrowRight,
  FaHome,
} from "react-icons/fa";

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [data, setData] = useState({
    email: "",
    password: "",
  });

  // Handle input changes
  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  // Handle login
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    try {
      setLoading(true);

      const res = await axiosInstance.post(
        "/auth/signin",
        data,
        {
          withCredentials: true,
        }
      );

      console.log("Login Response:", res.data);

      // Store logged-in user
      login(res.data.user);

      alert("Login successful ✅");

      navigate("/", {
        replace: true,
      });
    } catch (error) {
      console.error("Login Error:", error);

      alert(
        error.response?.data?.message ||
          "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">

      {/* Main Container */}
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-amber-100">

        <div className="grid grid-cols-1 lg:grid-cols-2">

          {/* ================= LEFT SIDE ================= */}
          <div className="hidden lg:flex relative bg-gradient-to-br from-amber-600 via-orange-500 to-amber-700 p-10 xl:p-14 text-white flex-col justify-between overflow-hidden">

            {/* Decorative circles */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-white/10 rounded-full" />
            <div className="absolute top-1/2 right-10 w-20 h-20 bg-white/5 rounded-full" />

            {/* Content */}
            <div className="relative z-10">

              {/* Logo */}
              <div className="flex items-center gap-3 mb-12">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                  <FaHome className="text-amber-600 text-xl" />
                </div>

                <div>
                  <h2 className="text-xl font-bold">
                    Mero Ghar Jagga
                  </h2>

                  <p className="text-xs text-amber-100">
                    Find your perfect place
                  </p>
                </div>
              </div>

              {/* Heading */}
              <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
                Welcome
                <br />
                Back!
              </h1>

              <p className="text-amber-50 text-base xl:text-lg leading-relaxed max-w-md">
                Sign in to discover properties, manage your listings,
                and find the perfect home, land, room, or office.
              </p>
            </div>

            {/* Bottom */}
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-12 bg-amber-200/60" />
                <span className="text-sm text-amber-100">
                  Your property journey starts here
                </span>
              </div>

              <p className="text-xs text-amber-100/80">
                © {new Date().getFullYear()} Mero Ghar Jagga
              </p>
            </div>
          </div>

          {/* ================= RIGHT SIDE ================= */}
          <div className="p-6 sm:p-8 md:p-10 lg:p-12 xl:p-14 flex items-center">

            <div className="w-full max-w-md mx-auto">

              {/* Mobile Logo */}
              <div className="flex lg:hidden items-center justify-center gap-3 mb-8">

                <div className="w-11 h-11 bg-amber-100 rounded-xl flex items-center justify-center">
                  <FaHome className="text-amber-600 text-lg" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    Mero Ghar Jagga
                  </h2>

                  <p className="text-xs text-gray-500">
                    Find your perfect place
                  </p>
                </div>
              </div>

              {/* Header */}
              <div className="mb-8">

                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                  Sign In
                </h1>

                <p className="text-gray-500 text-sm sm:text-base">
                  Welcome back! Please enter your details.
                </p>

              </div>

              {/* Form */}
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* ================= EMAIL ================= */}
                <div>

                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Email Address
                  </label>

                  <div className="relative">

                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaEnvelope className="text-gray-400 text-sm" />
                    </div>

                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={data.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      autoComplete="email"
                      required
                      className="
                        w-full
                        pl-11
                        pr-4
                        py-3
                        sm:py-3.5
                        border
                        border-gray-200
                        rounded-xl
                        bg-gray-50
                        text-gray-800
                        placeholder-gray-400
                        outline-none
                        transition
                        duration-200
                        focus:bg-white
                        focus:border-amber-500
                        focus:ring-4
                        focus:ring-amber-500/10
                        hover:border-gray-300
                      "
                    />

                  </div>

                </div>

                {/* ================= PASSWORD ================= */}
                <div>

                  <div className="flex items-center justify-between mb-2">

                    <label
                      htmlFor="password"
                      className="block text-sm font-semibold text-gray-700"
                    >
                      Password
                    </label>

                  </div>

                  <div className="relative">

                    {/* Lock Icon */}
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaLock className="text-gray-400 text-sm" />
                    </div>

                    {/* Password Input */}
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={data.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                      className="
                        w-full
                        pl-11
                        pr-12
                        py-3
                        sm:py-3.5
                        border
                        border-gray-200
                        rounded-xl
                        bg-gray-50
                        text-gray-800
                        placeholder-gray-400
                        outline-none
                        transition
                        duration-200
                        focus:bg-white
                        focus:border-amber-500
                        focus:ring-4
                        focus:ring-amber-500/10
                        hover:border-gray-300
                      "
                    />

                    {/* Show / Hide Password */}
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      className="
                        absolute
                        right-3
                        top-1/2
                        -translate-y-1/2
                        w-9
                        h-9
                        flex
                        items-center
                        justify-center
                        rounded-lg
                        text-gray-400
                        hover:text-amber-600
                        hover:bg-amber-50
                        transition
                      "
                    >
                      {showPassword ? (
                        <FaEyeSlash />
                      ) : (
                        <FaEye />
                      )}
                    </button>

                  </div>

                </div>

                {/* ================= SIGN IN BUTTON ================= */}
                <button
                  type="submit"
                  disabled={loading}
                  className="
                    w-full
                    flex
                    items-center
                    justify-center
                    gap-2
                    py-3
                    sm:py-3.5
                    px-4
                    rounded-xl
                    bg-gradient-to-r
                    from-amber-600
                    to-orange-500
                    text-white
                    font-semibold
                    shadow-lg
                    shadow-amber-500/20
                    transition
                    duration-200
                    hover:from-amber-700
                    hover:to-orange-600
                    hover:shadow-xl
                    hover:shadow-amber-500/25
                    active:scale-[0.98]
                    disabled:opacity-60
                    disabled:cursor-not-allowed
                    disabled:hover:shadow-lg
                  "
                >
                  {loading ? (
                    <>
                      <span
                        className="
                          w-5
                          h-5
                          border-2
                          border-white/30
                          border-t-white
                          rounded-full
                          animate-spin
                        "
                      />

                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In
                      <FaArrowRight className="text-sm" />
                    </>
                  )}
                </button>

              </form>

              {/* ================= SIGN UP ================= */}
              <div className="mt-7">

                <div className="relative flex items-center justify-center mb-6">

                  <div className="absolute inset-x-0 h-px bg-gray-200" />

                  <span className="relative bg-white px-4 text-xs text-gray-400">
                    OR
                  </span>

                </div>

                <p className="text-sm text-center text-gray-500">

                  Don't have an account?{" "}

                  <Link
                    to="/signup"
                    className="
                      font-semibold
                      text-amber-600
                      hover:text-amber-700
                      hover:underline
                      transition
                    "
                  >
                    Create an account
                  </Link>

                </p>

              </div>

              {/* Footer */}
              <p className="text-center text-xs text-gray-400 mt-8">
                By signing in, you agree to our terms and privacy policy.
              </p>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SignIn;