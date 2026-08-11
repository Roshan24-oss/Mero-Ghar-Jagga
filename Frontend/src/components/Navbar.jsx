import React, { useContext, useState, useRef, useEffect } from "react";
import logo from "../assets/Logo.png";
import { CiSearch } from "react-icons/ci";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FaFilter, FaPlus, FaHeart } from "react-icons/fa";
import { IoMdTrendingUp } from "react-icons/io";

const Navbar = ({
  setSearchedLocation,
  selectedFilter,
  setSelectedFilter,
  selectedTrending,
  setSelectedTrending,
}) => {
  const inputRef = useRef();
  const navigate = useNavigate();
  const { user, logout, savedProperties } = useContext(AuthContext);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [lockSuggestions, setLockSuggestions] = useState(false);
  const [isTrendingOpen, setIsTrendingOpen] = useState(false);

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
    setLockSuggestions(true);
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
        setLockSuggestions(true);
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

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ================= ADD PROPERTY =================
  const handleAddProperty = () => {
    if (!user) return navigate("/signin");
    if (user.role !== "owner")
      return alert("Register your account as an owner to add properties");

    navigate("/add-property");
  };

  const displayName = user?.fullName || "User";

  return (
    <nav className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200 z-[1000]">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-5 lg:px-8">
        <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 py-3">

          {/* ================= LOGO ================= */}
          <div
            className="flex items-center shrink-0 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img
              src={logo}
              alt="Mero Ghar Jagga"
              className="h-10 sm:h-12 lg:h-14 w-auto object-contain hover:scale-105 transition-transform duration-200"
            />
          </div>

          {/* ================= SEARCH ================= */}
          <div className="relative order-3 lg:order-none w-full lg:flex-1 lg:max-w-[520px] xl:max-w-[600px] mx-auto lg:mx-4">
            <div className="flex items-center bg-gray-50 hover:bg-white focus-within:bg-white rounded-full shadow-sm hover:shadow-md focus-within:shadow-lg px-3 sm:px-4 py-2.5 border border-gray-200 focus-within:border-green-400 transition-all duration-200">
              <CiSearch className="text-xl sm:text-2xl text-gray-500 shrink-0" />

              <input
                ref={inputRef}
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search city, area, location..."
                className="w-full outline-none bg-transparent px-2 sm:px-3 text-sm sm:text-base text-gray-700 placeholder:text-gray-400"
              />

              <button
                type="button"
                onClick={handleSearch}
                className="bg-green-500 hover:bg-green-600 text-white rounded-full px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Search
              </button>
            </div>

            {/* ================= SUGGESTIONS ================= */}
            {suggestions.length > 0 && (
              <ul className="absolute top-[58px] left-0 w-full bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-64 sm:max-h-72 overflow-y-auto z-[1100]">

                {suggestions.map((place, index) => (
                  <li
                    key={index}
                    onClick={() => handleSelect(place)}
                    className="px-4 py-3 text-sm cursor-pointer hover:bg-green-50 transition border-b last:border-none"
                  >
                    <div className="font-medium text-gray-800 truncate">
                      {place.display_name.split(",")[0]}
                    </div>

                    <div className="text-xs text-gray-500 truncate mt-0.5">
                      {place.display_name
                        .split(",")
                        .slice(1, 3)
                        .join(",")}
                    </div>
                  </li>
                ))}

              </ul>
            )}
          </div>

          {/* ================= RIGHT SIDE ================= */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 ml-auto">

            {/* ================= FILTER ================= */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsFilterOpen(!isFilterOpen);
                  setIsTrendingOpen(false);
                }}
                className={`w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full border transition-all duration-200 ${
                  isFilterOpen
                    ? "bg-green-100 text-green-600 border-green-300"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-green-50 hover:text-green-600"
                }`}
                title="Filter properties"
              >
                <FaFilter className="text-sm sm:text-base" />
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 mt-3 bg-white shadow-2xl border border-gray-100 rounded-2xl p-2 w-48 z-[1200] animate-[fadeIn_0.15s_ease-in-out]">

                  <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Property Type
                  </p>

                  <button
                    onClick={() => {
                      setSelectedFilter("all");
                      setIsTrendingOpen(false);
                      setIsFilterOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2.5 hover:bg-green-50 hover:text-green-600 rounded-xl text-sm transition"
                  >
                    🏘️ Show All
                  </button>

                  <button
                    onClick={() => {
                      setSelectedFilter("home");
                      setIsTrendingOpen(false);
                      setIsFilterOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2.5 hover:bg-green-50 hover:text-green-600 rounded-xl text-sm transition"
                  >
                    🏠 Home
                  </button>

                  <button
                    onClick={() => {
                      setSelectedFilter("land");
                      setIsTrendingOpen(false);
                      setIsFilterOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2.5 hover:bg-green-50 hover:text-green-600 rounded-xl text-sm transition"
                  >
                    🌳 Land
                  </button>

                  <button
                    onClick={() => {
                      setSelectedFilter("room");
                      setIsTrendingOpen(false);
                      setIsFilterOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2.5 hover:bg-green-50 hover:text-green-600 rounded-xl text-sm transition"
                  >
                    🛏️ Room Rent
                  </button>

                  <button
                    onClick={() => {
                      setSelectedFilter("office");
                      setIsTrendingOpen(false);
                      setIsFilterOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2.5 hover:bg-green-50 hover:text-green-600 rounded-xl text-sm transition"
                  >
                    🏢 Office Rent
                  </button>

                </div>
              )}
            </div>

            {/* ================= TRENDING ================= */}
            <div className="relative">
              <button
                className={`w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full border transition-all duration-200 ${
                  isTrendingOpen
                    ? "bg-green-100 text-green-600 border-green-300"
                    : "bg-gray-50 text-green-500 border-gray-200 hover:bg-green-50"
                }`}
                onClick={() => {
                  setIsTrendingOpen(!isTrendingOpen);
                  setIsFilterOpen(false);
                }}
                title="Trending properties"
              >
                <IoMdTrendingUp className="text-xl sm:text-2xl" />
              </button>

              {isTrendingOpen && (
                <div className="absolute right-0 mt-3 bg-white shadow-2xl border border-gray-100 rounded-2xl p-2 w-48 z-[1200]">

                  <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Trending
                  </p>

                  <button
                    onClick={() => {
                      setSelectedTrending("all");
                      setIsTrendingOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2.5 hover:bg-green-50 hover:text-green-600 rounded-xl text-sm transition"
                  >
                    🔥 All Trending
                  </button>

                  <button
                    onClick={() => {
                      setSelectedTrending("home");
                      setIsTrendingOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2.5 hover:bg-green-50 hover:text-green-600 rounded-xl text-sm transition"
                  >
                    🏠 Home
                  </button>

                  <button
                    onClick={() => {
                      setSelectedTrending("land");
                      setIsTrendingOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2.5 hover:bg-green-50 hover:text-green-600 rounded-xl text-sm transition"
                  >
                    🌳 Land
                  </button>

                  <button
                    onClick={() => {
                      setSelectedTrending("room");
                      setIsTrendingOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2.5 hover:bg-green-50 hover:text-green-600 rounded-xl text-sm transition"
                  >
                    🛏️ Room on Rent
                  </button>

                  <button
                    onClick={() => {
                      setSelectedTrending("office");
                      setIsTrendingOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2.5 hover:bg-green-50 hover:text-green-600 rounded-xl text-sm transition"
                  >
                    🏢 Office on Rent
                  </button>

                </div>
              )}
            </div>

            {/* ================= SAVED PROPERTIES ================= */}
            <div
              onClick={() => navigate("/saved-properties")}
              className="relative cursor-pointer w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-pink-50 border border-pink-100 hover:bg-pink-100 transition-all duration-200 hover:scale-105"
              title="Saved properties"
            >
              <FaHeart className="text-lg sm:text-xl text-pink-500" />

              {savedProperties.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[19px] h-[19px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white">
                  {savedProperties.length}
                </span>
              )}
            </div>

            {/* ================= ADD PROPERTY ================= */}
            <button
              onClick={handleAddProperty}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 active:scale-95 text-sm font-medium"
            >
              <FaPlus className="text-xs" />

              <span className="hidden sm:inline">
                Add Property
              </span>

              <span className="sm:hidden">
                Add
              </span>
            </button>

            {/* ================= AUTH ================= */}
            {!user ? (
              <Link
                to="/signin"
                className="bg-orange-500 hover:bg-orange-600 text-white px-3 sm:px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all duration-200 text-sm font-medium whitespace-nowrap"
              >
                Sign In
              </Link>
            ) : (
              <div ref={menuRef} className="relative">

                <div
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 cursor-pointer rounded-full hover:bg-gray-100 px-1.5 sm:px-2 py-1 transition-all duration-200"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center rounded-full font-bold shadow-sm">
                    {displayName.charAt(0).toUpperCase()}
                  </div>

                  <div className="hidden md:block max-w-[110px]">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {displayName}
                    </p>

                    <p className="text-[11px] text-gray-400 capitalize">
                      {user?.role}
                    </p>
                  </div>
                </div>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-3 bg-white shadow-2xl border border-gray-100 rounded-2xl p-3 w-52 z-[1200]">

                    <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center rounded-full font-bold">
                        {displayName.charAt(0).toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 truncate">
                          {displayName}
                        </p>

                        <p className="text-xs text-gray-500 capitalize">
                          {user?.role}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={logout}
                      className="mt-3 w-full bg-red-50 hover:bg-red-500 text-red-500 hover:text-white py-2 rounded-xl text-sm font-medium transition-all duration-200"
                    >
                      Logout
                    </button>

                  </div>
                )}

              </div>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

