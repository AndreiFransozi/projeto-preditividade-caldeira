import asyncio
import time
from datetime import datetime, timezone

import numpy as np
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from sklearn.ensemble import IsolationForest


FEATURES = (
    "pressure_bar",
    "gas_temperature_c",
    "water_level_pct",
    "pump_flow_m3h",
    "pump_vibration_mms",
)
REFERENCES = np.array([10.0, 180.0, 60.0, 5.0, 1.2])
NOISE = np.array([0.12, 2.5, 1.0, 0.12, 0.08])
RAMP_SECONDS = 25.0

SCENARIOS = {
    "normal": {
        "label": "Operacao normal",
        "target": np.array([10.0, 180.0, 60.0, 5.0, 1.2]),
    },
    "pump_failure": {
        "label": "Falha na bomba",
        "target": np.array([9.2, 185.0, 35.0, 0.8, 4.8]),
    },
    "burner_overheat": {
        "label": "Superaquecimento no queimador",
        "target": np.array([10.2, 285.0, 58.0, 5.0, 1.3]),
    },
    "overpressure": {
        "label": "Sobrepressao",
        "target": np.array([17.0, 195.0, 60.0, 5.0, 1.2]),
    },
}

FEATURE_LABELS = {
    "pressure_bar": ("Pressao", "bar"),
    "gas_temperature_c": ("Temperatura dos gases", "°C"),
    "water_level_pct": ("Nivel de agua", "%"),
    "pump_flow_m3h": ("Vazao da bomba", "m³/h"),
    "pump_vibration_mms": ("Vibracao da bomba", "mm/s"),
}
FEATURE_COMPONENTS = {
    "pressure_bar": "safety_valve",
    "gas_temperature_c": "burner",
    "water_level_pct": "boiler_body",
    "pump_flow_m3h": "feed_pump",
    "pump_vibration_mms": "feed_pump",
}
COMPONENT_LABELS = {
    "boiler_body": "Corpo / tubulao",
    "burner": "Queimador",
    "safety_valve": "Valvula de seguranca",
    "feed_pump": "Bomba de alimentacao",
}


def train_detector() -> tuple[IsolationForest, np.ndarray, np.ndarray, np.ndarray]:
    """Treina e calibra o detector com operacao normal sintetica."""
    rng = np.random.default_rng(42)
    normal_samples = rng.normal(loc=REFERENCES, scale=NOISE, size=(2000, len(FEATURES)))
    model = IsolationForest(
        n_estimators=150,
        contamination=0.05,
        random_state=42,
    )
    model.fit(normal_samples)
    normal_scores = model.score_samples(normal_samples)
    return (
        model,
        normal_samples.mean(axis=0),
        normal_samples.std(axis=0),
        normal_scores,
    )


MODEL, NORMAL_MEAN, NORMAL_STD, NORMAL_SCORES = train_detector()
SCORE_CUTOFF = float(np.quantile(NORMAL_SCORES, 0.05))
SCORE_FLOOR = float(np.quantile(NORMAL_SCORES, 0.001))

app = FastAPI(title="Digital Twin demonstrativo de caldeira", version="1.0.0")


class Simulator:
    def __init__(self) -> None:
        self.current = REFERENCES.copy()
        self.start_values = REFERENCES.copy()
        self.scenario = "normal"
        self.scenario_started = time.monotonic()
        self.rng = np.random.default_rng()

    def set_scenario(self, scenario: str) -> None:
        if scenario not in SCENARIOS:
            raise ValueError(f"Cenario desconhecido: {scenario}")
        if scenario == self.scenario:
            return
        self.start_values = self.current.copy()
        self.scenario = scenario
        self.scenario_started = time.monotonic()

    def read(self) -> np.ndarray:
        elapsed = time.monotonic() - self.scenario_started
        progress = min(elapsed / RAMP_SECONDS, 1.0)
        target = SCENARIOS[self.scenario]["target"]
        trend = self.start_values + (target - self.start_values) * progress
        self.current = trend + self.rng.normal(0.0, NOISE)
        self.current[2] = np.clip(self.current[2], 0.0, 100.0)
        self.current[3] = max(0.0, self.current[3])
        self.current[4] = max(0.0, self.current[4])
        return self.current.copy()


def diagnose(values: np.ndarray) -> dict:
    score = float(MODEL.score_samples(values.reshape(1, -1))[0])
    denominator = max(SCORE_CUTOFF - SCORE_FLOOR, 1e-9)
    anomaly_index = float(
        np.clip((SCORE_CUTOFF - score) / denominator * 100.0, 0.0, 100.0)
    )

    if anomaly_index >= 65.0:
        status = "critical"
    elif anomaly_index >= 20.0:
        status = "attention"
    else:
        status = "normal"

    component_statuses = {component: "normal" for component in COMPONENT_LABELS}
    if status == "normal":
        return {
            "anomaly_index": round(anomaly_index),
            "status": status,
            "affected_component": None,
            "component_statuses": component_statuses,
            "explanations": ["Leituras dentro da faixa normal simulada."],
        }

    deviations = np.abs((values - NORMAL_MEAN) / NORMAL_STD)
    component_deviations = {
        component: [
            index
            for index, feature in enumerate(FEATURES)
            if FEATURE_COMPONENTS[feature] == component
        ]
        for component in COMPONENT_LABELS
    }
    affected_component = max(
        component_deviations,
        key=lambda component: float(np.mean(deviations[component_deviations[component]])),
    )
    component_statuses[affected_component] = status

    top_features = np.argsort(deviations)[::-1][:2]
    explanations = [
        describe_deviation(FEATURES[index], float(values[index]))
        for index in top_features
        if deviations[index] >= 1.0
    ]
    if not explanations:
        explanations = ["Leitura fora do padrao normal sintetico."]

    return {
        "anomaly_index": round(anomaly_index),
        "status": status,
        "affected_component": affected_component,
        "component_statuses": component_statuses,
        "explanations": explanations,
    }


def describe_deviation(feature: str, value: float) -> str:
    label, unit = FEATURE_LABELS[feature]
    reference = float(REFERENCES[FEATURES.index(feature)])
    difference = value - reference
    direction = "acima" if difference >= 0 else "abaixo"
    percentage = abs(difference) / reference * 100.0
    return (
        f"{label} {percentage:.0f}% {direction} do normal "
        f"({value:.1f} {unit}; referencia {reference:g} {unit})."
    )


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "digital-twin-mvp"}


@app.websocket("/ws/telemetry")
async def telemetry_socket(websocket: WebSocket) -> None:
    await websocket.accept()
    simulator = Simulator()

    try:
        while True:
            try:
                message = await asyncio.wait_for(websocket.receive_json(), timeout=1.0)
                if isinstance(message, dict) and message.get("type") == "scenario":
                    scenario = message.get("scenario")
                    if scenario in SCENARIOS:
                        simulator.set_scenario(scenario)
                    else:
                        await websocket.send_json(
                            {"type": "error", "message": "Cenario invalido."}
                        )
                else:
                    await websocket.send_json(
                        {"type": "error", "message": "Mensagem invalida."}
                    )
                continue
            except asyncio.TimeoutError:
                pass

            values = simulator.read()
            diagnosis = diagnose(values)
            await websocket.send_json(
                {
                    "type": "telemetry",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "scenario": simulator.scenario,
                    "scenario_label": SCENARIOS[simulator.scenario]["label"],
                    "readings": dict(zip(FEATURES, values.tolist())),
                    "diagnosis": diagnosis,
                }
            )
    except WebSocketDisconnect:
        return
