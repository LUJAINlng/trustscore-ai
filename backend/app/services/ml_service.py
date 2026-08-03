from pathlib import Path
from typing import Any

import joblib
import pandas as pd


MODEL_PATH = (
    Path(__file__).resolve().parents[2]
    / "ml"
    / "random_forest_model.joblib"
)

_model_bundle = joblib.load(MODEL_PATH)
_model = _model_bundle["model"]
_features = _model_bundle["features"]


def predict_identity_risk(
    feature_values: dict[str, Any],
) -> dict[str, Any]:
    missing_features = [
        feature
        for feature in _features
        if feature not in feature_values
    ]

    if missing_features:
        raise ValueError(
            f"Missing ML features: {missing_features}"
        )

    input_data = pd.DataFrame(
        [[feature_values[feature] for feature in _features]],
        columns=_features,
    )

    prediction = str(_model.predict(input_data)[0])
    probabilities = _model.predict_proba(input_data)[0]

    class_probabilities = {
        str(label): round(float(probability), 4)
        for label, probability in zip(
            _model.classes_,
            probabilities,
        )
    }

    confidence = max(class_probabilities.values())

    return {
        "prediction": prediction,
        "confidence": confidence,
        "probabilities": class_probabilities,
        "model": "Random Forest",
        "dataset_type": _model_bundle.get(
            "dataset_type",
            "unknown",
        ),
    }