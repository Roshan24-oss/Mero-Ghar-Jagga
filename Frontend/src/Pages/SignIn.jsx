import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useContext } from "react";
import {AuthContext} from "../context/AuthContext";
import axiosInstance from "../api/axiosInstance.js"
const SignIn = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axiosInstance.post(
        "/auth/signin",
        data,
        { withCredentials: true }
      );
console.log("Login Response:", res.data);
     login(res.data.user);

      alert("Login successful ✅");
      navigate("/");


    } catch (error) {
      alert(error.response?.data?.message || "Login failed ❌");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-amber-100">
      <div className="w-[400px] border-2 border-amber-600 bg-white rounded-lg p-6">

        <h1 className="text-2xl font-bold text-pink-600 text-center mb-6">
          Mero Ghar Jagga
        </h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={data.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={data.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-amber-600 text-white py-2 rounded-md hover:bg-amber-700"
          >
            Sign In
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-amber-600">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;