import { MapContainer, TileLayer, LayersControl, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import "@geoman-io/leaflet-geoman-free";

const GeomanControl = () => {
  const map = useMap();

  useEffect(() => {
    // Enable drawing controls
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

    // When polygon is created
    map.on("pm:create", (e) => {
      const layer = e.layer;
      const geoJSON = layer.toGeoJSON();

      console.log("GeoJSON:", geoJSON);

      // 👉 send to backend later
    });
  }, [map]);

  return null;
};

const Mapview = () => {
  const { BaseLayer, Overlay } = LayersControl;

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

        {/* 🔥 GEOMAN DRAW TOOL */}
        <GeomanControl />

      </MapContainer>
    </div>
  );
};

export default Mapview;