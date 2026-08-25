import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";

import axiosInstance from "../../api/axiosInstance";

import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import "@geoman-io/leaflet-geoman-free";

import AddressSelector from "./AddressSelector.jsx";

const GeomanControl = ({ refreshProperties }) => {
  const map = useMap();

  const [showModal, setShowModal] = useState(false);
  const [tempLayer, setTempLayer] = useState(null);

  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);

  const [isSaving, setIsSaving] = useState(false);

  // =====================================================
  // FORM DATA
  // =====================================================

  const initialFormData = {
    propertyType: "",

    // COMMON
    province: "",
    district: "",
    municipality: "",
    wardNo: "",
    tole: "",

    price: "",
    currency: "NPR",
    isNegotiable: false,
    description: "",

    // LAND
    landArea: {
      value: "",
      unit: "aana",
    },

    roadAccess: {
      available: false,
      width: "",
      widthUnit: "ft",
      type: "other",
    },

    // HOME
    homeDetails: {
      builtUpArea: {
        value: "",
        unit: "sqft",
      },

      bedrooms: "",
      bathrooms: "",
      floors: "",
      propertyAge: "",

      furnishing: "",

      parking: {
        available: false,
        capacity: "",
      },

      kitchen: {
        available: false,
        count: "",
      },

      balcony: {
        available: false,
        count: "",
      },

      waterSupply: "",
    },

    // ROOM
    roomDetails: {
      roomType: "",
      floor: "",

      bathroom: {
        available: false,
        attached: false,
      },

      kitchen: {
        available: false,
      },

      balcony: {
        available: false,
      },

      furnishing: "",

      wifi: {
        available: false,
      },

      parking: {
        available: false,
      },

      waterSupply: "",
    },

    // OFFICE
    officeDetails: {
      area: {
        value: "",
        unit: "sqft",
      },

      floor: "",
      numberOfRooms: "",

      meetingRoom: {
        available: false,
        count: "",
      },

      parking: {
        available: false,
      },

      furnishing: "",
    },
  };

  const [formData, setFormData] = useState(initialFormData);

  // =====================================================
  // MAP CONTROLS
  // =====================================================

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

      // Disable drawing while form is open
      map.pm.disableDraw();

      setShowModal(true);
    };

    map.on("pm:create", handleCreate);

    return () => {
      map.pm.removeControls();
      map.off("pm:create", handleCreate);
    };
  }, [map]);

  // =====================================================
  // SIMPLE INPUT HANDLER
  // =====================================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // =====================================================
  // NESTED INPUT HANDLERS
  // =====================================================

  const handleNestedChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleDeepNestedChange = (
    section,
    parent,
    field,
    value
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],

        [parent]: {
          ...prev[section][parent],
          [field]: value,
        },
      },
    }));
  };

  // =====================================================
  // IMAGE CHANGE
  // =====================================================

  const handleImageChange = (e) => {
    const selectedImages = Array.from(e.target.files || []);

    if (selectedImages.length > 5) {
      alert("You can upload maximum 5 images.");
      return;
    }

    setImages(selectedImages);
  };

  // =====================================================
  // ENABLE MAP DRAWING
  // =====================================================

  const enableMapDrawing = () => {
    map.pm.enableGlobalEditMode(false);

    map.dragging.enable();
    map.doubleClickZoom.enable();
    map.scrollWheelZoom.enable();
  };

  // =====================================================
  // SAVE PROPERTY
  // =====================================================

  const handleSave = async () => {
    if (!tempLayer) return;

    if (!formData.propertyType) {
      alert("Please select property type.");
      return;
    }

    if (!formData.price || Number(formData.price) < 0) {
      alert("Please enter a valid property price.");
      return;
    }

    if (
      !formData.province ||
      !formData.district ||
      !formData.municipality ||
      !formData.wardNo
    ) {
      alert("Please complete the property address.");
      return;
    }

    const geoJSON = tempLayer.toGeoJSON();

    try {
      setIsSaving(true);

      const data = new FormData();

      // =================================================
      // GEOMETRY
      // =================================================

      data.append(
        "geometry",
        JSON.stringify(geoJSON.geometry)
      );

      // =================================================
      // PROPERTY TYPE
      // =================================================

      data.append(
        "propertyType",
        formData.propertyType
      );

      // =================================================
      // BASIC INFORMATION
      // =================================================

      data.append(
        "price",
        formData.price
      );

      data.append(
        "currency",
        formData.currency || "NPR"
      );

      data.append(
        "isNegotiable",
        String(formData.isNegotiable)
      );

      data.append(
        "description",
        formData.description || ""
      );

      // =================================================
      // ADDRESS
      // =================================================

      const address = {
        province: formData.province,
        district: formData.district,
        municipality: formData.municipality,
        wardNo: formData.wardNo,
        tole: formData.tole || "",
      };

      data.append(
        "address",
        JSON.stringify(address)
      );

      // =================================================
      // LAND
      // =================================================

      if (formData.propertyType === "land") {
        const landArea = {
          value: formData.landArea.value,
          unit: formData.landArea.unit,
        };

        data.append(
          "landArea",
          JSON.stringify(landArea)
        );

        data.append(
          "roadAccess",
          JSON.stringify(formData.roadAccess)
        );
      }

      // =================================================
      // HOME
      // =================================================

      if (formData.propertyType === "home") {
        data.append(
          "homeDetails",
          JSON.stringify(formData.homeDetails)
        );

        data.append(
          "roadAccess",
          JSON.stringify(formData.roadAccess)
        );
      }

      // =================================================
      // ROOM
      // =================================================

      if (formData.propertyType === "room") {
        data.append(
          "roomDetails",
          JSON.stringify(formData.roomDetails)
        );
      }

      // =================================================
      // OFFICE
      // =================================================

      if (formData.propertyType === "office") {
        data.append(
          "officeDetails",
          JSON.stringify(formData.officeDetails)
        );

        data.append(
          "roadAccess",
          JSON.stringify(formData.roadAccess)
        );
      }

      // =================================================
      // IMAGES
      // =================================================

      images.forEach((image) => {
        data.append("images", image);
      });

      // =================================================
      // VIDEO
      // =================================================

      if (video) {
        data.append("video", video);
      }

      // =================================================
      // API CALL
      // =================================================

      await axiosInstance.post(
        "/property",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Property registered successfully ✅");

      // =================================================
      // CLOSE FORM
      // =================================================

      setShowModal(false);
      setTempLayer(null);

      enableMapDrawing();

      // =================================================
      // RESET
      // =================================================

      setFormData(initialFormData);
      setImages([]);
      setVideo(null);

      refreshProperties();

    } catch (err) {
      console.error(
        "SAVE PROPERTY ERROR:",
        err
      );

      console.error(
        "SERVER RESPONSE:",
        err.response?.data
      );

      alert(
        err.response?.data?.message ||
        "Failed to save property"
      );

    } finally {
      setIsSaving(false);
    }
  };

  // =====================================================
  // CANCEL
  // =====================================================

  const handleCancel = () => {
    if (tempLayer) {
      map.removeLayer(tempLayer);
    }

    setShowModal(false);
    setTempLayer(null);

    setFormData(initialFormData);
    setImages([]);
    setVideo(null);

    enableMapDrawing();
  };

  // =====================================================
  // UI HELPERS
  // =====================================================

  const SectionTitle = ({
    number,
    title,
    description,
  }) => (
    <div className="flex items-start gap-3 mb-5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
        {number}
      </div>

      <div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900">
          {title}
        </h3>

        {description && (
          <p className="text-sm text-gray-500 mt-1">
            {description}
          </p>
        )}
      </div>
    </div>
  );

  const InputLabel = ({
    children,
    required = false,
  }) => (
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {children}

      {required && (
        <span className="text-red-500 ml-1">
          *
        </span>
      )}
    </label>
  );

  const inputClass =
    "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const selectClass =
    "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const textareaClass =
    "w-full min-h-[120px] resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 z-[1000] bg-gray-100">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="h-16 sm:h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-8 shadow-sm">

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Add New Property
              </h2>

              <p className="hidden sm:block text-sm text-gray-500 mt-1">
                Enter your property information carefully
              </p>
            </div>

            <button
              type="button"
              onClick={handleCancel}
              className="h-10 w-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xl hover:bg-gray-200 transition"
            >
              ×
            </button>

          </div>

          {/* =================================================
              MAIN FORM
          ================================================= */}

          <div className="h-[calc(100vh-64px)] sm:h-[calc(100vh-80px)] overflow-y-auto">

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

              {/* =================================================
                  PROPERTY TYPE
              ================================================= */}

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-7 mb-6">

                <SectionTitle
                  number="1"
                  title="Property Type"
                  description="Select what type of property you want to list."
                />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

                  {[
                    {
                      value: "land",
                      title: "Land",
                      icon: "🌳",
                    },
                    {
                      value: "home",
                      title: "Home",
                      icon: "🏠",
                    },
                    {
                      value: "room",
                      title: "Room",
                      icon: "🛏️",
                    },
                    {
                      value: "office",
                      title: "Office",
                      icon: "🏢",
                    },
                  ].map((item) => (

                    <button
                      key={item.value}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          propertyType:
                            item.value,
                        }))
                      }
                      className={`rounded-2xl border-2 p-4 sm:p-5 text-center transition ${
                        formData.propertyType ===
                        item.value
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50"
                      }`}
                    >

                      <div className="text-3xl mb-2">
                        {item.icon}
                      </div>

                      <div className="font-semibold">
                        {item.title}
                      </div>

                    </button>

                  ))}

                </div>

                {formData.propertyType && (
                  <div className="mt-5 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-700">

                    <span className="font-semibold">
                      Automatic title:
                    </span>{" "}

                    {formData.propertyType ===
                      "land" &&
                      "Land for Sale"}

                    {formData.propertyType ===
                      "home" &&
                      "Home for Sale"}

                    {formData.propertyType ===
                      "room" &&
                      "Room for Rent"}

                    {formData.propertyType ===
                      "office" &&
                      "Office for Rent"}

                  </div>
                )}

              </div>

              {/* =================================================
                  BASIC INFORMATION
              ================================================= */}

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-7 mb-6">

                <SectionTitle
                  number="2"
                  title="Basic Information"
                  description="Provide the price and general information about the property."
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  <div>
                    <InputLabel required>
                      Price
                    </InputLabel>

                    <div className="flex">

                      <div className="px-4 flex items-center bg-gray-100 border border-r-0 border-gray-300 rounded-l-xl text-sm font-semibold">
                        NPR
                      </div>

                      <input
                        name="price"
                        type="number"
                        min="0"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="Enter property price"
                        className={`${inputClass} rounded-l-none`}
                      />

                    </div>
                  </div>

                  <div className="flex items-center pt-7">

                    <label className="flex items-center gap-3 cursor-pointer">

                      <input
                        type="checkbox"
                        name="isNegotiable"
                        checked={
                          formData.isNegotiable
                        }
                        onChange={
                          handleChange
                        }
                        className="h-5 w-5 accent-blue-600"
                      />

                      <span className="text-sm font-medium text-gray-700">
                        Price is negotiable
                      </span>

                    </label>

                  </div>

                </div>

                <div className="mt-5">

                  <InputLabel>
                    Description
                  </InputLabel>

                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the property, nearby facilities, road condition, environment, etc."
                    className={textareaClass}
                  />

                </div>

              </div>

              {/* =================================================
                  LOCATION
              ================================================= */}

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-7 mb-6">

                <SectionTitle
                  number="3"
                  title="Property Location"
                  description="Select the exact address of your property."
                />

                <AddressSelector
                  formData={formData}
                  setFormData={setFormData}
                />

                <div className="mt-5">

                  <InputLabel>
                    Tole / Local Area
                  </InputLabel>

                  <input
                    name="tole"
                    value={formData.tole}
                    onChange={handleChange}
                    placeholder="e.g. Baneshwor"
                    className={inputClass}
                  />

                </div>

              </div>

              {/* =================================================
                  LAND
              ================================================= */}

              {formData.propertyType ===
                "land" && (
                <>
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-7 mb-6">

                    <SectionTitle
                      number="4"
                      title="Land Information"
                      description="Enter the land size and measurement unit."
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                      <div>

                        <InputLabel required>
                          Land Area
                        </InputLabel>

<input
  type="number"
  min="0"
  value={formData.landArea.value}
  onChange={(e) =>
    setFormData((prev) => ({
      ...prev,
      landArea: {
        ...prev.landArea,
        value: e.target.value,
      },
    }))
  }
  placeholder="e.g. 5"
  className={inputClass}
/>
                      

                      </div>

                      <div>

                        <InputLabel required>
                          Unit
                        </InputLabel>

                        <select
                          value={
                            formData.landArea
                              .unit
                          }
                          onChange={(e) =>
                            setFormData(
                              (prev) => ({
                                ...prev,
                                landArea: {
                                  ...prev.landArea,
                                  unit: e.target
                                    .value,
                                },
                              })
                            )
                          }
                          className={
                            selectClass
                          }
                        >

                          <option value="sqft">
                            Square Feet
                          </option>

                          <option value="sqm">
                            Square Meter
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

                    </div>

                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-7 mb-6">

                    <SectionTitle
                      number="5"
                      title="Road Access"
                      description="Tell buyers about the road access to the property."
                    />

                    <div className="flex items-center mb-5">

                      <label className="flex items-center gap-3 cursor-pointer">

                        <input
                          type="checkbox"
                          checked={
                            formData
                              .roadAccess
                              .available
                          }
                          onChange={(e) =>
                            handleNestedChange(
                              "roadAccess",
                              "available",
                              e.target.checked
                            )
                          }
                          className="h-5 w-5 accent-blue-600"
                        />

                        <span className="font-medium text-gray-700">
                          Road access is available
                        </span>

                      </label>

                    </div>

                    {formData.roadAccess
                      .available && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                        <div>

                          <InputLabel>
                            Road Width
                          </InputLabel>

                          <input
                            type="number"
                            min="0"
                            value={
                              formData
                                .roadAccess
                                .width
                            }
                            onChange={(e) =>
                              handleNestedChange(
                                "roadAccess",
                                "width",
                                e.target.value
                              )
                            }
                            placeholder="e.g. 20"
                            className={
                              inputClass
                            }
                          />

                        </div>

                        <div>

                          <InputLabel>
                            Width Unit
                          </InputLabel>

                          <select
                            value={
                              formData
                                .roadAccess
                                .widthUnit
                            }
                            onChange={(e) =>
                              handleNestedChange(
                                "roadAccess",
                                "widthUnit",
                                e.target.value
                              )
                            }
                            className={
                              selectClass
                            }
                          >

                            <option value="ft">
                              Feet
                            </option>

                            <option value="m">
                              Meter
                            </option>

                          </select>

                        </div>

                        <div>

                          <InputLabel>
                            Road Type
                          </InputLabel>

                          <select
                            value={
                              formData
                                .roadAccess
                                .type
                            }
                            onChange={(e) =>
                              handleNestedChange(
                                "roadAccess",
                                "type",
                                e.target.value
                              )
                            }
                            className={
                              selectClass
                            }
                          >

                            <option value="blacktopped">
                              Blacktopped
                            </option>

                            <option value="concrete">
                              Concrete
                            </option>

                            <option value="gravel">
                              Gravel
                            </option>

                            <option value="paved">
                              Paved
                            </option>

                            <option value="earthen">
                              Earthen
                            </option>

                            <option value="other">
                              Other
                            </option>

                          </select>

                        </div>

                      </div>
                    )}

                  </div>
                </>
              )}

              {/* =================================================
                  HOME
              ================================================= */}

              {formData.propertyType ===
                "home" && (
                <>
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-7 mb-6">

                    <SectionTitle
                      number="4"
                      title="Home Information"
                      description="Provide the main details about the house."
                    />

                    {/* BUILT UP AREA */}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                      <div>

                        <InputLabel required>
                          Built-up Area
                        </InputLabel>

                        <input
                          type="number"
                          min="0"
                          value={
                            formData
                              .homeDetails
                              .builtUpArea
                              .value
                          }
                          onChange={(e) =>
                            setFormData(
                              (prev) => ({
                                ...prev,
                                homeDetails: {
                                  ...prev.homeDetails,
                                  builtUpArea: {
                                    ...prev.homeDetails
                                      .builtUpArea,
                                    value:
                                      e.target
                                        .value,
                                  },
                                },
                              })
                            )
                          }
                          placeholder="e.g. 2500"
                          className={
                            inputClass
                          }
                        />

                      </div>

                      <div>

                        <InputLabel>
                          Area Unit
                        </InputLabel>

                        <select
                          value={
                            formData
                              .homeDetails
                              .builtUpArea
                              .unit
                          }
                          onChange={(e) =>
                            setFormData(
                              (prev) => ({
                                ...prev,
                                homeDetails: {
                                  ...prev.homeDetails,
                                  builtUpArea: {
                                    ...prev.homeDetails
                                      .builtUpArea,
                                    unit:
                                      e.target
                                        .value,
                                  },
                                },
                              })
                            )
                          }
                          className={
                            selectClass
                          }
                        >

                          <option value="sqft">
                            Square Feet
                          </option>

                          <option value="sqm">
                            Square Meter
                          </option>

                        </select>

                      </div>

                    </div>

                    {/* BEDROOM / BATHROOM / FLOOR */}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">

                      <div>

                        <InputLabel>
                          Bedrooms
                        </InputLabel>

                        <input
                          type="number"
                          min="0"
                          value={
                            formData
                              .homeDetails
                              .bedrooms
                          }
                          onChange={(e) =>
                            handleNestedChange(
                              "homeDetails",
                              "bedrooms",
                              e.target.value
                            )
                          }
                          placeholder="e.g. 4"
                          className={
                            inputClass
                          }
                        />

                      </div>

                      <div>

                        <InputLabel>
                          Bathrooms
                        </InputLabel>

                        <input
                          type="number"
                          min="0"
                          value={
                            formData
                              .homeDetails
                              .bathrooms
                          }
                          onChange={(e) =>
                            handleNestedChange(
                              "homeDetails",
                              "bathrooms",
                              e.target.value
                            )
                          }
                          placeholder="e.g. 3"
                          className={
                            inputClass
                          }
                        />

                      </div>

                      <div>

                        <InputLabel>
                          Floors
                        </InputLabel>

                        <input
                          type="number"
                          min="0"
                          value={
                            formData
                              .homeDetails
                              .floors
                          }
                          onChange={(e) =>
                            handleNestedChange(
                              "homeDetails",
                              "floors",
                              e.target.value
                            )
                          }
                          placeholder="e.g. 2"
                          className={
                            inputClass
                          }
                        />

                      </div>

                    </div>

                    {/* AGE / FURNISHING */}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">

                      <div>

                        <InputLabel>
                          Property Age
                        </InputLabel>

                        <input
                          type="number"
                          min="0"
                          value={
                            formData
                              .homeDetails
                              .propertyAge
                          }
                          onChange={(e) =>
                            handleNestedChange(
                              "homeDetails",
                              "propertyAge",
                              e.target.value
                            )
                          }
                          placeholder="Age in years"
                          className={
                            inputClass
                          }
                        />

                      </div>

                      <div>

                        <InputLabel>
                          Furnishing
                        </InputLabel>

                        <select
                          value={
                            formData
                              .homeDetails
                              .furnishing
                          }
                          onChange={(e) =>
                            handleNestedChange(
                              "homeDetails",
                              "furnishing",
                              e.target.value
                            )
                          }
                          className={
                            selectClass
                          }
                        >

                          <option value="">
                            Select furnishing
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

                    </div>

                  </div>

                  {/* HOME FACILITIES */}

                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-7 mb-6">

                    <SectionTitle
                      number="5"
                      title="Home Facilities"
                      description="Select the facilities available in the home."
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                      {/* PARKING */}

                      <div className="rounded-xl border border-gray-200 p-4">

                        <label className="flex items-center gap-3 cursor-pointer">

                          <input
                            type="checkbox"
                            checked={
                              formData
                                .homeDetails
                                .parking
                                .available
                            }
                            onChange={(e) =>
                              handleDeepNestedChange(
                                "homeDetails",
                                "parking",
                                "available",
                                e.target
                                  .checked
                              )
                            }
                            className="h-5 w-5 accent-blue-600"
                          />

                          <span className="font-semibold">
                            Parking
                          </span>

                        </label>

                        {formData
                          .homeDetails
                          .parking
                          .available && (
                          <input
                            type="number"
                            min="0"
                            value={
                              formData
                                .homeDetails
                                .parking
                                .capacity
                            }
                            onChange={(e) =>
                              handleDeepNestedChange(
                                "homeDetails",
                                "parking",
                                "capacity",
                                e.target
                                  .value
                              )
                            }
                            placeholder="Vehicle capacity"
                            className={`${inputClass} mt-3`}
                          />
                        )}

                      </div>

                      {/* KITCHEN */}

                      <div className="rounded-xl border border-gray-200 p-4">

                        <label className="flex items-center gap-3 cursor-pointer">

                          <input
                            type="checkbox"
                            checked={
                              formData
                                .homeDetails
                                .kitchen
                                .available
                            }
                            onChange={(e) =>
                              handleDeepNestedChange(
                                "homeDetails",
                                "kitchen",
                                "available",
                                e.target
                                  .checked
                              )
                            }
                            className="h-5 w-5 accent-blue-600"
                          />

                          <span className="font-semibold">
                            Kitchen
                          </span>

                        </label>

                        {formData
                          .homeDetails
                          .kitchen
                          .available && (
                          <input
                            type="number"
                            min="0"
                            value={
                              formData
                                .homeDetails
                                .kitchen
                                .count
                            }
                            onChange={(e) =>
                              handleDeepNestedChange(
                                "homeDetails",
                                "kitchen",
                                "count",
                                e.target
                                  .value
                              )
                            }
                            placeholder="Number of kitchens"
                            className={`${inputClass} mt-3`}
                          />
                        )}

                      </div>

                      {/* BALCONY */}

                      <div className="rounded-xl border border-gray-200 p-4">

                        <label className="flex items-center gap-3 cursor-pointer">

                          <input
                            type="checkbox"
                            checked={
                              formData
                                .homeDetails
                                .balcony
                                .available
                            }
                            onChange={(e) =>
                              handleDeepNestedChange(
                                "homeDetails",
                                "balcony",
                                "available",
                                e.target
                                  .checked
                              )
                            }
                            className="h-5 w-5 accent-blue-600"
                          />

                          <span className="font-semibold">
                            Balcony
                          </span>

                        </label>

                        {formData
                          .homeDetails
                          .balcony
                          .available && (
                          <input
                            type="number"
                            min="0"
                            value={
                              formData
                                .homeDetails
                                .balcony
                                .count
                            }
                            onChange={(e) =>
                              handleDeepNestedChange(
                                "homeDetails",
                                "balcony",
                                "count",
                                e.target
                                  .value
                              )
                            }
                            placeholder="Number of balconies"
                            className={`${inputClass} mt-3`}
                          />
                        )}

                      </div>

                    </div>

                    <div className="mt-5">

                      <InputLabel>
                        Water Supply
                      </InputLabel>

                      <select
                        value={
                          formData
                            .homeDetails
                            .waterSupply
                        }
                        onChange={(e) =>
                          handleNestedChange(
                            "homeDetails",
                            "waterSupply",
                            e.target.value
                          )
                        }
                        className={
                          selectClass
                        }
                      >

                        <option value="">
                          Select water supply
                        </option>

                        <option value="municipal">
                          Municipal
                        </option>

                        <option value="well">
                          Well
                        </option>

                        <option value="boring">
                          Boring
                        </option>

                        <option value="spring">
                          Spring
                        </option>

                        <option value="other">
                          Other
                        </option>

                      </select>

                    </div>

                  </div>

                  {/* HOME ROAD ACCESS */}

                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-7 mb-6">

                    <SectionTitle
                      number="6"
                      title="Road Access"
                      description="Provide information about road access."
                    />

                    <div className="flex items-center">

                      <label className="flex items-center gap-3 cursor-pointer">

                        <input
                          type="checkbox"
                          checked={
                            formData
                              .roadAccess
                              .available
                          }
                          onChange={(e) =>
                            handleNestedChange(
                              "roadAccess",
                              "available",
                              e.target.checked
                            )
                          }
                          className="h-5 w-5 accent-blue-600"
                        />

                        <span className="font-semibold">
                          Road access is available
                        </span>

                      </label>

                    </div>

                    {formData.roadAccess
                      .available && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">

                        <div>

                          <InputLabel>
                            Road Width
                          </InputLabel>

                          <input
                            type="number"
                            min="0"
                            value={
                              formData
                                .roadAccess
                                .width
                            }
                            onChange={(e) =>
                              handleNestedChange(
                                "roadAccess",
                                "width",
                                e.target.value
                              )
                            }
                            className={
                              inputClass
                            }
                          />

                        </div>

                        <div>

                          <InputLabel>
                            Width Unit
                          </InputLabel>

                          <select
                            value={
                              formData
                                .roadAccess
                                .widthUnit
                            }
                            onChange={(e) =>
                              handleNestedChange(
                                "roadAccess",
                                "widthUnit",
                                e.target.value
                              )
                            }
                            className={
                              selectClass
                            }
                          >

                            <option value="ft">
                              Feet
                            </option>

                            <option value="m">
                              Meter
                            </option>

                          </select>

                        </div>

                        <div>

                          <InputLabel>
                            Road Type
                          </InputLabel>

                          <select
                            value={
                              formData
                                .roadAccess
                                .type
                            }
                            onChange={(e) =>
                              handleNestedChange(
                                "roadAccess",
                                "type",
                                e.target.value
                              )
                            }
                            className={
                              selectClass
                            }
                          >

                            <option value="blacktopped">
                              Blacktopped
                            </option>

                            <option value="concrete">
                              Concrete
                            </option>

                            <option value="gravel">
                              Gravel
                            </option>

                            <option value="paved">
                              Paved
                            </option>

                            <option value="earthen">
                              Earthen
                            </option>

                            <option value="other">
                              Other
                            </option>

                          </select>

                        </div>

                      </div>
                    )}

                  </div>
                </>
              )}

              {/* =================================================
                  ROOM
              ================================================= */}

              {formData.propertyType ===
                "room" && (
                <>
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-7 mb-6">

                    <SectionTitle
                      number="4"
                      title="Room Information"
                      description="Provide details about the room available for rent."
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                      <div>

                        <InputLabel required>
                          Room Type
                        </InputLabel>

                        <select
                          value={
                            formData
                              .roomDetails
                              .roomType
                          }
                          onChange={(e) =>
                            handleNestedChange(
                              "roomDetails",
                              "roomType",
                              e.target.value
                            )
                          }
                          className={
                            selectClass
                          }
                        >

                          <option value="">
                            Select room type
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

                          <option value="other">
                            Other
                          </option>

                        </select>

                      </div>

                      <div>

                        <InputLabel>
                          Floor
                        </InputLabel>

                        <input
                          type="number"
                          min="0"
                          value={
                            formData
                              .roomDetails
                              .floor
                          }
                          onChange={(e) =>
                            handleNestedChange(
                              "roomDetails",
                              "floor",
                              e.target.value
                            )
                          }
                          placeholder="e.g. 2"
                          className={
                            inputClass
                          }
                        />

                      </div>

                      <div>

                        <InputLabel>
                          Furnishing
                        </InputLabel>

                        <select
                          value={
                            formData
                              .roomDetails
                              .furnishing
                          }
                          onChange={(e) =>
                            handleNestedChange(
                              "roomDetails",
                              "furnishing",
                              e.target.value
                            )
                          }
                          className={
                            selectClass
                          }
                        >

                          <option value="">
                            Select furnishing
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

                      <div>

                        <InputLabel>
                          Water Supply
                        </InputLabel>

                        <input
                          value={
                            formData
                              .roomDetails
                              .waterSupply
                          }
                          onChange={(e) =>
                            handleNestedChange(
                              "roomDetails",
                              "waterSupply",
                              e.target.value
                            )
                          }
                          placeholder="e.g. Municipal"
                          className={
                            inputClass
                          }
                        />

                      </div>

                    </div>

                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-7 mb-6">

                    <SectionTitle
                      number="5"
                      title="Room Facilities"
                      description="Select facilities available with the room."
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                      {[
                        [
                          "bathroom",
                          "Bathroom",
                        ],
                        [
                          "kitchen",
                          "Kitchen",
                        ],
                        [
                          "balcony",
                          "Balcony",
                        ],
                        [
                          "wifi",
                          "Wi-Fi",
                        ],
                        [
                          "parking",
                          "Parking",
                        ],
                      ].map(
                        ([key, label]) => (
                          <label
                            key={key}
                            className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 cursor-pointer hover:bg-gray-50"
                          >

                            <input
                              type="checkbox"
                              checked={
                                key ===
                                "bathroom"
                                  ? formData
                                      .roomDetails
                                      .bathroom
                                      .available
                                  : formData
                                      .roomDetails[
                                      key
                                    ].available
                              }
                              onChange={(e) =>
                                handleDeepNestedChange(
                                  "roomDetails",
                                  key,
                                  "available",
                                  e.target.checked
                                )
                              }
                              className="h-5 w-5 accent-blue-600"
                            />

                            <span className="font-medium">
                              {label}
                            </span>

                          </label>
                        )
                      )}

                    </div>

                    {/* ATTACHED BATHROOM */}

                    {formData.roomDetails
                      .bathroom.available && (
                      <label className="flex items-center gap-3 mt-5 cursor-pointer">

                        <input
                          type="checkbox"
                          checked={
                            formData
                              .roomDetails
                              .bathroom
                              .attached
                          }
                          onChange={(e) =>
                            handleDeepNestedChange(
                              "roomDetails",
                              "bathroom",
                              "attached",
                              e.target.checked
                            )
                          }
                          className="h-5 w-5 accent-blue-600"
                        />

                        <span className="text-sm font-medium">
                          Attached bathroom
                        </span>

                      </label>
                    )}

                  </div>
                </>
              )}

              {/* =================================================
                  OFFICE
              ================================================= */}

              {formData.propertyType ===
                "office" && (
                <>
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-7 mb-6">

                    <SectionTitle
                      number="4"
                      title="Office Information"
                      description="Provide details about the office space."
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                      <div>

                        <InputLabel required>
                          Office Area
                        </InputLabel>

                        <input
                          type="number"
                          min="0"
                          value={
                            formData
                              .officeDetails
                              .area
                              .value
                          }
                          onChange={(e) =>
                            setFormData(
                              (prev) => ({
                                ...prev,
                                officeDetails: {
                                  ...prev.officeDetails,
                                  area: {
                                    ...prev.officeDetails
                                      .area,
                                    value:
                                      e.target
                                        .value,
                                  },
                                },
                              })
                            )
                          }
                          placeholder="e.g. 1200"
                          className={
                            inputClass
                          }
                        />

                      </div>

                      <div>

                        <InputLabel>
                          Area Unit
                        </InputLabel>

                        <select
                          value={
                            formData
                              .officeDetails
                              .area
                              .unit
                          }
                          onChange={(e) =>
                            setFormData(
                              (prev) => ({
                                ...prev,
                                officeDetails: {
                                  ...prev.officeDetails,
                                  area: {
                                    ...prev.officeDetails
                                      .area,
                                    unit:
                                      e.target
                                        .value,
                                  },
                                },
                              })
                            )
                          }
                          className={
                            selectClass
                          }
                        >

                          <option value="sqft">
                            Square Feet
                          </option>

                          <option value="sqm">
                            Square Meter
                          </option>

                        </select>

                      </div>

                      <div>

                        <InputLabel>
                          Floor
                        </InputLabel>

                        <input
                          type="number"
                          min="0"
                          value={
                            formData
                              .officeDetails
                              .floor
                          }
                          onChange={(e) =>
                            handleNestedChange(
                              "officeDetails",
                              "floor",
                              e.target.value
                            )
                          }
                          placeholder="e.g. 3"
                          className={
                            inputClass
                          }
                        />

                      </div>

                      <div>

                        <InputLabel>
                          Number of Rooms
                        </InputLabel>

                        <input
                          type="number"
                          min="0"
                          value={
                            formData
                              .officeDetails
                              .numberOfRooms
                          }
                          onChange={(e) =>
                            handleNestedChange(
                              "officeDetails",
                              "numberOfRooms",
                              e.target.value
                            )
                          }
                          placeholder="e.g. 5"
                          className={
                            inputClass
                          }
                        />

                      </div>

                    </div>

                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-7 mb-6">

                    <SectionTitle
                      number="5"
                      title="Office Facilities"
                      description="Select facilities available with the office."
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                      <div className="border border-gray-200 rounded-xl p-4">

                        <label className="flex items-center gap-3 cursor-pointer">

                          <input
                            type="checkbox"
                            checked={
                              formData
                                .officeDetails
                                .meetingRoom
                                .available
                            }
                            onChange={(e) =>
                              handleDeepNestedChange(
                                "officeDetails",
                                "meetingRoom",
                                "available",
                                e.target
                                  .checked
                              )
                            }
                            className="h-5 w-5 accent-blue-600"
                          />

                          <span className="font-semibold">
                            Meeting Room
                          </span>

                        </label>

                        {formData
                          .officeDetails
                          .meetingRoom
                          .available && (
                          <input
                            type="number"
                            min="0"
                            value={
                              formData
                                .officeDetails
                                .meetingRoom
                                .count
                            }
                            onChange={(e) =>
                              handleDeepNestedChange(
                                "officeDetails",
                                "meetingRoom",
                                "count",
                                e.target
                                  .value
                              )
                            }
                            placeholder="Number of rooms"
                            className={`${inputClass} mt-3`}
                          />
                        )}

                      </div>

                      <label className="border border-gray-200 rounded-xl p-4 flex items-center gap-3 cursor-pointer">

                        <input
                          type="checkbox"
                          checked={
                            formData
                              .officeDetails
                              .parking
                              .available
                          }
                          onChange={(e) =>
                            handleDeepNestedChange(
                              "officeDetails",
                              "parking",
                              "available",
                              e.target.checked
                            )
                          }
                          className="h-5 w-5 accent-blue-600"
                        />

                        <span className="font-semibold">
                          Parking Available
                        </span>

                      </label>

                      <div>

                        <InputLabel>
                          Furnishing
                        </InputLabel>

                        <select
                          value={
                            formData
                              .officeDetails
                              .furnishing
                          }
                          onChange={(e) =>
                            handleNestedChange(
                              "officeDetails",
                              "furnishing",
                              e.target.value
                            )
                          }
                          className={
                            selectClass
                          }
                        >

                          <option value="">
                            Select furnishing
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

                    </div>

                  </div>

                  {/* OFFICE ROAD ACCESS */}

                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-7 mb-6">

                    <SectionTitle
                      number="6"
                      title="Road Access"
                      description="Provide information about access to the office."
                    />

                    <div className="flex items-center">

                      <label className="flex items-center gap-3 cursor-pointer">

                        <input
                          type="checkbox"
                          checked={
                            formData
                              .roadAccess
                              .available
                          }
                          onChange={(e) =>
                            handleNestedChange(
                              "roadAccess",
                              "available",
                              e.target.checked
                            )
                          }
                          className="h-5 w-5 accent-blue-600"
                        />

                        <span className="font-semibold">
                          Road access is available
                        </span>

                      </label>

                    </div>

                    {formData.roadAccess
                      .available && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">

                        <div>

                          <InputLabel>
                            Road Width
                          </InputLabel>

                          <input
                            type="number"
                            min="0"
                            value={
                              formData
                                .roadAccess
                                .width
                            }
                            onChange={(e) =>
                              handleNestedChange(
                                "roadAccess",
                                "width",
                                e.target.value
                              )
                            }
                            className={
                              inputClass
                            }
                          />

                        </div>

                        <div>

                          <InputLabel>
                            Width Unit
                          </InputLabel>

                          <select
                            value={
                              formData
                                .roadAccess
                                .widthUnit
                            }
                            onChange={(e) =>
                              handleNestedChange(
                                "roadAccess",
                                "widthUnit",
                                e.target.value
                              )
                            }
                            className={
                              selectClass
                            }
                          >

                            <option value="ft">
                              Feet
                            </option>

                            <option value="m">
                              Meter
                            </option>

                          </select>

                        </div>

                        <div>

                          <InputLabel>
                            Road Type
                          </InputLabel>

                          <select
                            value={
                              formData
                                .roadAccess
                                .type
                            }
                            onChange={(e) =>
                              handleNestedChange(
                                "roadAccess",
                                "type",
                                e.target.value
                              )
                            }
                            className={
                              selectClass
                            }
                          >

                            <option value="blacktopped">
                              Blacktopped
                            </option>

                            <option value="concrete">
                              Concrete
                            </option>

                            <option value="gravel">
                              Gravel
                            </option>

                            <option value="paved">
                              Paved
                            </option>

                            <option value="earthen">
                              Earthen
                            </option>

                            <option value="other">
                              Other
                            </option>

                          </select>

                        </div>

                      </div>
                    )}

                  </div>
                </>
              )}

              {/* =================================================
                  MEDIA
              ================================================= */}

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-7 mb-6">

                <SectionTitle
                  number="7"
                  title="Property Media"
                  description="Upload photos and a video to make your property attractive."
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* IMAGES */}

                  <div>

                    <InputLabel>
                      Property Images
                    </InputLabel>

                    <label className="flex flex-col items-center justify-center min-h-[160px] rounded-2xl border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer transition p-5 text-center">

                      <div className="text-4xl mb-3">
                        📷
                      </div>

                      <p className="font-semibold text-gray-700">
                        Click to upload images
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        Maximum 5 images
                      </p>

                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={
                          handleImageChange
                        }
                        className="hidden"
                      />

                    </label>

                    {images.length > 0 && (
                      <p className="text-sm text-green-600 mt-2">
                        {images.length} image
                        {images.length > 1
                          ? "s"
                          : ""}{" "}
                        selected
                      </p>
                    )}

                  </div>

                  {/* VIDEO */}

                  <div>

                    <InputLabel>
                      Property Video
                    </InputLabel>

                    <label className="flex flex-col items-center justify-center min-h-[160px] rounded-2xl border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer transition p-5 text-center">

                      <div className="text-4xl mb-3">
                        🎥
                      </div>

                      <p className="font-semibold text-gray-700">
                        Click to upload video
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        MP4, WebM or MOV
                      </p>

                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        onChange={(e) =>
                          setVideo(
                            e.target
                              .files?.[0] ||
                              null
                          )
                        }
                        className="hidden"
                      />

                    </label>

                    {video && (
                      <p className="text-sm text-green-600 mt-2 truncate">
                        {video.name}
                      </p>
                    )}

                  </div>

                </div>

              </div>

              {/* =================================================
                  FINAL ACTION
              ================================================= */}

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-7">

                <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">

                  <div>

                    <h3 className="font-bold text-gray-900">
                      Ready to publish?
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      Your property will be analyzed by
                      the AI popularity prediction system.
                    </p>

                  </div>

                  <div className="flex flex-col-reverse sm:flex-row gap-3">

                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={
                        isSaving ||
                        !formData.propertyType
                      }
                      className="px-7 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >

                      {isSaving
                        ? "Saving Property..."
                        : "Publish Property"}

                    </button>

                  </div>

                </div>

              </div>

              <div className="h-10" />

            </div>

          </div>

        </div>
      )}
    </>
  );
};

export default GeomanControl;