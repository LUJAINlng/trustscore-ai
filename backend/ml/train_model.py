from pathlib import Path
import json

import joblib
import numpy as np
import pandas as pd

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
)
from sklearn.model_selection import train_test_split


RANDOM_STATE = 42
SAMPLES_PER_SCENARIO = 500

FEATURES = [
    "failed_login_count",
    "impossible_travel",
    "new_device",
    "vpn_detected",
    "tor_network",
    "privileged_account",
    "mfa_enabled",
    "login_hour",
    "geo_risk",
    "device_reputation",
]


def generate_scenario(
    rng: np.random.Generator,
    scenario: str,
) -> dict:
    if scenario == "normal_login":
        return {
            "scenario": "Normal Login",
            "failed_login_count": rng.integers(0, 2),
            "impossible_travel": 0,
            "new_device": 0,
            "vpn_detected": 0,
            "tor_network": 0,
            "privileged_account": rng.integers(0, 2),
            "mfa_enabled": 1,
            "login_hour": rng.integers(7, 22),
            "geo_risk": 0,
            "device_reputation": 0,
            "decision": "Allow",
        }

    if scenario == "trusted_midnight_login":
        return {
            "scenario": "Trusted Midnight Login",
            "failed_login_count": rng.integers(0, 2),
            "impossible_travel": 0,
            "new_device": 0,
            "vpn_detected": 0,
            "tor_network": 0,
            "privileged_account": 0,
            "mfa_enabled": 1,
            "login_hour": rng.choice([0, 1, 2, 3, 4, 23]),
            "geo_risk": 0,
            "device_reputation": 0,
            "decision": "Allow",
        }

    if scenario == "new_device":
        return {
            "scenario": "New Device Login",
            "failed_login_count": rng.integers(0, 2),
            "impossible_travel": 0,
            "new_device": 1,
            "vpn_detected": 0,
            "tor_network": 0,
            "privileged_account": rng.integers(0, 2),
            "mfa_enabled": rng.integers(0, 2),
            "login_hour": rng.integers(6, 23),
            "geo_risk": rng.integers(0, 2),
            "device_reputation": 1,
            "decision": "Require MFA",
        }

    if scenario == "vpn_login":
        return {
            "scenario": "VPN Login",
            "failed_login_count": rng.integers(0, 3),
            "impossible_travel": 0,
            "new_device": rng.integers(0, 2),
            "vpn_detected": 1,
            "tor_network": 0,
            "privileged_account": rng.integers(0, 2),
            "mfa_enabled": rng.integers(0, 2),
            "login_hour": rng.integers(0, 24),
            "geo_risk": rng.integers(0, 2),
            "device_reputation": rng.integers(0, 2),
            "decision": "Require MFA",
        }

    if scenario == "risky_location":
        return {
            "scenario": "Risky Geographic Login",
            "failed_login_count": rng.integers(0, 3),
            "impossible_travel": 0,
            "new_device": rng.integers(0, 2),
            "vpn_detected": rng.integers(0, 2),
            "tor_network": 0,
            "privileged_account": rng.integers(0, 2),
            "mfa_enabled": rng.integers(0, 2),
            "login_hour": rng.integers(0, 24),
            "geo_risk": 2,
            "device_reputation": rng.integers(0, 2),
            "decision": "Require MFA",
        }

    if scenario == "brute_force":
        return {
            "scenario": "Brute Force Attack",
            "failed_login_count": rng.integers(6, 21),
            "impossible_travel": 0,
            "new_device": rng.integers(0, 2),
            "vpn_detected": rng.integers(0, 2),
            "tor_network": rng.integers(0, 2),
            "privileged_account": rng.integers(0, 2),
            "mfa_enabled": rng.integers(0, 2),
            "login_hour": rng.integers(0, 24),
            "geo_risk": rng.integers(0, 3),
            "device_reputation": rng.integers(1, 3),
            "decision": "Block",
        }

    if scenario == "impossible_travel":
        return {
            "scenario": "Impossible Travel",
            "failed_login_count": rng.integers(0, 4),
            "impossible_travel": 1,
            "new_device": rng.integers(0, 2),
            "vpn_detected": rng.integers(0, 2),
            "tor_network": 0,
            "privileged_account": rng.integers(0, 2),
            "mfa_enabled": rng.integers(0, 2),
            "login_hour": rng.integers(0, 24),
            "geo_risk": rng.integers(1, 3),
            "device_reputation": rng.integers(0, 3),
            "decision": "Block",
        }

    if scenario == "tor_access":
        return {
            "scenario": "TOR Network Access",
            "failed_login_count": rng.integers(0, 5),
            "impossible_travel": rng.integers(0, 2),
            "new_device": 1,
            "vpn_detected": 1,
            "tor_network": 1,
            "privileged_account": rng.integers(0, 2),
            "mfa_enabled": rng.integers(0, 2),
            "login_hour": rng.integers(0, 24),
            "geo_risk": rng.integers(1, 3),
            "device_reputation": 2,
            "decision": "Block",
        }

    if scenario == "compromised_device":
        return {
            "scenario": "Compromised Device",
            "failed_login_count": rng.integers(1, 8),
            "impossible_travel": rng.integers(0, 2),
            "new_device": rng.integers(0, 2),
            "vpn_detected": rng.integers(0, 2),
            "tor_network": rng.integers(0, 2),
            "privileged_account": rng.integers(0, 2),
            "mfa_enabled": rng.integers(0, 2),
            "login_hour": rng.integers(0, 24),
            "geo_risk": rng.integers(0, 3),
            "device_reputation": 2,
            "decision": "Block",
        }

    if scenario == "privileged_anomaly":
        return {
            "scenario": "Privileged Account Anomaly",
            "failed_login_count": rng.integers(2, 10),
            "impossible_travel": rng.integers(0, 2),
            "new_device": 1,
            "vpn_detected": rng.integers(0, 2),
            "tor_network": rng.integers(0, 2),
            "privileged_account": 1,
            "mfa_enabled": 0,
            "login_hour": rng.choice([0, 1, 2, 3, 4, 23]),
            "geo_risk": rng.integers(1, 3),
            "device_reputation": rng.integers(1, 3),
            "decision": "Block",
        }

    raise ValueError(f"Unknown scenario: {scenario}")


