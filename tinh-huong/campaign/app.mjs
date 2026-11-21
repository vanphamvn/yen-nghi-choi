// VN-F04: a traditional illustrated visual novel. No touching, dragging or sorting scenery.
import { DAY01, DAY01_SCRIPTS, day01Debrief } from "./day01.mjs";
import { getSceneComposition, projectContact, VISUAL_ASSET_DIMENSIONS } from "./scene-composition.mjs";
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
  // Do not zoom the painted floor under contact-anchored characters after a choice.
  backdrop.style.transform = "scale(1)";

  const composition=getSceneComposition(entry.id,outcome);
  world.setAttribute("aria-label",composition.description + (decided ? ". " + state.pending.reaction.line : ". " + entry.cue));
  const illustration=$("illustrations");
  illustration.replaceChildren();
  for(const prop of composition.layers){
    const sheet=prop.kind==="sheet";
    const element=node(sheet?"div":"img","scene-sprite scene-sprite--"+prop.role+
      (prop.id===composition.focusId?" is-focus":""));
    element.dataset.spriteId=prop.id;
    element.dataset.role=prop.role;
    element.dataset.surface=prop.surface;
    element.dataset.depth=String(prop.depth);
    element.dataset.asset=prop.asset;
    if(prop.state)element.dataset.state=prop.state;
    element.style.setProperty("--sprite-x",prop.contact.x+"%");
    element.style.setProperty("--sprite-width",prop.size+"%");
    element.style.setProperty("--sprite-foot","-"+prop.footOffset+"%");
    element.style.setProperty("--sprite-rotation",prop.rotation+"deg");
    element.style.zIndex=String(prop.depth);
    if(prop.tint)element.dataset.tint=prop.tint;
    if(sheet){
      // A 4×4 PNG sheet: display ONE 256×320 painted actor frame.
      element.classList.add("scene-sprite-sheet");
      element.style.backgroundImage='url("'+prop.src+'")';
      element.style.backgroundPosition=(prop.frame%4)*100/3+"% "+Math.floor(prop.frame/4)*100/3+"%";
      element.style.backgroundSize="400% 400%";
      element.setAttribute("aria-hidden","true");
    }else{
      element.src=prop.role==="mascot"&&decided?
        recovered?SPRITES.repaired:
          choice.risk==="safe"?SPRITES.relieved:
          choice.risk==="hazard"?SPRITES.worried:SPRITES.unsure
        :prop.src;
      element.alt="";
      const [sourceWidth,sourceHeight]=VISUAL_ASSET_DIMENSIONS[prop.asset];
      element.width=sourceWidth;
      element.height=sourceHeight;
      element.loading="eager";
      element.decoding="async";
    }
    illustration.append(element);
  }
  // Surface-attached props are projected to the counter's actual top edge.
  // The floor-contact points are not element centers.
  const positionSprites=()=>{
    const rect=world.getBoundingClientRect();
    if(rect.width<1||rect.height<1)return;
    for(const prop of composition.layers){
      const el=[...illustration.children].find(child=>child.dataset.spriteId===prop.id);
      if(!el)continue;
      const point=projectContact(prop,composition,rect.width,rect.height);
      el.style.left=point.x+"px";
      el.style.top=point.y+"px";
    }
  };
  positionSprites();
  requestAnimationFrame(positionSprites);

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
window.addEventListener("resize",()=>{
  if(!catalog||!state||state.dayIndex!==0)return;
  // Reproject staff feet, floor props and the countertop after an orientation change.
  incidentVisuals(chapter());
},{passive:true});

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
