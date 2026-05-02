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
    const properties = await Property.find();
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: "Error fetching properties" });
  }
};