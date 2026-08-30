from flask import Flask, request, jsonify
import joblib
import pandas as pd
import numpy as np



# FLASK APP


app = Flask(__name__)



# LOAD TRAINED MODEL


MODEL_PATH = "model.pkl"

try:
    model = joblib.load(MODEL_PATH)

  
    print("Model loaded successfully")

except Exception as error:

    print(error)

    model = None



# HOME / HEALTH CHECK

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "message": "Real Estate AI API is running",
        "model": "PropertyPopularity Prediction"
    })


# PREDICT POPULARITY


@app.route("/predict", methods=["POST"])
def predict():

    try:

       

        if model is None:

            return jsonify({
                "success": False,
                "message": "AI model is not loaded"
            }), 500


       

        data = request.get_json()

        if not data:

            return jsonify({
                "success": False,
                "message": "No JSON data received"
            }), 400


        print("\n==========================================")
        print("AI PREDICTION REQUEST")
        print("==========================================")

        print(data)



        model_input = {

            "propertyType":
                data.get("propertyType", ""),

            "price":
                float(data.get("price", 0)),

            "area":
                float(data.get("area", 0)),

            "province":
                data.get("province", ""),

            "district":
                data.get("district", ""),

            "municipality":
                data.get("municipality", ""),

            "wardNo":
                float(data.get("wardNo", 0)),

            "bhk":
                float(data.get("bhk", 0)),

            "furnished":
                data.get("furnished", ""),

            "parking":
                bool(data.get("parking", False)),

            "roadAccess":
                float(data.get("roadAccess", 0)),

            "roomType":
                data.get("roomType", ""),

            "wifi":
                bool(data.get("wifi", False)),

            "floorNumber":
                float(data.get("floorNumber", 0)),

            "meetingRoom":
                bool(data.get("meetingRoom", False)),

            "propertyAgeYears":
                float(data.get("propertyAgeYears", 0))

        }


      
        input_df = pd.DataFrame([
            model_input
        ])



        print(
            input_df.to_string(index=False)
        )


        

        prediction = model.predict(
            input_df
        )


        

        popularity_score = float(
            prediction[0]
        )


      

        popularity_score = max(
            0,
            min(
                100,
                popularity_score
            )
        )


      

        popularity_score = round(
            popularity_score,
            2
        )



        print("\n==========================================")
        print("AI PREDICTION")
        print("==========================================")

        print(
            f"Popularity Score : "
            f"{popularity_score} / 100"
        )


        return jsonify({

            "success": True,

            "popularityScore":
                popularity_score

        })


    except Exception as error:

        print("\n==========================================")
        print("AI PREDICTION ERROR")
        print("==========================================")

        print(error)


        return jsonify({

            "success": False,

            "message":
                "AI prediction failed",

            "error":
                str(error)

        }), 500




if __name__ == "__main__":


    print(
        "Server running on:"
    )

    print(
        "http://127.0.0.1:5000"
    )


    app.run(

        host="127.0.0.1",

        port=5000,

        debug=True

    )