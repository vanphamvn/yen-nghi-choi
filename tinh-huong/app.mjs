import { SCENARIOS, STARTING_STATS, DIMENSIONS, applyEffects, getEnding, validateStory } from "./story.mjs";

const byId = (id) => document.getElementById(id);
const selector = byId("selector");
const playing = byId("playing");
const ending = byId("ending");
const scene = document.querySelector(".scene");

let current = null;
let stats = { ...STARTING_STATS };
let beatIndex = 0;
let phase = "select";
let history = [];
let nextHook = "";

function setScene(place, time, note, sceneId = "") {
  scene.dataset.case = sceneId;
  byId("scene-place").textContent = place;
  byId("scene-time").textContent = time;
  byId("scene-note").textContent = note;
}

function focusHeading(id) {
  const heading = byId(id);
  heading.focus({ preventScroll: true });
  if (window.matchMedia("(max-width: 767px)").matches) {
    heading.scrollIntoView({ behavior: "auto", block: "start" });
  }
}

function renderStats() {
  for (const { key } of DIMENSIONS) {
    const progress = byId("stat-" + key);
    const status = byId("word-" + key);
    const value = stats[key];
    progress.value = value;
    const level = value < 45 ? "low" : value < 70 ? "medium" : "high";
    progress.dataset.level = level;
    status.textContent = level === "low" ? "Đang khó" : level === "medium" ? "Cần chú ý" : "Ổn định";
  }
}

function renderScenarioList() {
  const list = byId("scenario-list");
  list.replaceChildren();
  for (const item of SCENARIOS) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "scenario-button";
    button.dataset.scenario = item.id;

    const number = document.createElement("span");
    number.className = "scenario-no";
    number.textContent = item.number;
    const copy = document.createElement("span");
    const title = document.createElement("strong");
    title.className = "scenario-name";
    title.textContent = item.title;
    const description = document.createElement("span");
    description.className = "scenario-desc";
    description.textContent = item.description;
    copy.append(title, description);
    const arrow = document.createElement("span");
    arrow.className = "scenario-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "→";
    button.append(number, copy, arrow);
    button.addEventListener("click", () => startScenario(item.id));
    list.append(button);
  }
}

function showView(target) {
  selector.hidden = target !== "select";
  playing.hidden = target !== "playing";
  ending.hidden = target !== "ending";
}

function startScenario(id) {
  const selected = SCENARIOS.find((scenario) => scenario.id === id);
  if (!selected) return;
  current = selected;
  stats = { ...STARTING_STATS };
  beatIndex = 0;
  phase = "choice";
  history = [];
  nextHook = "";
  showView("playing");
  renderStats();
  renderBeat();
}

function renderBeat() {
  if (!current || beatIndex >= current.beats.length) return;
  phase = "choice";
  scene.dataset.phase = "choice";
  const beat = current.beats[beatIndex];
  byId("chapter-number").textContent = "HỒI " + (beatIndex + 1) + " / " + current.beats.length;
  byId("chapter-title").textContent = current.title;
  const beatTokens = document.querySelectorAll(".beats span");
  for (let i = 0; i < beatTokens.length; i++) {
    beatTokens[i].className = i < beatIndex ? "is-done" : i === beatIndex ? "is-active" : "";
    beatTokens[i].setAttribute("aria-label", "Hồi " + (i + 1) + (i < beatIndex ? " đã qua" : i === beatIndex ? " đang chơi" : " sắp tới"));
  }

  setScene(current.place, beat.time + " · " + current.weather, current.description, current.id);
  byId("speaker").textContent = beat.speaker;
  byId("dialogue-line").textContent = nextHook ? nextHook + "\n\n" + beat.line : beat.line;
  nextHook = "";
  byId("decision-question").textContent = beat.question;
  byId("consequence").hidden = true;
  const choices = byId("choices");
  choices.hidden = false;
  choices.replaceChildren();
  for (const [index, choice] of beat.choices.entries()) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice";
    const number = document.createElement("kbd");
    number.textContent = String(index + 1);
    number.setAttribute("aria-hidden", "true");
    const label = document.createElement("span");
    label.textContent = choice.text;
    button.append(number, label);
    button.addEventListener("click", () => choose(index));
    choices.append(button);
  }
  focusHeading("chapter-title");
}

