// VN-F04: a traditional illustrated visual novel. No touching, dragging or sorting scenery.
import { DAY01, DAY01_SCRIPTS, day01Debrief } from "./day01.mjs";
import { createState, currentIncident, choose, recover, advance, sceneView, validatePlayable } from "./engine.mjs";

const $ = id => document.getElementById(id);
const node = (tag, className, content = "") => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (content) element.textContent = content;
  return element;
};
const SPRITES = {
  relieved: "/assets/cuc-yen/sprites/delighted.webp",
  unsure: "/assets/cuc-yen/sprites/shy.webp",
  worried: "/assets/cuc-yen/sprites/surprised.webp",
  repaired: "/assets/cuc-yen/sprites/happy.webp"
};
const chapterById = Object.fromEntries(DAY01.map(item => [item.id, item]));
let catalog = null;
let state = null;

function chapter() {
  const current = currentIncident(catalog, state);
  const entry = current && chapterById[current.id];
  if (!entry) throw new Error("Chưa có nội dung chơi cho " + (current?.id ?? "ngày tiếp theo"));
  return entry;
}

function start() {
  state = createState(catalog);
  $("debrief").hidden = true;
  $("game").hidden = false;
  $("loading").hidden = true;
  render();
  $("incident-title").focus({ preventScroll: true });
}

function incidentVisuals(entry) {
  const scene = sceneView(catalog, DAY01_SCRIPTS, state);
  const decided = state.phase === "resolve";
  const choice = decided ? entry.choices.find(item => item.id === state.pending.choiceId) : null;
  const recovered = decided && state.pending.recovered;
  const risk = recovered ? "safe" : choice?.risk ?? "";
  const outcome = recovered ? "recovered" : choice?.id ?? "";
  const camera = scene.shot.camera || { scale: 1, position: "center" };

  const world = $("world");
  world.dataset.incident = entry.id;
  world.dataset.phase = decided ? "resolution" : "establishing";
  world.dataset.outcome = outcome;
  world.dataset.risk = risk;
  world.dataset.time = entry.sceneTheme;
  world.setAttribute("aria-label", scene.shot.alt + (decided ? ". " + state.pending.reaction.line : ". " + entry.cue));

  const backdrop = $("backdrop");
  backdrop.src = scene.shot.backdrop;
  backdrop.alt = ""; // semantic description is on the scene container
  backdrop.style.objectPosition = camera.position;
  backdrop.style.transform = "scale(" + camera.scale + ")";

  const illustration = $("illustrations");
  illustration.replaceChildren();
  for (const prop of entry.assets) {
    const image = node("img", "painted-layer " + prop.id);
    image.style.setProperty("--x", prop.x + "%");
    image.style.setProperty("--y", prop.y + "%");
    image.style.setProperty("--size", prop.width + "%");
    image.alt = "";
    image.loading = "eager";
    image.src = prop.id === "actor" && decided
      ? recovered ? SPRITES.repaired
        : choice.risk === "safe" ? SPRITES.relieved
        : choice.risk === "hazard" ? SPRITES.worried
        : SPRITES.unsure
      : prop.src;
    illustration.append(image);
  }

  // A single brief clue on the painting; the decisions stay in the lower half.
  const evidence = $("scene-evidence");
  evidence.replaceChildren();
  if (entry.id === "D01-01") {
    const order = outcome === "priority" ? "02 · 01 · 03" :
      decided ? "01 · 02 · 03" : "03 · 01 · 02";
    evidence.textContent = decided
      ? outcome === "priority" ? "Người đến sau được phục vụ trước · " + order :
        outcome === "explain" ? "Khách đã được thông báo · " + order :
        "Khách vẫn đang chờ thông tin · " + order
      : "Phiếu in bị lẫn thứ tự · " + order;
  } else if (entry.id === "D01-02") {
    evidence.textContent = outcome === "clean" || outcome === "recovered" ? "Sàn đã lau khô" :
      outcome === "later" ? "Đã chặn lối · sàn còn ướt" :
      outcome === "open" ? "Sàn trơn · chưa có cảnh báo" : "Sàn ướt · khách đang đến gần";
  } else {
    evidence.textContent = outcome === "refund" ?
      "Trà đào 25.000đ · Tổng 41.000đ · Đã hoàn 10.000đ" :
      "Menu 25.000đ · hóa đơn 35.000đ · Tổng 51.000đ";
  }

  const feedback = $("character-reaction");
  feedback.textContent = decided ? recovered ? "ĐÃ KHẮC PHỤC" :
    choice.risk === "hazard" ? "NGUY CƠ CHƯA ĐƯỢC XỬ LÝ" :
    choice.risk === "safe" ? "ĐÃ GIẢI QUYẾT" : "CẦN THEO DÕI" : "";

  $("world-alt").textContent = decided ? scene.shot.alt + ". " + state.pending.reason : scene.shot.alt;
}

