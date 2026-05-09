import React, { useContext, useState, useRef, useEffect } from "react";
import logo from "../assets/Logo.png";
import { CiSearch } from "react-icons/ci";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

import {FaPlus, FaHeart} from "react-icons/fa";


const Navbar = ({ setSearchedLocation }) => {
  const inputRef = useRef();
  const navigate = useNavigate();
  const { user, logout, savedProperties } = useContext(AuthContext);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [lockSuggestions, setLockSuggestions] = useState(false);

  const menuRef = useRef();

  // ================= FETCH SUGGESTIONS =================
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchText.length < 3 || lockSuggestions) {
        setSuggestions([]);
        return;
      }

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${searchText}&countrycodes=np`
        );
        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        console.error(err);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchText, lockSuggestions]);

  // ================= CLEAR UI =================
  const clearUI = () => {
    setSuggestions([]);
    inputRef.current?.blur();
  };

  // ================= SELECT SUGGESTION =================
  const handleSelect = (place) => {
    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);

    setSearchText(place.display_name);
    setSearchedLocation([lat, lon]);

    clearUI();
    setLockSuggestions(true); // 🔥 IMPORTANT
  };

  // ================= SEARCH BUTTON =================
  const handleSearch = async () => {
    if (!searchText) return;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${searchText}&countrycodes=np`
      );

      const data = await res.json();

      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);

        setSearchText(data[0].display_name);
        setSearchedLocation([lat, lon]);

        clearUI();
        setLockSuggestions(true); // 🔥 IMPORTANT
      }
    } catch (err) {
      console.log(err);
    }
  };

  // ================= UNLOCK WHEN USER TYPES AGAIN =================
  useEffect(() => {
    if (searchText.length === 0) {
      setLockSuggestions(false);
    }
  }, [searchText]);

  // ================= OUTSIDE CLICK =================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ================= ADD PROPERTY =================
  const handleAddProperty = () => {
    if (!user) return navigate("/signin");
    if (user.role !== "owner") return alert("Register your account as an owner to add properties");
    navigate("/add-property");
  };

  const displayName = user?.fullName || "User";

  return (
    <nav className="fixed top-0 w-full bg-green-100 shadow-md z-[1000]">
      <div className="flex justify-between items-center px-6 py-2">

        {/* ================= LOGO ================= */}
        <img src={logo} alt="Logo" className="h-14" />

        {/* ================= SEARCH ================= */}
        <div className="relative w-96">

          <div className="flex items-center bg-white rounded-full shadow-md px-3 py-2 border border-gray-200">
            <input
              ref={inputRef}
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search city, area, location..."
              className="w-full outline-none px-2 text-sm"
            />

            <CiSearch
              onClick={handleSearch}
              className="text-2xl text-gray-600 cursor-pointer hover:text-blue-600 transition"
            />
          </div>

          {/* ================= SUGGESTIONS ================= */}
          {suggestions.length > 0 && (
            <ul className="absolute top-12 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto z-50">

              {suggestions.map((place, index) => (
                <li
                  key={index}
                  onClick={() => handleSelect(place)}
                  className="px-4 py-3 text-sm cursor-pointer hover:bg-blue-50 transition border-b last:border-none"
                >
                  <div className="font-medium text-gray-800">
                    {place.display_name.split(",")[0]}
                  </div>
                  <div className="text-xs text-gray-500">
                    {place.display_name.split(",").slice(1, 3).join(",")}
                  </div>
                </li>
              ))}

            </ul>
          )}

        </div>

        {/* ================= RIGHT SIDE ================= */}
        <div className="flex items-center gap-4">
          
          <div onClick={()=> navigate("/saved-properties")}
             className="relative cursor-pointer">
              <FaHeart className="text-2xl text-pink-500"/>

              {savedProperties.length>0 && (
                <span className="absolute -top-2 bg-red-500 text-white text-[10px] rounded-full">
                  {savedProperties.length}
                </span>
              )}

          </div>

          {/* ADD PROPERTY */}
          <button
            onClick={handleAddProperty}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full hover:scale-95 transition"
          >
            <FaPlus className="text-xs" />
            Add Property
          </button>

          {/* AUTH */}
          {!user ? (
            <Link
              to="/signin"
              className="bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600"
            >
              Sign In
            </Link>
          ) : (
            <div ref={menuRef} className="relative">

              <div
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex flex-col items-center cursor-pointer"
              >
                <div className="w-9 h-9 bg-blue-600 text-white flex items-center justify-center rounded-full font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs">{displayName}</span>
              </div>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg p-3 w-44">
                  <p className="font-semibold">{displayName}</p>
                  <p className="text-sm text-gray-500">
                    Role: {user?.role}
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