import Property from "../models/Property.js";
import PropertyLike from "../models/PropertyLike.js";
import PropertyFavorite from "../models/PropertyFavoorite.js";
import PropertyView from "../models/PropertyView.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
import calculateTrending from "../utils/trendingCalculator.js";
import {predictPopularity} from "../services/aiServices.js";


//helper function for uploading image and video to cloudinary

const uploadToCloudinary = (fileBuffer, folder, resourceType = "image") => {
  return new Promise((resolve, reject) => {

    console.log("Uploading to Cloudinary...");
    console.log(cloudinary.config());

    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {

        console.log("Cloudinary Error:", error);
        console.log("Cloudinary Result:", result);

        if (error) return reject(error);

        resolve(result);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

// Convert Nepali numerals to English numerals
const nepaliToEnglishNumber = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const map = {
    "०": "0",
    "१": "1",
    "२": "2",
    "३": "3",
    "४": "4",
    "५": "5",
    "६": "6",
    "७": "7",
    "८": "8",
    "९": "9",
  };

  const converted = String(value)
    .split("")
    .map((char) => map[char] || char)
    .join("");

  const number = Number(converted);

  return Number.isNaN(number) ? null : number;
};


// Convert a value to Number safely
const toNumber = (value, defaultValue = null) => {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  const number = nepaliToEnglishNumber(value);

  return number === null ? defaultValue : number;
};


// Convert string boolean from FormData
const toBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  if (typeof value === "boolean") {
    return value;
  }

  return String(value).toLowerCase() === "true";
};


// Parse JSON coming from FormData
const parseJSON = (value, defaultValue = null) => {
  if (!value) {
    return defaultValue;
  }

  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return defaultValue;
  }
};




// =====================================================
// LAND AREA CONVERSION
// Nepal traditional land measurement
// =====================================================

const LAND_UNIT_TO_SQFT = {
  sqft: 1,
  sqm: 10.7639104167,

  // 1 Ropani = 16 Aana
  // 1 Aana = 342.25 sq.ft
  ropani: 5476,

  // 1 Aana = 4 Paisa
  aana: 342.25,

  // 1 Paisa = 4 Daam
  paisa: 85.5625,

  // 1 Daam
  daam: 21.390625,

  // Terai measurement
  // 1 Bigha = 20 Kattha
  bigha: 72900,

  // 1 Kattha = 20 Dhur
  kattha: 3645,

  dhur: 182.25,
};


const calculateSquareFeet = (value, unit) => {
  if (!value || !unit) {
    return null;
  }

  const conversion = LAND_UNIT_TO_SQFT[unit];

  if (!conversion) {
    return null;
  }

  return Number((Number(value) * conversion).toFixed(2));
};

// =====================================================
// GENERAL AREA CONVERSION
// =====================================================

const calculateGeneralSquareFeet = (value, unit) => {
  if (!value || !unit) {
    return null;
  }

  if (unit === "sqft") {
    return Number(Number(value).toFixed(2));
  }

  if (unit === "sqm") {
    return Number((Number(value) * 10.7639104167).toFixed(2));
  }

  return null;
}; 


// =====================================================
// ADD PROPERTY
// =====================================================

export const addProperty = async (req, res) => {
  try {
    // =================================================
    // BASIC DATA
    // =================================================

    const {
      geometry,
      propertyType,
      price,
      currency,
      isNegotiable,
      description,

      province,
      district,
      municipality,
      wardNo,
      tole,

      address,
      landArea,
      roadAccess,

      homeDetails,
      roomDetails,
      officeDetails,
    } = req.body;


    // =================================================
    // BASIC VALIDATION
    // =================================================

    if (!propertyType) {
      return res.status(400).json({
        success: false,
        message: "Property type is required",
      });
    }

    const allowedPropertyTypes = [
      "land",
      "home",
      "room",
      "office",
    ];

    if (!allowedPropertyTypes.includes(propertyType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property type",
      });
    }


    if (!price || Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: "Valid property price is required",
      });
    }


    // =================================================
    // OWNER CHECK
    // =================================================

    if (req.user.role !== "owner") {
      return res.status(403).json({
        success: false,
        message:
          "Register your account as an owner to add properties",
      });
    }


    // =================================================
    // GEOMETRY
    // =================================================

    if (!geometry) {
      return res.status(400).json({
        success: false,
        message: "Property geometry is required",
      });
    }

    const parsedGeometry = parseJSON(geometry);

    if (!parsedGeometry) {
      return res.status(400).json({
        success: false,
        message: "Invalid geometry data",
      });
    }


    // =================================================
    // ADDRESS
    // =================================================

    let parsedAddress = parseJSON(address);

    // Support both:
    // 1. New frontend sending address as JSON
    // 2. Temporary old-style separate fields

    if (!parsedAddress) {
      parsedAddress = {
        province,
        district,
        municipality,
        wardNo,
        tole,
      };
    }

    const finalWardNo = toNumber(
      parsedAddress.wardNo
    );

    if (
      !parsedAddress.province ||
      !parsedAddress.district ||
      !parsedAddress.municipality ||
      !finalWardNo
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Province, district, municipality and ward number are required",
      });
    }


    // =================================================
    // PARSE NESTED OBJECTS
    // =================================================

    const parsedLandArea = parseJSON(
      landArea,
      null
    );

    const parsedRoadAccess = parseJSON(
      roadAccess,
      null
    );

    const parsedHomeDetails = parseJSON(
      homeDetails,
      null
    );

    const parsedRoomDetails = parseJSON(
      roomDetails,
      null
    );

    const parsedOfficeDetails = parseJSON(
      officeDetails,
      null
    );


    // =================================================
    // LAND AREA
    // =================================================

    let finalLandArea = undefined;

    if (parsedLandArea) {
      const value = toNumber(
        parsedLandArea.value
      );

      const unit = parsedLandArea.unit;

      if (value !== null && unit) {
        const squareFeet =
          calculateSquareFeet(
            value,
            unit
          );

        finalLandArea = {
          value,
          unit,
          squareFeet,
        };
      }
    }


    // =================================================
    // ROAD ACCESS
    // =================================================

    let finalRoadAccess = undefined;

    if (parsedRoadAccess) {
      finalRoadAccess = {
        available: toBoolean(
          parsedRoadAccess.available
        ),

        width: toNumber(
          parsedRoadAccess.width
        ),

        widthUnit:
          parsedRoadAccess.widthUnit || "ft",

        type:
          parsedRoadAccess.type || "other",
      };
    }


    // =================================================
    // HOME DETAILS
    // =================================================

    let finalHomeDetails = undefined;

    if (parsedHomeDetails) {
      let builtUpArea;

      if (parsedHomeDetails.builtUpArea) {
        const value = toNumber(
          parsedHomeDetails.builtUpArea.value
        );

        const unit =
          parsedHomeDetails.builtUpArea.unit ||
          "sqft";

        if (value !== null) {
          builtUpArea = {
            value,
            unit,
            squareFeet:
              calculateGeneralSquareFeet(
                value,
                unit
              ),
          };
        }
      }


      finalHomeDetails = {
        ...(builtUpArea && {
          builtUpArea,
        }),

        bedrooms: toNumber(
          parsedHomeDetails.bedrooms
        ),

        bathrooms: toNumber(
          parsedHomeDetails.bathrooms
        ),

        floors: toNumber(
          parsedHomeDetails.floors
        ),

        propertyAge: toNumber(
          parsedHomeDetails.propertyAge
        ),

        furnishing:
          parsedHomeDetails.furnishing ||
          undefined,

        parking: {
          available: toBoolean(
            parsedHomeDetails.parking?.available
          ),

          capacity: toNumber(
            parsedHomeDetails.parking?.capacity
          ),
        },

        kitchen: {
          available: toBoolean(
            parsedHomeDetails.kitchen?.available
          ),

          count: toNumber(
            parsedHomeDetails.kitchen?.count
          ),
        },

        balcony: {
          available: toBoolean(
            parsedHomeDetails.balcony?.available
          ),

          count: toNumber(
            parsedHomeDetails.balcony?.count
          ),
        },

        waterSupply:
          parsedHomeDetails.waterSupply ||
          undefined,
      };
    }


    // =================================================
    // ROOM DETAILS
    // =================================================

    let finalRoomDetails = undefined;

    if (parsedRoomDetails) {
      finalRoomDetails = {
        roomType:
          parsedRoomDetails.roomType ||
          undefined,

        floor: toNumber(
          parsedRoomDetails.floor
        ),

        bathroom: {
          available: toBoolean(
            parsedRoomDetails.bathroom?.available
          ),

          attached: toBoolean(
            parsedRoomDetails.bathroom?.attached
          ),
        },

        kitchen: {
          available: toBoolean(
            parsedRoomDetails.kitchen?.available
          ),
        },

        balcony: {
          available: toBoolean(
            parsedRoomDetails.balcony?.available
          ),
        },

        furnishing:
          parsedRoomDetails.furnishing ||
          undefined,

        wifi: {
          available: toBoolean(
            parsedRoomDetails.wifi?.available
          ),
        },

        parking: {
          available: toBoolean(
            parsedRoomDetails.parking?.available
          ),
        },

        waterSupply:
          parsedRoomDetails.waterSupply ||
          "other",
      };
    }


    // =================================================
    // OFFICE DETAILS
    // =================================================

    let finalOfficeDetails = undefined;

    if (parsedOfficeDetails) {
      let officeArea;

      if (parsedOfficeDetails.area) {
        const value = toNumber(
          parsedOfficeDetails.area.value
        );

        const unit =
          parsedOfficeDetails.area.unit ||
          "sqft";

        if (value !== null) {
          officeArea = {
            value,
            unit,
            squareFeet:
              calculateGeneralSquareFeet(
                value,
                unit
              ),
          };
        }
      }


      finalOfficeDetails = {
        ...(officeArea && {
          area: officeArea,
        }),

        floor: toNumber(
          parsedOfficeDetails.floor
        ),

        numberOfRooms: toNumber(
          parsedOfficeDetails.numberOfRooms
        ),

        meetingRoom: {
          available: toBoolean(
            parsedOfficeDetails.meetingRoom?.available
          ),

          count: toNumber(
            parsedOfficeDetails.meetingRoom?.count
          ),
        },

        parking: {
          available: toBoolean(
            parsedOfficeDetails.parking?.available
          ),
        },

        furnishing:
          parsedOfficeDetails.furnishing ||
          undefined,
      };
    }


    // =================================================
    // PROPERTY-SPECIFIC VALIDATION
    // =================================================

    if (
      propertyType === "land" &&
      !finalLandArea
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Land area is required for land property",
      });
    }


    if (
      propertyType === "home" &&
      !finalHomeDetails
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Home details are required for home property",
      });
    }


    if (
      propertyType === "room" &&
      !finalRoomDetails
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Room details are required for room property",
      });
    }


    if (
      propertyType === "office" &&
      !finalOfficeDetails
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Office details are required for office property",
      });
    }


    // =================================================
    // AUTOMATIC TITLE
    // =================================================

    const titleMap = {
      land: "Land for Sale",
      home: "Home for Sale",
      room: "Room for Rent",
      office: "Office for Rent",
    };

    const title =
      titleMap[propertyType];


    // =================================================
    // IMAGE UPLOAD
    // =================================================

    const imagePaths = [];

    if (
      req.files?.images &&
      req.files.images.length > 0
    ) {
      for (
        const file of req.files.images
      ) {
        const result =
          await uploadToCloudinary(
            file.buffer,
            "properties/images",
            "image"
          );

        imagePaths.push({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    }


    // =================================================
    // VIDEO UPLOAD
    // =================================================

    let video = null;

    if (
      req.files?.video &&
      req.files.video.length > 0
    ) {
      const result =
        await uploadToCloudinary(
          req.files.video[0].buffer,
          "properties/videos",
          "video"
        );

      video = {
        url: result.secure_url,
        publicId: result.public_id,
      };
    }

    // =================================================
// AI POPULARITY PREDICTION
// =================================================

const aiPopularityScore = await predictPopularity({
  propertyType,

  price: toNumber(price, 0),

  areaSqFt:
    finalLandArea?.squareFeet ??
    finalHomeDetails?.builtUpArea?.squareFeet ??
    finalOfficeDetails?.area?.squareFeet ??
    0,

  province: parsedAddress.province,

  district: parsedAddress.district,

  municipality: parsedAddress.municipality,

  wardNo: finalWardNo,

  landArea:
    finalLandArea?.value ?? 0,

  landUnit:
    finalLandArea?.unit ?? "",

  roadAvailable:
    finalRoadAccess?.available ?? false,

  roadWidth:
    finalRoadAccess?.width ?? 0,

  roadType:
    finalRoadAccess?.type ?? "other",

  bedrooms:
    finalHomeDetails?.bedrooms ?? 0,

  bathrooms:
    finalHomeDetails?.bathrooms ?? 0,

  floors:
    finalHomeDetails?.floors ??
    finalRoomDetails?.floor ??
    finalOfficeDetails?.floor ??
    0,

  propertyAge:
    finalHomeDetails?.propertyAge ?? 0,

  furnishing:
    finalHomeDetails?.furnishing ??
    finalRoomDetails?.furnishing ??
    finalOfficeDetails?.furnishing ??
    "",

  parkingAvailable:
    finalHomeDetails?.parking?.available ??
    finalRoomDetails?.parking?.available ??
    finalOfficeDetails?.parking?.available ??
    false,

  parkingCapacity:
    finalHomeDetails?.parking?.capacity ?? 0,

  roomType:
    finalRoomDetails?.roomType ?? "",

  wifi:
    finalRoomDetails?.wifi?.available ?? false,

  officeFloor:
    finalOfficeDetails?.floor ?? 0,

  meetingRoomAvailable:
    finalOfficeDetails?.meetingRoom?.available ?? false,

  // New properties have no engagement yet
  views: 0,

  likesCount: 0,

  favoritesCount: 0,

  commentsCount: 0,
});

console.log(
  "AI Popularity Score:",
  aiPopularityScore
);

    
    // =================================================
    // CREATE PROPERTY
    // =================================================

    const propertyData = {
      title,

      propertyType,

      price: toNumber(price, 0),

      currency:
        currency || "NPR",

      isNegotiable:
        toBoolean(isNegotiable),

      description:
        description || "",

      address: {
        province:
          parsedAddress.province,

        district:
          parsedAddress.district,

        municipality:
          parsedAddress.municipality,

        wardNo:
          finalWardNo,

        tole:
          parsedAddress.tole || "",
      },

      geometry:
        parsedGeometry,

      images:
        imagePaths,

      video,

      aiPopularityScore,

      owner:
        req.user._id,
    };


    // Add only relevant property-specific data

    if (finalLandArea) {
      propertyData.landArea =
        finalLandArea;
    }

    if (finalRoadAccess) {
      propertyData.roadAccess =
        finalRoadAccess;
    }

    if (propertyType === "home") {
      propertyData.homeDetails =
        finalHomeDetails;
    }

    if (propertyType === "room") {
      propertyData.roomDetails =
        finalRoomDetails;
    }

    if (propertyType === "office") {
      propertyData.officeDetails =
        finalOfficeDetails;
    }


    // =================================================
    // SAVE
    // =================================================

    const property =
      await Property.create(
        propertyData
      );


    // =================================================
    // RESPONSE
    // =================================================

    return res.status(201).json({
      success: true,
      message:
        "Property registered successfully",
      property,
    });

  } catch (err) {

    console.error(
      "ADD PROPERTY ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message:
        "Error saving property",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : undefined,
    });
  }
};




