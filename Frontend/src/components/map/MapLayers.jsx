import { LayersControl, TileLayer } from "react-leaflet";

const MapLayers = () => {
  const { BaseLayer, Overlay } = LayersControl;

  return (
    <LayersControl>
      <BaseLayer  name="Street">
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
  );
};

export default MapLayers;