function drawChoices(entry) {
  const choices = $("choices");
  choices.replaceChildren();
  choices.hidden = state.phase !== "observe";
  if (state.phase !== "observe") return;
  for (const [index, option] of entry.choices.entries()) {
    const button = node("button", "day-choice");
    button.type = "button";
    button.dataset.choice = option.id;
    button.append(node("span", "choice-index", String(index + 1).padStart(2, "0")),
      node("span", "choice-text", option.label));
    button.addEventListener("click", () => {
      if (state.phase !== "observe") return;
      state = choose(catalog, DAY01_SCRIPTS, state, option.id);
      render();
      $("continue").focus({ preventScroll: true });
    });
    choices.append(button);
  }
}

function render() {
  if (state.dayIndex !== 0) {
    showDebrief();
    return;
  }
  const entry = chapter();
  const decided = state.phase === "resolve";
  $("story").dataset.state = decided ? "resolve" : "observe";
  $("actions").hidden = !decided;
  $("scene-number").textContent = "Ngày 1 · " + entry.slot + " · " + entry.time + " (" + (state.incidentIndex + 1) + "/3)";
  $("incident-title").textContent = entry.title;
  $("speaker").textContent = decided ? state.pending.reaction.speaker : entry.speaker;
  $("dialogue").textContent = decided ? state.pending.reaction.line : entry.cue;
  $("prompt").textContent = decided ? "Chuyện tiếp theo?" : entry.question;
  $("notice").hidden = !decided;
  $("notice").textContent = decided ?
    state.pending.recovered ? "Quán đã thực hiện hành động khắc phục." : state.pending.reason : "";
  $("result").hidden = !decided;
  $("recover").hidden = !decided || !state.pending.recovery || state.pending.recovered;
  $("continue").hidden = !decided;
  $("continue").textContent = state.incidentIndex === 2 ? "Kết sổ Ngày 1" : "Tiếp tục ca sau";
  $("reason").textContent = decided ? state.pending.reason : "";
  incidentVisuals(entry);
  drawChoices(entry);
}

function showDebrief() {
  $("game").hidden = true;
  $("debrief").hidden = false;
  const list = $("debrief-list");
  list.replaceChildren();
  for (const summary of day01Debrief(state.flags)) list.append(node("li", "", summary));
  $("tomorrow").textContent =
    state.flags.spillResolved && state.flags.billCorrected && state.flags.queueExplained ?
      "Quán đã có nền tảng tốt hơn cho Ngày 2. Mưa đầu mùa vẫn có những chuyện mới." :
      "Ngày 2: Mưa đầu mùa. Quán cần kiểm tra những việc còn dang dở trước khi mở cửa.";
  $("debrief-title").focus({ preventScroll: true });
}

$("continue").addEventListener("click", () => {
  if (state.phase !== "resolve") return;
  state = advance(catalog, state);
  if (state.dayIndex !== 0) showDebrief();
  else {
    render();
    $("incident-title").focus({ preventScroll: true });
  }
});
$("recover").addEventListener("click", () => {
  if (state.phase !== "resolve" || !state.pending.recovery || state.pending.recovered) return;
  state = recover(catalog, DAY01_SCRIPTS, state);
  render();
  $("continue").focus({ preventScroll: true });
});
$("restart").addEventListener("click", start);
$("play-again").addEventListener("click", start);

try {
  const response = await fetch("../../docs/visual-novel/episodes.json", { cache: "no-store" });
  if (!response.ok) throw new Error("Không tải được danh mục câu chuyện");
  catalog = await response.json();
  validatePlayable(catalog, DAY01_SCRIPTS, { requireAll: false });
  start();
} catch (error) {
  $("loading").replaceChildren(node("strong", "", "Không mở được Ngày 1: " + error.message));
  const link = node("a", "", "Quay về Một Ca Không Yên");
  link.href = "../";
  $("loading").append(link);
}
