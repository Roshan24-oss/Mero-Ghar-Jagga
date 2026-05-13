import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";

import axiosInstance from "../../api/axiosInstance";

import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import "@geoman-io/leaflet-geoman-free";

const GeomanControl = ({ refreshProperties }) => {
  const map = useMap();

  const [showModal, setShowModal] = useState(false);

  const [tempLayer, setTempLayer] = useState(null);

  const [formData, setFormData] = useState({
    propertyType: "",

    // COMMON
    label: "",
    address: "",
    price: "",
    area: "",
    availableDays: "",
    description: "",

    // HOME
    bhk: "",
    furnished: "",
    parking: "",

    // LAND
    roadAccess: "",

    // ROOM
    roomType: "",
    wifi: "",

    // OFFICE
    floorNumber: "",
    meetingRoom: "",
  });

  // ================= MAP CONTROLS =================
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

      // DISABLE DRAWING WHEN MODAL OPENS
      map.pm.disableDraw();

      setShowModal(true);
    };

    map.on("pm:create", handleCreate);

    return () => {
      map.pm.removeControls();
      map.off("pm:create", handleCreate);
    };
  }, [map]);

  // ================= HANDLE INPUT =================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ================= ENABLE DRAW AGAIN =================
  const enableMapDrawing = () => {
    map.pm.enableGlobalEditMode(false);

    map.dragging.enable();
    map.doubleClickZoom.enable();
    map.scrollWheelZoom.enable();
  };

  // ================= SAVE PROPERTY =================
  const handleSave = async () => {
    if (!tempLayer) return;

    const geoJSON = tempLayer.toGeoJSON();

    try {
      await axiosInstance.post("/property", {
        geometry: geoJSON.geometry,

        ...formData,

        availableDays:
          Number(formData.availableDays) || 0,
      });

      alert("Property saved ✅");

      setShowModal(false);

      setTempLayer(null);

      enableMapDrawing();

      // RESET FORM
      setFormData({
        propertyType: "",

        label: "",
        address: "",
        price: "",
        area: "",
        availableDays: "",
        description: "",

        bhk: "",
        furnished: "",
        parking: "",

        roadAccess: "",

        roomType: "",
        wifi: "",

        floorNumber: "",
        meetingRoom: "",
      });

      refreshProperties();
    } catch (err) {
      console.error(err);

      alert("Failed to save property");
    }
  };

  // ================= CANCEL =================
  const handleCancel = () => {
    if (tempLayer) {
      map.removeLayer(tempLayer);
    }

    setShowModal(false);

    setTempLayer(null);

    enableMapDrawing();
  };

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[1000]">
          <div className="bg-white p-6 rounded-2xl w-[380px] max-h-[90vh] overflow-y-auto space-y-3 shadow-xl">

            <h2 className="text-2xl font-bold text-center text-blue-600">
              Add Property
            </h2>

            {/* PROPERTY TYPE */}
            <select
              name="propertyType"
              value={formData.propertyType}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="">
                Select Property Type
              </option>

              <option value="land">Land</option>

              <option value="home">Home</option>

              <option value="room">
                Room Rent
              </option>

              <option value="office">
                Office Rent
              </option>
            </select>

            {/* COMMON */}
            <input
              name="label"
              placeholder="Property Title"
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />

            <input
              name="address"
              placeholder="Address"
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />

            <input
              name="price"
              type="number"
              placeholder="Price"
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />

            <textarea
              name="description"
              placeholder="Description"
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />

            <input
              name="availableDays"
              type="number"
              placeholder="Available Days"
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />

            {/* ================= LAND ================= */}
            {formData.propertyType === "land" && (
              <>
                <input
                  name="area"
                  placeholder="Area (5 Aana)"
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                />

                <input
                  name="roadAccess"
                  placeholder="Road Access"
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                />
              </>
            )}

            {/* ================= HOME ================= */}
            {formData.propertyType === "home" && (
              <>
                <input
                  name="bhk"
                  placeholder="BHK (4 BHK)"
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                />

                <select
                  name="furnished"
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                >
                  <option value="">
                    Furnished?
                  </option>

                  <option value="yes">
                    Yes
                  </option>

                  <option value="no">
                    No
                  </option>
                </select>

                <select
                  name="parking"
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                >
                  <option value="">
                    Parking Available?
                  </option>

                  <option value="yes">
                    Yes
                  </option>

                  <option value="no">
                    No
                  </option>
                </select>
              </>
            )}

            {/* ================= ROOM ================= */}
            {formData.propertyType === "room" && (
              <>
                <input
                  name="roomType"
                  placeholder="Single / Double"
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                />

                <select
                  name="wifi"
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                >
                  <option value="">
                    Wifi Available?
                  </option>

                  <option value="yes">
                    Yes
                  </option>

                  <option value="no">
                    No
                  </option>
                </select>
              </>
            )}

            {/* ================= OFFICE ================= */}
            {formData.propertyType === "office" && (
              <>
                <input
                  name="floorNumber"
                  placeholder="Floor Number"
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                />

                <select
                  name="meetingRoom"
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                >
                  <option value="">
                    Meeting Room?
                  </option>

                  <option value="yes">
                    Yes
                  </option>

                  <option value="no">
                    No
                  </option>
                </select>
              </>
            )}

            {/* BUTTONS */}
            <div className="flex justify-between pt-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Save Property
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GeomanControl;