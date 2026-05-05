import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
    },

    label: {
      type: String,
      default: "",
    },

    type: {
      type: String,
      enum: ["land", "house"],
      default: "land",
    },

    price: {
      type: Number,
      default: 0,
    },

    area: {
      type: String,
      default: "",
    },

    // 🔥 NEW FIELDS
    address: {
      type: String,
      default: "",
    },

    availableDays: {
      type: Number,
      default: 0,
    },

    description: {
      type: String,
      default: "",
    },

    geometry: {
      type: {
        type: String,
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

propertySchema.index({ geometry: "2dsphere" });

export default mongoose.model("Property", propertySchema);