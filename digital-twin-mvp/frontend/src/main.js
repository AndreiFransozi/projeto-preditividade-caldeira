import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import "./style.css";

const WS_URL = "ws://127.0.0.1:8000/ws/telemetry";
const MAX_HISTORY = 60;
const SCENARIOS = ["normal", "pump_failure", "burner_overheat", "overpressure"];
const SERIES = [
  { key: "pressure_bar", min: 7, max: 18, color: "#58a6ff" },
  { key: "gas_temperature_c", min: 160, max: 300, color: "#fb923c" },
  { key: "water_level_pct", min: 20, max: 80, color: "#36c99a" },
  { key: "pump_flow_m3h", min: 0, max: 7, color: "#b48aff" },
  { key: "pump_vibration_mms", min: 0, max: 6, color: "#f16a8a" },
];
const COMPONENTS = {
  boiler_body: { name: "Corpo / tubulao", readings: ["water_level_pct"] },
  burner: { name: "Queimador", readings: ["gas_temperature_c"] },
  safety_valve: { name: "Valvula de seguranca", readings: ["pressure_bar"] },
  feed_pump: { name: "Bomba de alimentacao", readings: ["pump_flow_m3h", "pump_vibration_mms"] },
};
const READING_LABELS = {
  pressure_bar: ["Pressao", "bar"],
  gas_temperature_c: ["Temperatura dos gases", "°C"],
  water_level_pct: ["Nivel de agua", "%"],
  pump_flow_m3h: ["Vazao", "m³/h"],
  pump_vibration_mms: ["Vibracao", "mm/s"],
};

const history = [];
const componentGroups = new Map();
const componentMaterials = new Map();
let latestReadings = null;
let latestDiagnosis = null;
let selectedComponent = null;
let activeScenario = "normal";
let lastAlertKey = "";
let socket;
let reconnectTimer;
let renderer;
let camera;
let controls;
let scene;

