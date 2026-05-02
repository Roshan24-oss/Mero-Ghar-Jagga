import {
  MapContainer,
  TileLayer,
  LayersControl,
  useMap,
  GeoJSON
} from "react-leaflet";

import { useEffect, useContext, useState } from "react";
import L from "leaflet";

import { AuthContext } from "../context/AuthContext";
import axiosInstance from "../api/axiosInstance.js";

import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import "@geoman-io/leaflet-geoman-free";


// 🔥 GEOMAN CONTROL (ONLY OWNER)
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

    // ✅ FIXED: single event only
    const handleCreate = async (e) => {
      const geoJSON = e.layer.toGeoJSON();

      try {
        await axiosInstance.post("/property", {
          geometry: geoJSON.geometry,
        });

        alert("Property saved ✅");

        // 🔄 refresh map data
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

  const [properties, setProperties] = useState([]);

  // 🔥 FETCH PROPERTIES
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

  return (
    <div className="h-[90vh] w-full">
      <MapContainer
        center={[27.7172, 85.3240]}
        zoom={13}
        className="h-full w-full"
      >
        <LayersControl>
          <BaseLayer checked name="Street Map">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          </BaseLayer>

          <BaseLayer name="Satellite">
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
          </BaseLayer>

          <BaseLayer name="Satellite + Labels">
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
          </BaseLayer>

          <Overlay checked name="Labels">
            <TileLayer
              url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              zIndex={1000}
            />
          </Overlay>
        </LayersControl>

        {/* 🔴 SHOW SAVED PROPERTIES */}
        {properties.map((prop) => (
          <GeoJSON
            key={prop._id}
            data={{
              type: "Feature",
              geometry: prop.geometry,
            }}
            style={{
              color: "red",
              weight: 3,
            }}
          />
        ))}

        {/* 🔥 ONLY OWNER CAN DRAW */}
        {user && user.role === "owner" && (
          <GeomanControl refreshProperties={fetchProperties} />
        )}

      </MapContainer>
    </div>
  );
};

export default Mapview;