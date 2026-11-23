// VN-F04: a traditional illustrated visual novel. No touching, dragging or sorting scenery.
import { DAY01, DAY01_SCRIPTS, day01Debrief } from "./day01.mjs";
import { getSceneComposition, projectContact, VISUAL_ASSET_DIMENSIONS } from "./scene-composition.mjs";
import { createState, currentIncident, choose, recover, advance, sceneView, validatePlayable } from "./engine.mjs";
import { shopProgress } from "./progression.mjs";

const $ = id => document.getElementById(id);
const node = (tag, className, content = "") => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (content) element.textContent = content;
  return element;
};
// Native WebKit click can be lost when a touch triggers :hover before the
// button moves out from under the finger. A touch pointer-up activates the
// button immediately; a subsequent synthetic click is suppressed. Mouse,
// keyboard and assistive-technology clicks continue through the click handler.
// Do not rely on a synthesized click after a WebKit toolbar resize.
// A short, single-finger touch gesture can still complete if a pointer
// sequence is cancelled by a view reflow; mouse/keyboard keep native click.
function reportGameInputError(error){
  console.error("Không xử lý được lượt chơi",error);
  const message=$("interaction-error");
  if(message){
    message.textContent="Lượt chơi chưa thực hiện được. Vui lòng thử lại.";
    message.hidden=false;
  }
}
function bindGamePress(button,action){
  let activePointer=null;
  let activeTouch=null;
  let lastTouchActivation=-Infinity;
  const invoke=()=>{
    try{action()}catch(error){reportGameInputError(error)}
  };
  const activateTouch=event=>{
    if(button.disabled||button.hidden)return;
    if(performance.now()-lastTouchActivation<350)return;
    lastTouchActivation=performance.now();
    event.preventDefault();
    invoke();
  };
  button.addEventListener("touchstart",event=>{
    if(event.touches.length!==1)return;
    const touch=event.changedTouches[0];
    activeTouch={
      id:touch.identifier,x:touch.clientX,y:touch.clientY,
      time:performance.now()
    };
  },{passive:true});
  button.addEventListener("touchcancel",()=>{activeTouch=null},{passive:true});
  button.addEventListener("touchend",event=>{
    if(!activeTouch)return;
    const touch=[...event.changedTouches].find(t=>t.identifier===activeTouch.id);
    if(!touch)return;
    const initial=activeTouch;
    activeTouch=null;
    const dx=touch.clientX-initial.x,dy=touch.clientY-initial.y;
    // A drag/scroll is not a game decision.
    if(dx*dx+dy*dy>24*24||performance.now()-initial.time>850)return;
    activateTouch(event);
  },{passive:false});
  button.addEventListener("pointerdown",event=>{
    if(event.isPrimary&&["touch","pen"].includes(event.pointerType))
      activePointer=event.pointerId;
  },{passive:true});
  button.addEventListener("pointercancel",event=>{
    if(activePointer===event.pointerId)activePointer=null;
  },{passive:true});
  button.addEventListener("pointerup",event=>{
    if(activePointer!==event.pointerId||!["touch","pen"].includes(event.pointerType))return;
    activePointer=null;
    const rect=button.getBoundingClientRect();
    if(event.clientX<rect.left||event.clientX>rect.right||
       event.clientY<rect.top||event.clientY>rect.bottom)return;
    activateTouch(event);
  });
  button.addEventListener("click",event=>{
    if(performance.now()-lastTouchActivation<650){
      event.preventDefault();
      return;
    }
    if(!button.disabled&&!button.hidden)invoke();
  });
}

const SPRITES = {
  relieved: "/assets/cuc-yen/sprites/delighted.webp",
  unsure: "/assets/cuc-yen/sprites/shy.webp",
  worried: "/assets/cuc-yen/sprites/surprised.webp",
  repaired: "/assets/cuc-yen/sprites/happy.webp"
};
const chapterById = Object.fromEntries(DAY01.map(item => [item.id, item]));
let catalog = null;
let state = null;
let repositionSprites=()=>{};
let resizeFrame=0;

