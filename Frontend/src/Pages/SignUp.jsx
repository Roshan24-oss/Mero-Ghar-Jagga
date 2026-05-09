import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import axiosInstance from "../api/axiosInstance.js";

const SignUp = () => {

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  // OTP STATES
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  // FORM DATA
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    role: "user",
  });

  const {
    fullName,
    email,
    password,
    phone,
    address,
    role,
  } = formData;

  // HANDLE INPUT
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // HANDLE ROLE
  const handleRoleChange = (selectedRole) => {
    setFormData({
      ...formData,
      role: selectedRole,
    });
  };

  // SEND OTP
  const sendOtp = async () => {
    try {

      if (
        !fullName ||
        !email ||
        !password ||
        !phone ||
        !address
      ) {
        return alert("Please fill all fields");
      }

      const res = await axiosInstance.post(
        "/auth/send-otp",
        { email }
      );

      alert(res.data.message);
      setOtpSent(true);

    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Failed to send OTP");
    }
  };

  // VERIFY OTP
  const verifyOtp = async () => {
    try {
      const res = await axiosInstance.post(
        "/auth/verify-otp",
        { email, otp }
      );

      alert(res.data.message);
      setOtpVerified(true);

    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Invalid OTP");
    }
  };

  // FINAL SIGNUP
  const handleSignup = async () => {
    try {

      if (!otpVerified) {
        return alert("Please verify OTP first");
      }

      const res = await axiosInstance.post(
        "/auth/signup",
        formData,
        { withCredentials: true }
      );

      console.log(res.data);

      login(res.data.user);

      alert("Signup Successful");
      navigate("/");

    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">

      <div className="bg-white shadow-lg rounded-lg p-6 w-96">

        <h2 className="text-3xl font-bold text-center mb-5">
          Sign Up
        </h2>

        {/* FULL NAME */}
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={fullName}
          onChange={handleChange}
          className="w-full mb-3 p-3 border rounded"
        />

        {/* EMAIL */}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={handleChange}
          className="w-full mb-3 p-3 border rounded"
        />

        {/* PASSWORD */}
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={handleChange}
          className="w-full mb-3 p-3 border rounded"
        />

        {/* PHONE (YOUR ORIGINAL) */}
        <input
          type="text"
          name="phone"
          placeholder="+97798XXXXXXXX"
          value={phone}
          onChange={handleChange}
          className="w-full mb-3 p-3 border rounded"
        />

        {/* ADDRESS */}
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={address}
          onChange={handleChange}
          className="w-full mb-3 p-3 border rounded"
        />

        {/* ROLE */}
        <div className="flex gap-3 mb-4">

          <button
            type="button"
            onClick={() => handleRoleChange("user")}
            className={`flex-1 p-2 rounded transition ${
              role === "user"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
          >
            User
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange("owner")}
            className={`flex-1 p-2 rounded transition ${
              role === "owner"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
          >
            Owner
          </button>
        </div>

        {/* SEND OTP */}
        <button
          type="button"
          onClick={sendOtp}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white p-3 rounded mb-3"
        >
          Send OTP
        </button>

        {/* OTP */}
        {otpSent && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full mb-3 p-3 border rounded"
            />

            <button
              type="button"
              onClick={verifyOtp}
              className={`w-full p-3 rounded mb-3 text-white ${
                otpVerified
                  ? "bg-green-700"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {otpVerified ? "OTP Verified" : "Verify OTP"}
            </button>
          </>
        )}

        {/* SIGNUP */}
        <button
          type="button"
          onClick={handleSignup}
          className="w-full bg-black hover:bg-gray-900 text-white p-3 rounded"
        >
          Create Account
        </button>

        {/* LOGIN */}
        <p className="text-center mt-5">
          Already have account?{" "}
          <Link to="/signin" className="text-blue-500">
            Login
          </Link>
        </p>

      </div>
    </div>
  );
};

export default SignUp;