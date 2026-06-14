import mongoose from "mongoose";

const propertyFavoriteSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

propertyFavoriteSchema.index(
  {
    propertyId: 1,
    userId: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.model(
  "PropertyFavorite",
  propertyFavoriteSchema
);