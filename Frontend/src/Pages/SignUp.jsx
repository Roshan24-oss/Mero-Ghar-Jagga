import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import axiosInstance from "../api/axiosInstance.js";

import {
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaHome,
  FaUserTie,
  FaArrowRight,
  FaCheckCircle,
  FaShieldAlt,
} from "react-icons/fa";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);

  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [creatingAccount, setCreatingAccount] = useState(false);

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  // ================= OTP STATES =================
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  // ================= FORM DATA =================
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

  // ================= HANDLE INPUT =================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ================= HANDLE ROLE =================
  const handleRoleChange = (selectedRole) => {
    setFormData({
      ...formData,
      role: selectedRole,
    });
  };

  // ================= SEND OTP =================
  const sendOtp = async () => {
    try {
      if (
        !fullName.trim() ||
        !email.trim() ||
        !password ||
        !phone.trim() ||
        !address.trim()
      ) {
        return alert("Please fill all fields");
      }

      setSendingOtp(true);

      const res = await axiosInstance.post(
        "/auth/send-otp",
        { email }
      );

      alert(res.data.message);

      setOtpSent(true);
      setOtpVerified(false);
      setOtp("");

    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          "Failed to send OTP"
      );
    } finally {
      setSendingOtp(false);
    }
  };

  // ================= VERIFY OTP =================
  const verifyOtp = async () => {
    try {
      if (!otp.trim()) {
        return alert("Please enter the OTP");
      }

      setVerifyingOtp(true);

      const res = await axiosInstance.post(
        "/auth/verify-otp",
        {
          email,
          otp,
        }
      );

      alert(res.data.message);

      setOtpVerified(true);

    } catch (error) {
      console.log(error);

      setOtpVerified(false);

      alert(
        error.response?.data?.message ||
          "Invalid OTP"
      );
    } finally {
      setVerifyingOtp(false);
    }
  };

  // ================= SIGNUP =================
  const handleSignup = async () => {
    try {
      if (!otpVerified) {
        return alert("Please verify OTP first");
      }

      setCreatingAccount(true);

      const res = await axiosInstance.post(
        "/auth/signup",
        formData,
        {
          withCredentials: true,
        }
      );

      console.log(res.data);

      login(res.data.user);

      alert("Signup Successful ✅");

      navigate("/", {
        replace: true,
      });

    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          "Signup failed"
      );
    } finally {
      setCreatingAccount(false);
    }
  };

  return (
    <div
      className="
        min-h-screen
        lg:h-screen
        bg-gradient-to-br
        from-amber-50
        via-orange-50
        to-yellow-100
        flex
        items-center
        justify-center
        px-3
        sm:px-5
        py-3
        lg:py-4
      "
    >

      {/* ================= MAIN CARD ================= */}

      <div
        className="
          w-full
          max-w-5xl
          bg-white
          rounded-2xl
          shadow-2xl
          overflow-hidden
          border
          border-amber-100
          max-h-full
        "
      >

        <div className="grid grid-cols-1 lg:grid-cols-2">

          {/* ================================================= */}
          {/* LEFT SIDE */}
          {/* ================================================= */}

          <div
            className="
              hidden
              lg:flex
              relative
              bg-gradient-to-br
              from-amber-600
              via-orange-500
              to-amber-700
              px-10
              xl:px-12
              py-8
              text-white
              flex-col
              justify-between
              overflow-hidden
            "
          >

            {/* Decorative circles */}

            <div className="
              absolute
              -top-24
              -right-24
              w-64
              h-64
              bg-white/10
              rounded-full
            " />

            <div className="
              absolute
              -bottom-28
              -left-28
              w-72
              h-72
              bg-white/10
              rounded-full
            " />

            {/* Logo */}

            <div className="relative z-10">

              <div className="flex items-center gap-3 mb-8">

                <div className="
                  w-11
                  h-11
                  bg-white
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  shadow-lg
                ">
                  <FaHome className="text-amber-600 text-lg" />
                </div>

                <div>
                  <h2 className="text-lg font-bold">
                    Mero Ghar Jagga
                  </h2>

                  <p className="text-[11px] text-amber-100">
                    Find your perfect place
                  </p>
                </div>

              </div>

              {/* Heading */}

              <h1 className="
                text-3xl
                xl:text-4xl
                font-bold
                leading-tight
                mb-4
              ">
                Find Your
                <br />
                Perfect Place
              </h1>

              <p className="
                text-amber-50
                text-sm
                leading-relaxed
                max-w-sm
              ">
                Create your account and start exploring
                homes, land, rooms, and offices across
                Nepal.
              </p>

              {/* Features */}

              <div className="mt-7 space-y-3">

                <div className="flex items-center gap-3">

                  <div className="
                    w-7
                    h-7
                    rounded-full
                    bg-white/15
                    flex
                    items-center
                    justify-center
                  ">
                    <FaCheckCircle className="text-xs" />
                  </div>

                  <span className="text-xs text-amber-50">
                    Discover properties easily
                  </span>

                </div>

                <div className="flex items-center gap-3">

                  <div className="
                    w-7
                    h-7
                    rounded-full
                    bg-white/15
                    flex
                    items-center
                    justify-center
                  ">
                    <FaCheckCircle className="text-xs" />
                  </div>

                  <span className="text-xs text-amber-50">
                    Connect with property owners
                  </span>

                </div>

                <div className="flex items-center gap-3">

                  <div className="
                    w-7
                    h-7
                    rounded-full
                    bg-white/15
                    flex
                    items-center
                    justify-center
                  ">
                    <FaCheckCircle className="text-xs" />
                  </div>

                  <span className="text-xs text-amber-50">
                    Find your ideal property
                  </span>

                </div>

              </div>

            </div>

            {/* Bottom */}

            <div className="relative z-10">

              <div className="flex items-center gap-2 mb-2">

                <div className="
                  h-px
                  w-8
                  bg-amber-200/60
                " />

                <span className="text-[11px] text-amber-100">
                  Your property journey starts here
                </span>

              </div>

              <p className="text-[10px] text-amber-100/80">
                © {new Date().getFullYear()} Mero Ghar Jagga
              </p>

            </div>

          </div>

          {/* ================================================= */}
          {/* RIGHT SIDE */}
          {/* ================================================= */}

          <div
            className="
              px-5
              py-5
              sm:px-7
              sm:py-6
              lg:px-8
              xl:px-10
              lg:py-6
            "
          >

            <div className="w-full max-w-md mx-auto">

              {/* MOBILE LOGO */}

              <div className="
                flex
                lg:hidden
                items-center
                justify-center
                gap-2
                mb-4
              ">

                <div className="
                  w-9
                  h-9
                  bg-amber-100
                  rounded-lg
                  flex
                  items-center
                  justify-center
                ">
                  <FaHome className="text-amber-600 text-sm" />
                </div>

                <div>
                  <h2 className="text-base font-bold text-gray-800">
                    Mero Ghar Jagga
                  </h2>

                  <p className="text-[10px] text-gray-500">
                    Find your perfect place
                  </p>
                </div>

              </div>

              {/* HEADER */}

              <div className="mb-4">

                <h1 className="
                  text-2xl
                  sm:text-3xl
                  font-bold
                  text-gray-900
                  mb-1
                ">
                  Create Account
                </h1>

                <p className="text-xs sm:text-sm text-gray-500">
                  Join us and start your property journey.
                </p>

              </div>

              {/* ================= FORM ================= */}

              <div className="space-y-3">

                {/* NAME + EMAIL */}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                  {/* NAME */}

                  <div>

                    <label className="
                      block
                      text-xs
                      font-semibold
                      text-gray-700
                      mb-1
                    ">
                      Full Name
                    </label>

                    <div className="relative">

                      <FaUser className="
                        absolute
                        left-3
                        top-1/2
                        -translate-y-1/2
                        text-gray-400
                        text-xs
                      " />

                      <input
                        type="text"
                        name="fullName"
                        placeholder="Full name"
                        value={fullName}
                        onChange={handleChange}
                        className="
                          w-full
                          pl-9
                          pr-3
                          py-2.5
                          text-sm
                          border
                          border-gray-200
                          rounded-lg
                          bg-gray-50
                          outline-none
                          focus:bg-white
                          focus:border-amber-500
                          focus:ring-2
                          focus:ring-amber-500/10
                        "
                      />

                    </div>

                  </div>

                  {/* EMAIL */}

                  <div>

                    <label className="
                      block
                      text-xs
                      font-semibold
                      text-gray-700
                      mb-1
                    ">
                      Email
                    </label>

                    <div className="relative">

                      <FaEnvelope className="
                        absolute
                        left-3
                        top-1/2
                        -translate-y-1/2
                        text-gray-400
                        text-xs
                      " />

                      <input
                        type="email"
                        name="email"
                        placeholder="Email address"
                        value={email}
                        onChange={handleChange}
                        className="
                          w-full
                          pl-9
                          pr-3
                          py-2.5
                          text-sm
                          border
                          border-gray-200
                          rounded-lg
                          bg-gray-50
                          outline-none
                          focus:bg-white
                          focus:border-amber-500
                          focus:ring-2
                          focus:ring-amber-500/10
                        "
                      />

                    </div>

                  </div>

                </div>

                {/* PASSWORD */}

                <div>

                  <label className="
                    block
                    text-xs
                    font-semibold
                    text-gray-700
                    mb-1
                  ">
                    Password
                  </label>

                  <div className="relative">

                    <FaLock className="
                      absolute
                      left-3
                      top-1/2
                      -translate-y-1/2
                      text-gray-400
                      text-xs
                    " />

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      name="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={handleChange}
                      className="
                        w-full
                        pl-9
                        pr-10
                        py-2.5
                        text-sm
                        border
                        border-gray-200
                        rounded-lg
                        bg-gray-50
                        outline-none
                        focus:bg-white
                        focus:border-amber-500
                        focus:ring-2
                        focus:ring-amber-500/10
                      "
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      className="
                        absolute
                        right-2
                        top-1/2
                        -translate-y-1/2
                        w-7
                        h-7
                        flex
                        items-center
                        justify-center
                        text-gray-400
                        hover:text-amber-600
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

                {/* PHONE + ADDRESS */}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                  {/* PHONE */}

                  <div>

                    <label className="
                      block
                      text-xs
                      font-semibold
                      text-gray-700
                      mb-1
                    ">
                      Phone
                    </label>

                    <div className="relative">

                      <FaPhone className="
                        absolute
                        left-3
                        top-1/2
                        -translate-y-1/2
                        text-gray-400
                        text-xs
                      " />

                      <input
                        type="text"
                        name="phone"
                        placeholder="+977 98XXXXXXXX"
                        value={phone}
                        onChange={handleChange}
                        className="
                          w-full
                          pl-9
                          pr-2
                          py-2.5
                          text-sm
                          border
                          border-gray-200
                          rounded-lg
                          bg-gray-50
                          outline-none
                          focus:bg-white
                          focus:border-amber-500
                          focus:ring-2
                          focus:ring-amber-500/10
                        "
                      />

                    </div>

                  </div>

                  {/* ADDRESS */}

                  <div>

                    <label className="
                      block
                      text-xs
                      font-semibold
                      text-gray-700
                      mb-1
                    ">
                      Address
                    </label>

                    <div className="relative">

                      <FaMapMarkerAlt className="
                        absolute
                        left-3
                        top-1/2
                        -translate-y-1/2
                        text-gray-400
                        text-xs
                      " />

                      <input
                        type="text"
                        name="address"
                        placeholder="Your address"
                        value={address}
                        onChange={handleChange}
                        className="
                          w-full
                          pl-9
                          pr-2
                          py-2.5
                          text-sm
                          border
                          border-gray-200
                          rounded-lg
                          bg-gray-50
                          outline-none
                          focus:bg-white
                          focus:border-amber-500
                          focus:ring-2
                          focus:ring-amber-500/10
                        "
                      />

                    </div>

                  </div>

                </div>

                {/* ROLE */}

                <div>

                  <label className="
                    block
                    text-xs
                    font-semibold
                    text-gray-700
                    mb-1
                  ">
                    Account Type
                  </label>

                  <div className="grid grid-cols-2 gap-3">

                    <button
                      type="button"
                      onClick={() =>
                        handleRoleChange("user")
                      }
                      className={`
                        flex
                        items-center
                        justify-center
                        gap-2
                        py-2.5
                        rounded-lg
                        border
                        text-sm
                        font-medium
                        transition
                        ${
                          role === "user"
                            ? "border-amber-500 bg-amber-50 text-amber-700"
                            : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                        }
                      `}
                    >

                      <FaUser />

                      User

                      {role === "user" && (
                        <FaCheckCircle className="text-xs" />
                      )}

                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleRoleChange("owner")
                      }
                      className={`
                        flex
                        items-center
                        justify-center
                        gap-2
                        py-2.5
                        rounded-lg
                        border
                        text-sm
                        font-medium
                        transition
                        ${
                          role === "owner"
                            ? "border-amber-500 bg-amber-50 text-amber-700"
                            : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                        }
                      `}
                    >

                      <FaUserTie />

                      Owner

                      {role === "owner" && (
                        <FaCheckCircle className="text-xs" />
                      )}

                    </button>

                  </div>

                </div>

                {/* ================= OTP ================= */}

                <div>

                  <div className="flex items-center justify-between mb-1">

                    <label className="
                      text-xs
                      font-semibold
                      text-gray-700
                    ">
                      Email Verification
                    </label>

                    {otpVerified && (
                      <span className="
                        flex
                        items-center
                        gap-1
                        text-[11px]
                        font-medium
                        text-green-600
                      ">
                        <FaCheckCircle />
                        Verified
                      </span>
                    )}

                  </div>

                  <div className="
                    border
                    border-gray-200
                    rounded-lg
                    bg-gray-50
                    p-2.5
                  ">

                    <div className="flex gap-2">

                      <div className="
                        w-8
                        h-8
                        shrink-0
                        bg-amber-100
                        rounded-lg
                        flex
                        items-center
                        justify-center
                      ">
                        <FaShieldAlt className="
                          text-amber-600
                          text-xs
                        " />
                      </div>

                      <div className="flex-1">

                        <p className="
                          text-xs
                          font-medium
                          text-gray-700
                        ">
                          Verify your email
                        </p>

                        <p className="
                          text-[10px]
                          text-gray-500
                        ">
                          Get a verification code by email.
                        </p>

                      </div>

                      {/* SEND OTP */}

                      <button
                        type="button"
                        onClick={sendOtp}
                        disabled={
                          sendingOtp ||
                          otpVerified
                        }
                        className="
                          self-center
                          px-3
                          py-2
                          rounded-lg
                          bg-amber-600
                          hover:bg-amber-700
                          text-white
                          text-xs
                          font-semibold
                          transition
                          disabled:opacity-60
                          disabled:cursor-not-allowed
                        "
                      >

                        {sendingOtp ? (
                          <span className="
                            flex
                            items-center
                            gap-1
                          ">
                            <span className="
                              w-3
                              h-3
                              border
                              border-white/30
                              border-t-white
                              rounded-full
                              animate-spin
                            " />
                            Sending
                          </span>
                        ) : otpVerified ? (
                          <FaCheckCircle />
                        ) : (
                          "Send OTP"
                        )}

                      </button>

                    </div>

                    {/* OTP INPUT */}

                    {otpSent && !otpVerified && (
                      <div className="
                        flex
                        gap-2
                        mt-2
                      ">

                        <input
                          type="text"
                          placeholder="Enter 6-digit OTP"
                          value={otp}
                          onChange={(e) =>
                            setOtp(
                              e.target.value
                            )
                          }
                          maxLength={6}
                          inputMode="numeric"
                          className="
                            flex-1
                            px-3
                            py-2
                            text-sm
                            border
                            border-gray-200
                            rounded-lg
                            bg-white
                            text-center
                            tracking-[0.3em]
                            font-semibold
                            outline-none
                            focus:border-green-500
                            focus:ring-2
                            focus:ring-green-500/10
                          "
                        />

                        <button
                          type="button"
                          onClick={verifyOtp}
                          disabled={verifyingOtp}
                          className="
                            px-4
                            py-2
                            rounded-lg
                            bg-green-600
                            hover:bg-green-700
                            text-white
                            text-xs
                            font-semibold
                            transition
                            disabled:opacity-60
                          "
                        >

                          {verifyingOtp
                            ? "Verifying..."
                            : "Verify"}

                        </button>

                      </div>
                    )}

                  </div>

                </div>

                {/* CREATE ACCOUNT */}

                <button
                  type="button"
                  onClick={handleSignup}
                  disabled={
                    creatingAccount ||
                    !otpVerified
                  }
                  className="
                    w-full
                    flex
                    items-center
                    justify-center
                    gap-2
                    py-3
                    rounded-lg
                    bg-gradient-to-r
                    from-amber-600
                    to-orange-500
                    text-white
                    text-sm
                    font-semibold
                    shadow-md
                    shadow-amber-500/20
                    transition
                    hover:from-amber-700
                    hover:to-orange-600
                    active:scale-[0.98]
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >

                  {creatingAccount ? (
                    <>
                      <span className="
                        w-4
                        h-4
                        border-2
                        border-white/30
                        border-t-white
                        rounded-full
                        animate-spin
                      " />

                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <FaArrowRight className="text-xs" />
                    </>
                  )}

                </button>

              </div>

              {/* LOGIN */}

              <div className="mt-4">

                <p className="
                  text-xs
                  sm:text-sm
                  text-center
                  text-gray-500
                ">

                  Already have an account?{" "}

                  <Link
                    to="/signin"
                    className="
                      font-semibold
                      text-amber-600
                      hover:text-amber-700
                      hover:underline
                    "
                  >
                    Sign In
                  </Link>

                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default SignUp;