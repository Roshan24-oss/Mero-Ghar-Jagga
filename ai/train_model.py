import pandas as pd
import numpy as np
import joblib

from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


# ==========================================
# LOAD DATASET
# ==========================================

df = pd.read_csv("dataset.csv")

print("Dataset loaded successfully!")
print(f"Rows: {len(df)}")
print(f"Columns: {len(df.columns)}")


# ==========================================
# X AND Y
# ==========================================

X = df.drop("popularityScore", axis=1)
y = df["popularityScore"]

print("\nFeatures (X):")
print(X.columns.tolist())

print("\nTarget (y):")
print(y.name)


# ==========================================
# FEATURE GROUPS
# ==========================================

categorical_features = [
    "propertyType",
    "province",
    "district",
    "municipality",
    "bhk",
    "furnished",
    "parking",
    "roomType",
    "wifi",
    "meetingRoom",
]

numerical_features = [
    "price",
    "area",
    "wardNo",
    "roadAccess",
    "floorNumber",
]


# ==========================================
# NUMERICAL PREPROCESSING
# ==========================================

numerical_pipeline = Pipeline(
    steps=[
        ("imputer", SimpleImputer(strategy="median"))
    ]
)


# ==========================================
# CATEGORICAL PREPROCESSING
# ==========================================

categorical_pipeline = Pipeline(
    steps=[
        (
            "imputer",
            SimpleImputer(strategy="most_frequent")
        ),
        (
            "encoder",
            OneHotEncoder(handle_unknown="ignore")
        )
    ]
)


# ==========================================
# COMBINE PREPROCESSING
# ==========================================

preprocessor = ColumnTransformer(
    transformers=[
        (
            "numerical",
            numerical_pipeline,
            numerical_features
        ),
        (
            "categorical",
            categorical_pipeline,
            categorical_features
        )
    ]
)

print("\nPreprocessing pipeline created successfully!")


# ==========================================
# TRAIN / TEST SPLIT
# ==========================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42
)

print("\nData split completed!")

print(f"Training features: {X_train.shape}")
print(f"Testing features: {X_test.shape}")

print(f"Training target: {y_train.shape}")
print(f"Testing target: {y_test.shape}")


# ==========================================
# RANDOM FOREST MODEL
# ==========================================

model = RandomForestRegressor(
    n_estimators=200,
    random_state=42,
    max_depth=None,
    n_jobs=-1
)

print("\nRandom Forest model created!")


# ==========================================
# COMPLETE ML PIPELINE
# ==========================================

ml_pipeline = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        ("model", model)
    ]
)

print("ML pipeline created!")


# ==========================================
# TRAIN MODEL
# ==========================================

print("\nTraining model...")

ml_pipeline.fit(X_train, y_train)

print("Model training completed!")


# ==========================================
# MAKE PREDICTIONS
# ==========================================

print("\nMaking predictions on test data...")

y_pred = ml_pipeline.predict(X_test)

print("Predictions completed!")


# ==========================================
# MODEL EVALUATION
# ==========================================

mae = mean_absolute_error(y_test, y_pred)

mse = mean_squared_error(y_test, y_pred)

rmse = np.sqrt(mse)

r2 = r2_score(y_test, y_pred)


print("\n==========================================")
print("MODEL EVALUATION")
print("==========================================")

print(f"MAE  : {mae:.2f}")
print(f"RMSE : {rmse:.2f}")
print(f"R²   : {r2:.4f}")


# ==========================================
# PREDICTION RANGE
# ==========================================

print("\n==========================================")
print("PREDICTION RANGE")
print("==========================================")

print(f"Minimum predicted score: {y_pred.min():.2f}")
print(f"Maximum predicted score: {y_pred.max():.2f}")


# ==========================================
# SAMPLE PREDICTIONS
# ==========================================

print("\n==========================================")
print("SAMPLE PREDICTIONS")
print("==========================================")

results = pd.DataFrame({
    "Actual": y_test.values,
    "Predicted": np.round(y_pred, 2)
})

print(results.head(10).to_string(index=False))


# ==========================================
# SAVE TRAINED MODEL
# ==========================================

print("\n==========================================")
print("SAVING MODEL")
print("==========================================")

model_filename = "model.pkl"

joblib.dump(ml_pipeline, model_filename)

print(f"Model saved successfully as: {model_filename}")