def generate_dataset() -> pd.DataFrame:
    rng = np.random.default_rng(RANDOM_STATE)

    scenarios = [
        "normal_login",
        "trusted_midnight_login",
        "new_device",
        "vpn_login",
        "risky_location",
        "brute_force",
        "impossible_travel",
        "tor_access",
        "compromised_device",
        "privileged_anomaly",
    ]

    records = []

    for scenario in scenarios:
        for _ in range(SAMPLES_PER_SCENARIO):
            records.append(generate_scenario(rng, scenario))

    dataset = pd.DataFrame(records)

    return dataset.sample(
        frac=1,
        random_state=RANDOM_STATE,
    ).reset_index(drop=True)


def train_model() -> None:
    output_directory = Path(__file__).resolve().parent

    model_path = output_directory / "random_forest_model.joblib"
    metrics_path = output_directory / "model_metrics.json"
    dataset_path = output_directory / "identity_security_scenarios.csv"

    dataset = generate_dataset()
    dataset.to_csv(dataset_path, index=False)

    X = dataset[FEATURES]
    y = dataset["decision"]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=RANDOM_STATE,
        stratify=y,
    )

    model = RandomForestClassifier(
        n_estimators=250,
        max_depth=10,
        min_samples_leaf=3,
        class_weight="balanced",
        random_state=RANDOM_STATE,
    )

    model.fit(X_train, y_train)

    predictions = model.predict(X_test)

    accuracy = accuracy_score(y_test, predictions)

    report = classification_report(
        y_test,
        predictions,
        output_dict=True,
        zero_division=0,
    )

    labels = ["Allow", "Require MFA", "Block"]

    matrix = confusion_matrix(
        y_test,
        predictions,
        labels=labels,
    )

    model_bundle = {
        "model": model,
        "features": FEATURES,
        "classes": list(model.classes_),
        "dataset_type": "scenario-based synthetic",
    }

    joblib.dump(model_bundle, model_path)

    metrics = {
        "accuracy": round(float(accuracy), 4),
        "classification_report": report,
        "confusion_matrix_labels": labels,
        "confusion_matrix": matrix.tolist(),
        "training_samples": int(len(X_train)),
        "testing_samples": int(len(X_test)),
        "total_samples": int(len(dataset)),
        "dataset_type": "scenario-based synthetic",
        "scenario_count": int(dataset["scenario"].nunique()),
        "scenarios": sorted(dataset["scenario"].unique().tolist()),
    }

    metrics_path.write_text(
        json.dumps(metrics, indent=2),
        encoding="utf-8",
    )

    print("Scenario-based Random Forest training completed.")
    print(f"Total samples: {len(dataset)}")
    print(f"Security scenarios: {dataset['scenario'].nunique()}")
    print(f"Accuracy: {accuracy:.4f}")
    print(f"Dataset saved to: {dataset_path}")
    print(f"Model saved to: {model_path}")
    print(f"Metrics saved to: {metrics_path}")


if __name__ == "__main__":
    train_model()