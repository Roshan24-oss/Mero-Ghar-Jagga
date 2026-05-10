import { GeoJSON, Popup } from "react-leaflet";

const PropertyPolygons = ({ properties }) => {
  return (
    <>
      {properties.map((prop) => (
        <GeoJSON
          key={prop._id}
          data={{
            type: "Feature",
            geometry: prop.geometry,
          }}
          style={{ color: "red", weight: 3 }}
        >
          <Popup>
            <div className="space-y-1 w-[220px]">
              <h2 className="font-bold text-blue-600">{prop.label}</h2>
              <p>📍 {prop.address}</p>
              <p>💰 Rs {prop.price}</p>
              <p>📏 {prop.area}</p>
              <p>⏳ {prop.availableDays} days</p>
              <p className="text-sm text-gray-600">
                {prop.description}
              </p>
            </div>
          </Popup>
        </GeoJSON>
      ))}
    </>
  );
};

export default PropertyPolygons;