function choose(index) {
  if (phase !== "choice" || !current) return;
  const beat = current.beats[beatIndex];
  const choice = beat.choices[index];
  if (!choice) return;
  phase = "response";
  scene.dataset.phase = "response";
  stats = applyEffects(stats, choice.effect);
  history.push({ time: beat.time, prompt: beat.question, chosen: choice.text, reason: choice.reason });
  nextHook = choice.followUp || "";
  renderStats();

  byId("speaker").textContent = choice.replySpeaker;
  byId("dialogue-line").textContent = choice.reply;
  byId("decision-question").textContent = "Hệ quả của lựa chọn";
  byId("choices").hidden = true;
  byId("reason").textContent = choice.reason;

  const effects = Object.entries(choice.effect)
    .filter(([, amount]) => amount !== 0)
    .map(([key, amount]) => {
      const item = DIMENSIONS.find((dimension) => dimension.key === key);
      const label = item ? item.label : key;
      return label + " " + (amount > 0 ? "+" : "−") + Math.abs(amount);
    });
  byId("impact").textContent = effects.join(" · ");
  byId("consequence").hidden = false;
  byId("continue").textContent = beatIndex === current.beats.length - 1 ? "Xem kết quả ca trực" : "Tiếp tục câu chuyện";
  if (window.matchMedia("(max-width: 767px)").matches) {
    byId("dialogue").scrollIntoView({ behavior: "auto", block: "start" });
  }
  byId("continue").focus({ preventScroll: true });
}

function next() {
  if (phase !== "response") return;
  beatIndex++;
  if (beatIndex >= current.beats.length) {
    renderEnding();
  } else {
    renderBeat();
  }
}

function renderEnding() {
  phase = "end";
  showView("ending");
  scene.dataset.phase = "ending";
  setScene("Hết ca trực", "TỔNG KẾT", "Bạn đã quyết định xong. Thử một cách khác cũng được.", current.id);
  const result = getEnding(stats, current);
  byId("ending-title").textContent = result.headline;
  byId("ending-lead").textContent = "Kết quả của ca: " + current.title;
  byId("ending-summary").textContent = result.summary;
  byId("lesson").textContent = current.lesson;
  const list = byId("history-list");
  list.replaceChildren();
  for (const step of history) {
    const li = document.createElement("li");
    const strong = document.createElement("strong");
    strong.textContent = step.time + ": " + step.chosen;
    const explanation = document.createElement("p");
    explanation.textContent = step.reason;
    li.append(strong, explanation);
    list.append(li);
  }
  document.querySelector(".history").open = false;
  focusHeading("ending-title");
}

function backToPicker() {
  phase = "select";
  current = null;
  history = [];
  nextHook = "";
  scene.dataset.phase = "select";
  showView("select");
  setScene("Quán Yên Coffee & Tea", "MỘT NGÀY Ở YÊN", "Cục Yên chỉ quan sát. Quyết định là của bạn.");
  focusHeading("selector-title");
}

byId("continue").addEventListener("click", next);
byId("leave").addEventListener("click", backToPicker);
byId("back-to-cases").addEventListener("click", backToPicker);
byId("replay").addEventListener("click", () => current && startScenario(current.id));

document.addEventListener("keydown", (event) => {
  if (phase !== "choice" || event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
  const index = Number(event.key) - 1;
  if (Number.isInteger(index) && index >= 0 && index < 3) {
    event.preventDefault();
    choose(index);
  }
});

try {
  validateStory();
  renderScenarioList();
} catch (error) {
  byId("scenario-list").textContent = "Chưa mở được sổ ca trực. Vui lòng thử tải lại trang.";
  console.error("Visual novel script invalid", error);
}
