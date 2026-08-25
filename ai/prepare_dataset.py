import pandas as pd
import numpy as np


np.random.seed(42)


# ============================================================
# LOAD DATA
# ============================================================

df = pd.read_csv("dataset.csv")

print("\n==========================================")
print("DATASET LOADED")
print("==========================================")

print(f"Rows    : {len(df)}")
print(f"Columns : {len(df.columns)}")


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def minmax(series):

    minimum = series.min()
    maximum = series.max()

    return (
        (series - minimum)
        /
        (maximum - minimum)
    )


# ============================================================
# NUMERICAL MARKET FEATURES
# ============================================================

price_per_sqft = (
    df["price"] /
    (df["area"] + 1)
)


price_signal = minmax(
    np.log1p(price_per_sqft)
)


area_signal = minmax(
    np.log1p(df["area"])
)


age_signal = (
    np.exp(
        -df["propertyAgeYears"] / 30
    )
)


road_signal = (
    df["roadAccess"] / 30
)


# ============================================================
# LOCATION SIGNAL
# ============================================================

location_values = {

    "Kathmandu": 0.95,
    "Lalitpur": 0.90,
    "Bhaktapur": 0.84,
    "Kaski": 0.88,
    "Chitwan": 0.78,
    "Morang": 0.76,
    "Jhapa": 0.70,
    "Rupandehi": 0.80,
    "Kailali": 0.68

}


location_signal = (

    df["district"]
    .map(location_values)
    .fillna(0.50)

)


# ============================================================
# PROPERTY TYPE
# ============================================================

type_values = {

    "land": 0.70,
    "home": 0.88,
    "room": 0.68,
    "office": 0.78

}


type_signal = (

    df["propertyType"]
    .map(type_values)
    .fillna(0.50)

)


# ============================================================
# AMENITIES
# ============================================================

parking_signal = (
    df["parking"].astype(int)
)


wifi_signal = (
    df["wifi"].astype(int)
)


meeting_signal = (
    df["meetingRoom"].astype(int)
)


# ============================================================
# FURNISHING
# ============================================================

furnishing_values = {

    "fully-furnished": 1.0,
    "semi-furnished": 0.65,
    "unfurnished": 0.35

}


furnishing_signal = (

    df["furnished"]
    .map(furnishing_values)
    .fillna(0.50)

)


# ============================================================
# BHK
# ============================================================

bhk_signal = np.where(

    df["bhk"] > 0,

    np.minimum(
        df["bhk"] / 5,
        1
    ),

    0

)


# ============================================================
# FLOOR
# ============================================================

floor_signal = np.where(

    df["floorNumber"] > 0,

    np.exp(
        -(
            df["floorNumber"] - 3
        ) ** 2
        / 10
    ),

    0

)


# ============================================================
# INTERACTION FEATURES
# ============================================================

location_road = (
    location_signal *
    road_signal
)


location_price = (
    location_signal *
    (1 - price_signal)
)


age_condition = (
    age_signal *
    furnishing_signal
)


space_value = (
    area_signal *
    (1 - price_signal)
)


amenity_score = (

    parking_signal
    +

    wifi_signal
    +

    meeting_signal

) / 3


# ============================================================
# LATENT DEMAND
# ============================================================

latent_demand = (

    0.20 * location_signal

    +

    0.13 * type_signal

    +

    0.12 * price_signal

    +

    0.10 * area_signal

    +

    0.10 * age_signal

    +

    0.08 * road_signal

    +

    0.08 * furnishing_signal

    +

    0.06 * bhk_signal

    +

    0.05 * amenity_score

    +

    0.03 * floor_signal

    +

    0.02 * location_road

    +

    0.02 * location_price

    +

    0.01 * age_condition

)


# ============================================================
# NON-LINEAR MARKET EFFECT
# ============================================================

latent_demand += (

    0.06 *
    np.sin(
        area_signal * np.pi
    )

)


latent_demand += (

    0.05 *
    np.sqrt(
        np.maximum(
            space_value,
            0
        )
    )

)


# ============================================================
# REALISTIC RANDOM VARIATION
# ============================================================

noise = np.random.normal(

    0,

    0.05,

    len(df)

)


latent_demand += noise


# ============================================================
# CONVERT TO POPULARITY
# ============================================================

df["popularityScore"] = (

    minmax(
        latent_demand
    )
    * 100

)


df["popularityScore"] = (

    df["popularityScore"]
    .round(2)

)


# ============================================================
# SAVE
# ============================================================

df.to_csv(

    "training_dataset.csv",

    index=False

)


# ============================================================
# OUTPUT
# ============================================================

print("\n==========================================")
print("TRAINING DATASET CREATED")
print("==========================================")

print(
    f"Rows    : {len(df)}"
)

print(
    f"Columns : {len(df.columns)}"
)


print("\nPopularity statistics:")

print(
    df["popularityScore"].describe()
)


print("\nSample:")

print(

    df[
        [
            "propertyType",
            "price",
            "area",
            "district",
            "bhk",
            "furnished",
            "parking",
            "roadAccess",
            "propertyAgeYears",
            "popularityScore"
        ]
    ]
    .head(10)
    .to_string(index=False)

)


print(
    "\nSaved as training_dataset.csv"
)