const el = (id) => document.getElementById(id);
const numberFormat = (value, digits = 1) =>
  new Intl.NumberFormat("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);

function setupScene() {
  const container = el("scene-container");
  scene = new THREE.Scene();
  scene.background = new THREE.Color("#101722");

  camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(5.2, 4.2, 7.4);
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  container.prepend(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1.05, 0);
  controls.enableDamping = true;
  controls.minDistance = 4;
  controls.maxDistance = 13;
  controls.maxPolarAngle = Math.PI * 0.49;

  scene.add(new THREE.HemisphereLight("#d9e8ff", "#42505d", 2.0));
  const keyLight = new THREE.DirectionalLight("#fff1d2", 3.5);
  keyLight.position.set(-4, 8, 6);
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight("#76aaff", 2.2);
  fillLight.position.set(5, 4, -5);
  scene.add(fillLight);
  const rimLight = new THREE.PointLight("#37b8b0", 22, 14);
  rimLight.position.set(0, 3.2, -3);
  scene.add(rimLight);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshStandardMaterial({ color: "#151f2a", roughness: 0.88, metalness: 0.08 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.035;
  scene.add(floor);
  const grid = new THREE.GridHelper(16, 32, "#31404c", "#222f3b");
  grid.position.y = -0.02;
  scene.add(grid);

  createBoiler();
  resizeScene();
  window.addEventListener("resize", resizeScene);
  renderer.domElement.addEventListener("click", selectIntersectedComponent);

  const observer = new ResizeObserver(resizeScene);
  observer.observe(container);

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
  el("scene-loading").remove();
}

function createMaterial(color, metalness = 0.48, roughness = 0.3) {
  return new THREE.MeshStandardMaterial({ color, metalness, roughness });
}

function createComponent(key, displayName, color) {
  const group = new THREE.Group();
  group.name = displayName;
  group.userData.componentKey = key;
  group.userData.displayName = displayName;
  scene.add(group);
  componentGroups.set(key, group);
  componentMaterials.set(key, createMaterial(color));
  return group;
}

function mesh(geometry, material, parent, position, rotation) {
  const object = new THREE.Mesh(geometry, material);
  object.position.set(...position);
  if (rotation) object.rotation.set(...rotation);
  object.castShadow = true;
  object.receiveShadow = true;
  parent.add(object);
  return object;
}

function cylinderBetween(parent, material, start, end, radius, segments = 20) {
  const from = new THREE.Vector3(...start);
  const to = new THREE.Vector3(...end);
  const direction = new THREE.Vector3().subVectors(to, from);
  const object = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, direction.length(), segments),
    material,
  );
  object.position.copy(from).add(to).multiplyScalar(0.5);
  object.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  object.castShadow = true;
  parent.add(object);
  return object;
}

function createBoiler() {
  const body = createComponent("boiler_body", "Corpo / tubulao", "#91a4b3");
  const burner = createComponent("burner", "Queimador", "#c47d43");
  const valve = createComponent("safety_valve", "Valvula de seguranca", "#d7b85b");
  const pump = createComponent("feed_pump", "Bomba de alimentacao", "#7396b5");

  mesh(bodyGeometry(), componentMaterials.get("boiler_body"), body, [0, 1.05, 0], [0, 0, Math.PI / 2]);
  const bandMaterial = createMaterial("#566a79", 0.7, 0.26);
  for (const x of [-1.25, 1.25]) {
    mesh(new THREE.TorusGeometry(0.69, 0.035, 10, 48), bandMaterial, body, [x, 1.05, 0], [0, Math.PI / 2, 0]);
  }
  for (const x of [-1.15, 1.15]) {
    mesh(new THREE.BoxGeometry(0.22, 0.62, 1.05), createMaterial("#52616d", 0.68, 0.36), body, [x, 0.38, 0]);
    mesh(new THREE.BoxGeometry(0.72, 0.08, 1.18), createMaterial("#71818d", 0.55, 0.38), body, [x, 0.08, 0]);
  }
  mesh(new THREE.TorusGeometry(0.3, 0.045, 12, 40), createMaterial("#536878", 0.72, 0.25), body, [0, 1.05, 0.71], [0, 0, 0]);
  mesh(new THREE.CircleGeometry(0.255, 40), createMaterial("#263744", 0.35, 0.35), body, [0, 1.05, 0.755]);

  mesh(new THREE.CylinderGeometry(0.36, 0.42, 0.72, 32), componentMaterials.get("burner"), burner, [-2.22, 1.05, 0], [0, 0, Math.PI / 2]);
  mesh(new THREE.CylinderGeometry(0.29, 0.29, 0.035, 32), createMaterial("#17232c", 0.18, 0.28), burner, [-2.6, 1.05, 0], [0, 0, Math.PI / 2]);
  mesh(new THREE.TorusGeometry(0.34, 0.045, 12, 32), createMaterial("#d08a50", 0.58, 0.26), burner, [-2.62, 1.05, 0], [0, Math.PI / 2, 0]);
  cylinderBetween(burner, componentMaterials.get("burner"), [-1.86, 1.05, 0], [-1.62, 1.05, 0], 0.12);

  cylinderBetween(valve, componentMaterials.get("safety_valve"), [0.65, 1.67, 0], [0.65, 2.02, 0], 0.12);
  mesh(new THREE.CylinderGeometry(0.27, 0.2, 0.17, 24), componentMaterials.get("safety_valve"), valve, [0.65, 2.08, 0]);
  mesh(new THREE.SphereGeometry(0.13, 20, 16), createMaterial("#ead17b", 0.52, 0.24), valve, [0.65, 2.22, 0]);
  mesh(new THREE.TorusGeometry(0.17, 0.025, 8, 28), createMaterial("#73633a", 0.6, 0.3), valve, [0.65, 1.82, 0], [Math.PI / 2, 0, 0]);

  mesh(new THREE.BoxGeometry(0.88, 0.16, 0.58), createMaterial("#536575", 0.62, 0.35), pump, [2.28, 0.13, 0]);
  mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.56, 32), componentMaterials.get("feed_pump"), pump, [2.28, 0.52, 0]);
  mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.17, 24), createMaterial("#9aabba", 0.65, 0.27), pump, [2.28, 0.89, 0]);
  mesh(new THREE.SphereGeometry(0.15, 24, 18), createMaterial("#607c94", 0.55, 0.32), pump, [2.28, 0.52, 0.3]);
  cylinderBetween(pump, componentMaterials.get("feed_pump"), [2.28, 0.78, 0], [2.28, 1.0, 0], 0.12);
  cylinderBetween(pump, componentMaterials.get("feed_pump"), [2.28, 0.6, -0.26], [2.28, 0.6, -0.48], 0.1);

  cylinderBetween(pump, createMaterial("#7d93a2", 0.6, 0.32), [2.28, 1.0, 0], [2.28, 1.32, 0], 0.075);
  cylinderBetween(body, createMaterial("#7d93a2", 0.6, 0.32), [2.28, 1.32, 0], [1.5, 1.32, 0], 0.075);
  cylinderBetween(body, createMaterial("#7d93a2", 0.6, 0.32), [1.5, 1.32, 0], [1.5, 1.48, 0], 0.075);
  cylinderBetween(body, createMaterial("#a6bac5", 0.56, 0.32), [0.65, 1.67, 0], [0.65, 1.46, 0], 0.055);
}

