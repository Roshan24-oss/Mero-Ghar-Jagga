import pandas as pd
import joblib


# ============================================================
# LOAD MODEL
# ============================================================

model = joblib.load("model.pkl")

print("\n==========================================")
print("AI PROPERTY POPULARITY TEST")
print("==========================================")


# ============================================================
# TEST PROPERTIES
# ============================================================

properties = [

    {
        "name": "Premium Kathmandu Home",
        "propertyType": "home",
        "price": 15000000,
        "area": 1800,
        "province": "Bagmati",
        "district": "Kathmandu",
        "municipality": "Kathmandu Metropolitan City",
        "wardNo": 10,
        "bhk": 3,
        "furnished": "fully-furnished",
        "parking": True,
        "roadAccess": 20,
        "roomType": "",
        "wifi": False,
        "floorNumber": 2,
        "meetingRoom": False,
        "propertyAgeYears": 5
    },

    {
        "name": "Old Small Home",
        "propertyType": "home",
        "price": 8000000,
        "area": 900,
        "province": "Sudurpashchim",
        "district": "Kailali",
        "municipality": "Dhangadhi Sub-Metropolitan City",
        "wardNo": 15,
        "bhk": 2,
        "furnished": "unfurnished",
        "parking": False,
        "roadAccess": 10,
        "roomType": "",
        "wifi": False,
        "floorNumber": 1,
        "meetingRoom": False,
        "propertyAgeYears": 30
    },

    {
        "name": "Large Kathmandu Land",
        "propertyType": "land",
        "price": 30000000,
        "area": 3500,
        "province": "Bagmati",
        "district": "Kathmandu",
        "municipality": "Kathmandu Metropolitan City",
        "wardNo": 5,
        "bhk": 0,
        "furnished": "",
        "parking": False,
        "roadAccess": 25,
        "roomType": "",
        "wifi": False,
        "floorNumber": 0,
        "meetingRoom": False,
        "propertyAgeYears": 0
    },

    {
        "name": "Office Space",
        "propertyType": "office",
        "price": 60000,
        "area": 2000,
        "province": "Bagmati",
        "district": "Lalitpur",
        "municipality": "Lalitpur Metropolitan City",
        "wardNo": 3,
        "bhk": 0,
        "furnished": "fully-furnished",
        "parking": True,
        "roadAccess": 25,
        "roomType": "",
        "wifi": True,
        "floorNumber": 4,
        "meetingRoom": True,
        "propertyAgeYears": 3
    },

    {
        "name": "Basic Room",
        "propertyType": "room",
        "price": 12000,
        "area": 500,
        "province": "Koshi",
        "district": "Morang",
        "municipality": "Biratnagar Metropolitan City",
        "wardNo": 8,
        "bhk": 1,
        "furnished": "unfurnished",
        "parking": False,
        "roadAccess": 10,
        "roomType": "shared",
        "wifi": False,
        "floorNumber": 2,
        "meetingRoom": False,
        "propertyAgeYears": 10
    }

]


# ============================================================
# PREDICT ALL
# ============================================================

for property_data in properties:

    name = property_data.pop("name")

    property_df = pd.DataFrame([property_data])

    prediction = model.predict(property_df)

    score = float(prediction[0])

    score = max(
        0,
        min(100, score)
    )

    print("\n------------------------------------------")

    print(f"Property : {name}")

    print(
        f"AI Popularity Score : {score:.2f} / 100"
    )


print("\n==========================================")
print("TESTING COMPLETED")
print("==========================================")