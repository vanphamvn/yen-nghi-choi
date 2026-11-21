import { DAY01, DAY01_SCRIPTS, day01Debrief } from "./day01.mjs";
import {
  createState, currentIncident, interact, choose, recover, advance,
  sceneView, validatePlayable, METRICS
} from "./engine.mjs";
import { createInteraction, getScene, updateInteraction, visualState } from "../interactions/mechanics.mjs";

const $=id=>document.getElementById(id);
const elem=(tag,cls,text="")=>{
 const node=document.createElement(tag);
 if(cls)node.className=cls;
 if(text)node.textContent=text;
 return node;
};
const LABELS={safety:"An toàn",trust:"Niềm tin",flow:"Nhịp quán",budget:"Ngân sách"};
const CLASS={safe:"is-safe",caution:"is-caution",hazard:"is-hazard"};
const FILES={
 pleased:"/assets/cuc-yen/sprites/delighted.webp",
 neutral:"/assets/cuc-yen/sprites/shy.webp",
 alarmed:"/assets/cuc-yen/sprites/surprised.webp",
 recovered:"/assets/cuc-yen/sprites/happy.webp"
};

let catalog=null;
let state=null;
let mechanic=null;

function chapter(){
 const inc=currentIncident(catalog,state);
 const entry=DAY01.find(s=>s.id===inc?.id);
 if(!entry)throw new Error("Ngày 2 chưa phát hành: "+(inc?.id||"không rõ"));
 return entry;
}
function start(){
 state=createState(catalog);
 mechanic=createInteraction(DAY01[0].mechanicId);
 $("debrief").hidden=true;$("game").hidden=false;$("loading").hidden=true;
 render();
 $("incident-title").focus({preventScroll:true});
}
function targetButton(item,scene){
 const b=elem("button","scene-item item-"+item.kind);
 b.type="button";b.dataset.item=item.id;
 b.style.setProperty("--x",item.x+"%");
 b.style.setProperty("--y",item.y+"%");
 b.setAttribute("aria-label",item.label);
 b.setAttribute("aria-pressed",String(Boolean(item.selected||item.marked||item.corrected||item.placed||item.warningPlaced||item.inspected)));
 for(const [flag,klass] of [
  ["selected","is-selected"],["marked","is-marked"],["corrected","is-corrected"],
  ["placed","is-placed"],["warningPlaced","is-deployed"],["inspected","is-inspected"]
 ])if(item[flag])b.classList.add(klass);
 if(mechanic.completed||state.phase!=="observe")b.disabled=true;
 if(item.src){
   const img=elem("img","");
   img.src=item.src;img.alt="";b.append(img,elem("span","painted-label",item.label));
 }else if(item.kind==="ticket"){
   b.append(elem("span","ticket-number","PHIẾU "+item.id),elem("span","ticket-description",item.label.split(" · ")[1]||item.label));
 }else if(item.kind==="receipt")b.append(elem("span","receipt-text",item.label));
 else if(item.kind==="sign")b.append(elem("span","sign-symbol","!"),elem("span","sign-text","CẢNH BÁO"));
 else if(item.kind==="spill")b.append(elem("span","hazard-symbol","!"),elem("span","hazard-text",item.marked?"ĐÃ KHOANH VÙNG":"SÀN TRƠN"));
 else if(item.kind==="dry")b.append(elem("span","ground-text","LỐI KHÔ"));
 else if(item.kind==="target")b.append(elem("span","target-text",scene.kind==="place"?"KHAY NHẬN":"GÓC TRỐNG"));
 b.addEventListener("click",()=>{
   if(state.phase!=="observe")return;
   const hadFocus=document.activeElement===b;
   const previous=mechanic;
   mechanic=updateInteraction(mechanic,{type:"activate",id:item.id});
   if(mechanic===previous)return;
   if(mechanic.completed){
     const entry=chapter();
     state=interact(catalog,DAY01_SCRIPTS,state,entry.actionId);
   }
   render();
   const replacement=[...$("targets").querySelectorAll("[data-item]")].find(x=>x.dataset.item===item.id);
   if(hadFocus && replacement && !replacement.disabled)replacement.focus({preventScroll:true});
   if(mechanic.completed){
     // Transition the keyboard to the new decision controls, not a removed hotspot.
     $("choices").querySelector("button")?.focus({preventScroll:true});
   }
 });
 return b;
}
function paintWorld(entry,view,visuals){
 const assets=entry.assets.map(a=>({...a}));
 let outcome=state.phase==="resolve"?state.pending.choiceId:"";
 if(state.phase==="resolve" && state.pending.recovered)outcome="recovered";
 const risk=state.phase==="resolve" ? entry.choices.find(c=>c.id===state.pending.choiceId)?.risk : null;
 const camera=view.shot.camera||{scale:1,position:"center"};
 $("world").dataset.incident=entry.id;
 $("world").dataset.phase=state.phase==="resolve"?"resolution":state.phase==="decide"?"interactive":"establishing";
 $("world").dataset.outcome=outcome;
 $("world").dataset.risk=risk||"";
 $("world").dataset.time=entry.sceneTheme;
 $("backdrop").src=view.shot.backdrop;
 $("backdrop").alt=view.shot.alt;
 $("backdrop").style.objectPosition=camera.position;
 $("backdrop").style.transform="scale("+camera.scale+")";
 const illustration=$("illustrations");
 illustration.replaceChildren();
 for(const a of assets){
  const img=elem("img","painted-layer "+a.id);
  img.style.setProperty("--x",a.x+"%");img.style.setProperty("--y",a.y+"%");
  img.style.setProperty("--size",a.width+"%");
  img.alt="";
  img.src=a.id==="actor" && state.phase==="resolve" ?
   (state.pending.recovered?FILES.recovered:risk==="safe"?FILES.pleased:risk==="hazard"?FILES.alarmed:FILES.neutral):a.src;
  illustration.append(img);
 }
 const props=$("targets");props.replaceChildren();
 if(entry.id==="D01-02" && state.phase==="resolve"){
   const spill=visuals.items.find(i=>i.id==="spill");
   const sign=visuals.items.find(i=>i.id==="sign");
   if(outcome==="open"){
     spill.marked=false;sign.warningPlaced=false;sign.x=16;sign.y=63;
   }else if(outcome==="clean"||outcome==="recovered"){
     spill.marked=true;
   }
 }
 if(entry.id==="D01-03" && state.phase==="resolve" && outcome!=="refund"){
   for(const item of visuals.items){
    if(item.id==="tea"){item.label="Trà đào · 35.000đ · CHƯA SỬA";item.corrected=false;}
    if(item.id==="total"){item.label="Tổng · 51.000đ";item.corrected=false;}
   }
 }
 if(entry.id==="D01-01" && state.phase==="resolve" && outcome==="priority"){
  visuals.items.sort((a,b)=>["02","01","03"].indexOf(a.id)-["02","01","03"].indexOf(b.id));
  visuals.items.forEach((x,index)=>x.x=24+index*25);
 }
 for(const item of visuals.items)props.append(targetButton(item,getScene(entry.mechanicId)));
 const label=outcome ? (state.pending.recovered?"ĐÃ SỬA SAI":risk==="safe"?"ĐÃ XỬ LÝ":risk==="hazard"?"CHƯA AN TOÀN":"CẦN THEO DÕI") : "ĐANG DIỄN RA";
 $("character-reaction").textContent=label;
 $("camera-caption").textContent=state.phase==="observe"?"TOÀN CẢNH · "+entry.slot.toUpperCase():
   state.phase==="decide"?"CẬN CẢNH · VẬT CHỨNG":"KẾT QUẢ · "+entry.slot.toUpperCase();
 $("weather-caption").textContent=entry.weather;
 $("world-alt").textContent=state.phase==="resolve" ?
   (state.pending.recovered?state.pending.recovery.reason:state.pending.reason)+". "+view.shot.alt :
   view.shot.alt+" "+getScene(entry.mechanicId).goal;
}
function drawChoices(entry){
 const choices=$("choices");
 choices.replaceChildren();
 if(state.phase!=="decide"){choices.hidden=true;return;}
 choices.hidden=false;
 entry.choices.forEach((choice,index)=>{
  const b=elem("button","day-choice");
  b.type="button";b.dataset.choice=choice.id;
  b.append(elem("span","choice-index",String(index+1).padStart(2,"0")),elem("span","choice-text",choice.label));
  b.addEventListener("click",()=>{
   state=choose(catalog,DAY01_SCRIPTS,state,choice.id);
   render();
   $("continue").focus({preventScroll:true});
  });
  choices.append(b);
 });
}
function drawMetrics(){
 const host=$("metrics");host.replaceChildren();
 for(const key of METRICS){
  const box=elem("div","metric");
  const value=state.metrics[key];
  const label=elem("div","metric-label");
  label.append(elem("span","",LABELS[key]),elem("strong","",String(value)+"/100"));
  const meter=elem("progress");
  meter.max=100;meter.value=value;meter.setAttribute("aria-label",LABELS[key]);
  box.append(label,meter);
  host.append(box);
 }
}
function render(){
 if(state.dayIndex!==0){showDebrief();return;}
 const entry=chapter();
 const scene=getScene(entry.mechanicId);
 const v=sceneView(catalog,DAY01_SCRIPTS,state);
 const visual=visualState(scene,mechanic);
 const slot=["SÁNG","CHIỀU","TỐI"][state.incidentIndex];
 $("scene-number").textContent="NGÀY 01 / 30 · "+slot+" · "+entry.time;
 $("scene-status").textContent=state.phase==="observe"?"CHẠM VÀO CẢNH":
  state.phase==="decide"?"RA QUYẾT ĐỊNH":"KẾT QUẢ";
 $("incident-id").textContent=entry.id+" · "+entry.time+" · "+entry.scene.location;
 $("incident-title").textContent=entry.title;
 $("speaker").textContent=state.phase==="resolve"?state.pending.reaction.speaker:entry.speaker;
 $("dialogue").textContent=state.phase==="observe"?entry.cue:
  state.phase==="decide"?entry.transition:state.pending.reaction.line;
 $("prompt").textContent=state.phase==="observe"?scene.prompt:
  state.phase==="decide"?entry.question:"Hệ quả của lựa chọn";
 $("goal").textContent=state.phase==="resolve"?"Hậu quả sẽ đi theo quán sang những ngày tiếp theo.":
  state.phase==="decide"?"Chọn một cách xử lý. Bạn có thể thử lại Ngày 1 để thấy kết quả khác.":scene.goal;
 $("notice").textContent=state.phase==="observe"?mechanic.message:
  state.phase==="decide"?"Bạn đã thao tác trực tiếp lên cảnh. Hãy chọn bước xử lý tiếp theo.":
  state.pending.recovered?"Đã thực hiện hành động sửa sai.":state.pending.reason;
 $("reset-mechanic").hidden=state.phase!=="observe";
 $("result").hidden=state.phase!=="resolve";
 $("recover").hidden=state.phase!=="resolve"||!state.pending.recovery||state.pending.recovered;
 $("continue").hidden=state.phase!=="resolve";
 $("continue").textContent=state.incidentIndex===2?"Kết sổ Ngày 1":"Tiếp tục ca sau";
 $("outcome-speaker").textContent=state.phase==="resolve"?state.pending.reaction.speaker:"";
 $("outcome").textContent=state.phase==="resolve"?state.pending.reaction.line:"";
 $("reason").textContent=state.phase==="resolve"?state.pending.reason:"";
 document.querySelectorAll("[data-step]").forEach((li,i)=>{
  li.classList.toggle("is-current",i===state.incidentIndex);
  li.classList.toggle("is-done",i<state.incidentIndex);
 });
 drawChoices(entry);
 paintWorld(entry,v,visual);
 drawMetrics();
}
function showDebrief(){
 $("game").hidden=true;$("debrief").hidden=false;
 document.querySelectorAll("[data-step]").forEach(li=>{
  li.classList.remove("is-current");li.classList.add("is-done");
 });
 const list=$("debrief-list");list.replaceChildren();
 for(const line of day01Debrief(state.flags))list.append(elem("li","",line));
 $("tomorrow").textContent=state.flags.spillResolved&&state.flags.billCorrected&&state.flags.queueExplained?
  "Quán đã có nền tảng tốt hơn cho Ngày 2. Mưa đầu mùa vẫn có những chuyện mới.":
  "Ngày 2: Mưa đầu mùa. Quán cần kiểm tra lại những việc còn dang dở trước khi nhận thêm khách.";
 const history=$("history");history.replaceChildren();
 for(const record of state.history){
  const chosen=DAY01.find(s=>s.id===record.incidentId)?.choices.find(c=>c.id===record.choiceId);
  history.append(elem("li","",record.incidentId+" · "+(chosen?.label||record.choiceLabel)+(record.recovered?" (đã sửa sai)":"")));
 }
 $("debrief-title").focus({preventScroll:true});
}
function onNext(){
 if(state.phase!=="resolve")return;
 state=advance(catalog,state);
 if(state.dayIndex!==0){showDebrief();return;}
 mechanic=createInteraction(chapter().mechanicId);
 render();
 $("incident-title").focus({preventScroll:true});
}
$("continue").addEventListener("click",onNext);
$("recover").addEventListener("click",()=>{
 if(state.phase!=="resolve"||!state.pending.recovery||state.pending.recovered)return;
 state=recover(catalog,DAY01_SCRIPTS,state);render();
 $("continue").focus({preventScroll:true});
});
$("reset-mechanic").addEventListener("click",()=>{
 if(state.phase!=="observe")return;
 mechanic=createInteraction(chapter().mechanicId);render();$("incident-title").focus({preventScroll:true});
});
$("restart").addEventListener("click",start);
$("play-again").addEventListener("click",start);
try {
 const response=await fetch("../../docs/visual-novel/episodes.json",{cache:"no-store"});
 if(!response.ok)throw new Error("Không tải được danh mục câu chuyện");
 catalog=await response.json();
 validatePlayable(catalog,DAY01_SCRIPTS,{requireAll:false});
 start();
} catch(error) {
 $("loading").replaceChildren(elem("strong","","Không mở được Ngày 1: "+error.message),
  elem("p","","Bạn vẫn có thể chơi bản thử tương tác riêng của quán."));
 const link=elem("a","","Mở bản thử thao tác với cảnh");
 link.href="../tuong-tac/";$("loading").append(link);
}
