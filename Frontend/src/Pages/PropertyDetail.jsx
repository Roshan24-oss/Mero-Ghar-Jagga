import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaHome,
  FaMapMarkerAlt,
  FaRulerCombined,
  FaRoad,
  FaBed,
  FaBath,
  FaRobot,
} from "react-icons/fa";
import axiosInstance from "../api/axiosInstance";

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);

        const res = await axiosInstance.get(`/property/${id}`);

        setProperty(res.data);
      } catch (err) {
        console.error("Failed to fetch property:", err);
        setError("Failed to load property details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id]);

  const formatPrice = (price) => {
    if (!price) return "Price not available";

    return new Intl.NumberFormat("en-IN").format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-3 text-gray-600">
            Loading property...
          </p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 mb-4">
            {error || "Property not found."}
          </p>

          <button
            onClick={() => navigate("/")}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const aiScore =
    property.aiPopularityScore !== null &&
    property.aiPopularityScore !== undefined
      ? Number(property.aiPopularityScore)
      : null;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}

      <div className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">

          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
          >
            <FaArrowLeft />
          </button>

          <div>
            <p className="text-xs text-gray-500">
              Property Details
            </p>

            <h1 className="font-bold text-gray-800">
              {property.title || "Property"}
            </h1>
          </div>

        </div>
      </div>


      {/* MAIN */}

      <div className="max-w-6xl mx-auto px-4 py-6">

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

          {/* IMAGE */}

          <div className="relative">

            {property.images?.length > 0 ? (
              <img
                src={property.images[0].url}
                alt={property.title}
                className="w-full h-[420px] object-cover"
              />
            ) : (
              <div className="w-full h-[420px] bg-blue-100 flex items-center justify-center">
                <FaHome className="text-7xl text-blue-400" />
              </div>
            )}

            {property.isTrending && (
              <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                🔥 Trending
              </div>
            )}

            <div
              className={`absolute top-4 right-4 px-4 py-2 rounded-full text-sm font-bold text-white ${
                property.status === "available"
                  ? "bg-green-500"
                  : property.status === "negotiation"
                  ? "bg-yellow-500"
                  : property.status === "sold"
                  ? "bg-red-500"
                  : "bg-gray-500"
              }`}
            >
              {property.status || "Available"}
            </div>

          </div>


          {/* CONTENT */}

          <div className="p-6">

            {/* TITLE */}

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

              <div>

                <h2 className="text-3xl font-bold text-gray-800">
                  {property.title || "Property"}
                </h2>

                <div className="flex items-center gap-2 text-gray-500 mt-2">
                  <FaMapMarkerAlt className="text-red-500" />

                  <span>
                    {property.address?.tole &&
                      `${property.address.tole}, `}
                    Ward {property.address?.wardNo},{" "}
                    {property.address?.municipality ||
                      property.address?.muncipality},{" "}
                    {property.address?.district}
                  </span>
                </div>

              </div>

              <span className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-semibold capitalize">
                {property.propertyType}
              </span>

            </div>


            {/* PRICE */}

            <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5">

              <p className="text-sm text-gray-500">
                Property Price
              </p>

              <p className="text-3xl font-bold text-blue-700">
                Rs. {formatPrice(property.price)}
              </p>

              {property.isNegotiable && (
                <p className="text-sm text-green-600 font-semibold mt-1">
                  ✓ Negotiable
                </p>
              )}

            </div>


            {/* PROPERTY FEATURES */}

            <div className="mt-6">

              <h3 className="text-lg font-bold text-gray-800 mb-3">
                Property Information
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

                {property.propertyType === "land" &&
                  property.landArea && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <FaRulerCombined className="text-blue-600 mb-2" />

                      <p className="text-xs text-gray-500">
                        Land Area
                      </p>

                      <p className="font-semibold">
                        {property.landArea.value}{" "}
                        {property.landArea.unit}
                      </p>
                    </div>
                  )}

                {property.propertyType === "home" &&
                  property.homeDetails?.builtUpArea && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <FaRulerCombined className="text-blue-600 mb-2" />

                      <p className="text-xs text-gray-500">
                        Built-up Area
                      </p>

                      <p className="font-semibold">
                        {property.homeDetails.builtUpArea.value}{" "}
                        {property.homeDetails.builtUpArea.unit}
                      </p>
                    </div>
                  )}

                {property.propertyType === "home" &&
                  property.homeDetails?.bedrooms !== undefined && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <FaBed className="text-blue-600 mb-2" />

                      <p className="text-xs text-gray-500">
                        Bedrooms
                      </p>

                      <p className="font-semibold">
                        {property.homeDetails.bedrooms}
                      </p>
                    </div>
                  )}

                {property.propertyType === "home" &&
                  property.homeDetails?.bathrooms !== undefined && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <FaBath className="text-blue-600 mb-2" />

                      <p className="text-xs text-gray-500">
                        Bathrooms
                      </p>

                      <p className="font-semibold">
                        {property.homeDetails.bathrooms}
                      </p>
                    </div>
                  )}

                {property.roadAccess?.available && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <FaRoad className="text-blue-600 mb-2" />

                    <p className="text-xs text-gray-500">
                      Road Access
                    </p>

                    <p className="font-semibold">
                      {property.roadAccess.width}{" "}
                      {property.roadAccess.widthUnit}
                    </p>
                  </div>
                )}

              </div>

            </div>


            {/* AI PREDICTION */}

            {aiScore !== null && (
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-5">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <FaRobot />
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      AI Prediction
                    </p>

                    <p className="font-bold text-blue-700">
                      Property Popularity
                    </p>
                  </div>

                  <div className="ml-auto text-right">
                    <p className="text-2xl font-bold text-blue-700">
                      {aiScore.toFixed(1)}%
                    </p>
                  </div>

                </div>

                <div className="mt-4 h-2 bg-white rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{
                      width: `${Math.min(
                        Math.max(aiScore, 0),
                        100
                      )}%`,
                    }}
                  />
                </div>

              </div>
            )}


            {/* DESCRIPTION */}

            {property.description && (
              <div className="mt-6">

                <h3 className="text-lg font-bold text-gray-800">
                  Description
                </h3>

                <p className="text-gray-600 mt-2 leading-relaxed">
                  {property.description}
                </p>

              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};

export default PropertyDetails;