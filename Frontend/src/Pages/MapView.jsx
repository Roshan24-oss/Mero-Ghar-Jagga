import {
  MapContainer,
  Marker,
  Popup,
} from "react-leaflet";

import { useEffect, useContext, useState } from "react";

import { AuthContext } from "../context/AuthContext";
import axiosInstance from "../api/axiosInstance";

import FlyToLocation from "../components/map/FlyToLocation";
import MapLayers from "../components/map/MapLayers";
import PropertyMarkers from "../components/map/PropertyMarkers";
import PropertyPolygons from "../components/map/PropertyPolygons";
import GeomanControl from "../components/map/GeomanControl"

import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";

const MapView = ({ searchedLocation, selectedFilter }) => {
  const { user, savedProperties, setSavedProperties } =
    useContext(AuthContext);

  const [properties, setProperties] = useState([]);

const filteredProperties =
  selectedFilter === "all"
    ? properties
    : properties.filter(
        (prop) =>
          prop.propertyType
            ?.toLowerCase()
            .trim() === selectedFilter
      );
 

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
        center={[27.7172, 85.324]}
        zoom={13}
        className="h-full w-full"
      >
        <MapLayers />

        {searchedLocation && (
          <>
            <FlyToLocation location={searchedLocation} />

            <Marker position={searchedLocation}>
              <Popup>Searched Location</Popup>
            </Marker>
          </>
        )}

        <PropertyPolygons properties={filteredProperties} />

        <PropertyMarkers
          properties={filteredProperties}
          user={user}
          savedProperties={savedProperties}
          setSavedProperties={setSavedProperties}
        />

        {user && user.role === "owner" &&(
          <GeomanControl refreshProperties={fetchProperties} />
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;