// ✅ GET ALL PROPERTIES
export const getProperties = async (req, res) => {
  try {
    let properties;

    if (req.user?.role === "owner") {
      properties = await Property.find({
        owner: req.user._id,
      }).populate(
        "owner",
        "_id fullName phone"
      ).populate("comments.user","_id fullName");
      
    } else {
      
const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

      properties = await Property.find({
        $or: [
          {
            status: { $ne: "sold" }, // available & negotiation
          },
          {
            status: "sold",
            soldAt: { $gt: yesterday }, // sold within last 24 hours
          },
        ],
      })
        .populate("owner", "_id fullName phone")
        .populate("comments.user", "_id fullName");
      

    }

    res.json(properties);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Error fetching properties",
    });
  }
};   

export const addView = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { visitorId } = req.body;

    let existingView;

    if (req.user) {
      existingView = await PropertyView.findOne({
        propertyId,
        userId: req.user._id,
      });
    } else {
      existingView = await PropertyView.findOne({
        propertyId,
        visitorId,
      });
    }

    if (existingView) {
      return res.json({
        success: true,
      });
    }

    await PropertyView.create({
      propertyId,
      userId: req.user?._id || null,
      visitorId,
    });

   const property = await Property.findById(propertyId);

property.views += 1;

const result = calculateTrending(property);

