import {
  FaTimes,
  FaHome,
  FaMapMarkerAlt,
  FaRulerCombined,
  FaRoad,
  FaBed,
  FaBath,
  FaBuilding,
  FaRobot,
  FaEye,
  FaHeart,
  FaBookmark,
  FaRegComment,
  FaChevronRight,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

const PropertyDetailsPanel = ({
  property,
  onClose,
}) => {
  const navigate = useNavigate();

  if (!property) return null;

  const formatPrice = (price) => {
    if (!price) return "Price not available";

    return new Intl.NumberFormat("en-IN").format(price);
  };

  const getPopularityLabel = (score) => {
    if (score >= 80) {
      return {
        text: "Very High",
        className: "text-green-600",
      };
    }

    if (score >= 65) {
      return {
        text: "High",
        className: "text-blue-600",
      };
    }

    if (score >= 50) {
      return {
        text: "Moderate",
        className: "text-yellow-600",
      };
    }

    return {
      text: "Low",
      className: "text-red-600",
    };
  };

  const aiScore =
    property.aiPopularityScore !== null &&
    property.aiPopularityScore !== undefined
      ? Number(property.aiPopularityScore)
      : null;

  const popularity =
    aiScore !== null
      ? getPopularityLabel(aiScore)
      : null;

  return (
    <div
      className="
        absolute
        z-[1000]
        top-4
        right-4
        bottom-4
        w-[420px]
        max-w-[calc(100%-2rem)]
        bg-white
        rounded-2xl
        shadow-2xl
        overflow-hidden
        flex
        flex-col
      "
    >

      {/* HEADER */}

      <div className="flex items-center justify-between px-4 py-3 border-b bg-white">

        <div>
          <p className="text-xs text-gray-500">
            Property Details
          </p>

          <h2 className="font-bold text-gray-800">
            {property.title || "Property"}
          </h2>
        </div>

        <button
          onClick={onClose}
          className="
            w-9
            h-9
            flex
            items-center
            justify-center
            rounded-full
            bg-gray-100
            hover:bg-gray-200
            transition
          "
        >
          <FaTimes />
        </button>

      </div>


      {/* CONTENT */}

      <div className="flex-1 overflow-y-auto">

        {/* IMAGE */}

        <div className="relative">

          {property.images?.length > 0 ? (
            <img
              src={property.images[0].url}
              alt={property.title}
              className="w-full h-56 object-cover"
            />
          ) : (
            <div className="
              w-full
              h-56
              bg-gradient-to-br
              from-blue-100
              to-blue-200
              flex
              items-center
              justify-center
            ">
              <FaHome className="text-6xl text-blue-400" />
            </div>
          )}

          {/* TRENDING */}

          {property.isTrending && (
            <div className="
              absolute
              top-3
              left-3
              bg-gradient-to-r
              from-orange-500
              to-red-600
              text-white
              text-xs
              font-bold
              px-3
              py-1.5
              rounded-full
            ">
              🔥 TRENDING
            </div>
          )}

          {/* STATUS */}

          <div
            className={`
              absolute
              top-3
              right-3
              text-white
              text-xs
              font-bold
              px-3
              py-1.5
              rounded-full

              ${
                property.status === "available"
                  ? "bg-green-500"
                  : property.status === "negotiation"
                  ? "bg-yellow-500"
                  : property.status === "sold"
                  ? "bg-red-500"
                  : "bg-gray-500"
              }
            `}
          >
            {property.status
              ?.charAt(0)
              .toUpperCase() +
              property.status?.slice(1)}
          </div>

        </div>


        {/* MAIN CONTENT */}

        <div className="p-4 space-y-4">

          {/* TITLE */}

          <div className="flex items-start justify-between gap-3">

            <div>

              <h1 className="text-xl font-bold text-gray-800">
                {property.title || "Property"}
              </h1>

              <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                <FaMapMarkerAlt className="text-red-500" />

                {property.address?.tole &&
                  `${property.address.tole}, `}

                Ward {property.address?.wardNo},{" "}
                {property.address?.municipality},{" "}
                {property.address?.district}
              </div>

            </div>

            <span className="
              bg-blue-50
              text-blue-600
              px-2
              py-1
              rounded-lg
              text-xs
              font-semibold
              capitalize
            ">
              {property.propertyType}
            </span>

          </div>


          {/* PRICE */}

          <div className="
            bg-gradient-to-r
            from-blue-50
            to-indigo-50
            rounded-xl
            p-4
          ">

            <p className="text-xs text-gray-500">
              Price
            </p>

            <p className="text-2xl font-bold text-blue-700">
              Rs. {formatPrice(property.price)}
            </p>

            {property.isNegotiable && (
              <p className="text-xs text-green-600 font-semibold mt-1">
                ✓ Negotiable
              </p>
            )}

          </div>


          {/* DETAILS */}

          <div className="grid grid-cols-2 gap-2">

            {/* LAND */}

            {property.propertyType === "land" &&
              property.landArea && (

                <div className="bg-gray-50 rounded-xl p-3">

                  <div className="flex items-center gap-2 text-gray-500 text-xs">
                    <FaRulerCombined />
                    Land Area
                  </div>

                  <p className="font-semibold mt-1">
                    {property.landArea.value}{" "}
                    {property.landArea.unit}
                  </p>

                </div>
            )}


            {/* HOME AREA */}

            {property.propertyType === "home" &&
              property.homeDetails?.builtUpArea && (

                <div className="bg-gray-50 rounded-xl p-3">

                  <div className="flex items-center gap-2 text-gray-500 text-xs">
                    <FaRulerCombined />
                    Built-up Area
                  </div>

                  <p className="font-semibold mt-1">
                    {
                      property.homeDetails
                        .builtUpArea.value
                    }{" "}
                    {
                      property.homeDetails
                        .builtUpArea.unit
                    }
                  </p>

                </div>
            )}


            {/* BEDROOM */}

            {property.propertyType === "home" &&
              property.homeDetails?.bedrooms !==
                undefined && (

                <div className="bg-gray-50 rounded-xl p-3">

                  <div className="flex items-center gap-2 text-gray-500 text-xs">
                    <FaBed />
                    Bedrooms
                  </div>

                  <p className="font-semibold mt-1">
                    {property.homeDetails.bedrooms}
                  </p>

                </div>
            )}


            {/* BATHROOM */}

            {property.propertyType === "home" &&
              property.homeDetails?.bathrooms !==
                undefined && (

                <div className="bg-gray-50 rounded-xl p-3">

                  <div className="flex items-center gap-2 text-gray-500 text-xs">
                    <FaBath />
                    Bathrooms
                  </div>

                  <p className="font-semibold mt-1">
                    {property.homeDetails.bathrooms}
                  </p>

                </div>
            )}


            {/* ROAD */}

            {property.roadAccess?.available && (

              <div className="bg-gray-50 rounded-xl p-3">

                <div className="flex items-center gap-2 text-gray-500 text-xs">
                  <FaRoad />
                  Road Access
                </div>

                <p className="font-semibold mt-1">
                  {property.roadAccess.width}{" "}
                  {property.roadAccess.widthUnit}
                </p>

              </div>
            )}

          </div>


          {/* AI */}

          {aiScore !== null && (

            <div className="
              rounded-xl
              border
              border-blue-200
              bg-blue-50
              p-4
            ">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="
                    w-9
                    h-9
                    rounded-full
                    bg-blue-600
                    text-white
                    flex
                    items-center
                    justify-center
                  ">
                    <FaRobot />
                  </div>

                  <div>

                    <p className="text-xs text-gray-500">
                      AI Prediction
                    </p>

                    <p className="font-bold text-blue-700">
                      Popularity
                    </p>

                  </div>

                </div>

                <div className="text-right">

                  <p className="text-xl font-bold text-blue-700">
                    {aiScore.toFixed(1)}%
                  </p>

                  <p
                    className={`text-xs font-semibold ${popularity.className}`}
                  >
                    {popularity.text}
                  </p>

                </div>

              </div>


              <div className="w-full bg-white rounded-full h-2 mt-3">

                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min(
                      Math.max(aiScore, 0),
                      100
                    )}%`,
                  }}
                />

              </div>

              <p className="text-[10px] text-gray-500 mt-2">
                AI prediction based on property features.
              </p>

            </div>
          )}


          {/* ENGAGEMENT */}

          <div className="
            flex
            items-center
            justify-between
            bg-gray-50
            rounded-xl
            p-3
          ">

            <div className="flex items-center gap-1 text-xs text-gray-600">
              <FaEye />
              {property.views || 0}
            </div>

            <div className="flex items-center gap-1 text-xs text-red-500">
              <FaHeart />
              {property.likesCount || 0}
            </div>

            <div className="flex items-center gap-1 text-xs text-yellow-600">
              <FaBookmark />
              {property.favoritesCount || 0}
            </div>

            <div className="flex items-center gap-1 text-xs text-blue-500">
              <FaRegComment />
              {property.comments?.length || 0}
            </div>

          </div>


          {/* DESCRIPTION */}

          {property.description && (

            <div>

              <p className="text-xs text-gray-500">
                Description
              </p>

              <p className="text-sm text-gray-700 mt-1 line-clamp-3">
                {property.description}
              </p>

            </div>
          )}

        </div>

      </div>


      {/* FOOTER */}

      <div className="border-t bg-white p-3">

        <button
          onClick={() =>
            navigate(`/property/${property._id}`)
          }
          className="
            w-full
            flex
            items-center
            justify-center
            gap-2
            bg-gradient-to-r
            from-blue-600
            to-indigo-600
            hover:from-blue-700
            hover:to-indigo-700
            text-white
            font-semibold
            py-3
            rounded-xl
            transition
          "
        >
          Get More Details
          <FaChevronRight />
        </button>

      </div>

    </div>
  );
};

export default PropertyDetailsPanel;