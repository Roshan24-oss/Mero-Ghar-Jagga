import { MapContainer, Marker, Popup } from "react-leaflet";
import { useEffect, useContext, useState } from "react";

import { AuthContext } from "../context/AuthContext";
import axiosInstance from "../api/axiosInstance";

import FlyToLocation from "../components/map/FlyToLocation";
import MapLayers from "../components/map/MapLayers";
import PropertyMarkers from "../components/map/PropertyMarkers";
import PropertyPolygons from "../components/map/PropertyPolygons";
import GeomanControl from "../components/map/GeomanControl";

import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";

const MapView = ({
  searchedLocation,
  selectedFilter,
  selectedTrending,
}) => {
  const {
    user,
    savedProperties,
    setSavedProperties,
  } = useContext(AuthContext);

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // ================= FILTER PROPERTIES =================
  const filteredProperties =
    selectedFilter === "all"
      ? properties
      : properties.filter(
          (prop) =>
            prop.propertyType
              ?.toLowerCase()
              .trim() === selectedFilter
        );

  // ================= FETCH PROPERTIES =================
  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(false);

      let url = "/property";

      if (selectedTrending !== "none") {
        url = `/trending/${selectedTrending}`;
      }

      const res = await axiosInstance.get(url);

      setProperties(
        Array.isArray(res.data) ? res.data : []
      );
    } catch (err) {
      console.error(
        "Failed to fetch properties:",
        err
      );

      setProperties([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH WHEN TRENDING CHANGES =================
  useEffect(() => {
    fetchProperties();
  }, [selectedTrending]);

  return (
    <div className="relative w-full h-[90vh] overflow-hidden bg-slate-100">

      {/* =====================================================
          MAP
      ====================================================== */}
      <MapContainer
        center={[27.7172, 85.324]}
        zoom={13}
        className="w-full h-full z-0"
        zoomControl={true}
      >

        {/* MAP LAYERS */}
        <MapLayers />

        {/* =================================================
            SEARCHED LOCATION
        ================================================== */}
        {searchedLocation && (
          <>
            <FlyToLocation
              location={searchedLocation}
            />

            <Marker position={searchedLocation}>
              <Popup>
                <div className="text-sm font-semibold text-slate-700">
                  📍 Searched Location
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* =================================================
            PROPERTY POLYGONS
        ================================================== */}
        <PropertyPolygons
          properties={filteredProperties}
        />

        {/* =================================================
            PROPERTY MARKERS
        ================================================== */}
        <PropertyMarkers
          properties={filteredProperties}
          user={user}
          savedProperties={savedProperties}
          setSavedProperties={setSavedProperties}
          refreshProperties={fetchProperties}
        />

        {/* =================================================
            GEOMAN - OWNER ONLY
        ================================================== */}
        {user?.role === "owner" && (
          <GeomanControl
            refreshProperties={fetchProperties}
          />
        )}

      </MapContainer>


      {/* =====================================================
          PROPERTY COUNT
          Small card + moved down from navbar
      ====================================================== */}
      <div className="absolute top-20 left-4 z-[1000] pointer-events-none">

        <div className="pointer-events-auto">

          <div className="bg-white/95 backdrop-blur-md shadow-lg rounded-xl px-3 py-2 border border-white/60">

            <div className="flex items-center gap-2.5">

              {/* ICON */}
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
                <span className="text-sm">
                  🏠
                </span>
              </div>

              {/* TEXT */}
              <div>

                <p className="text-[10px] text-slate-500 font-medium leading-none">
                  Properties
                </p>

                <p className="text-base font-bold text-slate-800 leading-tight">
                  {filteredProperties.length}
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          FILTER / TRENDING STATUS
      ====================================================== */}
      {(selectedFilter !== "all" ||
        selectedTrending !== "none") && (

        <div className="absolute top-32 left-4 z-[1000]">

          <div className="bg-white/95 backdrop-blur-md shadow-lg rounded-xl px-3 py-2.5 border border-white/70">

            <div className="flex items-center gap-2">

              <span className="text-sm">
                🔎
              </span>

              <span className="text-sm font-medium text-slate-700">
                Showing:
              </span>

              {/* PROPERTY FILTER */}
              {selectedFilter !== "all" && (
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold capitalize">
                  {selectedFilter}
                </span>
              )}

              {/* TRENDING FILTER */}
              {selectedTrending !== "none" && (
                <span className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-600 text-xs font-semibold">
                  🔥 Trending
                </span>
              )}

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          SEARCH LOCATION CARD
      ====================================================== */}
      {searchedLocation && (

        <div className="absolute bottom-5 left-5 z-[1000]">

          <div className="bg-white/95 backdrop-blur-md shadow-xl rounded-2xl px-4 py-3 border border-white/70">

            <div className="flex items-center gap-3">

              {/* LOCATION ICON */}
              <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
                📍
              </div>

              {/* LOCATION TEXT */}
              <div>

                <p className="text-xs text-slate-500">
                  Viewing location
                </p>

                <p className="text-sm font-semibold text-slate-800">
                  Selected Location
                </p>

              </div>

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          OWNER MODE
      ====================================================== */}
      {user?.role === "owner" && (

        <div className="absolute bottom-5 right-5 z-[1000]">

          <div className="bg-white/95 backdrop-blur-md shadow-xl rounded-2xl px-4 py-3 border border-white/70">

            <div className="flex items-center gap-3">

              {/* OWNER ICON */}
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                ✏️
              </div>

              {/* OWNER TEXT */}
              <div>

                <p className="text-xs text-slate-500">
                  Owner Mode
                </p>

                <p className="text-sm font-semibold text-blue-700">
                  Draw Property
                </p>

              </div>

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          LOADING OVERLAY
      ====================================================== */}
      {loading && (

        <div className="absolute inset-0 z-[900] flex items-center justify-center pointer-events-none">

          <div className="bg-white/90 backdrop-blur-md shadow-xl rounded-2xl px-6 py-4">

            <div className="flex items-center gap-3">

              {/* LOADING SPINNER */}
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />

              <span className="text-sm font-semibold text-slate-700">
                Loading properties...
              </span>

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          EMPTY STATE
      ====================================================== */}
      {!loading &&
        filteredProperties.length === 0 && (

        <div className="absolute inset-0 z-[800] flex items-center justify-center pointer-events-none">

          <div className="bg-white/95 backdrop-blur-md shadow-xl rounded-2xl px-6 py-5 text-center max-w-xs">

            <div className="text-4xl mb-2">
              🏠
            </div>

            <h3 className="font-bold text-slate-800">
              No properties found
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Try changing the property filter
              or search another location.
            </p>

          </div>

        </div>

      )}

    </div>
  );
};

export default MapView;