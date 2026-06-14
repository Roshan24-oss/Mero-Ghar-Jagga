import mongoose from "mongoose";

const propertyViewSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    visitorId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

propertyViewSchema.index(
  {
    propertyId: 1,
    visitorId: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.model("PropertyView", propertyViewSchema);