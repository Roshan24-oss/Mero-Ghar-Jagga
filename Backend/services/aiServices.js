import axios from "axios";

const AI_SERVICE_URL = "http://127.0.0.1:5000/predict";

export const predictPopularity = async (propertyData) => {
  try {
    // =====================================================
    // AREA
    // =====================================================

    const area =
      propertyData.areaSqFt ??
      propertyData.landArea?.squareFeet ??
      propertyData.homeDetails?.builtUpArea?.squareFeet ??
      propertyData.officeDetails?.area?.squareFeet ??
      0;


    // =====================================================
    // ADDRESS
    // =====================================================

    const province =
      propertyData.province ??
      propertyData.address?.province ??
      "";

    const district =
      propertyData.district ??
      propertyData.address?.district ??
      "";

    const municipality =
      propertyData.municipality ??
      propertyData.address?.municipality ??
      "";

    const wardNo =
      propertyData.wardNo ??
      propertyData.address?.wardNo ??
      0;


    // =====================================================
    // BHK / BEDROOMS
    // =====================================================

    const bhk =
      propertyData.bhk ??
      propertyData.bedrooms ??
      propertyData.homeDetails?.bedrooms ??
      0;


    // =====================================================
    // FURNISHED
    // =====================================================

    const furnished =
      propertyData.furnished ??
      propertyData.furnishing ??
      propertyData.homeDetails?.furnishing ??
      propertyData.roomDetails?.furnishing ??
      propertyData.officeDetails?.furnishing ??
      "";


    // =====================================================
    // PARKING
    // =====================================================

    const parking =
      propertyData.parking ??
      propertyData.parkingAvailable ??
      propertyData.homeDetails?.parking?.available ??
      propertyData.roomDetails?.parking?.available ??
      propertyData.officeDetails?.parking?.available ??
      false;


    // =====================================================
    // ROAD ACCESS
    // =====================================================

    const roadAccess =
      propertyData.roadAccessWidth ??
      propertyData.roadWidth ??
      propertyData.roadAccess?.width ??
      0;


    // =====================================================
    // ROOM TYPE
    // =====================================================

    const roomType =
      propertyData.roomType ??
      propertyData.roomDetails?.roomType ??
      "";


    // =====================================================
    // WIFI
    // =====================================================

    const wifi =
      propertyData.wifi ??
      propertyData.roomDetails?.wifi?.available ??
      false;


    // =====================================================
    // FLOOR NUMBER
    // =====================================================

    const floorNumber =
      propertyData.floorNumber ??
      propertyData.floors ??
      propertyData.homeDetails?.floors ??
      propertyData.roomDetails?.floor ??
      propertyData.officeDetails?.floor ??
      0;


    // =====================================================
    // MEETING ROOM
    // =====================================================

    const meetingRoom =
      propertyData.meetingRoom ??
      propertyData.meetingRoomAvailable ??
      propertyData.officeDetails?.meetingRoom?.available ??
      false;


    // =====================================================
    // PROPERTY AGE
    // =====================================================

    const propertyAgeYears =
      propertyData.propertyAgeYears ??
      propertyData.propertyAge ??
      propertyData.homeDetails?.propertyAge ??
      0;


    // =====================================================
    // FINAL ML INPUT
    // =====================================================

    const modelInput = {

      propertyType:
        propertyData.propertyType,

      price:
        Number(propertyData.price) || 0,

      area:
        Number(area) || 0,

      province,

      district,

      municipality,

      wardNo:
        Number(wardNo) || 0,

      bhk:
        Number(bhk) || 0,

      furnished,

      parking:
        Boolean(parking),

      roadAccess:
        Number(roadAccess) || 0,

      roomType,

      wifi:
        Boolean(wifi),

      floorNumber:
        Number(floorNumber) || 0,

      meetingRoom:
        Boolean(meetingRoom),

      propertyAgeYears:
        Number(propertyAgeYears) || 0,
    };


    // =====================================================
    // DEBUG
    // =====================================================

    console.log(
      "\n=========================================="
    );

    console.log(
      "AI MODEL INPUT"
    );

    console.log(
      "=========================================="
    );

    console.log(
      JSON.stringify(
        modelInput,
        null,
        2
      )
    );


    // =====================================================
    // SEND TO PYTHON AI SERVER
    // =====================================================

    const response = await axios.post(
      AI_SERVICE_URL,
      modelInput,
      {
        headers: {
          "Content-Type": "application/json",
        },

        timeout: 10000,
      }
    );


    // =====================================================
    // GET PREDICTION
    // =====================================================

    const popularityScore =
      response.data?.popularityScore;


    console.log(
      "AI Popularity Score:",
      popularityScore
    );


    // =====================================================
    // RETURN SCORE
    // =====================================================

    return popularityScore;


  } catch (error) {

    console.error(
      "\n=========================================="
    );

    console.error(
      "AI POPULARITY PREDICTION ERROR"
    );

    console.error(
      "=========================================="
    );

    console.error(
      error.response?.data ||
      error.message
    );


    return null;
  }
};