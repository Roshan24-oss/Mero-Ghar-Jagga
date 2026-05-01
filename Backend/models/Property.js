// models/Property.js
import mongoose from "mongoose";

const propertySchema = new mongoose.Schema({
  title: String,
  description: String,
  location: Object, // GeoJSON
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

export default mongoose.model("Property", propertySchema);