import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    title: String,
    type: {
      type: String,
      enum: ["land", "house"],
      default: "land",
    },

    geometry: {
      type: {
        type: String, // Polygon, Point, LineString
        required: true,
      },
      coordinates: {
        type: Array,
        required: true,
      },
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// 🔥 IMPORTANT for Geo queries
propertySchema.index({ geometry: "2dsphere" });

export default mongoose.model("Property", propertySchema);