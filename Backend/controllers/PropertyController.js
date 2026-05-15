import Property from "../models/Property.js";

export const addProperty = async (req, res) => {
  try {
    const {
      geometry,
      label,
      price,
      area,
      address,
      availableDays,
      description,

      // PROPERTY TYPE
      propertyType,

      // HOME
      bhk,
      furnished,
      parking,

      // LAND
      roadAccess,

      // ROOM
      roomType,
      wifi,

      // OFFICE
      floorNumber,
      meetingRoom,
    } = req.body;

    // ✅ GEOMETRY REQUIRED
    if (!geometry) {
      return res.status(400).json({
        message: "Geometry required",
      });
    }

    // 🔒 ONLY OWNER CAN ADD
    if (req.user.role !== "owner") {
      return res.status(403).json({
        message:
          "Register your account as an owner to add properties",
      });
    }

    // ✅ IMAGE PATHS
    const imagePaths = req.files?.map(
      (file) => `/uploads/${file.filename}`
    ) || [];

    // ✅ CREATE PROPERTY
    const property = await Property.create({
      geometry: JSON.parse(geometry),

      label,
      price,
      area,
      address,
      availableDays,
      description,

      propertyType,

      // HOME
      bhk,
      furnished,
      parking,

      // LAND
      roadAccess,

      // ROOM
      roomType,
      wifi,

      // OFFICE
      floorNumber,
      meetingRoom,

      // IMAGES
      images: imagePaths,

      owner: req.user._id,
    });

    res.status(201).json(property);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Error saving property",
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
        "fullName phone"
      );
    } else {
      properties = await Property.find().populate(
        "owner",
        "fullName phone"
      );
    }

    res.json(properties);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Error fetching properties",
    });
  }
};   