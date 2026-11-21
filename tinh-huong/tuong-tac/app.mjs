import { SCENES, createInteraction, getScene, updateInteraction, visualState } from "../interactions/mechanics.mjs";

const el = (id) => document.getElementById(id);
const modeList = el("mode-list");
const targets = el("targets");
const world = el("world");
let current = createInteraction(SCENES[0].id);

function node(tag, className, text = "") {
  const element = document.createElement(tag);
  element.className = className;
  if (text) element.textContent = text;
  return element;
}

function renderModes() {
  modeList.replaceChildren();
  for (const [index, scene] of SCENES.entries()) {
    const button = node("button", "mode", String(index + 1).padStart(2, "0") + " · " + scene.title);
    button.type = "button";
    button.dataset.demo = scene.id;
    button.setAttribute("aria-pressed", String(current.id === scene.id));
    button.addEventListener("click", () => openScene(scene.id));
    modeList.append(button);
  }
}

function sceneItem(item, scene, state) {
  const button = node("button", "scene-item item-" + item.kind);
  button.type = "button";
  button.dataset.item = item.id;
  button.style.setProperty("--x", item.x + "%");
  button.style.setProperty("--y", item.y + "%");
  button.setAttribute("aria-label", item.label);
  button.setAttribute("aria-pressed", String(Boolean(item.selected || item.marked || item.corrected || item.placed)));
  if (item.selected) button.classList.add("is-selected");
  if (item.marked) button.classList.add("is-marked");
  if (item.corrected) button.classList.add("is-corrected");
  if (item.placed) button.classList.add("is-placed");
  if (state.completed) button.disabled = true;

  if (item.src) {
    const img = document.createElement("img");
    img.src = item.src;
    img.alt = "";
    img.loading = "eager";
    button.append(img);
    button.append(node("span", "painted-label", item.label));
  } else if (item.kind === "ticket") {
    button.append(node("span", "ticket-number", "PHIẾU " + item.id));
    button.append(node("span", "ticket-description", item.label.split(" · ")[1]));
  } else if (item.kind === "receipt") {
    button.append(node("span", "receipt-text", item.label));
  } else if (item.kind === "sign") {
    button.append(node("span", "sign-symbol", "!"));
    button.append(node("span", "sign-text", "BIỂN CẢNH BÁO"));
  } else if (item.kind === "spill") {
    button.append(node("span", "hazard-symbol", "!"));
    button.append(node("span", "hazard-text", item.marked ? "ĐÃ KHOANH VÙNG" : "SÀN TRƠN"));
  } else if (item.kind === "dry") {
    button.append(node("span", "ground-text", "LỐI KHÔ"));
  } else if (item.kind === "target") {
    button.append(node("span", "target-text", scene.kind === "place" ? "KHAY NHẬN LY" : "GÓC TRỐNG"));
  }

  button.addEventListener("click", () => {
    const before = current;
    const restoreFocus = document.activeElement === button;
    current = updateInteraction(current, { type: "activate", id: item.id });
    // A no-op stays no-op even on repeated taps and after completion.
    if (before === current) return;
    render();
    const replacement = [...targets.querySelectorAll("[data-item]")].find(b => b.dataset.item === item.id);
    if (replacement && !replacement.disabled && restoreFocus) {
      replacement.focus({ preventScroll: true });
    }
  });
  return button;
}

function render() {
  const scene = getScene(current.id);
  const visuals = visualState(scene, current);
  world.dataset.kind = scene.kind;
  world.dataset.phase = visuals.phase;
  el("scene-number").textContent = String(SCENES.indexOf(scene) + 1).padStart(2, "0") + " / " + SCENES.length;
  el("scene-status").textContent = current.completed ? "ĐÃ XỬ LÝ" : current.selected ? "ĐANG THAO TÁC" : "ĐANG QUAN SÁT";
  el("scene-incident").textContent = "CẢNH THỬ · " + scene.incident;
  el("scene-title").textContent = scene.title;
  el("scene-actors").textContent = scene.actors;
  el("scene-prompt").textContent = scene.prompt;
  el("scene-goal").textContent = scene.goal;
  el("status").textContent = current.message;
  el("result").hidden = !current.completed;
  el("outcome").textContent = current.outcome;
  el("next").hidden = !current.completed;
  el("scene-reaction").textContent = current.completed ? "Đã có chuyển biến trong quán" : "";
  el("world-alt").textContent = current.completed ? scene.evidence : "Chạm vào vật hoặc vị trí trên cảnh. " + scene.goal;
  targets.replaceChildren();
  for (const item of visuals.items) targets.append(sceneItem(item, scene, current));
  for (const button of modeList.children) {
    button.setAttribute("aria-pressed", String(button.dataset.demo === current.id));
  }
}

function openScene(id) {
  current = createInteraction(id);
  render();
  el("scene-title").focus({ preventScroll: true });
}
el("reset").addEventListener("click", () => openScene(current.id));
el("next").addEventListener("click", () => {
  const nextIndex = (SCENES.findIndex(item => item.id === current.id) + 1) % SCENES.length;
  openScene(SCENES[nextIndex].id);
});
renderModes();
render();
