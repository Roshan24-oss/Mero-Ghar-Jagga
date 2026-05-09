import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const SavedProperties = () => {
  const { savedProperties } = useContext(AuthContext);

  return (
    <div className="pt-24 px-6">
      <h1 className="text-3xl font-bold mb-6 text-pink-600">
        Saved Properties
      </h1>

      {savedProperties.length === 0 ? (
        <p>No saved properties yet.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {savedProperties.map((prop) => (
            <div
              key={prop._id}
              className="bg-white shadow-lg rounded-2xl p-4 border"
            >
              <h2 className="text-xl font-bold text-blue-600">
                {prop.label}
              </h2>

              <p>📍 {prop.address}</p>
              <p>💰 Rs {prop.price}</p>
              <p>📏 {prop.area}</p>
              <p>⏳ {prop.availableDays} days</p>

              <p className="text-sm text-gray-600 mt-2">
                {prop.description}
              </p>

              <hr className="my-2" />

              <p>👤 {prop.owner?.fullName}</p>
              <p>📞 {prop.owner?.phone}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedProperties;