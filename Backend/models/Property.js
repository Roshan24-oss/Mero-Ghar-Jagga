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

    // 🔥 PROPERTY CATEGORY
    propertyType: {
      type: String,
      enum: ["land", "home", "room", "office"],
      required: true,
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

    // ================= HOME =================

    bhk: {
      type: String,
      default: "",
    },

    furnished: {
      type: String,
      default: "",
    },

    parking: {
      type: String,
      default: "",
    },

    // ================= LAND =================

    roadAccess: {
      type: String,
      default: "",
    },

    // ================= ROOM RENT =================

    roomType: {
      type: String,
      default: "",
    },

    wifi: {
      type: String,
      default: "",
    },

    // ================= OFFICE RENT =================

    floorNumber: {
      type: String,
      default: "",
    },

    meetingRoom: {
      type: String,
      default: "",
    },

    // ================= GEOJSON =================

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
images: [String],
    // ================= OWNER =================

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    views:{
      type:Number,
      default:0,
    },
    likesCount:{
      type:Number,
      default:0,
    },
    favoritesCount:{
      type:Number,
      default:0,
    },

    comments:[{
      user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      text:String,
      createdAt:{
        type:Date,
        default:Date.now,
      }
    }]
  },
  { timestamps: true }
);

// GEO INDEX
propertySchema.index({ geometry: "2dsphere" });

export default mongoose.model("Property", propertySchema);