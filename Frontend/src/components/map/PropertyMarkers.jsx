// PropertyMarkers.jsx

import { Marker, Popup } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import { FaWhatsapp, FaHeart } from "react-icons/fa";

import { profileIcon, getCenter } from "./mapUtils";
import { format } from "date-fns";

const PropertyMarkers = ({
  properties,
  user,
  savedProperties,
  setSavedProperties,
}) => {
  const navigate = useNavigate();

  // ================= SAVE PROPERTY =================
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
    <>
      {properties.map((prop) => {

        // SAFE PROPERTY TYPE CHECK
        const propertyType =
          prop.propertyType?.toLowerCase()?.trim();

       

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
              <div className="w-[250px] space-y-2">

                {/* TITLE */}
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-blue-600">
                    {prop.label}
                  </h2>

                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full capitalize">
                    {prop.propertyType}
                  </span>
                </div>

                {/* ✅ PROPERTY IMAGE */}
                {prop.images?.length > 0 && (
                  <img
                    src={`http://localhost:8000${prop.images[0]}`}
                    alt="property"
                    className="w-full h-[140px] object-cover rounded-lg"
                  />
                )}

                {/* SAVE BUTTON */}
                <button
                  onClick={() => handleSaveProperty(prop)}
                  className="flex items-center gap-2 bg-pink-500 text-white px-3 py-1 rounded-full text-sm hover:bg-pink-600 transition"
                >
                  <FaHeart />
                  Save Property
                </button>

                {/* COMMON DETAILS */}
                <p className="text-sm">
                  📍 {prop.address}
                </p>

                <p className="text-sm">
                  💰 Rs {prop.price}
                </p>

                {prop.area && (
                  <p className="text-sm">
                    📏 {prop.area}
                  </p>
                )}

                <p className="text-sm">
                  ⏳ {prop.availableDays} days
                </p>

                <p className="text-xs text-gray-600">
                  {prop.description}
                </p>

                <p className="text-xs text-gray-500">
                  Registered:{" "}
                  {format(
                    new Date(prop.createdAt),
                    "PPP p"
                  )}
                </p>

                {/* ================= LAND ================= */}
                {propertyType === "land" && (
                  <div className="bg-yellow-50 p-2 rounded-lg space-y-1">
                    <p className="font-semibold text-yellow-700">
                      🟫 Land Details
                    </p>

                    <p className="text-sm">
                      🛣 Road Access:{" "}
                      {prop.roadAccess || "N/A"}
                    </p>
                  </div>
                )}

                {/* ================= ROOM ================= */}
                {propertyType === "room" && (
                  <div className="bg-green-50 p-2 rounded-lg space-y-1">
                    <p className="font-semibold text-green-700">
                      🛏 Room Details
                    </p>

                    <p className="text-sm">
                      🛌 Room Type:{" "}
                      {prop.roomType || "N/A"}
                    </p>

                    <p className="text-sm">
                      📶 Wifi:{" "}
                      {prop.wifi || "N/A"}
                    </p>
                  </div>
                )}

                {/* ================= OFFICE ================= */}
                {propertyType === "office" && (
                  <div className="bg-gray-100 p-2 rounded-lg space-y-1">
                    <p className="font-semibold text-gray-700">
                      🏢 Office Details
                    </p>

                    <p className="text-sm">
                      🏬 Floor:{" "}
                      {prop.floorNumber || "N/A"}
                    </p>

                    <p className="text-sm">
                      👥 Meeting Room:{" "}
                      {prop.meetingRoom || "N/A"}
                    </p>
                  </div>
                )}

                <hr />

                {/* OWNER DETAILS */}
                <div className="space-y-1">
                  <p className="text-sm font-semibold">
                    👤 {prop.owner?.fullName}
                  </p>

                  <p className="text-sm">
                    📞 {prop.owner?.phone}
                  </p>
                </div>

                {/* WHATSAPP */}
                <a
                  href={`https://wa.me/${prop.owner?.phone}?text=Hello, I'm interested in your property "${prop.label}". Is it still available?`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-green-500 hover:text-green-600 animate-pulse font-bold"
                >
                  <FaWhatsapp />
                  Chat on WhatsApp
                </a>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};

export default PropertyMarkers;