import { Marker, Popup } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import { FaWhatsapp, FaHeart, FaRegComment } from "react-icons/fa";
import { useState } from "react";

import axiosInstance from "../../api/axiosInstance";
import { profileIcon, getCenter } from "./mapUtils";
import { format } from "date-fns";

const PropertyMarkers = ({ properties, user, savedProperties, setSavedProperties, refreshProperties }) => {
  const navigate = useNavigate();

  const [selectedProperty, setSelectedProperty] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [unlockedIds, setUnlockedIds] = useState(new Set());

  const [showEditModal, setShowEditModal]=useState(false);
  const [editData, setEditData]=useState(null);

  // Check whether the current user has paid to see this property's contact info
  const handleUnlockOrView = async (property) => {
    if (!user) {
      navigate("/signin");
      return;
    }
    if (unlockedIds.has(property._id)) return;

    try {
      const { data } = await axiosInstance.get(`/payment/access/${property._id}`);
      if (data.hasAccess) {
        setUnlockedIds((prev) => new Set(prev).add(property._id));
      }
      // if not paid, we just leave it locked — don't auto-redirect on marker click,
      // only redirect when they actually click "Pay to Unlock"
    } catch (err) {
      console.log(err);
    }
  };

  // VIEW PROPERTY
  const handleView = async (propertyId) => {
    try {
      const visitorId = localStorage.getItem("visitorId") || crypto.randomUUID();
      localStorage.setItem("visitorId", visitorId);

      await axiosInstance.post(`/property/view/${propertyId}`, { visitorId });
    } catch (err) {
      console.log(err);
    }
  };

  // DELETE PROPERTY
  const handleDelete = async (propertyId) => {
    try {
      const confirmDelete = window.confirm("Are you sure you want to delete this property?");
      if (!confirmDelete) return;

      await axiosInstance.delete(`/property/${propertyId}`);
      alert("Property deleted successfully");
      refreshProperties();
    } catch (err) {
      console.log(err);
      alert("Error deleting property");
    }
  };


  //Edit Porperty

  const handleEdit= (property)=>{
    setEditData(property);
    setShowEditModal(true);
  }

const handleEditChange = (e) => {
  const { name, value } = e.target;

  setEditData((prev) => ({
    ...prev,
    [name]: value,
  }));
};

const updateProperty = async () => {
  try {
    await axiosInstance.put(
      `/property/${editData._id}`,
      editData
    );

    alert("Property updated successfully ✅");

    // Close the modal
    setShowEditModal(false);

    // Clear previous property data
    setEditData(null);

    // Reload properties from backend
    refreshProperties();

  } catch (err) {
    console.log(err);
    alert("Failed to update property");
  }
};
  // LIKE PROPERTY
  const handleLike = async (propertyId) => {
    if (!user) {
      navigate("/signin");
      return;
    }
    try {
      await axiosInstance.post(`/property/like/${propertyId}`);
      refreshProperties();
    } catch (err) {
      console.log(err);
    }
  };

  // COMMENT PROPERTY
  const handleComment = (property) => {
    if (!user) {
      navigate("/signin");
      return;
    }
    setSelectedProperty(property);
    setShowCommentModal(true);
  };

  const submitComment = async () => {
    if (!commentText.trim()) return;

    try {
      const res = await axiosInstance.post(`/property/comment/${selectedProperty._id}`, {
        text: commentText,
      });

      setSelectedProperty({
        ...selectedProperty,
        comments: res.data.comments,
      });

      setCommentText("");
    } catch (err) {
      console.log(err);
    }
  };

  // FAVORITE PROPERTY
  const handleFavorite = async (propertyId) => {
    if (!user) {
      navigate("/signin");
      return;
    }
    try {
      await axiosInstance.post(`/property/favorite/${propertyId}`);
      refreshProperties();
    } catch (err) {
      console.log(err);
    }
  };

// available,sold status change garne functiono
  const changeStatus = async(propertyId,status)=>{
    try {
      await axiosInstance.put(`/property/status/${propertyId}`,{status});

      refreshProperties();
    } catch (error) {
      console.log(error);
      alert("Failed to update property status.");
    }
  }
  // SAVE PROPERTY
  const handleSaveProperty = (property) => {
    if (!user) {
      navigate("/signin");
      return;
    }

    const alreadySaved = savedProperties.find((item) => item._id === property._id);
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
        const center = getCenter(prop.geometry);
        if (!center) return null;

        return (
          <Marker
            key={prop._id}
            position={[center[1], center[0]]}
            icon={profileIcon(prop.owner?.fullName)}
            eventHandlers={{
              click: () => {
                handleView(prop._id);
                handleUnlockOrView(prop); // check access when popup opens
              },
            }}
          >
            <Popup>
              <div className="w-[250px] space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-blue-600">{prop.label}</h2>
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full capitalize">
                    {prop.propertyType}
                  </span>

                  <span className={`text-xs px-2 rounded text-white
                    ${
                      prop.status === "available"? "bg-green-500": prop.status === "negotiation"? "bg-yellow-500": "bg-red-500"
                    }`}>
{prop.status}
                  </span>
                </div>

                {prop.images?.length > 0 && (
                  <img
                    src={`http://localhost:8000${prop.images[0]}`}
                    alt="property"
                    className="w-full h-[140px] object-cover rounded-lg"
                  />
                )}

                <button
                  onClick={() => handleSaveProperty(prop)}
                  className="flex items-center gap-2 bg-pink-500 text-white px-3 py-1 rounded-full text-sm hover:bg-pink-600 transition"
                >
                  <FaHeart />
                  Save Property
                </button>

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

                <p className="text-sm">📍 {prop.address}</p>
                <p className="text-sm">💰 Rs {prop.price}</p>

                <div className="flex gap-3 text-sm">
                  <span>👁 {prop.views || 0}</span>
                  <span>❤️ {prop.likesCount || 0}</span>
                  <span>🔖 {prop.favoritesCount || 0}</span>
                </div>

                {prop.area && <p className="text-sm">📏 {prop.area}</p>}
                <p className="text-sm">⏳ {prop.availableDays} days</p>
                <p className="text-xs text-gray-600">{prop.description}</p>
                <p className="text-xs text-gray-500">
                  Registered: {format(new Date(prop.createdAt), "PPP p")}
                </p>

                <div className="space-y-1">
                  <p className="text-sm font-semibold">👤 {prop.owner?.fullName}</p>
{unlockedIds.has(prop._id) ? (
  <>
    <p className="text-sm">📞 {prop.owner?.phone}</p>

    <a
      href={`https://wa.me/${prop.owner?.phone}?text=Hello, I'm interested in your property "${prop.label}". Is it still available?`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-green-500 hover:text-green-600 font-bold"
    >
      <FaWhatsapp />
      Chat on WhatsApp
    </a>
  </>
) : prop.status === "sold" ? (
  <p className="text-red-600 font-bold">
    This property has been sold.
  </p>
) : (
  <button
    onClick={() => navigate(`/payment/${prop._id}`)}
    className="bg-green-600 text-white px-3 py-1 rounded text-xs"
  >
    🔒 Pay to Unlock Contact
  </button>
)}
                    
                  
                </div>

{user?._id === prop.owner?._id &&(
  <>
  
  <div className="mb-2">

    <label className="text-sm font-semibold">  Property Status</label>

    <select
     value={prop.status}
     onChange={(e)=> changeStatus(prop._id, e.target.value)}
     className="w-full border rounded p-1 mt-1"
    
    >
      <option value="available"> Available</option>
      <option value="negotiation">Negotiation</option>
      <option value="sold"> Sold</option>

    </select>

  </div>
  
  <button onClick={()=> handleEdit(prop)}
    className="bg-blue-500 text-white px-2 py-1 rounded">
    Edit
  </button>

  <button
  onClick={()=>handleDelete(prop._id)}
  className="bg-red-500 text-white px-2 ml-2 rounded">
    
    Delete
  </button>
  </>

)}

              


              </div>
            </Popup>
          </Marker>
        );
      })}

      {showCommentModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center"
          style={{ zIndex: 9999999 }}
        >
          <div className="bg-white p-4 rounded-lg w-[400px]">
            <h2 className="text-lg font-bold mb-3">Comments for {selectedProperty?.label}</h2>

            <div className="max-h-[250px] overflow-y-auto border p-2 rounded">
              {selectedProperty?.comments?.length > 0 ? (
                selectedProperty.comments.map((comment, index) => (
                  <div key={index} className="border-b py-2">
                    <p className="font-semibold">{comment.user?.fullName}</p>
                    <p>{comment.text}</p>
                  </div>
                ))
              ) : (
                <p>No comments yet</p>
              )}
            </div>

            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full border mt-3 p-2 rounded"
              placeholder="Write a comment..."
            />

            <div className="flex justify-end gap-2 mt-3">
              <button onClick={() => setShowCommentModal(false)} className="px-3 py-1 bg-gray-300 rounded">
                Cancel
              </button>
              <button onClick={submitComment} className="px-3 py-1 bg-blue-500 text-white rounded">
                Post
              </button>
            </div>


          </div>
        </div>
      )}


      {showEditModal && editData && (
  <div
    className="fixed inset-0 bg-black/50 flex items-center justify-center"
    style={{ zIndex: 999999 }}
  >
    <div className="bg-white p-6 rounded-lg w-[500px] max-h-[90vh] overflow-y-auto">

      <h2 className="text-2xl font-bold mb-4 text-center">
        Edit Property
      </h2>

      {/* Property Title */}
      <input
        type="text"
        name="label"
        value={editData.label || ""}
        onChange={handleEditChange}
        placeholder="Property Title"
        className="w-full border p-2 rounded mb-3"
      />

      {/* Address */}
      <input
        type="text"
        name="address"
        value={editData.address || ""}
        onChange={handleEditChange}
        placeholder="Address"
        className="w-full border p-2 rounded mb-3"
      />

      {/* Price */}
      <input
        type="number"
        name="price"
        value={editData.price || ""}
        onChange={handleEditChange}
        placeholder="Price"
        className="w-full border p-2 rounded mb-3"
      />

      {/* Area */}
      <input
        type="text"
        name="area"
        value={editData.area || ""}
        onChange={handleEditChange}
        placeholder="Area"
        className="w-full border p-2 rounded mb-3"
      />

      {/* Available Days */}
      <input
        type="number"
        name="availableDays"
        value={editData.availableDays || ""}
        onChange={handleEditChange}
        placeholder="Available Days"
        className="w-full border p-2 rounded mb-3"
      />

      {/* Description */}
      <textarea
        name="description"
        value={editData.description || ""}
        onChange={handleEditChange}
        placeholder="Description"
        className="w-full border p-2 rounded mb-3"
      />

      {/* Property Type */}
      <select
        name="propertyType"
        value={editData.propertyType || ""}
        onChange={handleEditChange}
        className="w-full border p-2 rounded mb-3"
      >
        <option value="land">Land</option>
        <option value="home">Home</option>
        <option value="room">Room</option>
        <option value="office">Office</option>
      </select>

      {/* ---------- LAND ---------- */}

      {editData.propertyType === "land" && (
        <>
          <input
            type="text"
            name="roadAccess"
            value={editData.roadAccess || ""}
            onChange={handleEditChange}
            placeholder="Road Access"
            className="w-full border p-2 rounded mb-3"
          />
        </>
      )}

      {/* ---------- HOME ---------- */}

      {editData.propertyType === "home" && (
        <>
          <input
            type="text"
            name="bhk"
            value={editData.bhk || ""}
            onChange={handleEditChange}
            placeholder="BHK"
            className="w-full border p-2 rounded mb-3"
          />

          <select
            name="furnished"
            value={editData.furnished || ""}
            onChange={handleEditChange}
            className="w-full border p-2 rounded mb-3"
          >
            <option value="">Furnished?</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>

          <select
            name="parking"
            value={editData.parking || ""}
            onChange={handleEditChange}
            className="w-full border p-2 rounded mb-3"
          >
            <option value="">Parking?</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </>
      )}

      {/* ---------- ROOM ---------- */}

      {editData.propertyType === "room" && (
        <>
          <input
            type="text"
            name="roomType"
            value={editData.roomType || ""}
            onChange={handleEditChange}
            placeholder="Room Type"
            className="w-full border p-2 rounded mb-3"
          />

          <select
            name="wifi"
            value={editData.wifi || ""}
            onChange={handleEditChange}
            className="w-full border p-2 rounded mb-3"
          >
            <option value="">Wifi?</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </>
      )}

      {/* ---------- OFFICE ---------- */}

      {editData.propertyType === "office" && (
        <>
          <input
            type="text"
            name="floorNumber"
            value={editData.floorNumber || ""}
            onChange={handleEditChange}
            placeholder="Floor Number"
            className="w-full border p-2 rounded mb-3"
          />

          <select
            name="meetingRoom"
            value={editData.meetingRoom || ""}
            onChange={handleEditChange}
            className="w-full border p-2 rounded mb-3"
          >
            <option value="">Meeting Room?</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </>
      )}

      {/* Buttons */}

      <div className="flex justify-end gap-3 mt-5">

        <button
          onClick={() => setShowEditModal(false)}
          className="bg-gray-400 text-white px-4 py-2 rounded"
        >
          Cancel
        </button>

        <button
          onClick={updateProperty}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Update Property
        </button>

      </div>

    </div>
  </div>
)}
    </>
  );
};

export default PropertyMarkers;