function bodyGeometry() {
  return new THREE.CylinderGeometry(0.72, 0.72, 3.9, 48, 1, false);
}

function resizeScene() {
  if (!renderer || !camera) return;
  const bounds = el("scene-container").getBoundingClientRect();
  if (!bounds.width || !bounds.height) return;
  renderer.setSize(bounds.width, bounds.height, false);
  camera.aspect = bounds.width / bounds.height;
  camera.updateProjectionMatrix();
}

function selectIntersectedComponent(event) {
  const bounds = renderer.domElement.getBoundingClientRect();
  const pointer = new THREE.Vector2(
    ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
    -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(pointer, camera);
  const intersections = raycaster.intersectObjects([...componentGroups.values()], true);
  const selected = intersections
    .map((hit) => {
      let object = hit.object;
      while (object && !object.userData.componentKey) object = object.parent;
      return object;
    })
    .find(Boolean);
  if (!selected) return;
  selectedComponent = selected.userData.componentKey;
  updateComponentDetails();
}

function connectWebSocket() {
  window.clearTimeout(reconnectTimer);
  socket = new WebSocket(WS_URL);
  socket.addEventListener("open", () => {
    setConnection(true, "Conectado");
    sendScenario(activeScenario);
  });
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.type === "telemetry") {
      renderTelemetry(message);
    } else if (message.type === "error") {
      setConnection(false, message.message);
    }
  });
  socket.addEventListener("close", () => {
    setConnection(false, "Reconectando...");
    reconnectTimer = window.setTimeout(connectWebSocket, 2000);
  });
  socket.addEventListener("error", () => socket.close());
}

function setConnection(connected, label) {
  el("connection-dot").classList.toggle("connected", connected);
  el("connection-label").textContent = label;
}

function sendScenario(scenario) {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: "scenario", scenario }));
  }
}

function setupScenarioButtons() {
  document.querySelectorAll(".scenario-button").forEach((button) => {
    button.addEventListener("click", () => {
      const { scenario } = button.dataset;
      if (!SCENARIOS.includes(scenario)) return;
      activeScenario = scenario;
      document.querySelectorAll(".scenario-button").forEach((item) => {
        item.classList.toggle("active", item === button);
      });
      sendScenario(scenario);
    });
  });
}

function renderTelemetry(message) {
  latestReadings = message.readings;
  latestDiagnosis = message.diagnosis;
  updateReadingValues(message.readings);
  updateDiagnosis(message.diagnosis);
  updateComponentColors(message.diagnosis.component_statuses);
  history.push(message.readings);
  if (history.length > MAX_HISTORY) history.shift();
  drawChart();
  updateComponentDetails();
  updateAlerts(message);
  document.querySelectorAll(".scenario-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.scenario === message.scenario);
  });
}

function updateReadingValues(readings) {
  el("reading-pressure").textContent = numberFormat(readings.pressure_bar);
  el("reading-temperature").textContent = numberFormat(readings.gas_temperature_c, 0);
  el("reading-water").textContent = numberFormat(readings.water_level_pct, 0);
  el("reading-flow").textContent = numberFormat(readings.pump_flow_m3h);
  el("reading-vibration").textContent = numberFormat(readings.pump_vibration_mms);
}

function updateDiagnosis(diagnosis) {
  const statusLabels = { normal: "NORMAL", attention: "ATENCAO", critical: "CRITICO" };
  el("anomaly-value").textContent = diagnosis.anomaly_index;
  el("anomaly-status").textContent = statusLabels[diagnosis.status] ?? "NORMAL";
  el("anomaly-status").className = `anomaly-status status-${diagnosis.status}`;
  el("meter-fill").style.width = `${diagnosis.anomaly_index}%`;
  el("meter-fill").dataset.status = diagnosis.status;
}