property.trendingScore = result.score;
property.isTrending = result.isTrending;

await property.save();

    res.json({
      success: true,
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "View error",
    });
  }
};

export const toggleLike = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const existingLike = await PropertyLike.findOne({
      propertyId,
      userId: req.user._id,
    });

    // ================= UNLIKE =================
    if (existingLike) {
      await existingLike.deleteOne();

      const property = await Property.findById(propertyId);

      if (!property) {
        return res.status(404).json({
          message: "Property not found",
        });
      }

      property.likesCount = Math.max(0, property.likesCount - 1);

      const result = calculateTrending(property);

      property.trendingScore = result.score;
      property.isTrending = result.isTrending;

      await property.save();

      return res.json({
        liked: false,
      });
    }

    // ================= LIKE =================
    await PropertyLike.create({
      propertyId,
      userId: req.user._id,
    });

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    property.likesCount += 1;

    const result = calculateTrending(property);

    property.trendingScore = result.score;
    property.isTrending = result.isTrending;

    await property.save();

    return res.json({
      liked: true,
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Like error",
    });
  }
};
 

export const toggleFavorite = async (
  req,
  res
) => {
  try {
    const { propertyId } = req.params;

    const existingFavorite =
      await PropertyFavorite.findOne({
        propertyId,
        userId: req.user._id,
      });

if (existingFavorite) {

    await existingFavorite.deleteOne();

    const property = await Property.findById(propertyId);

    property.favoritesCount -= 1;

    const result = calculateTrending(property);

    property.trendingScore = result.score;
    property.isTrending = result.isTrending;

    await property.save();

    return res.json({
        saved: false,
    });
}

    await PropertyFavorite.create({
      propertyId,
      userId: req.user._id,
    });

    const property = await Property.findById(propertyId);

property.favoritesCount += 1;

const result = calculateTrending(property);

property.trendingScore = result.score;
property.isTrending = result.isTrending;

await property.save();
    res.json({
      saved: true,
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Favorite error",
    });
  }
};

