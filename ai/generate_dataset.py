import random
import pandas as pd

locations = [
    {
        "province": "Bagmati",
        "district": "Kathmandu",
        "municipality": "Kathmandu Metropolitan City",
    },
    {
        "province": "Bagmati",
        "district": "Lalitpur",
        "municipality": "Lalitpur Metropolitan City",
    },
    {
        "province": "Bagmati",
        "district": "Bhaktapur",
        "municipality": "Bhaktapur Municipality",
    },
    {
        "province": "Gandaki",
        "district": "Kaski",
        "municipality": "Pokhara Metropolitan City",
    },
    {
        "province": "Bagmati",
        "district": "Chitwan",
        "municipality": "Bharatpur Metropolitan City",
    },
    {
        "province": "Koshi",
        "district": "Morang",
        "municipality": "Biratnagar Metropolitan City",
    },
    {
        "province": "Koshi",
        "district": "Jhapa",
        "municipality": "Birtamode Municipality",
    },
    {
        "province": "Lumbini",
        "district": "Rupandehi",
        "municipality": "Butwal Sub-Metropolitan City",
    },
    {
        "province": "Sudurpashchim",
        "district": "Kailali",
        "municipality": "Dhangadhi Sub-Metropolitan City",
    },
]

property_types = [
    "land",
    "home",
    "room",
    "office",
]


def generate_property():
    location = random.choice(locations)
    property_type = random.choice(property_types)

    # Common property features
    if property_type == "land":
        price = random.randint(3000000, 50000000)

    elif property_type == "home":
        price = random.randint(5000000, 50000000)

    elif property_type == "room":
        price = random.randint(8000, 50000)

    else:  # office
        price = random.randint(20000, 150000)

    area = round(random.uniform(1, 10), 2)
    parking = random.choice(["Yes", "No"])
    road_access = random.choice([10, 13, 16, 20, 25, 30])
    furnished = random.choice(["Fully", "Semi", "No"])

    # Home-specific features
    bhk = ""
    if property_type == "home":
        bhk = random.choice(["1", "2", "3", "4", "5"])

    # Room-specific features
    room_type = ""
    wifi = ""
    if property_type == "room":
        room_type = random.choice(["Single", "Double", "Shared"])
        wifi = random.choice(["Yes", "No"])

    # Office-specific features
    floor_number = ""
    meeting_room = ""
    if property_type == "office":
        floor_number = random.randint(1, 8)
        meeting_room = random.choice(["Yes", "No"])

    # Land-specific feature
    if property_type == "land":
        furnished = ""
        parking = ""

    popularity = 50

    # Location effect
    location_scores = {
        "Kathmandu": 15,
        "Lalitpur": 13,
        "Bhaktapur": 11,
        "Kaski": 10,
        "Chitwan": 9,
        "Morang": 8,
        "Jhapa": 7,
        "Rupandehi": 8,
        "Kailali": 7,
    }

    popularity += location_scores.get(location["district"], 5)

    # Road access effect
    if road_access >= 20:
        popularity += 10
    elif road_access >= 16:
        popularity += 7
    elif road_access >= 13:
        popularity += 4
    else:
        popularity -= 2

    # Price competitiveness effect
    if property_type == "land":
        expected_price = area * 5000000

    elif property_type == "home":
        expected_price = area * 8000000

    elif property_type == "room":
        expected_price = 30000

    else:  # office
        expected_price = area * 25000

    price_ratio = price / expected_price

    if price_ratio <= 0.80:
        popularity += 10
    elif price_ratio <= 1.00:
        popularity += 6
    elif price_ratio <= 1.20:
        popularity += 0
    elif price_ratio <= 1.40:
        popularity -= 6
    else:
        popularity -= 10

    # Area effect
    if 3 <= area <= 7:
        popularity += 5

    # Property-specific factors
    if property_type == "home":

        if bhk in ["2", "3", "4"]:
            popularity += 8

        if parking == "Yes":
            popularity += 6

        if furnished == "Fully":
            popularity += 4
        elif furnished == "Semi":
            popularity += 2

    elif property_type == "land":

        if area >= 4:
            popularity += 5

    elif property_type == "room":

        if wifi == "Yes":
            popularity += 7

        if room_type == "Single":
            popularity += 3

    elif property_type == "office":

        if meeting_room == "Yes":
            popularity += 6

        if parking == "Yes":
            popularity += 5

        if floor_number in [2, 3, 4, 5]:
            popularity += 3

    # Add realistic random variation
    popularity += random.gauss(0, 8)

    # Keep score between 0 and 100
    popularity = max(0, min(100, popularity))

    popularity = round(popularity, 2)

    return {
        "propertyType": property_type,
        "price": price,
        "area": area,

        "province": location["province"],
        "district": location["district"],
        "municipality": location["municipality"],
        "wardNo": random.randint(1, 32),

        "bhk": bhk,
        "furnished": furnished,
        "parking": parking,
        "roadAccess": road_access,

        "roomType": room_type,
        "wifi": wifi,

        "floorNumber": floor_number,
        "meetingRoom": meeting_room,

        "popularityScore": popularity,
    }


# Create an empty list BEFORE adding properties

properties = []

for _ in range(3000):
    properties.append(generate_property())

df = pd.DataFrame(properties)

df.to_csv("dataset.csv", index=False)

print(f"Dataset generated successfully: {len(df)} properties")
print(df.head())

