import Property from "../models/Property.js";
import PropertyLike from "../models/PropertyLike.js";
import PropertyFavorite from "../models/PropertyFavoorite.js";
import PropertyView from "../models/PropertyView.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
import calculateTrending from "../utils/trendingCalculator.js";
import {predictPopularity} from "../services/aiServices.js";


//helper function for uploading image and video to cloudinary

const uploadToCloudinary = (fileBuffer, folder, resourceType = "image") => {
  return new Promise((resolve, reject) => {

    console.log("Uploading to Cloudinary...");
    console.log(cloudinary.config());

    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {

        console.log("Cloudinary Error:", error);
        console.log("Cloudinary Result:", result);

        if (error) return reject(error);

        resolve(result);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

const nepaliToEnglishNumber = (value) => {
  const map = {
    "०": "0",
    "१": "1",
    "२": "2",
    "३": "3",
    "४": "4",
    "५": "5",
    "६": "6",
    "७": "7",
    "८": "8",
    "९": "9",
  };

  return Number(
    String(value)
      .split("")
      .map((char) => map[char] || char)
      .join("")
  );
};


export const addProperty = async (req, res) => {
  try {
    const {
      geometry,
      label,
      price,
      area,
       province,
  district,
  municipality,
  wardNo,
  tole,
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
  const imagePaths=[];

  if(req.files?.images?.length>0){
    for(const file of req.files.images){
      const result = await uploadToCloudinary(
        file.buffer,
        "properties/images",
        "image"
      );

      imagePaths.push({
        url:result.secure_url,
        publicId:result.public_id,
      })
    }
  }

  let video = null;
  if(req.files?.video?.length>0){
    const result = await uploadToCloudinary(
      req.files.video[0].buffer,
      "properties/videos",
      "video"
    );
    video={
      url:result.secure_url,
      publicId:result.public_id,
    }
  }

  // ================= AI POPULARITY PREDICTION =================

const aiPopularityScore = await predictPopularity({
  propertyType,
  price: Number(price),
  area: Number(area),

  province,
  district,
  municipality,

  wardNo: nepaliToEnglishNumber(wardNo),

  bhk: bhk || null,
  furnished: furnished || null,
  parking: parking || null,

  roadAccess: roadAccess ? Number(roadAccess) : null,

  roomType: roomType || null,
  wifi: wifi || null,

  floorNumber: floorNumber ? Number(floorNumber) : null,
  meetingRoom: meetingRoom || null,
});

console.log("AI Popularity Score:", aiPopularityScore);

    // ✅ CREATE PROPERTY
    const property = await Property.create({
      geometry: JSON.parse(geometry),

      label,
      price,
      area,
      address:{
        province,
        district,
        municipality,
        wardNo: nepaliToEnglishNumber(wardNo),
        tole
      },
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
      video:video,

      aiPopularityScore,

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
        "_id fullName phone"
      ).populate("comments.user","_id fullName");
      
    } else {
      
const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

      properties = await Property.find({
        $or: [
          {
            status: { $ne: "sold" }, // available & negotiation
          },
          {
            status: "sold",
            soldAt: { $gt: yesterday }, // sold within last 24 hours
          },
        ],
      })
        .populate("owner", "_id fullName phone")
        .populate("comments.user", "_id fullName");
      

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

   const property = await Property.findById(propertyId);

property.views += 1;

const result = calculateTrending(property);

property.trendingScore = result.score;
property.isTrending = result.isTrending;

await property.save();

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

export const toggleLike = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const existingLike = await PropertyLike.findOne({
      propertyId,
      userId: req.user._id,
    });

    // ================= UNLIKE =================
    if (existingLike) {
      await existingLike.deleteOne();

      const property = await Property.findById(propertyId);

      if (!property) {
        return res.status(404).json({
          message: "Property not found",
        });
      }

      property.likesCount = Math.max(0, property.likesCount - 1);

      const result = calculateTrending(property);

      property.trendingScore = result.score;
      property.isTrending = result.isTrending;

      await property.save();

      return res.json({
        liked: false,
      });
    }

    // ================= LIKE =================
    await PropertyLike.create({
      propertyId,
      userId: req.user._id,
    });

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    property.likesCount += 1;

    const result = calculateTrending(property);

    property.trendingScore = result.score;
    property.isTrending = result.isTrending;

    await property.save();

    return res.json({
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

    const property = await Property.findById(propertyId);

    property.favoritesCount -= 1;

    const result = calculateTrending(property);

    property.trendingScore = result.score;
    property.isTrending = result.isTrending;

    await property.save();

    return res.json({
        saved: false,
    });
}

    await PropertyFavorite.create({
      propertyId,
      userId: req.user._id,
    });

    const property = await Property.findById(propertyId);

property.favoritesCount += 1;

const result = calculateTrending(property);

property.trendingScore = result.score;
property.isTrending = result.isTrending;

await property.save();
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

export const addComment = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { text } = req.body;

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    property.comments.push({
      user: req.user._id,
      text,
    });

    const result = calculateTrending(property);

property.trendingScore = result.score;

property.isTrending = result.isTrending;
    await property.save();

    await property.populate("comments.user", "fullName");
    res.status(200).json({
      success: true,
      comments: property.comments,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Comment error",
    });
  }
};

export const deleteProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const property = await Property.findById(propertyId);
console.log("Property owner:", property.owner.toString());
console.log("Logged in user:", req.user._id.toString());

    if (!property) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    // Only the owner can delete
    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to delete this property",
      });
    }

    await property.deleteOne();

    res.status(200).json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Delete error",
    });
  }
};

export const updateProperty = async (req, res) => {
  try {

    const { propertyId } = req.params;

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    // Only owner can edit
    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to edit this property",
      });
    }

    const {
      label,
      propertyType,
      price,
      area,
     province,
district,
municipality,
wardNo,
tole,
houseNo, 
      availableDays,
      description,
      bhk,
      furnished,
      parking,
      roadAccess,
      roomType,
      wifi,
      floorNumber,
      meetingRoom,
    } = req.body;

    property.label = label;
    property.propertyType = propertyType;
    property.price = price;
    property.area = area;
    property.address = {
      province,
      district,
      municipality,
      wardNo,
      tole
    };
    property.availableDays = availableDays;
    property.description = description;

    property.bhk = bhk;
    property.furnished = furnished;
    property.parking = parking;

    property.roadAccess = roadAccess;

    property.roomType = roomType;
    property.wifi = wifi;

    property.floorNumber = floorNumber;
    property.meetingRoom = meetingRoom;

    await property.save();

    res.status(200).json({
      success: true,
      message: "Property updated successfully",
      property,
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Update error",
    });

  }
};

//porperty status update ko code

 

export const updatePropertyStatus= async (req,res)=>{
  try {
    const {propertyId}= req.params;
    const {status}=req.body;

    const property = await Property.findById(propertyId);

    if(!property){
      return res.status(404).json({
        success:false,
        message:"Property not found"
      })
    }

    if(property.owner.toString()!==req.user._id.toString()){
      return res.status(403).json({
        success:false,
        message:"Unauthorize"
      })
    }

    property.status=status;

   if(status==="sold"){
    property.soldAt= new Date();
   }else{
    property.soldAt= null;
   }

    await property.save()

    res.json({
      success:true,
      property
    })

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error updating property status"
    });
  }
}


