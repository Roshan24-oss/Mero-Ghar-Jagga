import React, { useState, useContext } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import axiosInstance from "../api/axiosInstance.js";

const SignUp = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    role: "user"
  });

  const { fullName, email, password, phone, address, role } = formData;

  // handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // handle role change
  const handleRoleChange = (selectedRole) => {
    setFormData({ ...formData, role: selectedRole });
  };

  // submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post(
        "/auth/signup",
        formData,
        { withCredentials: true }
      );

      console.log("Signup Response:", res.data);

      // login after signup
      login(res.data.user);

      alert("Signup successful");

      // redirect
      navigate("/");

    } catch (error) {
      console.error("Signup Error:", error);
      alert(error.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form onSubmit={handleSubmit} className="p-6 shadow-md rounded w-96">
        <h2 className="text-2xl mb-4 text-center">Sign Up</h2>

        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={fullName}
          onChange={handleChange}
          className="w-full mb-3 p-2 border"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={handleChange}
          className="w-full mb-3 p-2 border"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={handleChange}
          className="w-full mb-3 p-2 border"
          required
        />

        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={phone}
          onChange={handleChange}
          className="w-full mb-3 p-2 border"
        />

        <input
          type="text"
          name="address"
          placeholder="Address"
          value={address}
          onChange={handleChange}
          className="w-full mb-3 p-2 border"
        />

        {/* Role Selection */}
        <div className="mb-3">
          <button
            type="button"
            onClick={() => handleRoleChange("user")}
            className={`mr-2 p-2 ${role === "user" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            User
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange("owner")}
            className={`p-2 ${role === "owner" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Owner
          </button>
        </div>

        <button type="submit" className="w-full bg-green-500 text-white p-2">
          Sign Up
        </button>

        <p className="text-center mt-3">
          Already have an account? <Link to="/signin" className="text-blue-500">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default SignUp;