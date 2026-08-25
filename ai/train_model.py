import pandas as pd
import numpy as np
import joblib

from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder

from sklearn.model_selection import (
    train_test_split,
    RandomizedSearchCV,
    KFold
)

from sklearn.ensemble import RandomForestRegressor

from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)


# ============================================================
# LOAD DATASET
# ============================================================

df = pd.read_csv("training_dataset.csv")

print("\n==========================================")
print("TRAINING DATASET LOADED")
print("==========================================")

print(f"Rows    : {len(df)}")
print(f"Columns : {len(df.columns)}")


# ============================================================
# FEATURES AND TARGET
# ============================================================

X = df.drop(
    "popularityScore",
    axis=1
)

y = df["popularityScore"]


# ============================================================
# FEATURE GROUPS
# ============================================================

categorical_features = [

    "propertyType",
    "province",
    "district",
    "municipality",
    "furnished",
    "roomType"

]


numerical_features = [

    "price",
    "area",
    "wardNo",
    "bhk",
    "parking",
    "roadAccess",
    "wifi",
    "floorNumber",
    "meetingRoom",
    "propertyAgeYears"

]


# ============================================================
# PREPROCESSING
# ============================================================

numerical_pipeline = Pipeline(

    steps=[

        (
            "imputer",

            SimpleImputer(
                strategy="median"
            )

        )

    ]

)


categorical_pipeline = Pipeline(

    steps=[

        (
            "imputer",

            SimpleImputer(
                strategy="most_frequent"
            )

        ),

        (
            "encoder",

            OneHotEncoder(
                handle_unknown="ignore"
            )

        )

    ]

)


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


# ============================================================
# TRAIN / TEST SPLIT
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(

    X,
    y,

    test_size=0.20,

    random_state=42

)


print("\n==========================================")
print("DATA SPLIT")
print("==========================================")

print(
    f"Training samples : {len(X_train)}"
)

print(
    f"Testing samples  : {len(X_test)}"
)


# ============================================================
# RANDOM FOREST
# ============================================================

rf = RandomForestRegressor(

    random_state=42,

    n_jobs=-1

)


# ============================================================
# COMPLETE PIPELINE
# ============================================================

pipeline = Pipeline(

    steps=[

        (
            "preprocessor",
            preprocessor
        ),

        (
            "model",
            rf
        )

    ]

)


# ============================================================
# HYPERPARAMETER SEARCH
# ============================================================

param_distributions = {

    "model__n_estimators": [

        200,
        400,
        600

    ],

    "model__max_depth": [

        None,
        10,
        15,
        20,
        25

    ],

    "model__min_samples_split": [

        2,
        5,
        10

    ],

    "model__min_samples_leaf": [

        1,
        2,
        4

    ],

    "model__max_features": [

        "sqrt",
        "log2",
        1.0

    ]

}


# ============================================================
# CROSS VALIDATION
# ============================================================

cv = KFold(

    n_splits=5,

    shuffle=True,

    random_state=42

)


# ============================================================
# RANDOMIZED SEARCH
# ============================================================

search = RandomizedSearchCV(

    estimator=pipeline,

    param_distributions=param_distributions,

    n_iter=20,

    scoring="neg_mean_absolute_error",

    cv=cv,

    verbose=1,

    random_state=42,

    n_jobs=-1

)


# ============================================================
# TRAIN
# ============================================================

print("\n==========================================")
print("HYPERPARAMETER TUNING")
print("==========================================")

print(
    "Training multiple Random Forest configurations..."
)


search.fit(

    X_train,

    y_train

)


print("\nTraining completed!")


# ============================================================
# BEST PARAMETERS
# ============================================================

print("\n==========================================")
print("BEST PARAMETERS")
print("==========================================")

print(
    search.best_params_
)


# ============================================================
# BEST MODEL
# ============================================================

best_model = search.best_estimator_


# ============================================================
# PREDICTION
# ============================================================

y_pred = best_model.predict(

    X_test

)


# ============================================================
# EVALUATION
# ============================================================

mae = mean_absolute_error(

    y_test,

    y_pred

)


rmse = np.sqrt(

    mean_squared_error(

        y_test,

        y_pred

    )

)


r2 = r2_score(

    y_test,

    y_pred

)


print("\n==========================================")
print("FINAL MODEL EVALUATION")
print("==========================================")

print(
    f"MAE  : {mae:.2f}"
)

print(
    f"RMSE : {rmse:.2f}"
)

print(
    f"R²   : {r2:.4f}"
)


# ============================================================
# PREDICTION RANGE
# ============================================================

print("\n==========================================")
print("PREDICTION RANGE")
print("==========================================")

print(
    f"Minimum : {y_pred.min():.2f}"
)

print(
    f"Maximum : {y_pred.max():.2f}"
)

print(
    f"Average : {y_pred.mean():.2f}"
)


# ============================================================
# SAMPLE PREDICTIONS
# ============================================================

results = pd.DataFrame({

    "Actual":
        y_test.values,

    "Predicted":
        np.round(
            y_pred,
            2
        )

})


print("\n==========================================")
print("SAMPLE PREDICTIONS")
print("==========================================")

print(

    results
    .head(15)
    .to_string(
        index=False
    )

)


# ============================================================
# FEATURE IMPORTANCE
# ============================================================

print("\n==========================================")
print("FEATURE IMPORTANCE")
print("==========================================")


model = best_model.named_steps["model"]

preprocessor_fitted = (
    best_model
    .named_steps["preprocessor"]
)


feature_names = (
    preprocessor_fitted
    .get_feature_names_out()
)


importances = model.feature_importances_


feature_importance = pd.DataFrame({

    "feature":
        feature_names,

    "importance":
        importances

})


feature_importance = (

    feature_importance

    .sort_values(

        "importance",

        ascending=False

    )

)


print(

    feature_importance
    .head(20)
    .to_string(
        index=False
    )

)


# ============================================================
# SAVE FEATURE IMPORTANCE
# ============================================================

feature_importance.to_csv(

    "feature_importance.csv",

    index=False

)


# ============================================================
# SAVE MODEL
# ============================================================

joblib.dump(

    best_model,

    "model.pkl"

)


print("\n==========================================")
print("MODEL SAVED")
print("==========================================")

print(
    "model.pkl"
)

print(
    "feature_importance.csv"
)

print(
    "\nTraining completed successfully!"
)