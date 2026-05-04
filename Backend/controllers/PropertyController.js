import Property from "../models/Property.js";

// SAVE PROPERTY
export const addProperty = async (req, res) => {
  try {
    const { geometry } = req.body;

    if (!geometry) {
      return res.status(400).json({ message: "Geometry required" });
    }

    const property = await Property.create({
      geometry,
      owner: req.user._id,
    });

    res.status(201).json(property);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error saving property" });
  }
};

// GET ALL PROPERTIES
export const getProperties = async (req, res) => {
  try {
    let properties;

    // 👤 OWNER → only his properties
    if (req.user?.role === "owner") {
      properties = await Property.find({ owner: req.user._id }).populate(
        "owner",
        "fullName phone"
      );
    } 
    // 👥 USER / NOT LOGGED → all properties
    else {
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