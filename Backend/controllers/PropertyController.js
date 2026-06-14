import Property from "../models/Property.js";
import PropertyLike from "../models/PropertyLike.js";
import PropertyFavorite from "../models/PropertyFavoorite.js";
import PropertyView from "../models/PropertyView.js";

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

    await Property.findByIdAndUpdate(
      propertyId,
      {
        $inc: {
          views: 1,
        },
      }
    );

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


export const toggleLike = async (
  req,
  res
) => {
  try {
    const { propertyId } = req.params;

    const existingLike =
      await PropertyLike.findOne({
        propertyId,
        userId: req.user._id,
      });

    if (existingLike) {

      await existingLike.deleteOne();

      await Property.findByIdAndUpdate(
        propertyId,
        {
          $inc: {
            likesCount: -1,
          },
        }
      );

      return res.json({
        liked: false,
      });
    }

    await PropertyLike.create({
      propertyId,
      userId: req.user._id,
    });

    await Property.findByIdAndUpdate(
      propertyId,
      {
        $inc: {
          likesCount: 1,
        },
      }
    );

    res.json({
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

      await Property.findByIdAndUpdate(
        propertyId,
        {
          $inc: {
            favoritesCount: -1,
          },
        }
      );

      return res.json({
        saved: false,
      });
    }

    await PropertyFavorite.create({
      propertyId,
      userId: req.user._id,
    });

    await Property.findByIdAndUpdate(
      propertyId,
      {
        $inc: {
          favoritesCount: 1,
        },
      }
    );

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