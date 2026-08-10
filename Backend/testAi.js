import { predictPopularity } from "./services/aiServices.js";

const propertyData = {
  propertyType: "home",
  price: 25000000,
  area: 5,
  province: "Bagmati",
  district: "Kathmandu",
  municipality: "Kathmandu Metropolitan City",
  wardNo: 10,
  bhk: "3",
  furnished: "Yes",
  parking: "Yes",
  roadAccess: 20,
  roomType: null,
  wifi: null,
  floorNumber: null,
  meetingRoom: null,
};

const testAI = async () => {
  console.log("Sending property to AI...");

  const score = await predictPopularity(propertyData);

  console.log("AI Popularity Score:", score);
};

testAI();