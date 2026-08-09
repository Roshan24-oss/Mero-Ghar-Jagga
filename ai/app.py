from flask import Flask, request, jsonify
import pandas as pd
import joblib


# ==========================================
# CREATE FLASK APP
# ==========================================

app = Flask(__name__)


# ==========================================
# LOAD TRAINED ML MODEL
# ==========================================

model = joblib.load("model.pkl")

print("AI model loaded successfully!")


# ==========================================
# HOME ROUTE
# ==========================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "success": True,
        "message": "Mero Ghar Jagga AI service is running"
    })


# ==========================================
# PREDICTION ROUTE
# ==========================================

@app.route("/predict", methods=["POST"])
def predict():

    try:

        # --------------------------------------
        # GET JSON DATA
        # --------------------------------------

        data = request.get_json()

        if not data:

            return jsonify({
                "success": False,
                "error": "No property data received"
            }), 400


        # --------------------------------------
        # CREATE DATAFRAME
        # --------------------------------------

        new_property = pd.DataFrame([

            {
                "propertyType": data.get("propertyType"),

                "price": data.get("price"),

                "area": data.get("area"),

                "province": data.get("province"),

                "district": data.get("district"),

                "municipality": data.get("municipality"),

                "wardNo": data.get("wardNo"),

                "bhk": data.get("bhk"),

                "furnished": data.get("furnished"),

                "parking": data.get("parking"),

                "roadAccess": data.get("roadAccess"),

                "roomType": data.get("roomType"),

                "wifi": data.get("wifi"),

                "floorNumber": data.get("floorNumber"),

                "meetingRoom": data.get("meetingRoom")
            }

        ])


        # --------------------------------------
        # MAKE PREDICTION
        # --------------------------------------

        prediction = model.predict(new_property)

        popularity_score = float(prediction[0])


        # --------------------------------------
        # LIMIT SCORE
        # --------------------------------------

        popularity_score = max(
            0,
            min(100, popularity_score)
        )


        # --------------------------------------
        # RETURN RESULT
        # --------------------------------------

        return jsonify({

            "success": True,

            "popularityScore": round(
                popularity_score,
                2
            )

        })


    except Exception as error:

        return jsonify({

            "success": False,

            "error": str(error)

        }), 500


# ==========================================
# START SERVER
# ==========================================

if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )