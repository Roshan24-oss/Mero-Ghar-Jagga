import React, { useContext, useState, useRef, useEffect } from "react";
import logo from "../assets/Logo.png";
import { CiSearch } from "react-icons/ci";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FaPlus } from "react-icons/fa";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef();

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Add Property logic
  const handleAddProperty = () => {
    if (!user) {
      navigate("/signin");
      return;
    }

    if (user.role !== "owner") {
      alert("Only owners can add property");
      return;
    }

    navigate("/add-property");
  };

  // ✅ Backend uses fullName
  const displayName = user?.fullName || "User";

  return (
    <nav className="fixed top-0 w-full bg-green-100 shadow-md z-[1000]">
      <div className="flex justify-between items-center px-6">

        {/* Logo */}
        <div>
          <img src={logo} alt="Logo" className="h-16 w-auto" />
        </div>

        {/* Search */}
        <div className="flex items-center bg-white rounded-md px-2">
          <input
            type="text"
            placeholder="Search based on city..."
            className="px-4 py-2 outline-none w-80"
          />
          <CiSearch className="text-xl text-gray-600" />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">

          {/* Add Property */}
          <button
            onClick={handleAddProperty}
            className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1.5 rounded-full hover:scale-95 transition"
          >
            <FaPlus className="text-xs" />
            Add Property
          </button>

          {/* Auth */}
          {!user ? (
            <Link
              to="/signin"
              className="bg-orange-500 font-bold rounded-2xl px-4 py-2 text-white hover:bg-orange-600"
            >
              Sign In
            </Link>
          ) : (
            <div ref={menuRef} className="relative">

              {/* Profile */}
              <div
                onClick={() => setIsMenuOpen(prev => !prev)}
                className="cursor-pointer flex flex-col items-center"
              >
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm">{displayName}</span>
              </div>

              {/* Dropdown */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-md p-3 w-44 text-black z-[2000]">

                  <p className="font-semibold">{displayName}</p>

                  <p className="text-sm text-gray-600">
                    Role: {user?.role || "User"}
                  </p>

                  <button
                    onClick={logout}
                    className="mt-2 w-full bg-red-500 text-white py-1 rounded hover:bg-red-600"
                  >
                    Logout
                  </button>

                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;