export const addComment = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { text } = req.body;

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    property.comments.push({
      user: req.user._id,
      text,
    });

    const result = calculateTrending(property);

property.trendingScore = result.score;

property.isTrending = result.isTrending;
    await property.save();

    await property.populate("comments.user", "fullName");
    res.status(200).json({
      success: true,
      comments: property.comments,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Comment error",
    });
  }
};

export const deleteProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const property = await Property.findById(propertyId);
console.log("Property owner:", property.owner.toString());
console.log("Logged in user:", req.user._id.toString());

    if (!property) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    // Only the owner can delete
    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to delete this property",
      });
    }

    await property.deleteOne();

    res.status(200).json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Delete error",
    });
  }
};

// =====================================================
// UPDATE PROPERTY
// =====================================================

export const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // =================================================
    // OWNER AUTHORIZATION
    // =================================================

    if (
      property.owner.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to update this property",
      });
    }

    // =================================================
    // BASIC DATA
    // =================================================

    const {
      propertyType,
      price,
      currency,
      isNegotiable,
      description,
      geometry,

      address,
      landArea,
      roadAccess,

      homeDetails,
      roomDetails,
      officeDetails,

      status,
      availableFrom,
    } = req.body;


    // =================================================
    // PROPERTY TYPE
    // =================================================

    const finalPropertyType =
      propertyType || property.propertyType;

    const allowedPropertyTypes = [
      "land",
      "home",
      "room",
      "office",
    ];

    if (
      !allowedPropertyTypes.includes(
        finalPropertyType
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid property type",
      });
    }


    // =================================================
    // ADDRESS
    // =================================================

    let parsedAddress =
      parseJSON(address, null);

    if (parsedAddress) {
      const wardNo = toNumber(
        parsedAddress.wardNo
      );

      parsedAddress = {
        province:
          parsedAddress.province ??
          property.address?.province ??
          "",

        district:
          parsedAddress.district ??
          property.address?.district ??
          "",

        municipality:
          parsedAddress.municipality ??
          property.address?.municipality ??
          "",

        wardNo:
          wardNo ??
          property.address?.wardNo,

        tole:
          parsedAddress.tole ??
          property.address?.tole ??
          "",
      };
    }


    // =================================================
    // LAND AREA
    // =================================================

    let finalLandArea =
      property.landArea;

    const parsedLandArea =
      parseJSON(landArea, null);

    if (parsedLandArea) {
      const value =
        toNumber(
          parsedLandArea.value
        );

      const unit =
        parsedLandArea.unit;

      if (value !== null && unit) {
        finalLandArea = {
          value,
          unit,
          squareFeet:
            calculateSquareFeet(
              value,
              unit
            ),
        };
      }
    }


    // =================================================
    // ROAD ACCESS
    // =================================================

    let finalRoadAccess =
      property.roadAccess;

    const parsedRoadAccess =
      parseJSON(roadAccess, null);

    if (parsedRoadAccess) {
      finalRoadAccess = {
        available:
          toBoolean(
            parsedRoadAccess.available
          ),

        width:
          toNumber(
            parsedRoadAccess.width
          ),

        widthUnit:
          parsedRoadAccess.widthUnit ||
          "ft",

        type:
          parsedRoadAccess.type ||
          "other",
      };
    }


    // =================================================
    // HOME DETAILS
    // =================================================

    let finalHomeDetails =
      property.homeDetails;

    const parsedHomeDetails =
      parseJSON(
        homeDetails,
        null
      );

    if (parsedHomeDetails) {
      let builtUpArea;

      if (
        parsedHomeDetails.builtUpArea
      ) {
        const value =
          toNumber(
            parsedHomeDetails
              .builtUpArea
              .value
          );

        const unit =
          parsedHomeDetails
            .builtUpArea
            .unit || "sqft";

        if (value !== null) {
          builtUpArea = {
            value,
            unit,
            squareFeet:
              calculateGeneralSquareFeet(
                value,
                unit
              ),
          };
        }
      }

      finalHomeDetails = {
        ...(builtUpArea && {
          builtUpArea,
        }),

        bedrooms:
          toNumber(
            parsedHomeDetails.bedrooms
          ),

        bathrooms:
          toNumber(
            parsedHomeDetails.bathrooms
          ),

        floors:
          toNumber(
            parsedHomeDetails.floors
          ),

        propertyAge:
          toNumber(
            parsedHomeDetails.propertyAge
          ),

        furnishing:
          parsedHomeDetails.furnishing,

        parking: {
          available:
            toBoolean(
              parsedHomeDetails
                .parking?.available
            ),

          capacity:
            toNumber(
              parsedHomeDetails
                .parking?.capacity
            ),
        },

        kitchen: {
          available:
            toBoolean(
              parsedHomeDetails
                .kitchen?.available
            ),

          count:
            toNumber(
              parsedHomeDetails
                .kitchen?.count
            ),
        },

        balcony: {
          available:
            toBoolean(
              parsedHomeDetails
                .balcony?.available
            ),

          count:
            toNumber(
              parsedHomeDetails
                .balcony?.count
            ),
        },

        waterSupply:
          parsedHomeDetails.waterSupply,
      };
    }


    // =================================================
    // ROOM DETAILS
    // =================================================

    let finalRoomDetails =
      property.roomDetails;

    const parsedRoomDetails =
      parseJSON(
        roomDetails,
        null
      );

    if (parsedRoomDetails) {
      finalRoomDetails = {
        roomType:
          parsedRoomDetails.roomType,

        floor:
          toNumber(
            parsedRoomDetails.floor
          ),

        bathroom: {
          available:
            toBoolean(
              parsedRoomDetails
                .bathroom?.available
            ),

          attached:
            toBoolean(
              parsedRoomDetails
                .bathroom?.attached
            ),
        },

        kitchen: {
          available:
            toBoolean(
              parsedRoomDetails
                .kitchen?.available
            ),
        },

        balcony: {
          available:
            toBoolean(
              parsedRoomDetails
                .balcony?.available
            ),
        },

        furnishing:
          parsedRoomDetails.furnishing,

        wifi: {
          available:
            toBoolean(
              parsedRoomDetails
                .wifi?.available
            ),
        },

        parking: {
          available:
            toBoolean(
              parsedRoomDetails
                .parking?.available
            ),
        },

        waterSupply:
          parsedRoomDetails.waterSupply ||
          "other",
      };
    }


    // =================================================
    // OFFICE DETAILS
    // =================================================

    let finalOfficeDetails =
      property.officeDetails;

    const parsedOfficeDetails =
      parseJSON(
        officeDetails,
        null
      );

    if (parsedOfficeDetails) {
      let officeArea;

      if (
        parsedOfficeDetails.area
      ) {
        const value =
          toNumber(
            parsedOfficeDetails
              .area.value
          );

        const unit =
          parsedOfficeDetails
            .area.unit || "sqft";

        if (value !== null) {
          officeArea = {
            value,
            unit,
            squareFeet:
              calculateGeneralSquareFeet(
                value,
                unit
              ),
          };
        }
      }

      finalOfficeDetails = {
        ...(officeArea && {
          area: officeArea,
        }),

        floor:
          toNumber(
            parsedOfficeDetails.floor
          ),

        numberOfRooms:
          toNumber(
            parsedOfficeDetails
              .numberOfRooms
          ),

        meetingRoom: {
          available:
            toBoolean(
              parsedOfficeDetails
                .meetingRoom?.available
            ),

          count:
            toNumber(
              parsedOfficeDetails
                .meetingRoom?.count
            ),
        },

        parking: {
          available:
            toBoolean(
              parsedOfficeDetails
                .parking?.available
            ),
        },

        furnishing:
          parsedOfficeDetails.furnishing,
      };
    }


    // =================================================
    // IMAGE UPLOAD
    // =================================================

    let images =
      property.images || [];

    if (
      req.files?.images &&
      req.files.images.length > 0
    ) {
      const newImages = [];

      for (
        const file of req.files.images
      ) {
        const result =
          await uploadToCloudinary(
            file.buffer,
            "properties/images",
            "image"
          );

        newImages.push({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }

      images = [
        ...images,
        ...newImages,
      ];
    }


    // =================================================
    // VIDEO UPLOAD
    // =================================================

    let video =
      property.video || null;

    if (
      req.files?.video &&
      req.files.video.length > 0
    ) {
      const result =
        await uploadToCloudinary(
          req.files.video[0].buffer,
          "properties/videos",
          "video"
        );

      video = {
        url: result.secure_url,
        publicId: result.public_id,
      };
    }


    // =================================================
    // AUTOMATIC TITLE
    // =================================================

   // =================================================
// AUTOMATIC TITLE
// =================================================

const titleMap = {
  land: "Land for Sale",
  home: "Home for Sale",
  room: "Room for Rent",
  office: "Office for Rent",
};

const title =
  titleMap[finalPropertyType];

// =================================================
// AI POPULARITY PREDICTION
// =================================================

let aiAreaSqFt = 0;

if (finalLandArea?.squareFeet) {
  aiAreaSqFt = finalLandArea.squareFeet;
} else if (finalHomeDetails?.builtUpArea?.squareFeet) {
  aiAreaSqFt = finalHomeDetails.builtUpArea.squareFeet;
} else if (finalOfficeDetails?.area?.squareFeet) {
  aiAreaSqFt = finalOfficeDetails.area.squareFeet;
}

const aiPopularityScore = await predictPopularity({
  propertyType: finalPropertyType,

  price:
    price !== undefined
      ? toNumber(price, 0)
      : property.price,

  areaSqFt: aiAreaSqFt,

  province:
    parsedAddress?.province ||
    property.address?.province ||
    "",

  district:
    parsedAddress?.district ||
    property.address?.district ||
    "",

  municipality:
    parsedAddress?.municipality ||
    property.address?.municipality ||
    "",

  wardNo:
    parsedAddress?.wardNo ??
    property.address?.wardNo ??
    0,

  // LAND
  landArea:
    finalLandArea?.value ?? 0,

  landUnit:
    finalLandArea?.unit ?? "",

  // ROAD
  roadAvailable:
    finalRoadAccess?.available ?? false,

  roadWidth:
    finalRoadAccess?.width ?? 0,

  roadType:
    finalRoadAccess?.type ?? "",

  // HOME
  bedrooms:
    finalHomeDetails?.bedrooms ?? 0,

  bathrooms:
    finalHomeDetails?.bathrooms ?? 0,

  floors:
    finalHomeDetails?.floors ?? 0,

  propertyAge:
    finalHomeDetails?.propertyAge ?? 0,

  furnishing:
    finalHomeDetails?.furnishing ??
    finalRoomDetails?.furnishing ??
    finalOfficeDetails?.furnishing ??
    "",

  parkingAvailable:
    finalHomeDetails?.parking?.available ??
    finalRoomDetails?.parking?.available ??
    finalOfficeDetails?.parking?.available ??
    false,

  parkingCapacity:
    finalHomeDetails?.parking?.capacity ?? 0,

  // ROOM
  roomType:
    finalRoomDetails?.roomType ?? "",

  wifi:
    finalRoomDetails?.wifi?.available ?? false,

  // OFFICE
  officeFloor:
    finalOfficeDetails?.floor ?? 0,

  meetingRoomAvailable:
    finalOfficeDetails?.meetingRoom?.available ?? false,

  // ENGAGEMENT
  views: property.views ?? 0,

  likesCount: property.likesCount ?? 0,

  favoritesCount:
    property.favoritesCount ?? 0,

  commentsCount:
    property.comments?.length ?? 0,
});

console.log(
  "Updated AI Popularity Score:",
  aiPopularityScore
);

// UPDATE OBJECT
// =================================================

    // =================================================
    // UPDATE OBJECT
    // =================================================

    const updateData = {
      title,

      propertyType:
        finalPropertyType,

      price:
        price !== undefined
          ? toNumber(price, 0)
          : property.price,

          aiPopularityScore,

      currency:
        currency ||
        property.currency ||
        "NPR",

      isNegotiable:
        isNegotiable !== undefined
          ? toBoolean(isNegotiable)
          : property.isNegotiable,

      description:
        description !== undefined
          ? description
          : property.description,

      address:
        parsedAddress ||
        property.address,

      geometry:
        parseJSON(
          geometry,
          property.geometry
        ),

      landArea:
        finalLandArea,

      roadAccess:
        finalRoadAccess,

      homeDetails:
        finalPropertyType === "home"
          ? finalHomeDetails
          : undefined,

      roomDetails:
        finalPropertyType === "room"
          ? finalRoomDetails
          : undefined,

      officeDetails:
        finalPropertyType === "office"
          ? finalOfficeDetails
          : undefined,

      images,

      video,

      status:
        status || property.status,

      availableFrom:
        availableFrom
          ? new Date(availableFrom)
          : property.availableFrom,
    };


    // =================================================
    // REMOVE OLD CATEGORY DATA
    // =================================================

    if (finalPropertyType !== "home") {
      updateData.homeDetails = undefined;
    }

    if (finalPropertyType !== "room") {
      updateData.roomDetails = undefined;
    }

    if (finalPropertyType !== "office") {
      updateData.officeDetails = undefined;
    }


    // =================================================
    // UPDATE DATABASE
    // =================================================

    const updatedProperty =
      await Property.findByIdAndUpdate(
        id,
        {
          $set: updateData,
          $unset: {
            // Remove legacy fields if they
            // existed on old documents
            label: "",
            area: "",
            bhk: "",
            furnished: "",
            parking: "",
            roomType: "",
            wifi: "",
            floorNumber: "",
            meetingRoom: "",
            availableDays: "",
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );


    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,
      message:
        "Property updated successfully",
      property: updatedProperty,
    });

  } catch (err) {

    console.error(
      "UPDATE PROPERTY ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message:
        "Error updating property",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : undefined,
    });
  }
};
//porperty status update ko code

 

export const updatePropertyStatus= async (req,res)=>{
  try {
    const {propertyId}= req.params;
    const {status}=req.body;

    const property = await Property.findById(propertyId);

    if(!property){
      return res.status(404).json({
        success:false,
        message:"Property not found"
      })
    }

    if(property.owner.toString()!==req.user._id.toString()){
      return res.status(403).json({
        success:false,
        message:"Unauthorize"
      })
    }

    property.status=status;

   if(status==="sold"){
    property.soldAt= new Date();
   }else{
    property.soldAt= null;
   }

    await property.save()

    res.json({
      success:true,
      property
    })

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error updating property status"
    });
  }
}


export const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    res.status(200).json(property);
  } catch (error) {
    console.error("Get property by ID error:", error);

    res.status(500).json({
      message: "Failed to fetch property",
      error: error.message,
    });
  }
};