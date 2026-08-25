import { Marker } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  FaWhatsapp,
  FaHeart,
  FaRegComment,
  FaEye,
  FaBookmark,
  FaMapMarkerAlt,
  FaHome,
  FaRulerCombined,
  FaCar,
  FaBed,
  FaBath,
  FaBuilding,
  FaEdit,
  FaTrash,
  FaChevronRight,
  FaRobot,
  FaRoad,
  FaTimes,
  FaCheckCircle,
  FaImage,
} from "react-icons/fa";
import { format } from "date-fns";

import axiosInstance from "../../api/axiosInstance";

import {
  propertyIcon,
  getCenter,
  trendingPropertyIcon,
} from "./mapUtils";

const PropertyMarkers = ({
  properties,
  user,
  savedProperties,
  setSavedProperties,
  refreshProperties,
  setSelectedProperty: parentSetSelectedProperty,
}) => {
  const navigate = useNavigate();

  const [activeProperty, setActiveProperty] =
    useState(null);

  const [commentProperty, setCommentProperty] =
    useState(null);

  const [commentText, setCommentText] =
    useState("");

  const [showCommentModal, setShowCommentModal] =
    useState(false);

  const [unlockedIds, setUnlockedIds] =
    useState(new Set());

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [editData, setEditData] =
    useState(null);

  /* =====================================================
     PROPERTY OPEN / CLOSE
  ===================================================== */

  const openProperty = (property) => {
    setActiveProperty(property);

    parentSetSelectedProperty?.(property);
  };

  const closeProperty = () => {
    setActiveProperty(null);

    parentSetSelectedProperty?.(null);
  };

  /* =====================================================
     GET MORE DETAILS
  ===================================================== */

  const handleGetMoreDetails = (propertyId) => {
    closeProperty();

    navigate(`/property/${propertyId}`);
  };

  /* =====================================================
     CONTACT
  ===================================================== */

  const handleUnlockOrView = async (property) => {
    if (!user) return;

    if (unlockedIds.has(property._id)) return;

    try {
      const { data } =
        await axiosInstance.get(
          `/payment/access/${property._id}`
        );

      if (data.hasAccess) {
        setUnlockedIds((prev) => {
          const updated = new Set(prev);
          updated.add(property._id);
          return updated;
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  /* =====================================================
     VIEW
  ===================================================== */

  const handleView = async (propertyId) => {
    try {
      let visitorId =
        localStorage.getItem("visitorId");

      if (!visitorId) {
        visitorId = crypto.randomUUID();
        localStorage.setItem(
          "visitorId",
          visitorId
        );
      }

      await axiosInstance.post(
        `/property/view/${propertyId}`,
        { visitorId }
      );
    } catch (error) {
      console.log(error);
    }
  };

  /* =====================================================
     DELETE
  ===================================================== */

  const handleDelete = async (propertyId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this property?"
    );

    if (!confirmDelete) return;

    try {
      await axiosInstance.delete(
        `/property/${propertyId}`
      );

      alert("Property deleted successfully");

      closeProperty();
      refreshProperties();
    } catch (error) {
      console.log(error);
      alert("Error deleting property");
    }
  };

  /* =====================================================
     EDIT
  ===================================================== */

  const handleEdit = (property) => {
    setEditData({
      ...property,
      address: {
        ...property.address,
      },
      landArea: property.landArea
        ? { ...property.landArea }
        : {
            value: "",
            unit: "sqft",
          },
      roadAccess: property.roadAccess
        ? { ...property.roadAccess }
        : {
            available: false,
            width: "",
            widthUnit: "ft",
            type: "other",
          },
      homeDetails: property.homeDetails
        ? {
            ...property.homeDetails,
            builtUpArea:
              property.homeDetails.builtUpArea
                ? {
                    ...property.homeDetails
                      .builtUpArea,
                  }
                : {
                    value: "",
                    unit: "sqft",
                  },
            parking:
              property.homeDetails.parking
                ? {
                    ...property.homeDetails.parking,
                  }
                : {
                    available: false,
                    capacity: "",
                  },
            kitchen:
              property.homeDetails.kitchen
                ? {
                    ...property.homeDetails.kitchen,
                  }
                : {
                    available: false,
                    count: "",
                  },
            balcony:
              property.homeDetails.balcony
                ? {
                    ...property.homeDetails.balcony,
                  }
                : {
                    available: false,
                    count: "",
                  },
          }
        : null,
      roomDetails: property.roomDetails
        ? {
            ...property.roomDetails,
            bathroom:
              property.roomDetails.bathroom
                ? {
                    ...property.roomDetails.bathroom,
                  }
                : {
                    available: false,
                    attached: false,
                  },
            kitchen:
              property.roomDetails.kitchen
                ? {
                    ...property.roomDetails.kitchen,
                  }
                : {
                    available: false,
                  },
            balcony:
              property.roomDetails.balcony
                ? {
                    ...property.roomDetails.balcony,
                  }
                : {
                    available: false,
                  },
            wifi: property.roomDetails.wifi
              ? {
                  ...property.roomDetails.wifi,
                }
              : {
                  available: false,
                },
            parking:
              property.roomDetails.parking
                ? {
                    ...property.roomDetails.parking,
                  }
                : {
                    available: false,
                  },
          }
        : null,
      officeDetails: property.officeDetails
        ? {
            ...property.officeDetails,
            area: property.officeDetails.area
              ? {
                  ...property.officeDetails.area,
                }
              : {
                  value: "",
                  unit: "sqft",
                },
            meetingRoom:
              property.officeDetails.meetingRoom
                ? {
                    ...property.officeDetails
                      .meetingRoom,
                  }
                : {
                    available: false,
                    count: "",
                  },
            parking:
              property.officeDetails.parking
                ? {
                    ...property.officeDetails
                      .parking,
                  }
                : {
                    available: false,
                  },
          }
        : null,
    });

    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNestedChange = (
    section,
    field,
    value
  ) => {
    setEditData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleDeepNestedChange = (
    section,
    nestedSection,
    field,
    value
  ) => {
    setEditData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [nestedSection]: {
          ...prev[section]?.[nestedSection],
          [field]: value,
        },
      },
    }));
  };

  /* =====================================================
     UPDATE
  ===================================================== */

  const updateProperty = async () => {
    try {
      const payload = {
        propertyType: editData.propertyType,
        price: Number(editData.price),
        currency: editData.currency || "NPR",
        isNegotiable: Boolean(
          editData.isNegotiable
        ),
        description: editData.description || "",
        address: editData.address,
        geometry: editData.geometry,

        landArea:
          editData.propertyType === "land"
            ? editData.landArea
            : undefined,

        roadAccess: editData.roadAccess,

        homeDetails:
          editData.propertyType === "home"
            ? editData.homeDetails
            : undefined,

        roomDetails:
          editData.propertyType === "room"
            ? editData.roomDetails
            : undefined,

        officeDetails:
          editData.propertyType === "office"
            ? editData.officeDetails
            : undefined,

        status: editData.status,
        availableFrom: editData.availableFrom,
      };

      await axiosInstance.put(
        `/property/${editData._id}`,
        payload
      );

      alert("Property updated successfully ✅");

      setShowEditModal(false);
      setEditData(null);

      closeProperty();
      refreshProperties();
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          "Failed to update property"
      );
    }
  };

  /* =====================================================
     LIKE
  ===================================================== */

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
    } catch (error) {
      console.log(error);
    }
  };

  /* =====================================================
     COMMENT
  ===================================================== */

  const handleComment = (property) => {
    if (!user) {
      navigate("/signin");
      return;
    }

    setCommentProperty(property);
    setShowCommentModal(true);
  };

  const submitComment = async () => {
    if (!commentText.trim()) return;

    try {
      const res =
        await axiosInstance.post(
          `/property/comment/${commentProperty._id}`,
          {
            text: commentText,
          }
        );

      const updatedComments =
        res.data.comments;

      setCommentProperty((prev) => ({
        ...prev,
        comments: updatedComments,
      }));

      setActiveProperty((prev) =>
        prev?._id === commentProperty._id
          ? {
              ...prev,
              comments: updatedComments,
            }
          : prev
      );

      setCommentText("");

      refreshProperties();
    } catch (error) {
      console.log(error);
    }
  };

  /* =====================================================
     FAVORITE
  ===================================================== */

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
    } catch (error) {
      console.log(error);
    }
  };

  /* =====================================================
     STATUS
  ===================================================== */

  const changeStatus = async (
    propertyId,
    status
  ) => {
    try {
      await axiosInstance.put(
        `/property/status/${propertyId}`,
        { status }
      );

      setActiveProperty((prev) =>
        prev?._id === propertyId
          ? { ...prev, status }
          : prev
      );

      refreshProperties();
    } catch (error) {
      console.log(error);
      alert("Failed to update property status.");
    }
  };

  /* =====================================================
     SAVE
  ===================================================== */

  const handleSaveProperty = (property) => {
    if (!user) {
      navigate("/signin");
      return;
    }

    const alreadySaved =
      savedProperties.find(
        (item) => item._id === property._id
      );

    if (alreadySaved) {
      alert("Property already saved");
      return;
    }

    setSavedProperties([
      ...savedProperties,
      property,
    ]);

    alert("Property saved ❤️");
  };

  /* =====================================================
     HELPERS
  ===================================================== */

  const getPopularityLabel = (score) => {
    if (score >= 80)
      return {
        text: "Very High",
        className: "text-green-600",
      };

    if (score >= 65)
      return {
        text: "High",
        className: "text-blue-600",
      };

    if (score >= 50)
      return {
        text: "Moderate",
        className: "text-yellow-600",
      };

    return {
      text: "Low",
      className: "text-red-600",
    };
  };

  const formatPrice = (price) => {
    if (!price) return "Price not available";

    return new Intl.NumberFormat("en-IN").format(
      price
    );
  };

  const getPropertyIcon = (type) => {
    if (type === "home") return <FaHome />;
    if (type === "room") return <FaBuilding />;
    if (type === "office")
      return <FaBuilding />;

    return <FaRulerCombined />;
  };

  const getAddress = (property) => {
    const address = property.address;

    if (!address)
      return "Location not available";

    return [
      address.tole,
      address.wardNo
        ? `Ward ${address.wardNo}`
        : null,
      address.municipality ||
        address.muncipality,
      address.district,
      address.province,
    ]
      .filter(Boolean)
      .join(", ");
  };

  /* =====================================================
     MARKERS
  ===================================================== */

  return (
    <>
      {properties.map((property) => {
        const center = getCenter(
          property.geometry
        );

        if (!center) return null;

        return (
          <Marker
            key={property._id}
            position={[
              center[1],
              center[0],
            ]}
            icon={
              property.isTrending
                ? trendingPropertyIcon(
                    property.propertyType
                  )
                : propertyIcon(
                    property.propertyType
                  )
            }
            eventHandlers={{
              click: () => {
                handleView(property._id);
                handleUnlockOrView(property);
                openProperty(property);
              },
            }}
          />
        );
      })}

      {/* =====================================================
          PROPERTY DETAILS
      ===================================================== */}

      {activeProperty && (
        <div
          className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeProperty();
            }
          }}
        >
          <div
            className="relative w-full max-w-5xl h-[94vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            {/* HEADER */}

            <div className="flex-shrink-0 px-5 py-4 border-b bg-white flex justify-between items-center">
              <div className="min-w-0">
                <p className="text-xs text-gray-400">
                  Property Details
                </p>

                <h2 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
                  {activeProperty.title ||
                    "Property Details"}
                </h2>
              </div>

              <button
                onClick={closeProperty}
                className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition"
              >
                <FaTimes />
              </button>
            </div>

            {/* CONTENT */}

            <div className="flex-1 overflow-y-auto">
              {/* IMAGE */}

              <div className="relative bg-gray-100">
                {activeProperty.images
                  ?.length > 0 ? (
                  <img
                    src={
                      activeProperty.images[0].url
                    }
                    alt={
                      activeProperty.title ||
                      "Property"
                    }
                    className="w-full h-[220px] sm:h-[300px] md:h-[350px] object-cover"
                  />
                ) : (
                  <div className="h-[220px] sm:h-[300px] md:h-[350px] flex items-center justify-center bg-gray-100">
                    <FaHome className="text-7xl text-blue-300" />
                  </div>
                )}

                {activeProperty.isTrending && (
                  <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow">
                    🔥 TRENDING
                  </div>
                )}

                <div
                  className={`absolute top-4 right-4 text-white text-xs font-bold px-4 py-2 rounded-full shadow ${
                    activeProperty.status ===
                    "available"
                      ? "bg-green-500"
                      : activeProperty.status ===
                        "negotiation"
                      ? "bg-yellow-500"
                      : activeProperty.status ===
                        "sold"
                      ? "bg-red-500"
                      : "bg-gray-500"
                  }`}
                >
                  {activeProperty.status
                    ? activeProperty.status
                        .charAt(0)
                        .toUpperCase() +
                      activeProperty.status.slice(
                        1
                      )
                    : "Available"}
                </div>

                {activeProperty.images
                  ?.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs px-3 py-2 rounded-full flex items-center gap-2">
                    <FaImage />
                    {activeProperty.images.length}{" "}
                    Photos
                  </div>
                )}
              </div>

              {/* MAIN */}

              <div className="max-w-4xl mx-auto p-5 sm:p-7">
                {/* TITLE */}

                <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {activeProperty.title ||
                        "Property for Sale"}
                    </h1>

                    <div className="flex gap-2 mt-2 text-gray-500">
                      <FaMapMarkerAlt className="text-red-500 mt-1 flex-shrink-0" />

                      <p className="text-sm">
                        {getAddress(
                          activeProperty
                        )}
                      </p>
                    </div>
                  </div>

                  <span className="self-start flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-semibold capitalize">
                    {getPropertyIcon(
                      activeProperty.propertyType
                    )}

                    {activeProperty.propertyType}
                  </span>
                </div>

                {/* PRICE */}

                <div className="mt-5 bg-blue-50 border border-blue-100 rounded-2xl p-5">
                  <p className="text-xs text-gray-500">
                    Property Price
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-3xl font-extrabold text-blue-700">
                      Rs.{" "}
                      {formatPrice(
                        activeProperty.price
                      )}
                    </p>

                    {activeProperty.isNegotiable && (
                      <span className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                        <FaCheckCircle />
                        Negotiable
                      </span>
                    )}
                  </div>
                </div>

                {/* PROPERTY INFORMATION */}

                <div className="mt-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">
                    Property Information
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {activeProperty.propertyType ===
                      "land" &&
                      activeProperty.landArea && (
                        <InfoBox
                          icon={<FaRulerCombined />}
                          label="Land Area"
                          value={`${activeProperty.landArea.value} ${activeProperty.landArea.unit}`}
                        />
                      )}

                    {activeProperty.propertyType ===
                      "home" &&
                      activeProperty.homeDetails
                        ?.builtUpArea && (
                        <InfoBox
                          icon={<FaRulerCombined />}
                          label="Built-up Area"
                          value={`${activeProperty.homeDetails.builtUpArea.value} ${activeProperty.homeDetails.builtUpArea.unit}`}
                        />
                      )}

                    {activeProperty.propertyType ===
                      "home" &&
                      activeProperty.homeDetails
                        ?.bedrooms !==
                        undefined && (
                        <InfoBox
                          icon={<FaBed />}
                          label="Bedrooms"
                          value={
                            activeProperty
                              .homeDetails
                              .bedrooms
                          }
                        />
                      )}

                    {activeProperty.propertyType ===
                      "home" &&
                      activeProperty.homeDetails
                        ?.bathrooms !==
                        undefined && (
                        <InfoBox
                          icon={<FaBath />}
                          label="Bathrooms"
                          value={
                            activeProperty
                              .homeDetails
                              .bathrooms
                          }
                        />
                      )}

                    {activeProperty.propertyType ===
                      "home" &&
                      activeProperty.homeDetails
                        ?.floors !==
                        undefined && (
                        <InfoBox
                          icon={<FaBuilding />}
                          label="Floors"
                          value={
                            activeProperty
                              .homeDetails
                              .floors
                          }
                        />
                      )}

                    {activeProperty.propertyType ===
                      "room" &&
                      activeProperty.roomDetails
                        ?.roomType && (
                        <InfoBox
                          icon={<FaBed />}
                          label="Room Type"
                          value={
                            activeProperty
                              .roomDetails
                              .roomType
                          }
                        />
                      )}

                    {activeProperty.propertyType ===
                      "room" &&
                      activeProperty.roomDetails
                        ?.floor !==
                        undefined && (
                        <InfoBox
                          icon={<FaBuilding />}
                          label="Floor"
                          value={
                            activeProperty
                              .roomDetails
                              .floor
                          }
                        />
                      )}

                    {activeProperty.propertyType ===
                      "office" &&
                      activeProperty.officeDetails
                        ?.area && (
                        <InfoBox
                          icon={<FaRulerCombined />}
                          label="Office Area"
                          value={`${activeProperty.officeDetails.area.value} ${activeProperty.officeDetails.area.unit}`}
                        />
                      )}

                    {activeProperty.propertyType ===
                      "office" &&
                      activeProperty.officeDetails
                        ?.floor !==
                        undefined && (
                        <InfoBox
                          icon={<FaBuilding />}
                          label="Floor"
                          value={
                            activeProperty
                              .officeDetails
                              .floor
                          }
                        />
                      )}

                    {activeProperty.propertyType ===
                      "home" &&
                      activeProperty.homeDetails
                        ?.parking?.available && (
                        <InfoBox
                          icon={<FaCar />}
                          label="Parking"
                          value="Available"
                          valueClass="text-green-600"
                        />
                      )}

                    {activeProperty.roadAccess
                      ?.available && (
                      <InfoBox
                        icon={<FaRoad />}
                        label="Road Access"
                        value={`${activeProperty.roadAccess.width} ${activeProperty.roadAccess.widthUnit}`}
                      />
                    )}
                  </div>
                </div>

                {/* AI */}

                {activeProperty.aiPopularityScore !==
                  null &&
                  activeProperty.aiPopularityScore !==
                    undefined && (
                    <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                            <FaRobot />
                          </div>

                          <div>
                            <p className="text-xs text-gray-500">
                              AI Prediction
                            </p>

                            <h3 className="font-bold">
                              Property Popularity
                            </h3>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-3xl font-extrabold text-blue-700">
                            {Number(
                              activeProperty.aiPopularityScore
                            ).toFixed(1)}
                            %
                          </p>

                          <p
                            className={`text-sm font-bold ${
                              getPopularityLabel(
                                Number(
                                  activeProperty.aiPopularityScore
                                )
                              ).className
                            }`}
                          >
                            {
                              getPopularityLabel(
                                Number(
                                  activeProperty.aiPopularityScore
                                )
                              ).text
                            }
                          </p>
                        </div>
                      </div>

                      <div className="w-full bg-white rounded-full h-3 mt-4 overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full"
                          style={{
                            width: `${Math.min(
                              Math.max(
                                Number(
                                  activeProperty.aiPopularityScore
                                ),
                                0
                              ),
                              100
                            )}%`,
                          }}
                        />
                      </div>

                      <p className="text-xs text-gray-500 mt-3">
                        AI prediction based on property
                        features and trained machine
                        learning model.
                      </p>
                    </div>
                  )}

                {/* ENGAGEMENT */}

                <div className="mt-6 grid grid-cols-4 gap-3">
                  <StatBox
                    icon={<FaEye />}
                    value={
                      activeProperty.views || 0
                    }
                    label="Views"
                  />

                  <StatBox
                    icon={<FaHeart />}
                    value={
                      activeProperty.likesCount ||
                      0
                    }
                    label="Likes"
                  />

                  <StatBox
                    icon={<FaBookmark />}
                    value={
                      activeProperty.favoritesCount ||
                      0
                    }
                    label="Saves"
                  />

                  <StatBox
                    icon={<FaRegComment />}
                    value={
                      activeProperty.comments
                        ?.length || 0
                    }
                    label="Comments"
                  />
                </div>

                {/* DESCRIPTION */}

                {activeProperty.description && (
                  <div className="mt-6">
                    <h3 className="text-lg font-bold mb-2">
                      Description
                    </h3>

                    <p className="text-gray-600 leading-7">
                      {
                        activeProperty.description
                      }
                    </p>
                  </div>
                )}

                {/* ACTIONS */}

                <div className="mt-6 grid grid-cols-3 gap-3">
                  <ActionButton
                    onClick={() =>
                      handleLike(
                        activeProperty._id
                      )
                    }
                    icon={<FaHeart />}
                    text="Like"
                    className="bg-red-50 text-red-600 hover:bg-red-100"
                  />

                  <ActionButton
                    onClick={() =>
                      handleFavorite(
                        activeProperty._id
                      )
                    }
                    icon={<FaBookmark />}
                    text="Save"
                    className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                  />

                  <ActionButton
                    onClick={() =>
                      handleComment(
                        activeProperty
                      )
                    }
                    icon={<FaRegComment />}
                    text="Comment"
                    className="bg-blue-50 text-blue-600 hover:bg-blue-100"
                  />
                </div>

                {/* OWNER */}

                <div className="mt-6 border rounded-2xl p-5 bg-gray-50">
                  <p className="text-xs text-gray-500 mb-3">
                    PROPERTY OWNER
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                      {activeProperty.owner?.fullName
                        ?.charAt(0)
                        ?.toUpperCase() || "U"}
                    </div>

                    <div>
                      <p className="font-bold">
                        {activeProperty.owner
                          ?.fullName ||
                          "Property Owner"}
                      </p>

                      <p className="text-xs text-gray-500">
                        Property Owner
                      </p>
                    </div>
                  </div>

                  {unlockedIds.has(
                    activeProperty._id
                  ) ? (
                    <div className="mt-4 space-y-3">
                      <div className="bg-white border rounded-xl p-3">
                        <p className="text-xs text-gray-500">
                          Phone Number
                        </p>

                        <p className="font-semibold">
                          📞{" "}
                          {
                            activeProperty.owner
                              ?.phone
                          }
                        </p>
                      </div>

                      <a
                        href={`https://wa.me/${activeProperty.owner?.phone}?text=Hello, I'm interested in your property "${activeProperty.title}". Is it still available?`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold text-sm"
                      >
                        <FaWhatsapp />
                        Chat on WhatsApp
                      </a>
                    </div>
                  ) : activeProperty.status ===
                    "sold" ? (
                    <div className="mt-4 bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-sm font-semibold">
                      This property has been sold.
                    </div>
                  ) : (
                    <button
                      onClick={() =>
                        navigate(
                          `/payment/${activeProperty._id}`
                        )
                      }
                      className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold"
                    >
                      🔒 Pay to Unlock Contact
                    </button>
                  )}
                </div>

                {/* OWNER CONTROLS */}

                {user?._id ===
                  activeProperty.owner?._id && (
                  <div className="mt-6 border-t pt-5">
                    <p className="text-xs font-bold text-gray-500 mb-3">
                      OWNER CONTROLS
                    </p>

                    <select
                      value={
                        activeProperty.status ||
                        "available"
                      }
                      onChange={(e) =>
                        changeStatus(
                          activeProperty._id,
                          e.target.value
                        )
                      }
                      className="w-full border rounded-xl p-3 mb-3"
                    >
                      <option value="available">
                        Available
                      </option>

                      <option value="negotiation">
                        Negotiation
                      </option>

                      <option value="sold">
                        Sold
                      </option>

                      <option value="inactive">
                        Inactive
                      </option>
                    </select>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() =>
                          handleEdit(
                            activeProperty
                          )
                        }
                        className="flex items-center justify-center gap-2 bg-blue-500 text-white py-3 rounded-xl"
                      >
                        <FaEdit />
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(
                            activeProperty._id
                          )
                        }
                        className="flex items-center justify-center gap-2 bg-red-500 text-white py-3 rounded-xl"
                      >
                        <FaTrash />
                        Delete
                      </button>
                    </div>
                  </div>
                )}

                {/* GET MORE DETAILS */}

                <button
                  onClick={() =>
                    handleGetMoreDetails(
                      activeProperty._id
                    )
                  }
                  className="w-full mt-6 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg transition"
                >
                  Get More Details
                  <FaChevronRight />
                </button>

                <p className="text-xs text-gray-400 text-center mt-5 pb-3">
                  Registered:{" "}
                  {activeProperty.createdAt
                    ? format(
                        new Date(
                          activeProperty.createdAt
                        ),
                        "PPP p"
                      )
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          COMMENT MODAL
      ===================================================== */}

      {showCommentModal && (
        <div className="fixed inset-0 z-[10000000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
              <div>
                <h2 className="font-bold">
                  Comments
                </h2>

                <p className="text-xs text-blue-100">
                  {commentProperty?.title}
                </p>
              </div>

              <button
                onClick={() => {
                  setShowCommentModal(false);
                  setCommentText("");
                }}
                className="p-2 rounded-full hover:bg-white/20"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-4">
              <div className="max-h-[300px] overflow-y-auto border rounded-xl p-3 space-y-3">
                {commentProperty?.comments
                  ?.length > 0 ? (
                  commentProperty.comments.map(
                    (comment, index) => (
                      <div
                        key={index}
                        className="border-b last:border-b-0 pb-3"
                      >
                        <p className="font-semibold text-sm">
                          {comment.user
                            ?.fullName || "User"}
                        </p>

                        <p className="text-sm text-gray-600 mt-1">
                          {comment.text}
                        </p>
                      </div>
                    )
                  )
                ) : (
                  <p className="text-center text-gray-500 py-8 text-sm">
                    No comments yet.
                  </p>
                )}
              </div>

              <textarea
                value={commentText}
                onChange={(e) =>
                  setCommentText(e.target.value)
                }
                rows={3}
                placeholder="Write a comment..."
                className="w-full border rounded-xl p-3 mt-3 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
              />

              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={() => {
                    setShowCommentModal(false);
                    setCommentText("");
                  }}
                  className="px-4 py-2 bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>

                <button
                  onClick={submitComment}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold"
                >
                  Post Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          EDIT MODAL
      ===================================================== */}

      {showEditModal && editData && (
        <div className="fixed inset-0 z-[11000000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl max-h-[95vh] overflow-y-auto rounded-2xl shadow-2xl">
            <div className="sticky top-0 z-10 bg-blue-600 text-white p-5 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">
                  Edit Property
                </h2>

                <p className="text-xs text-blue-100">
                  Update your property information
                </p>
              </div>

              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditData(null);
                }}
                className="p-2 rounded-full hover:bg-white/20"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-5 space-y-6">
              {/* BASIC */}

              <section>
                <h3 className="font-bold mb-3">
                  Basic Information
                </h3>

                <div className="grid md:grid-cols-2 gap-3">
                  <input
                    name="propertyType"
                    value={
                      editData.propertyType || ""
                    }
                    onChange={handleEditChange}
                    className="border rounded-lg p-2"
                    placeholder="Property Type"
                  />

                  <input
                    type="number"
                    name="price"
                    value={editData.price || ""}
                    onChange={handleEditChange}
                    className="border rounded-lg p-2"
                    placeholder="Price"
                  />
                </div>
              </section>

              {/* ADDRESS */}

              <section>
                <h3 className="font-bold mb-3">
                  Location
                </h3>

                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    ["province", "Province"],
                    ["district", "District"],
                    ["municipality", "Municipality"],
                    ["wardNo", "Ward No"],
                    ["tole", "Tole"],
                  ].map(([field, placeholder]) => (
                    <input
                      key={field}
                      type={
                        field === "wardNo"
                          ? "number"
                          : "text"
                      }
                      placeholder={placeholder}
                      value={
                        editData.address?.[
                          field
                        ] || ""
                      }
                      onChange={(e) =>
                        handleNestedChange(
                          "address",
                          field,
                          field === "wardNo"
                            ? Number(
                                e.target.value
                              )
                            : e.target.value
                        )
                      }
                      className={`border rounded-lg p-2 ${
                        field === "tole"
                          ? "md:col-span-2"
                          : ""
                      }`}
                    />
                  ))}
                </div>
              </section>

              {/* LAND */}

              {editData.propertyType ===
                "land" && (
                <section>
                  <h3 className="font-bold mb-3">
                    Land Information
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Land Area"
                      value={
                        editData.landArea?.value ||
                        ""
                      }
                      onChange={(e) =>
                        handleNestedChange(
                          "landArea",
                          "value",
                          e.target.value
                        )
                      }
                      className="border rounded-lg p-2"
                    />

                    <select
                      value={
                        editData.landArea?.unit ||
                        "sqft"
                      }
                      onChange={(e) =>
                        handleNestedChange(
                          "landArea",
                          "unit",
                          e.target.value
                        )
                      }
                      className="border rounded-lg p-2"
                    >
                      <option value="sqft">
                        Sq Ft
                      </option>
                      <option value="sqm">
                        Sq M
                      </option>
                      <option value="ropani">
                        Ropani
                      </option>
                      <option value="aana">
                        Aana
                      </option>
                      <option value="paisa">
                        Paisa
                      </option>
                      <option value="daam">
                        Daam
                      </option>
                      <option value="bigha">
                        Bigha
                      </option>
                      <option value="kattha">
                        Kattha
                      </option>
                      <option value="dhur">
                        Dhur
                      </option>
                    </select>
                  </div>
                </section>
              )}

              {/* HOME */}

              {editData.propertyType ===
                "home" && (
                <section>
                  <h3 className="font-bold mb-3">
                    Home Information
                  </h3>

                  <div className="grid md:grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Built-up Area"
                      value={
                        editData.homeDetails
                          ?.builtUpArea?.value ||
                        ""
                      }
                      onChange={(e) =>
                        handleDeepNestedChange(
                          "homeDetails",
                          "builtUpArea",
                          "value",
                          e.target.value
                        )
                      }
                      className="border rounded-lg p-2"
                    />

                    <select
                      value={
                        editData.homeDetails
                          ?.builtUpArea?.unit ||
                        "sqft"
                      }
                      onChange={(e) =>
                        handleDeepNestedChange(
                          "homeDetails",
                          "builtUpArea",
                          "unit",
                          e.target.value
                        )
                      }
                      className="border rounded-lg p-2"
                    >
                      <option value="sqft">
                        Sq Ft
                      </option>
                      <option value="sqm">
                        Sq M
                      </option>
                    </select>

                    {[
                      ["bedrooms", "Bedrooms"],
                      ["bathrooms", "Bathrooms"],
                      ["floors", "Floors"],
                      [
                        "propertyAge",
                        "Property Age",
                      ],
                    ].map(([field, label]) => (
                      <input
                        key={field}
                        type="number"
                        placeholder={label}
                        value={
                          editData.homeDetails?.[
                            field
                          ] || ""
                        }
                        onChange={(e) =>
                          handleNestedChange(
                            "homeDetails",
                            field,
                            Number(
                              e.target.value
                            )
                          )
                        }
                        className="border rounded-lg p-2"
                      />
                    ))}

                    <select
                      value={
                        editData.homeDetails
                          ?.furnishing || ""
                      }
                      onChange={(e) =>
                        handleNestedChange(
                          "homeDetails",
                          "furnishing",
                          e.target.value
                        )
                      }
                      className="border rounded-lg p-2 md:col-span-2"
                    >
                      <option value="">
                        Furnishing
                      </option>
                      <option value="fully-furnished">
                        Fully Furnished
                      </option>
                      <option value="semi-furnished">
                        Semi Furnished
                      </option>
                      <option value="unfurnished">
                        Unfurnished
                      </option>
                    </select>
                  </div>
                </section>
              )}

              {/* ROOM */}

              {editData.propertyType ===
                "room" && (
                <section>
                  <h3 className="font-bold mb-3">
                    Room Information
                  </h3>

                  <div className="grid md:grid-cols-2 gap-3">
                    <select
                      value={
                        editData.roomDetails
                          ?.roomType || ""
                      }
                      onChange={(e) =>
                        handleNestedChange(
                          "roomDetails",
                          "roomType",
                          e.target.value
                        )
                      }
                      className="border rounded-lg p-2"
                    >
                      <option value="">
                        Room Type
                      </option>
                      <option value="single">
                        Single
                      </option>
                      <option value="double">
                        Double
                      </option>
                      <option value="shared">
                        Shared
                      </option>
                      <option value="studio">
                        Studio
                      </option>
                      <option value="1bhk">
                        1 BHK
                      </option>
                      <option value="2bhk">
                        2 BHK
                      </option>
                    </select>

                    <input
                      type="number"
                      placeholder="Floor"
                      value={
                        editData.roomDetails
                          ?.floor || ""
                      }
                      onChange={(e) =>
                        handleNestedChange(
                          "roomDetails",
                          "floor",
                          Number(
                            e.target.value
                          )
                        )
                      }
                      className="border rounded-lg p-2"
                    />

                    <select
                      value={
                        editData.roomDetails
                          ?.furnishing || ""
                      }
                      onChange={(e) =>
                        handleNestedChange(
                          "roomDetails",
                          "furnishing",
                          e.target.value
                        )
                      }
                      className="border rounded-lg p-2 md:col-span-2"
                    >
                      <option value="">
                        Furnishing
                      </option>
                      <option value="fully-furnished">
                        Fully Furnished
                      </option>
                      <option value="semi-furnished">
                        Semi Furnished
                      </option>
                      <option value="unfurnished">
                        Unfurnished
                      </option>
                    </select>
                  </div>
                </section>
              )}

              {/* OFFICE */}

              {editData.propertyType ===
                "office" && (
                <section>
                  <h3 className="font-bold mb-3">
                    Office Information
                  </h3>

                  <div className="grid md:grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Office Area"
                      value={
                        editData.officeDetails?.area
                          ?.value || ""
                      }
                      onChange={(e) =>
                        handleDeepNestedChange(
                          "officeDetails",
                          "area",
                          "value",
                          e.target.value
                        )
                      }
                      className="border rounded-lg p-2"
                    />

                    <select
                      value={
                        editData.officeDetails?.area
                          ?.unit || "sqft"
                      }
                      onChange={(e) =>
                        handleDeepNestedChange(
                          "officeDetails",
                          "area",
                          "unit",
                          e.target.value
                        )
                      }
                      className="border rounded-lg p-2"
                    >
                      <option value="sqft">
                        Sq Ft
                      </option>
                      <option value="sqm">
                        Sq M
                      </option>
                    </select>

                    <input
                      type="number"
                      placeholder="Floor"
                      value={
                        editData.officeDetails
                          ?.floor || ""
                      }
                      onChange={(e) =>
                        handleNestedChange(
                          "officeDetails",
                          "floor",
                          Number(
                            e.target.value
                          )
                        )
                      }
                      className="border rounded-lg p-2"
                    />

                    <input
                      type="number"
                      placeholder="Number of Rooms"
                      value={
                        editData.officeDetails
                          ?.numberOfRooms || ""
                      }
                      onChange={(e) =>
                        handleNestedChange(
                          "officeDetails",
                          "numberOfRooms",
                          Number(
                            e.target.value
                          )
                        )
                      }
                      className="border rounded-lg p-2"
                    />
                  </div>
                </section>
              )}

              {/* DESCRIPTION */}

              <section>
                <h3 className="font-bold mb-2">
                  Description
                </h3>

                <textarea
                  value={
                    editData.description || ""
                  }
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      description:
                        e.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full border rounded-lg p-3 resize-none"
                  placeholder="Property description"
                />
              </section>

              {/* BUTTONS */}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditData(null);
                  }}
                  className="flex-1 bg-gray-200 py-3 rounded-xl font-semibold"
                >
                  Cancel
                </button>

                <button
                  onClick={updateProperty}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold"
                >
                  Update Property
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/* =====================================================
   SMALL UI COMPONENTS
===================================================== */

const InfoBox = ({
  icon,
  label,
  value,
  valueClass = "text-gray-800",
}) => (
  <div className="bg-gray-50 border rounded-xl p-4">
    <div className="text-blue-600 mb-2">
      {icon}
    </div>

    <p className="text-xs text-gray-500">
      {label}
    </p>

    <p
      className={`font-bold mt-1 capitalize ${valueClass}`}
    >
      {value}
    </p>
  </div>
);

const StatBox = ({
  icon,
  value,
  label,
}) => (
  <div className="bg-gray-50 rounded-xl p-3 text-center">
    <div className="text-gray-500 mb-1 flex justify-center">
      {icon}
    </div>

    <p className="font-bold text-gray-800">
      {value}
    </p>

    <p className="text-[10px] text-gray-500">
      {label}
    </p>
  </div>
);

const ActionButton = ({
  onClick,
  icon,
  text,
  className,
}) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition ${className}`}
  >
    {icon}
    {text}
  </button>
);

export default PropertyMarkers;