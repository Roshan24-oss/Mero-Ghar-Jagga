import React, { useContext } from "react";
import logo from "../assets/Logo.png";
import { CiSearch } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const handleAddProperty = () => {
    // ❌ Not logged in
    if (!user) {
      navigate("/signin");
      return;
    }

    // ❌ Not owner
    if (user.role !== "owner") {
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

    <button
  onClick={handleAddProperty}
  className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium px-3 py-1.5 rounded-full shadow-sm hover:shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 active:scale-95 text-sm"
>
  <FaPlus className="text-xs" />
  <span>Add Property</span>
</button>

          {/* Sign In / Profile */}
          
            <Link 
            to="/signin"
            className="bg-orange-500 font-bold rounded-2xl px-4 py-2 text-white hober:bg-orange-600">Sign In</Link>
          
            
          

        </div>

      </div>
    </nav>
  )
};

export default Navbar;