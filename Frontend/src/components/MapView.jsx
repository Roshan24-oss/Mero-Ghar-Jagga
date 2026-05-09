import {
  MapContainer,
  TileLayer,
  LayersControl,
  useMap,
  GeoJSON,
  Marker,
  Popup,
} from "react-leaflet";

import { useEffect, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";

import { AuthContext } from "../context/AuthContext";
import axiosInstance from "../api/axiosInstance.js";

import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import "@geoman-io/leaflet-geoman-free";
import {FaWhatsapp, FaHeart} from "react-icons/fa";


// ================= DRAW + FORM =================
const GeomanControl = ({ refreshProperties }) => {
  const map = useMap();

  const [showModal, setShowModal] = useState(false);
  const [tempLayer, setTempLayer] = useState(null);

  const [formData, setFormData] = useState({
    label: "",
    address: "",
    price: "",
    area: "",
    availableDays: "",
    description: "",
  });

  useEffect(() => {
    map.pm.addControls({
      position: "topright",
      drawPolygon: true,
      drawMarker: true,
      drawCircle: true,
      drawRectangle: true,
      editMode: true,
      dragMode: true,
      removalMode: true,
    });

    const handleCreate = (e) => {
      setTempLayer(e.layer);
      setShowModal(true);
    };

    map.on("pm:create", handleCreate);

    return () => {
      map.pm.removeControls();
      map.off("pm:create", handleCreate);
    };
  }, [map]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const geoJSON = tempLayer.toGeoJSON();

    try {
      await axiosInstance.post("/property", {
        geometry: geoJSON.geometry,
        ...formData,
        availableDays: Number(formData.availableDays) || 0,
      });

      alert("Property saved ✅");

      setShowModal(false);
      setTempLayer(null);

      setFormData({
        label: "",
        address: "",
        price: "",
        area: "",
        availableDays: "",
        description: "",
      });

      refreshProperties();
    } catch (err) {
      console.error(err);
      alert("Failed to save property");
    }
  };

  const handleCancel = () => {
    if (tempLayer) map.removeLayer(tempLayer);

    setShowModal(false);
    setTempLayer(null);
  };

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[1000]">
          <div className="bg-white p-6 rounded-2xl w-[360px] space-y-2 shadow-xl">
            <h2 className="text-xl font-bold text-center text-blue-600">
              Property Details
            </h2>

            <input name="label" placeholder="Title" onChange={handleChange} className="w-full border p-2 rounded" />
            <input name="address" placeholder="Address" onChange={handleChange} className="w-full border p-2 rounded" />
            <input name="price" placeholder="Price" onChange={handleChange} className="w-full border p-2 rounded" />
            <input name="area" placeholder="Area" onChange={handleChange} className="w-full border p-2 rounded" />
            <input name="availableDays" type="number" placeholder="Available Days" onChange={handleChange} className="w-full border p-2 rounded" />
            <textarea name="description" placeholder="Description" onChange={handleChange} className="w-full border p-2 rounded" />

            <div className="flex justify-between pt-2">
              <button onClick={handleCancel} className="px-4 py-2 bg-gray-300 rounded">
                Cancel
              </button>

              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ================= FLY TO =================
const FlyToLocation = ({ location }) => {
  const map = useMap();

  useEffect(() => {
    if (location) {
      map.flyTo(location, 15);
    }
  }, [location]);

  return null;
};

// ================= MAIN MAP =================
const MapView = ({ searchedLocation }) => {
  const { BaseLayer, Overlay } = LayersControl;
  const { user,savedProperties,setSavedProperties } = useContext(AuthContext);
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);

  const fetchProperties = async () => {
    try {
      const res = await axiosInstance.get("/property");
      setProperties(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const profileIcon = (name) =>
    L.divIcon({
      html: `
        <div style="
          width:32px;
          height:32px;
          border-radius:50%;
          background:#2563eb;
          display:flex;
          align-items:center;
          justify-content:center;
          color:white;
          font-weight:bold;
          border:2px solid white;
        ">
          ${name ? name.charAt(0).toUpperCase() : "U"}
        </div>
      `,
      className: "",
      iconSize: [32, 32],
    });

  const getCenter = (geom) => {
    if (!geom?.coordinates) return null;

    if (geom.type === "Point") return geom.coordinates;

    if (geom.type === "Polygon") {
      const coords = geom.coordinates?.[0];
      return coords?.[Math.floor(coords.length / 2)];
    }

    if (geom.type === "LineString") {
      const coords = geom.coordinates;
      return coords?.[Math.floor(coords.length / 2)];
    }

    return null;
  };

  const handleSaveProperty = (property) => {
  if (!user) {
    navigate("/signin");
    return;
  }

  const alreadySaved = savedProperties.find(
    (item) => item._id === property._id
  );

  if (alreadySaved) {
    alert("Property already saved");
    return;
  }

  setSavedProperties([...savedProperties, property]);

  alert("Property saved ❤️");
};
  
  return (
    <div className="h-[90vh] w-full">
      <MapContainer center={[27.7172, 85.324]} zoom={13} className="h-full w-full">

        <LayersControl>
          <BaseLayer name="Street">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          </BaseLayer>

          <BaseLayer name="Satellite">
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
          </BaseLayer>

          <BaseLayer checked name="Satellite + Labels">
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
          </BaseLayer>

          <Overlay checked name="Labels">
            <TileLayer
              url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              zIndex={1000}
            />
          </Overlay>
        </LayersControl>

        {/* 🔍 SEARCH RESULT */}
        {searchedLocation && (
          <>
            <FlyToLocation location={searchedLocation} />
            <Marker position={searchedLocation}>
              <Popup>Searched Location</Popup>
            </Marker>
          </>
        )}

        {/* POLYGONS */}
        {properties.map((prop) => (
          <GeoJSON
            key={prop._id}
            data={{ type: "Feature", geometry: prop.geometry }}
            style={{ color: "red", weight: 3 }}
          >
            <Popup>
              <div className="space-y-1 w-[220px]">
                <h2 className="font-bold text-blue-600">{prop.label}</h2>
                <p>📍 {prop.address}</p>
                <p>💰 Rs {prop.price}</p>
                <p>📏 {prop.area}</p>
                <p>⏳ {prop.availableDays} days</p>
                <p className="text-sm text-gray-600">{prop.description}</p>
              </div>
            </Popup>
          </GeoJSON>
        ))}

        {/* MARKERS */}
        {properties.map((prop) => {
          const center = getCenter(prop.geometry);
          if (!center) return null;

          return (
            <Marker
              key={prop._id}
              position={[center[1], center[0]]}
              icon={profileIcon(prop.owner?.fullName)}
              eventHandlers={{
                click: () => {
                  if (!user) navigate("/signin");
                },
              }}
            >
              <Popup>
                <div className="w-[220px] space-y-2">
                  <h2 className="text-lg font-bold text-blue-600">{prop.label}</h2>
                  <button onClick={()=>handleSaveProperty(prop)}
                  className="flex items-center gap-2 bg-pink-500 text-white px-3 py-1 rounded-full text-sm hover:bg-pink-600 transition">
                    <FaHeart /> Save Property 
                  </button>
                  <p className="text-sm">📍 {prop.address}</p>
                  <p className="text-sm">💰 Rs {prop.price}</p>
                  <p className="text-sm">📏 {prop.area}</p>
                  <p className="text-sm">⏳ {prop.availableDays} days</p>
                  <p className="text-xs text-gray-600">{prop.description}</p>
                  <hr />
                  <p className="text-sm">👤 {prop.owner?.fullName}</p>
                  <p className="text-sm">📞 {prop.owner?.phone}</p>
                  
                  <a
                    href={`https://wa.me/${prop.owner?.phone}?text=Hello, I'm interested in your property "${prop.label}". Is it still available?`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-green-500 hover:text-green-600 animate-pulse font-bold"
                  >
                    <FaWhatsapp /> Chat on WhatsApp
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* DRAW TOOL */}
        {user && user.role === "owner" && (
          <GeomanControl refreshProperties={fetchProperties} />
        )}

      </MapContainer>
    </div>
  );
};

export default MapView;