function updateComponentColors(statuses = {}) {
  const colors = { normal: "#35c78a", attention: "#f2b84b", critical: "#f2646e" };
  for (const [key, material] of componentMaterials) {
    const status = statuses[key] ?? "normal";
    material.color.set(colors[status] ?? colors.normal);
    material.emissive.set(colors[status] === colors.normal ? "#000000" : colors[status]);
    material.emissiveIntensity = status === "normal" ? 0 : 0.16;
  }
}

function updateComponentDetails() {
  if (!selectedComponent) return;
  const component = COMPONENTS[selectedComponent];
  if (!component) return;
  const status = latestDiagnosis?.component_statuses?.[selectedComponent] ?? "normal";
  const statusLabels = { normal: "NORMAL", attention: "ATENCAO", critical: "CRITICO" };
  el("detail-name").textContent = component.name;
  el("detail-status").textContent = statusLabels[status];
  el("detail-status").className = `detail-status status-${status}`;
  if (!latestReadings) {
    el("detail-reading").textContent = "Aguardando leituras...";
    return;
  }
  el("detail-reading").textContent = component.readings
    .map((key) => `${READING_LABELS[key][0]}: ${numberFormat(latestReadings[key])} ${READING_LABELS[key][1]}`)
    .join("  ·  ");
}

function updateAlerts(message) {
  const diagnosis = message.diagnosis;
  if (diagnosis.status === "normal" || !diagnosis.affected_component) {
    lastAlertKey = "";
    return;
  }
  const key = `${diagnosis.status}:${diagnosis.affected_component}`;
  if (key === lastAlertKey) return;
  lastAlertKey = key;
  const list = el("alert-list");
  const empty = list.querySelector(".empty-alert");
  if (empty) empty.remove();
  const alert = document.createElement("article");
  alert.className = `alert-item alert-${diagnosis.status}`;
  const time = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    .format(new Date(message.timestamp));
  const componentName = COMPONENTS[diagnosis.affected_component]?.name ?? "Componente";
  const explanation = diagnosis.explanations.join(" ");
  alert.innerHTML = `<span class="alert-mark">${diagnosis.status === "critical" ? "!" : "△"}</span><div class="alert-content"><div class="alert-title-row"><strong>${diagnosis.status === "critical" ? "Anomalia critica" : "Desvio detectado"}</strong><time>${time}</time></div><span class="alert-component">${componentName}</span><p></p></div>`;
  alert.querySelector("p").textContent = explanation;
  list.prepend(alert);
  while (list.children.length > 5) list.lastElementChild.remove();
  el("alert-count").textContent = String(list.querySelectorAll(".alert-item").length);
}

function drawChart() {
  const canvas = el("history-chart");
  const bounds = canvas.getBoundingClientRect();
  if (!bounds.width || !bounds.height) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(bounds.width * ratio);
  canvas.height = Math.floor(bounds.height * ratio);
  const context = canvas.getContext("2d");
  context.scale(ratio, ratio);
  const width = bounds.width;
  const height = bounds.height;
  const padding = { top: 10, right: 8, bottom: 12, left: 8 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  context.clearRect(0, 0, width, height);
  context.strokeStyle = "rgba(151, 170, 190, 0.11)";
  context.lineWidth = 1;
  for (let index = 0; index < 4; index += 1) {
    const y = padding.top + (plotHeight * index) / 3;
    context.beginPath();
    context.moveTo(padding.left, y);
    context.lineTo(width - padding.right, y);
    context.stroke();
  }
  for (const series of SERIES) {
    context.beginPath();
    context.strokeStyle = series.color;
    context.lineWidth = 1.8;
    context.lineJoin = "round";
    history.forEach((point, index) => {
      const x = padding.left + (index / Math.max(MAX_HISTORY - 1, 1)) * plotWidth;
      const normalized = THREE.MathUtils.clamp((point[series.key] - series.min) / (series.max - series.min), 0, 1);
      const y = padding.top + (1 - normalized) * plotHeight;
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });
    context.stroke();
  }
  el("chart-empty").classList.toggle("hidden", history.length > 0);
}

function start() {
  setupScene();
  setupScenarioButtons();
  connectWebSocket();
  window.addEventListener("beforeunload", () => {
    window.clearTimeout(reconnectTimer);
    socket?.close();
    renderer?.dispose();
  });
}

start();
