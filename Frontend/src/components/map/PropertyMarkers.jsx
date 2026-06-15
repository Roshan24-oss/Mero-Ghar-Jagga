// PropertyMarkers.jsx

import { Marker, Popup } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import { FaWhatsapp, FaHeart } from "react-icons/fa";

import axiosInstance from "../../api/axiosInstance"; // ✅ NEW ADD
import { profileIcon, getCenter } from "./mapUtils";
import { format } from "date-fns";
import { FaRegComment } from "react-icons/fa";
import {useState} from "react";



const PropertyMarkers = ({
  properties,
  user,
  savedProperties,
  setSavedProperties,
  refreshProperties, // ✅ NEW ADD
}) => {
  const navigate = useNavigate();

  const[selectedProperty, setSelectedProperty] = useState(null);
const[commentText, setCommentText] = useState("");
const[showCommentModal, setShowCommentModal] = useState(false);

  // ================= VIEW PROPERTY (NEW ADD) =================
  const handleView = async (propertyId) => {
    try {
      const visitorId =
        localStorage.getItem("visitorId") ||
        crypto.randomUUID();

      localStorage.setItem("visitorId", visitorId);

      await axiosInstance.post(
        `/property/view/${propertyId}`,
        {
          visitorId,
        }
      );
    } catch (err) {
      console.log(err);
    }
  };

  // ================= LIKE PROPERTY (NEW ADD) =================

const handleLike = async (propertyId) => {
  if (!user) {
    navigate("/signin");
    return;
  }

  try {
    await axiosInstance.post(
      `/property/like/${propertyId}`
    );

    refreshProperties();

  } catch (err) {
    console.log(err);
  }
};
//================== COMMENT PROPERTY (NEW ADD) =================
const handleComment = (property)=>{
   console.log("comment clicked");
  setSelectedProperty(property);
  setShowCommentModal(true);
}

  // ================= FAVORITE PROPERTY (NEW ADD) =================
 
const handleFavorite = async (propertyId) => {
  if (!user) {
    navigate("/signin");
    return;
  }

  try {
    await axiosInstance.post(
      `/property/favorite/${propertyId}`
    );

    refreshProperties();

  } catch (err) {
    console.log(err);
  }
};
  // ================= SAVE PROPERTY (YOUR EXISTING CODE) =================
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
                handleView(prop._id); // 🔥 NEW ADD (VIEW TRACKING)

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

                {/* IMAGE */}
                {prop.images?.length > 0 && (
                  <img
                    src={`http://localhost:8000${prop.images[0]}`}
                    alt="property"
                    className="w-full h-[140px] object-cover rounded-lg"
                  />
                )}

                {/* SAVE BUTTON (YOUR OLD CODE) */}
                <button
                  onClick={() => handleSaveProperty(prop)}
                  className="flex items-center gap-2 bg-pink-500 text-white px-3 py-1 rounded-full text-sm hover:bg-pink-600 transition"
                >
                  <FaHeart />
                  Save Property
                </button>

                {/* ================= NEW ACTION BUTTONS ================= */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleLike(prop._id)}
                    className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                  >
                    ❤️ Like
                  </button>

                  <button
                    onClick={() => handleFavorite(prop._id)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded text-xs"
                  >
                    🔖 Save
                  </button>

                <button
  onClick={(e) => {
    e.stopPropagation();
    handleComment(prop);
  }}
  className="bg-blue-500 text-white px-2 py-1 rounded text-xs cursor-pointer"
>
  <FaRegComment />
</button>
                 
                </div>

               


                {/* DETAILS */}
                <p className="text-sm">📍 {prop.address}</p>
                <p className="text-sm">💰 Rs {prop.price}</p>

                <div className="flex gap-3 text-sm">
  <span>👁 {prop.views || 0}</span>

  <span>❤️ {prop.likesCount || 0}</span>

  <span>🔖 {prop.favoritesCount || 0}</span>
</div>

                {prop.area && (
                  <p className="text-sm">📏 {prop.area}</p>
                )}

                <p className="text-sm">
                  ⏳ {prop.availableDays} days
                </p>

                <p className="text-xs text-gray-600">
                  {prop.description}
                </p>

                <p className="text-xs text-gray-500">
                  Registered:{" "}
                  {format(new Date(prop.createdAt), "PPP p")}
                </p>

                {/* OWNER */}
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

       {showCommentModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center "
  
  style={{ zIndex: 9999999}}>
    <div className="bg-white p-4 rounded-lg w-[400px]">
      <h2 className="text-lg font-bold mb-3">
        Comments for {selectedProperty?.label}
      </h2>

      {/* Existing comments */}
      <div className="max-h-[250px] overflow-y-auto border p-2 rounded">
        {selectedProperty?.comments?.length > 0 ? (
          selectedProperty.comments.map((comment, index) => (
            <div
              key={index}
              className="border-b py-2"
            >
              <p className="font-semibold">
                {comment.user?.fullName}
              </p>

              <p>{comment.text}</p>
            </div>
          ))
        ) : (
          <p>No comments yet</p>
        )}
      </div>

      {/* Add Comment */}
      <textarea
        value={commentText}
        onChange={(e) =>
          setCommentText(e.target.value)
        }
        className="w-full border mt-3 p-2 rounded"
        placeholder="Write a comment..."
      />

      <div className="flex justify-end gap-2 mt-3">
        <button
          onClick={() => setShowCommentModal(false)}
          className="px-3 py-1 bg-gray-300 rounded"
        >
          Cancel
        </button>

        <button
          className="px-3 py-1 bg-blue-500 text-white rounded"
        >
          Post
        </button>
      </div>
    </div>
  </div>
)}

    </>
  );
};

export default PropertyMarkers;