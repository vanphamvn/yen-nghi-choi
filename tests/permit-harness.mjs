// Minimal deterministic DOM and virtual timer model for Sở cấp phép nghỉ.
// Run the user-facing behavior without a browser or external dependencies.
import {readFileSync} from "node:fs";

export const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
export const permitScript=html.split('<script id="yen-permit-script">')[1]?.split("</script>")[0]||"";

export function mountPermit({reduced=false,randomValues=[0]}={}){
  function makeNode(id){
    const classes=new Set();
    return {
      id,hidden:id==="permit-receipt",disabled:false,textContent:"",dataset:{},style:{setProperty(){}},
      handlers:{},
      classList:{
        add(...names){names.forEach(n=>classes.add(n))},
        remove(...names){names.forEach(n=>classes.delete(n))},
        toggle(name,active){if(active)classes.add(name);else classes.delete(name)},
        contains(name){return classes.has(name)}
      },
      addEventListener(kind,callback){this.handlers[kind]=callback},
      click(){this.handlers.click?.()},
      setAttribute(){},
      focus(){this.focused=true},
      scrollIntoView(){this.scrolled=true},
      getBoundingClientRect(){return {left:0,top:0,width:100,height:100}},
      querySelector(){return makeNode("nested")}
    };
  }
  const ids=["yen-permit","permit-intro","permit-receipt","permit-stamp","permit-message",
    "permit-cuc-trigger","permit-receipt-kicker","permit-start","permit-restart",
    "permit-stamp-performer","permit-stamp-landing","permit-stamp-landing-mobile",
    "permit-out-reason","permit-out-duration","permit-out-note","permit-out-drink",
    "permit-out-why","permit-share-status","permit-share-img"];
  const nodes=Object.fromEntries(ids.map(id=>[id,makeNode(id)]));
  const timers=[];
  let nextId=0,rngIndex=0,reactions=0;
  const doc={readyState:"complete",getElementById:id=>nodes[id]||null,addEventListener(){}};
  const win={
    matchMedia:q=>({matches:q.includes("prefers-reduced-motion")?reduced:false}),
    setTimeout(fn,delay){const id=++nextId;timers.push({id,fn,delay});return id},
    clearTimeout(id){const index=timers.findIndex(t=>t.id===id);if(index>=0)timers.splice(index,1)},
    YenReaction:{show(){reactions++}}
  };
  const fakeMath={floor:Math.floor,random(){return randomValues[rngIndex++%randomValues.length]}};
  new Function("document","window","navigator","Math",permitScript)(doc,win,{},fakeMath);
  return {
    nodes,timers,
    tick(){const timer=timers.shift();if(!timer)throw new Error("No timers left");timer.fn();return timer.delay},
    getReactionCount:()=>reactions
  };
}
