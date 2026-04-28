import { MapContainer, TileLayer, LayersControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";

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

          {/* STREET MAP */}
          <BaseLayer checked name="Street Map">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap"
            />
          </BaseLayer>

          {/* SATELLITE */}
          <BaseLayer name="Satellite">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="Esri"
            />
          </BaseLayer>

          {/* HYBRID FIXED */}
          <BaseLayer name="Satellite + Labels">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="Esri"
            />
          </BaseLayer>

          {/* 🔥 LABELS AS OVERLAY (THIS IS THE FIX) */}
          <Overlay checked name="Labels (ON TOP)">
            <TileLayer
              url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              attribution="Esri Labels"
              opacity={1}
              zIndex={1000}
            />
          </Overlay>

        </LayersControl>
      </MapContainer>
    </div>
  );
};

export default Mapview;