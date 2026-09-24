Mero Ghar Jagga 🏠

AI-Based Property Popularity Prediction

Mero Ghar Jagga is a real-estate platform that uses Machine Learning to predict a property's popularity score (0–100%) based on its characteristics such as property type, price, area, location, BHK, furnishing, parking, and other features.

Note: The popularity score is a model-generated estimate, not a guaranteed probability of success.

🚀 AI Architecture
React Frontend
      ↓
Node.js + Express
      ↓
aiService.js
      ↓
Python Flask API
      ↓
Random Forest Model
      ↓
Popularity Score
      ↓
MongoDB


The Node/Express backend acts as a bridge between the MERN application and the Python ML service.

🤖 Machine Learning
Component	Details
Algorithm	Random Forest Regressor
Dataset	3,000 property records
Training Set	2,400 records (80%)
Test Set	600 records (20%)
MAE	7.17
RMSE	8.86
R² Score	0.5819
Model	model.pkl

The model uses a preprocessing pipeline with missing-value handling and One-Hot Encoding for categorical features.

Main Features

Property type

Price and area

Province, district, municipality, ward

BHK and furnishing

Parking and road access

Room type

Wi-Fi

Floor number

Meeting room

🔄 Prediction Flow

Owner submits a property through the React frontend.

Node/Express receives the property data.

Backend sends relevant features to the Flask AI API.

Flask loads the trained model.pkl.

Random Forest predicts a popularity score.

The score is stored in MongoDB as aiPopularityScore.

React displays the score to the user.

Example:

{
  "success": true,
  "popularityScore": 83.11
}

🛠️ Tech Stack

Frontend: React + Vite

Backend: Node.js + Express

Database: MongoDB + Mongoose

AI Service: Python + Flask

ML: Scikit-learn

Model Storage: Joblib (model.pkl)

📌 Future Improvements

Larger and more representative datasets

Real user interaction data such as views, likes, and favorites

Feature engineering and hyperparameter tuning

Cross-validation

Comparison with other regression models

Periodic model retraining

🎯 Summary

Mero Ghar Jagga integrates a Random Forest regression model into a MERN-based real-estate platform through a Python Flask API, enabling property owners to receive an AI-generated popularity score and making the prediction part of the actual property listing workflow.
