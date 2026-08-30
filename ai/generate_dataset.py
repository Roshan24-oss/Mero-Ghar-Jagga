import random
import pandas as pd



random.seed(42)




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

    province = location["province"]
    district = location["district"]
    municipality = location["municipality"]

    ward_no = random.randint(1, 32)




    price = 0
    area_sqft = 0

    bedrooms = 0
    furnishing = ""

    parking = False
    road_access = 0

    room_type = ""

    wifi = False

    floor_number = 0

    meeting_room = False

    property_age_years = 0




    if property_type == "land":

        area_sqft = round(
            random.uniform(700, 5000),
            2
        )

        price = random.randint(
            3000000,
            50000000
        )

        road_access = random.choice(
            [
                0,
                10,
                13,
                16,
                20,
                25,
                30
            ]
        )

        # Land itself does not have building age.
        property_age_years = 0


    elif property_type == "home":

        area_sqft = round(
            random.uniform(800, 5000),
            2
        )

        price = random.randint(
            5000000,
            50000000
        )

        bedrooms = random.randint(
            1,
            5
        )

        furnishing = random.choice(
            [
                "fully-furnished",
                "semi-furnished",
                "unfurnished"
            ]
        )

        parking = random.choice(
            [
                True,
                False
            ]
        )

        road_access = random.choice(
            [
                0,
                10,
                13,
                16,
                20,
                25,
                30
            ]
        )

        floor_number = random.randint(
            1,
            4
        )

        property_age_years = random.randint(
            0,
            40
        )


   

    elif property_type == "room":

        area_sqft = round(
            random.uniform(100, 1000),
            2
        )

        price = random.randint(
            8000,
            50000
        )

        bedrooms = random.choice(
            [
                0,
                1,
                1,
                2
            ]
        )

        furnishing = random.choice(
            [
                "fully-furnished",
                "semi-furnished",
                "unfurnished"
            ]
        )

        parking = random.choice(
            [
                True,
                False
            ]
        )

        road_access = random.choice(
            [
                0,
                10,
                13,
                16,
                20
            ]
        )

        room_type = random.choice(
            [
                "single",
                "double",
                "shared",
                "studio",
                "1bhk",
                "2bhk"
            ]
        )

        wifi = random.choice(
            [
                True,
                False
            ]
        )

        floor_number = random.randint(
            1,
            5
        )

        property_age_years = random.randint(
            0,
            30
        )


  

    else:

        area_sqft = round(
            random.uniform(300, 5000),
            2
        )

        price = random.randint(
            20000,
            150000
        )

        furnishing = random.choice(
            [
                "fully-furnished",
                "semi-furnished",
                "unfurnished"
            ]
        )

        parking = random.choice(
            [
                True,
                False
            ]
        )

        road_access = random.choice(
            [
                0,
                10,
                13,
                16,
                20,
                25,
                30
            ]
        )

        floor_number = random.randint(
            1,
            8
        )

        meeting_room = random.choice(
            [
                True,
                False
            ]
        )

        property_age_years = random.randint(
            0,
            40
        )


   

    return {

        "propertyType": property_type,

        "price": price,

        "area": area_sqft,

        "province": province,

        "district": district,

        "municipality": municipality,

        "wardNo": ward_no,

        "bhk": bedrooms,

        "furnished": furnishing,

        "parking": parking,

        "roadAccess": road_access,

        "roomType": room_type,

        "wifi": wifi,

        "floorNumber": floor_number,

        "meetingRoom": meeting_room,

        "propertyAgeYears": property_age_years,
    }




properties = []

for _ in range(5000):

    properties.append(
        generate_property()
    )




df = pd.DataFrame(
    properties
)




df.to_csv(
    "dataset.csv",
    index=False
)


print(
    "\n=========================================="
)

print(
    "DATASET GENERATED SUCCESSFULLY"
)

print(
    "=========================================="
)

print(
    f"Total properties : {len(df)}"
)

print(
    f"Total columns    : {len(df.columns)}"
)


print(
    "\nProperty type distribution:"
)

print(
    df["propertyType"].value_counts()
)


print(
    "\nProperty age statistics:"
)

print(
    df["propertyAgeYears"].describe()
)


print(
    "\nSample data:"
)

print(
    df.head(10).to_string(
        index=False
    )
)


print(
    "\nDataset saved as dataset.csv"
)