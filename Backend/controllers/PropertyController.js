import Property from "../models/Property.js";

// ✅ SAVE PROPERTY
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
    } = req.body;

    if (!geometry) {
      return res.status(400).json({ message: "Geometry required" });
    }

    // 🔒 Only owner can add
    if (req.user.role !== "owner") {
      return res.status(403).json({ message: "Only owners can add property" });
    }

    const property = await Property.create({
      geometry,
      label,
      price,
      area,
      address,
      availableDays,
      description,
      owner: req.user._id,
    });

    res.status(201).json(property);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error saving property" });
  }
};


// ✅ GET ALL PROPERTIES
export const getProperties = async (req, res) => {
  try {
    let properties;

    if (req.user?.role === "owner") {
      properties = await Property.find({ owner: req.user._id }).populate(
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
    res.status(500).json({ message: "Error fetching properties" });
  }
};