// The first game paint is not proof the browser's touch viewport is stable.
// Keep choices undisplayed until event handlers and the first layout are ready.
function revealChoicesWhenReady(){
  if(document.documentElement.dataset.inputReady==="true")return;
  let stableFrames=0;
  let previousWidth=window.visualViewport?.width??innerWidth;
  let previousHeight=window.visualViewport?.height??innerHeight;
  const began=performance.now();
  function tick(){
    const width=window.visualViewport?.width??innerWidth;
    const height=window.visualViewport?.height??innerHeight;
    const story=$("story").getBoundingClientRect();
    const stable=story.height>0&&Math.abs(width-previousWidth)<1&&
      Math.abs(height-previousHeight)<1;
    stableFrames=stable?stableFrames+1:0;
    previousWidth=width;previousHeight=height;
    // Set a hard ceiling so a noisy in-app webview cannot keep the game locked.
    if(stableFrames>=6||performance.now()-began>1500){
      document.documentElement.dataset.inputReady="true";
      $("controls-loading").hidden=true;
      return;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}


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
  revealChoicesWhenReady();
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
  repositionSprites=positionSprites;
  positionSprites();
  requestAnimationFrame(positionSprites);

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
    bindGamePress(button, () => {
      if(state.phase!=="observe")return;
      state=choose(catalog,DAY01_SCRIPTS,state,option.id);
      render();
      $("continue").focus({preventScroll:true});
    });
    choices.append(button);
  }
}

function drawShopLevel(panel,{daySummary=false}={}){
  const progress=shopProgress(state.history);
  const get=key=>panel.querySelector('[data-level="'+key+'"]');
  get("number").textContent="Cấp "+progress.level;
  get("title").textContent=progress.title;
  const earned=get("earned");
  earned.hidden=!daySummary&&state.phase!=="resolve";
  earned.textContent=daySummary?"Ngày 1 · +"+progress.xp+" XP":"Ca này +"+progress.latest+" XP";
  const meter=get("meter");
  meter.max=progress.threshold||1;
  meter.value=progress.threshold?progress.earned:1;
  meter.setAttribute("aria-valuetext",progress.nextLevel?
    progress.earned+" trên "+progress.threshold+" XP lên cấp "+progress.nextLevel:
    "Đã đạt cấp cao nhất");
  get("xp").textContent=progress.nextLevel?
    progress.earned+"/"+progress.threshold+" XP":progress.xp+" XP";
  get("next").textContent=progress.nextLevel?
    "Còn "+progress.remaining+" XP · "+progress.nextTitle:"Danh hiệu cao nhất";
  panel.dataset.level=String(progress.level);
  panel.dataset.levelUp=progress.justLeveled&&state.phase==="resolve"?"true":"false";
}

function render() {
  $("interaction-error").hidden=true;
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
  // Choices have the whole lower half. XP is a post-decision reward, not an overlay.
  $("level-panel").hidden = !decided;
  drawShopLevel($("level-panel"));
}

function showDebrief() {
  $("game").hidden = true;
  $("debrief").hidden = false;
  const list = $("debrief-list");
  list.replaceChildren();
  for (const summary of day01Debrief(state.flags)) list.append(node("li", "", summary));
  drawShopLevel($("day-level"),{daySummary:true});
  $("tomorrow").textContent =
    state.flags.spillResolved && state.flags.billCorrected && state.flags.queueExplained ?
      "Quán đã có nền tảng tốt hơn cho Ngày 2. Mưa đầu mùa vẫn có những chuyện mới." :
      "Ngày 2: Mưa đầu mùa. Quán cần kiểm tra những việc còn dang dở trước khi mở cửa.";
  $("debrief-title").focus({ preventScroll: true });
}

bindGamePress($("continue"), () => {
  if (state.phase !== "resolve") return;
  state = advance(catalog, state);
  if (state.dayIndex !== 0) showDebrief();
  else {
    render();
    $("incident-title").focus({ preventScroll: true });
  }
});
bindGamePress($("recover"), () => {
  if (state.phase !== "resolve" || !state.pending.recovery || state.pending.recovered) return;
  state = recover(catalog, DAY01_SCRIPTS, state);
  render();
  $("continue").focus({ preventScroll: true });
});
bindGamePress($("restart"),start);
bindGamePress($("play-again"),start);
window.addEventListener("resize",()=>{
  if(!catalog||!state||state.dayIndex!==0)return;
  // Browser chrome often changes visualViewport height during first load.
  // Do not tear down and re-decode every sprite on those resize events:
  // it can block real taps on mobile. Only reproject existing DOM nodes.
  cancelAnimationFrame(resizeFrame);
  resizeFrame=requestAnimationFrame(repositionSprites);
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
