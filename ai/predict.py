import sys
import json
import pandas as pd
import joblib


# ==========================================
# LOAD TRAINED MODEL
# ==========================================

model = joblib.load("model.pkl")


# ==========================================
# READ JSON FROM STANDARD INPUT
# ==========================================

try:
    input_text = sys.stdin.read().strip()

    if not input_text:
        print(json.dumps({
            "success": False,
            "error": "No JSON input received"
        }))
        sys.exit(1)

    input_data = json.loads(input_text)

except json.JSONDecodeError as error:

    print(json.dumps({
        "success": False,
        "error": f"Invalid JSON: {error}"
    }))

    sys.exit(1)


# ==========================================
# CREATE DATAFRAME
# ==========================================

try:

    new_property = pd.DataFrame([

        {
            "propertyType": input_data.get("propertyType"),

            "price": input_data.get("price"),

            "area": input_data.get("area"),

            "province": input_data.get("province"),

            "district": input_data.get("district"),

            "municipality": input_data.get("municipality"),

            "wardNo": input_data.get("wardNo"),

            "bhk": input_data.get("bhk"),

            "furnished": input_data.get("furnished"),

            "parking": input_data.get("parking"),

            "roadAccess": input_data.get("roadAccess"),

            "roomType": input_data.get("roomType"),

            "wifi": input_data.get("wifi"),

            "floorNumber": input_data.get("floorNumber"),

            "meetingRoom": input_data.get("meetingRoom")
        }

    ])


    # ==========================================
    # MAKE PREDICTION
    # ==========================================

    prediction = model.predict(new_property)

    popularity_score = float(prediction[0])


    # ==========================================
    # LIMIT SCORE
    # ==========================================

    popularity_score = max(
        0,
        min(100, popularity_score)
    )


    # ==========================================
    # RETURN RESULT
    # ==========================================

    response = {

        "success": True,

        "popularityScore": round(
            popularity_score,
            2
        )

    }

    print(json.dumps(response))


except Exception as error:

    print(json.dumps({

        "success": False,

        "error": str(error)

    }))

    sys.exit(1)