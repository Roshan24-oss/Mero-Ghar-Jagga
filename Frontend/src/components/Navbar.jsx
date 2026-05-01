import React, { useContext } from "react";
import logo from "../assets/Logo.png";
import { CiSearch } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FaPlus } from "react-icons/fa";

const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const handleAddProperty = () => {
    // ❌ Not logged in
    if (!user) {
      navigate("/login");
      return;
    }

    // ❌ Not owner
    if (user.user.role !== "owner") {
      alert("Only owners can add property");
      return;
    }

    // ✅ Allowed
    navigate("/add-property");
  };

  return (
    <nav className="fixed top-0 w-full bg-green-100 shadow-md z-50">
      <div className="flex justify-between items-center">

        {/* Logo */}
        <div className="ml-10">
          <img src={logo} alt="Logo" className="h-19 w-30" />
        </div>

        {/* Search Bar */}
        <div className="mt-3 flex items-center bg-white rounded-md px-2">
          <input
            type="text"
            placeholder="Search based on city..."
            className="px-4 py-2 outline-none w-80"
          />
          <CiSearch className="text-xl text-gray-600" />
        </div>

        {/* Actions */}
        <div className="mr-10 flex items-center gap-4">

          {/* 🔥 Add Property Button */}
          <button
            onClick={handleAddProperty}
            className="flex items-center gap-2 bg-blue-600 text-white font-bold px-4 py-2 rounded-2xl hover:bg-blue-700"
          >
            <FaPlus />
            Add
          </button>

          {/* Sign In / Profile */}
          {!user ? (
            <button
              onClick={() => navigate("/login")}
              className="bg-orange-500 font-bold rounded-2xl px-4 py-2 text-white"
            >
              Sign In
            </button>
          ) : (
            <button
              className="bg-gray-800 text-white px-4 py-2 rounded-2xl"
              onClick={() => navigate("/profile")}
            >
              Profile
            </button>
          )}

        </div>

      </div>
    </nav>
  );
};

export default Navbar;