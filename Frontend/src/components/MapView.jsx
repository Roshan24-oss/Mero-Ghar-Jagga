import {
  MapContainer,
  TileLayer,
  LayersControl,
  useMap,
  GeoJSON,
  Marker,
  Popup
} from "react-leaflet";

import { useEffect, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";

import { AuthContext } from "../context/AuthContext";
import axiosInstance from "../api/axiosInstance.js";

import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import "@geoman-io/leaflet-geoman-free";


// 🔥 GEOMAN CONTROL (UNCHANGED)
const GeomanControl = ({ refreshProperties }) => {
  const map = useMap();

  useEffect(() => {
    map.pm.addControls({
      position: "topright",
      drawPolygon: true,
      drawMarker: false,
      drawCircle: false,
      drawPolyline: false,
      drawRectangle: false,
      editMode: true,
      dragMode: true,
      cutPolygon: true,
      removalMode: true,
    });

    const handleCreate = async (e) => {
      const geoJSON = e.layer.toGeoJSON();

      try {
        await axiosInstance.post("/property", {
          geometry: geoJSON.geometry,
        });

        alert("Property saved ✅");
        refreshProperties();
      } catch (err) {
        console.error(err);
        alert("Failed to save");
      }
    };

    map.on("pm:create", handleCreate);

    return () => {
      map.pm.removeControls();
      map.off("pm:create", handleCreate);
    };
  }, [map, refreshProperties]);

  return null;
};


// 🔥 MAIN MAP COMPONENT
const Mapview = () => {
  const { BaseLayer, Overlay } = LayersControl;
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);

  // FETCH PROPERTIES
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

  // 🔵 ICON
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

  return (
    <div className="h-[90vh] w-full">
      <MapContainer
        center={[27.7172, 85.3240]}
        zoom={13}
        className="h-full w-full"
      >
        <LayersControl>
          <BaseLayer name="Street Map">
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

        {/* 🔴 POLYGONS */}
        {properties.map((prop) => (
          <GeoJSON
            key={prop._id}
            data={{
              type: "Feature",
              geometry: prop.geometry,
            }}
            style={{ color: "red", weight: 3 }}
          />
        ))}

        {/* 🔵 SAFE OWNER MARKERS */}
        {properties.map((prop) => {
          const coords = prop.geometry?.coordinates?.[0];

          if (!Array.isArray(coords) || coords.length === 0) return null;

          const center = coords.find(
            (c) => Array.isArray(c) && c.length >= 2
          );

          if (!center) return null;

          return (
            <Marker
              key={prop._id + "_marker"}
              position={[center[1], center[0]]}
              icon={profileIcon(prop.owner?.fullName)}
              eventHandlers={{
                click: () => {
                  if (!user) {
                    navigate("/signin");
                  }
                },
              }}
            >
              <Popup>
                <div>
                  <h3>{prop.owner?.fullName}</h3>

                  {/* 🔥 PHONE LOGIC FIXED */}
                  <p>
                    {prop.owner?.phone
                      ? user
                        ? prop.owner.phone
                        : prop.owner.phone.slice(0, -6) + "******"
                      : ""}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 🔥 ONLY OWNER CAN DRAW */}
        {user && user.role === "owner" && (
          <GeomanControl refreshProperties={fetchProperties} />
        )}
      </MapContainer>
    </div>
  );
};

export default Mapview;