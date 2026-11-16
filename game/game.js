/* YÊN: Ai đang làm việc? — self-contained 3D minigame.
 * All game state is ephemeral. No accounts, cookies, analytics or rewards.
 * Babylon.js is loaded only when the visitor enters exploration mode.
 */
const $ = id => document.getElementById(id);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const ROLES = {
  guard: { name: 'Bảo vệ', color: 0x3c6171, power: 'Ánh mắt bảo vệ', desc: 'Hồi phục Độ Yên và chặn một sự cố bất ngờ.',
    tasks: [
      { at: 'door', title: 'Đón vị khách lạc đường', text: 'Ra cổng và chỉ cho khách nơi ngồi.' },
      { at: 'table', title: 'Sắp xếp chỗ cho năm người', text: 'Đến bàn và giải quyết bài toán năm người, bốn ghế.' },
      { at: 'bench', title: 'Giải phóng lối đi', text: 'Đến ghế dài để thương lượng với người đang ngồi chắn lối.' }
    ] },
  shipper: { name: 'Shipper', color: 0xd59a59, power: 'Giao hàng thần tốc', desc: 'Tăng tốc chạy trong 12 giây. Đừng làm đổ ly.',
    tasks: [
      { at: 'counter', title: 'Nhận ly cà phê nóng', text: 'Tới quầy và nhận món cần giao.' },
      { at: 'bike', title: 'Kiểm tra xe giao hàng', text: 'Ra xe kiểm tra đơn trước khi xuất phát.' },
      { at: 'door', title: 'Giao nước đúng người', text: 'Mang đơn ra cổng. Khách vẫn còn chờ.' }
    ] },
  barista: { name: 'Pha chế', color: 0x608668, power: 'Bàn tay vàng', desc: 'Rút ngắn đáng kể lần thao tác tiếp theo.',
    tasks: [
      { at: 'counter', title: 'Pha một ly cà phê', text: 'Tới máy pha và làm món đầu ca.' },
      { at: 'plant', title: 'Tìm nguyên liệu thất lạc', text: 'Ai đó để lá bạc hà ở góc cây xanh.' },
      { at: 'counter', title: 'Hoàn thiện ly bí mật', text: 'Quay về quầy, hoàn tất đơn trước khi khách đổi ý.' }
    ] },
  waiter: { name: 'Phục vụ', color: 0x8e95b4, power: 'Một tay năm ly', desc: 'Tăng Hiệu suất và Độ Yên ngay lập tức.',
    tasks: [
      { at: 'table', title: 'Dọn bàn trong tích tắc', text: 'Bàn vừa có khách rời đi. Dọn trước khi có khách mới.' },
      { at: 'counter', title: 'Nhận khay nước', text: 'Đến quầy lấy các ly đã pha xong.' },
      { at: 'bench', title: 'Mang nước cho đúng khách', text: 'Có một khách đang đợi ở ghế dài.' }
    ] },
  cat: { name: 'Mèo cổ vũ', color: 0xd39b6a, power: 'Meo chữa lành', desc: 'Hồi phục rất nhiều Độ Yên cho cả quán.',
    tasks: [
      { at: 'plant', title: 'Vươn vai trước giờ làm', text: 'Ra chậu cây và thực hiện nghi lễ khởi động.' },
      { at: 'table', title: 'Cổ vũ đồng nghiệp', text: 'Đến gần chiếc bàn. Ai đó đang mất bình tĩnh.' },
      { at: 'bench', title: 'Ngồi cạnh người cần nghỉ', text: 'Tới ghế dài. Hôm nay chỉ cần bạn hiện diện.' }
    ] }
};
const STAT_INFO = [
  { key: 'speed', label: 'Nhanh nhẹn', detail: 'Di chuyển nhanh hơn' },
  { key: 'dexterity', label: 'Khéo léo', detail: 'Thực hiện nhiệm vụ nhanh hơn' },
  { key: 'calm', label: 'Bình tĩnh', detail: 'Ít bị trừ điểm khi có sự cố' },
  { key: 'charm', label: 'Duyên dáng', detail: 'Tăng Độ Yên khi hoàn thành việc' }
];
const STATIONS = {
  door: { x: -6.5, z: 4.4, label: 'Cổng' },
  counter: { x: 3.0, z: -2.2, label: 'Quầy pha chế' },
  table: { x: -3.2, z: .8, label: 'Bàn khách' },
  bike: { x: 6.2, z: 5.2, label: 'Xe giao hàng' },
  bench: { x: 2.5, z: 2.15, label: 'Ghế dài' },
  plant: { x: -6.2, z: -2.35, label: 'Góc cây' }
};
// The same café can be explored indefinitely; NPCs and items have their own reactions.
const NPCS = [
  { id:'guest_minh', name:'Khách đang đọc sách', kind:'customer', x:-4.85, z:-.15, color:0xc99380,
    lines:['Mình đến đọc hai trang sách. Đọc được đúng một dòng.', 'Cà phê chưa nguội mà thời gian đã trôi mất rồi.'] },
  { id:'guest_lan', name:'Khách chờ bạn', kind:'customer', x:-1.75, z:.25, color:0x9dafa3,
    lines:['Bạn mình nói năm phút nữa tới. Câu này nghe quen không?', 'Tớ gọi nước trước hay đợi người hay trễ nhỉ?'] },
  { id:'npc_guard', name:'Chú bảo vệ', kind:'staff', x:-7.6, z:3.2, color:0x436378,
    lines:['Xe cứ để ngay ngắn, còn chuyện buồn thì để ngoài cổng.', 'Chú bảo vệ cái quán. Con mèo bảo vệ cái ghế.'] },
  { id:'npc_barista', name:'Bạn pha chế', kind:'staff', x:6.65, z:-1.1, color:0x648a6c,
    lines:['Cà phê đen dễ làm. Khó là đoán khách đang muốn tâm sự.', 'Đá trong ly cần lạnh. Người pha thì không nhất thiết.'] },
  { id:'npc_waiter', name:'Bạn phục vụ', kind:'staff', x:.65, z:1.2, color:0x8c97b0,
    lines:['Mình đang học cách nhớ bàn. Hôm nay hơi nhiều bàn.', 'Khách hỏi nhà vệ sinh đâu. Mình đã chỉ đúng ngay lần hai.'] },
  { id:'npc_cat', name:'Mèo Mướp', kind:'cat', x:-5.85, z:1.05, color:0xd7a373,
    lines:['Meo. (Mướp chậm rãi chớp mắt.)', 'Mướp cho phép bạn vuốt ve. Trong vòng hai giây.'] }
];
const PROP_TEXT = {
  door: ['Bạn chỉnh lại biển trước cổng. Một ngày bỗng có vẻ ngay ngắn hơn.', 'Biển đã thẳng. Vẫn có người hỏi đây là quán gì.'],
  counter: ['Máy pha kêu bíp. Hôm nay máy đồng ý hợp tác.', 'Tắt máy pha một chút. Tiếng ồn cũng được tan ca.'],
  table: ['Bạn nhấc ly khỏi bàn. Mặt bàn bất ngờ rộng ra.', 'Đặt chiếc ly về chỗ cũ. Bàn lại có việc để làm.'],
  bike: ['Đèn xe bật sáng. Chưa ai yêu cầu giao hàng.', 'Bạn tắt đèn xe. Xe có vẻ hài lòng.'],
  bench: ['Bạn chỉnh lại chiếc gối. Ghế dài trông hiếu khách hơn.', 'Chiếc gối trở về vị trí đầu tiên.'],
  plant: ['Bạn tưới cây. Cây không cảm ơn nhưng lá có vẻ vui.', 'Bạn nhìn kỹ hơn. Cây vẫn đang làm rất tốt công việc của nó.']
};
let selectedRole = 'cat';
let stats = { speed: 3, dexterity: 3, calm: 3, charm: 3 };
let BABYLON = null;
let ANIME_WORLD = null;
let engineLoad = null;
let world = null;
let game = null;
let frame = 0;
let lastTick = 0;
const pressed = new Set();
const touchMove = { x: 0, y: 0, pointer: null };

function totalStats() { return Object.values(stats).reduce((a,b) => a + b, 0); }
function renderStats() {
  const remain = 12 - totalStats();
  $('points-left').textContent = remain;
  $('start-btn').disabled = remain !== 0;
  $('stats').innerHTML = '';
  for (const st of STAT_INFO) {
    const row = document.createElement('div');
    row.className = 'stat';
    const left = document.createElement('div');
    left.className = 'stat-label';
    const title = document.createElement('strong'); title.textContent = st.label;
    const description = document.createElement('small'); description.textContent = st.detail;
    left.append(title, description);
    const values = document.createElement('div'); values.className = 'stat-values';
    const minus = document.createElement('button'); minus.type = 'button'; minus.textContent = '−';
    minus.setAttribute('aria-label', 'Giảm ' + st.label);
    minus.disabled = stats[st.key] <= 1;
    const number = document.createElement('b'); number.textContent = stats[st.key];
    const plus = document.createElement('button'); plus.type = 'button'; plus.textContent = '+';
    plus.setAttribute('aria-label', 'Tăng ' + st.label);
    plus.disabled = stats[st.key] >= 5 || remain === 0;
    minus.addEventListener('click', () => { stats[st.key]--; renderStats(); });
    plus.addEventListener('click', () => { stats[st.key]++; renderStats(); });
    values.append(minus, number, plus); row.append(left, values); $('stats').append(row);
  }
}
function setRole(id) {
  if (!ROLES[id]) return;
  selectedRole = id;
  for (const button of document.querySelectorAll('.role-card')) {
    button.setAttribute('aria-pressed', String(button.dataset.role === id));
  }
  $('power-name').textContent = ROLES[id].power;
  $('power-desc').textContent = ROLES[id].desc;
}
document.querySelectorAll('.role-card').forEach(button =>
  button.addEventListener('click', () => setRole(button.dataset.role)));
renderStats();
setRole(selectedRole);

function showError() { $('error').hidden = false; $('start-btn').disabled = false; $('start-btn').textContent = 'Vào quán khám phá ↗'; }
function loadBabylon() {
  if (window.BABYLON?.Engine) return Promise.resolve(window.BABYLON);
  if (engineLoad) return engineLoad;
  engineLoad = new Promise((resolve,reject)=>{
    const script=document.createElement('script');
    script.src='https://cdn.jsdelivr.net/npm/babylonjs@9.36.0/babylon.js';
    script.async=true;
    script.onload=()=>{
      if (window.BABYLON?.Engine) resolve(window.BABYLON);
      else reject(new Error('Babylon.js bundle did not initialize'));
    };
    script.onerror=()=>reject(new Error('Could not load Babylon.js'));
    document.head.appendChild(script);
  }).catch(error=>{engineLoad=null;throw error;});
  return engineLoad;
}
function setObjectiveOpen(open) {
  const panel=$('objective-panel');
  const toggle=$('objective-toggle');
  panel.hidden=!open;
  toggle.setAttribute('aria-expanded',String(open));
  toggle.setAttribute('aria-label',open?'Đóng bảng nhiệm vụ':'Mở bảng nhiệm vụ');
}
$('objective-toggle').addEventListener('click',()=>setObjectiveOpen($('objective-panel').hidden));

async function startGame() {
  if (totalStats() !== 12) return;
  $('start-btn').disabled = true;
  $('start-btn').textContent = 'Đang mở cửa quán...';
  try {
    if (!BABYLON) BABYLON = await loadBabylon();
    if (!ANIME_WORLD) ANIME_WORLD = await import('./world-babylon.js');
    disposeWorld();
    game = {
      role: selectedRole, attributes: { ...stats }, day: 1, phase: 'explore',
      elapsed: 0, ambientTime: 0, done: 0, efficiency: 50, peace: 70,
      active: null, playing: true, nextEvent: 22, powerCooldown: 0, sprint: 0,
      shield: false, quickNext: false, message: '', messageTime: 0,
      propState: { door: 0, counter: 0, table: 0, bike: 0, bench: 0, plant: 0 }
    };
    $('setup').hidden = true; $('result').hidden = true; $('game').hidden = false; $('error').hidden = true;
    setObjectiveOpen(false);
    $('hud-role').textContent = ROLES[game.role].name;
    $('skill-name').textContent = ROLES[game.role].power;
    buildWorld();
    updatePhaseUI();
    showMessage('Đi dạo một vòng nhé. Muốn bắt đầu ca thì mở Objective ở góc màn hình.',5);
    updateHud();
    lastTick = 0;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(loop);
  } catch (error) {
    console.error('Could not start the Yên 3D game', error);
    disposeWorld();
    $('game').hidden = true; $('setup').hidden = false;
    showError();
  } finally {
    if (!$('setup').hidden) {
      $('start-btn').textContent = 'Vào quán khám phá ↗';
      $('start-btn').disabled = totalStats() !== 12;
    }
  }
}
$('start-btn').addEventListener('click', startGame);
$('error-back').addEventListener('click', () => { $('error').hidden = true; });

function buildWorld() {
  world=ANIME_WORLD.createAnimeWorld(BABYLON,$('scene'),game.role,ROLES,NPCS);
  resetEnvironment();
  onResize();
}
function onResize() {
  if (world) world.resize();
}
window.addEventListener('resize',onResize);

function resetEnvironment() {
  if (!game || !world) return;
  game.ambientTime=0;
  game.propState={ door:0, counter:0, table:0, bike:0, bench:0, plant:0 };
  for (const npc of world.npcs) {
    npc.group.position.set(npc.x,0,npc.z);
    npc.group.rotation.y=-.3;
    npc.interactions=0;
    npc.react=0;
  }
  const refs=world.refs;
  world.setTint(refs.machineLight,0x9b9188);
  refs.tableCup.isVisible=true;
  refs.bikeLamp.isVisible=false;
  refs.benchPillow.position.x=2.5;
  world.setTint(refs.doorPanel,0x699f87);
  for (const leaf of refs.plantLeaves) {
    leaf.scaling.set(.33,.59,.24);
    world.setTint(leaf,0x75ab83);
  }
  world.player.position.set(0,0,4.5);
  world.player.rotation.y=0;
  world.nearRing.isVisible=false;
}
function updateTaskUI() {
  if (!game || !world || game.phase!=='shift') return;
  const task=ROLES[game.role].tasks[game.done];
  if (!task) return;
  $('objective-count').textContent='NGÀY '+String(game.day).padStart(2,'0')+' · NHIỆM VỤ '+(game.done+1)+' / 3';
  $('objective-title').textContent=task.title;
  $('objective-desc').textContent=task.text+' Đi tới vòng sáng và chọn Làm nhiệm vụ.';
  $('objective-pill').textContent=(game.done+1)+'/3';
  const station=STATIONS[task.at];
  world.indicator.position.set(station.x,.13,station.z);
  world.markerPole.position.set(station.x,.83,station.z);
  world.focusedStation=station;
}
function updatePhaseUI() {
  if (!game || !world) return;
  $('game').dataset.phase=game.phase;
  $('hud-day').textContent='NGÀY '+String(game.day).padStart(2,'0');
  $('objective-pill').textContent=game.phase==='explore'?'Khám phá':game.phase==='ready'?'Xong 3/3':game.phase==='result'?'Kết ca':(game.done+1)+'/3';
  $('shift-btn').hidden=game.phase==='shift'||game.phase==='result';
  world.indicator.isVisible=game.phase==='shift';
  world.markerPole.isVisible=game.phase==='shift';
  world.focusedStation=null;
  if (game.phase==='explore') {
    $('objective-count').textContent='NGÀY '+String(game.day).padStart(2,'0')+' · KHÁM PHÁ TỰ DO';
    $('objective-title').textContent='Cứ chơi trước, làm sau.';
    $('objective-desc').textContent='Nói chuyện với khách, nhân viên, mèo hoặc thử các vật dụng. Khi nào thích thì bắt đầu ca.';
    $('shift-state').textContent='CHƯA BẮT ĐẦU CA';
    $('shift-btn').textContent='Bắt đầu ca ↗';
    $('shift-btn').disabled=false;
  } else if (game.phase==='shift') {
    $('shift-state').textContent='ĐANG TRONG CA';
    updateTaskUI();
  } else if (game.phase==='ready') {
    $('objective-count').textContent='NGÀY '+String(game.day).padStart(2,'0')+' · ĐÃ XONG CÔNG VIỆC';
    $('objective-title').textContent='Ba việc đã xong.';
    $('objective-desc').textContent='Bạn vẫn có thể ở lại chơi, trò chuyện hoặc kết thúc ca để qua ngày mới.';
    $('shift-state').textContent='SẴN SÀNG TAN CA';
    $('shift-btn').textContent='Kết thúc ca ↗';
    $('shift-btn').disabled=false;
  }
  $('action-progress').hidden=!game.active;
  updateHud();
}
function startShift() {
  if (!game || game.phase!=='explore' || !world) return;
  game.phase='shift';
  game.done=0;game.elapsed=0;game.nextEvent=22;
  game.efficiency=50;game.peace=70;game.active=null;
  game.powerCooldown=0;game.sprint=0;game.shield=false;game.quickNext=false;
  game.message='';game.messageTime=0;
  $('event-text').textContent='';
  $('game-toast').hidden=true;
  resetEnvironment();
  updatePhaseUI();
  setObjectiveOpen(false);
  showMessage('Ca ngày '+game.day+' bắt đầu. Mọi người và đồ dùng đã về đúng vị trí.',4);
}
function finishShift() {
  if (!game || game.phase!=='ready') return;
  game.phase='result';
  pressed.clear();resetJoystick();
  const eff=Math.round(game.efficiency),peace=Math.round(game.peace);
  $('result-day').textContent='NGÀY '+String(game.day).padStart(2,'0')+' · BIÊN BẢN KẾT CA';
  $('result-tasks').textContent=game.done+' / 3';
  $('result-eff').textContent=eff+'%';
  $('result-yen').textContent=peace+'%';
  $('result-title').textContent='Quán vẫn còn nguyên.';
  $('result-message').textContent='Ca làm việc đã kết thúc theo quyết định của bạn. Ngày mới đang chờ phía trước.';
  const balance=Math.round((eff+peace)/2);
  $('result-note').textContent=balance>=80?'Làm được việc mà vẫn giữ được Yên.':
    balance>=60?'Quán chạy được. Có thể thêm một chút bình tĩnh.':
    'Có lẽ cả quán muốn xin giấy phép nghỉ.';
  $('result').hidden=false;
  setObjectiveOpen(false);
  updatePhaseUI();
}
function nextDay() {
  if (!game || game.phase!=='result' || !world) return;
  game.day++;
  game.phase='explore';
  game.done=0;game.elapsed=0;game.active=null;
  game.efficiency=50;game.peace=70;
  game.powerCooldown=0;game.sprint=0;game.shield=false;game.quickNext=false;
  game.message='';game.messageTime=0;
  $('event-text').textContent='';
  $('game-toast').hidden=true;
  $('result').hidden=true;
  resetEnvironment();
  updatePhaseUI();
  setObjectiveOpen(false);
  showMessage('Chào ngày '+game.day+'. Quán đã sẵn sàng để khám phá.',4);
}
function showMessage(message,seconds=3) {
  if (!game) return;
  game.message=message;
  game.messageTime=seconds;
  $('event-text').textContent=message;
  $('game-toast').textContent=message;
  $('game-toast').hidden=false;
}
function getInteractionCandidate() {
  if (!game || !world || game.phase==='result' || game.active) return null;
  const {x,z}=world.player.position;
  let choice=null;
  function consider(kind,id,name,targetX,targetZ,target,action) {
    const distance=Math.hypot(x-targetX,z-targetZ);
    if (distance>2.05 || (choice && choice.distance<=distance)) return;
    choice={kind,id,name,x:targetX,z:targetZ,target,action,distance};
  }
  for (const npc of world.npcs) {
    consider('npc',npc.id,npc.name,npc.group.position.x,npc.group.position.z,npc,'Nói chuyện');
  }
  for (const [id,station] of Object.entries(STATIONS)) {
    consider('prop',id,station.label,station.x,station.z,station,'Khám phá');
  }
  if (game.phase==='shift' && game.done<3) {
    const task=ROLES[game.role].tasks[game.done];
    const station=STATIONS[task.at];
    const distance=Math.hypot(x-station.x,z-station.z);
    if (distance<=1.95 && (!choice || distance<=choice.distance+.25)) {
      return {kind:'task',id:task.at,name:task.title,x:station.x,z:station.z,target:station,action:'Làm nhiệm vụ',distance};
    }
  }
  return choice;
}
function updateHud() {
  if (!game || !world) return;
  const seconds=Math.floor(game.elapsed);
  $('clock').textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');
  $('eff-text').textContent=Math.round(game.efficiency)+'%';
  $('yen-text').textContent=Math.round(game.peace)+'%';
  $('eff-bar').style.width=clamp(game.efficiency,0,100)+'%';
  $('yen-bar').style.width=clamp(game.peace,0,100)+'%';
  const candidate=getInteractionCandidate();
  $('interact-btn').disabled=!candidate;
  $('interact-label').textContent=game.active?'Đang làm...':candidate?candidate.action:'Tương tác';
  $('target-hint').textContent=game.active?'Đang thực hiện nhiệm vụ...':
    candidate?'Ở gần: '+candidate.name+' · '+candidate.action:
    'Đi gần khách, nhân viên, mèo hoặc vật dụng để tương tác.';
  world.nearRing.isVisible=!!candidate && candidate.kind!=='task';
  if (candidate && candidate.kind!=='task') world.nearRing.position.set(candidate.x,.075,candidate.z);
  $('skill-btn').disabled=game.phase!=='shift'||game.powerCooldown>0;
  $('skill-cooldown').textContent=game.phase!=='shift'?'Chỉ trong ca':
    game.powerCooldown>0?Math.ceil(game.powerCooldown)+' giây':'Sẵn sàng';
}
function interact() {
  const candidate=getInteractionCandidate();
  if (!candidate) return;
  if (candidate.kind==='task') { startAction(); return; }
  if (candidate.kind==='npc') {
    const npc=candidate.target;
    const text=npc.lines[npc.interactions%npc.lines.length];
    npc.interactions++;
    npc.react=1.3;
    showMessage(npc.name+': '+text,5);
    return;
  }
  const id=candidate.id;
  const next=game.propState[id]===0?1:0;
  game.propState[id]=next;
  const refs=world.refs;
  if(id==='counter') world.setTint(refs.machineLight,next?0x77c78b:0x9b9188);
  if(id==='table') refs.tableCup.isVisible=!next;
  if(id==='bike') refs.bikeLamp.isVisible=!!next;
  if(id==='bench') refs.benchPillow.position.x=next?2.95:2.5;
  if(id==='door') world.setTint(refs.doorPanel,next?0xdba36e:0x699f87);
  if(id==='plant') for(const leaf of refs.plantLeaves) leaf.scaling.y=next?.78:.59;
  showMessage(PROP_TEXT[id][next?0:1],4);
}
function startAction() {
  if (!game || game.phase!=='shift' || game.active || !world) return;
  const task=ROLES[game.role].tasks[game.done];
  if (!task) return;
  const station=STATIONS[task.at];
  const distance=Math.hypot(world.player.position.x-station.x,world.player.position.z-station.z);
  if (distance>1.95) { showMessage('Đến gần vòng sáng hơn một chút.'); return; }
  const roleBoost={guard:'door',shipper:'bike',barista:'counter',waiter:'table',cat:'plant'};
  let duration=clamp(3.2-(game.attributes.dexterity*.38),.75,3.0);
  if(task.at===roleBoost[game.role]) duration*=.7;
  if(game.quickNext) { duration=.28;game.quickNext=false; }
  game.active={elapsed:0,duration};
  $('action-progress').hidden=false;
  $('action-bar').style.width='0%';
  showMessage('Đang thực hiện: '+task.title,2);
}
function completeAction() {
  if (!game || game.phase!=='shift') return;
  game.active=null;
  $('action-progress').hidden=true;
  const roleBonus=game.role==='cat'?4:game.role==='barista'?5:3;
  game.efficiency=clamp(game.efficiency+7+roleBonus+(game.attributes.dexterity-3)*2,0,100);
  game.peace=clamp(game.peace+4+(game.attributes.charm-2)*2+(game.role==='cat'?5:0),0,100);
  game.done++;
  if (game.done===3) {
    game.phase='ready';
    updatePhaseUI();
    showMessage('Xong cả ba việc! Bạn tự quyết định lúc kết thúc ca.',6);
  } else {
    showMessage('Xong một việc. Quán vẫn tiếp tục mở cửa.',3);
    updateTaskUI();
  }
}
function usePower() {
  if (!game || game.phase!=='shift' || game.powerCooldown>0) return;
  game.powerCooldown=25;
  switch(game.role) {
    case 'guard':
      game.peace=clamp(game.peace+11,0,100);game.shield=true;
      showMessage('Ánh mắt bảo vệ: cả quán trật tự. Chặn sự cố kế tiếp.');break;
    case 'shipper':
      game.sprint=12;
      showMessage('Giao hàng thần tốc: chạy nhanh trong 12 giây.');break;
    case 'barista':
      game.quickNext=true;
      showMessage('Bàn tay vàng: thao tác tiếp theo sẽ rất nhanh.');break;
    case 'waiter':
      game.efficiency=clamp(game.efficiency+9,0,100);
      game.peace=clamp(game.peace+5,0,100);
      showMessage('Một tay năm ly: mọi người vừa được đỡ việc.');break;
    case 'cat':
      game.peace=clamp(game.peace+18,0,100);
      game.efficiency=clamp(game.efficiency+2,0,100);
      showMessage('Meo. Đồng nghiệp tự nhiên thấy đời dễ chịu hơn.');break;
  }
  updateHud();
}
function randomEvent() {
  if (game.shield) {
    game.shield=false;showMessage('Có sự cố, nhưng ánh mắt bảo vệ đã xử lý.',4);return;
  }
  const events=[
    'Khách đổi món ngay lúc vừa pha xong.',
    'Trời mưa. Một người không mang dù.',
    'Có ai để quên chiếc ghế giữa lối đi.',
    'Một chiếc ly vừa tự nhận là rất dễ vỡ.'
  ];
  const event=events[Math.floor(Math.random()*events.length)];
  const resistance=game.attributes.calm;
  game.peace=clamp(game.peace-(13-resistance*1.5),0,100);
  game.efficiency=clamp(game.efficiency-(7-resistance*.7),0,100);
  showMessage(event+' Bình tĩnh nào.',5);
}
function blocked(x,z) {
  const r=.37;
  // Let the character slide beside the furniture instead of walking through it.
  if (Math.abs(x-3)<2.75+r && Math.abs(z+3.7)<.91+r) return true;
  if (Math.hypot(x+3.25,z+1.4)<1.18+r) return true;
  if (Math.abs(x-2.5)<1.72+r && Math.abs(z-3.5)<.59+r) return true;
  if (Math.hypot(x+6.2,z+4.2)<.65+r) return true;
  if (Math.hypot(x-6.2,z-3.55)<.77+r) return true;
  return false;
}
function updateAmbient(dt) {
  if (!world || !game || game.phase==='result') return;
  game.ambientTime+=dt;
  for (let i=0;i<world.npcs.length;i++) {
    const npc=world.npcs[i];
    const angle=game.ambientTime*(npc.kind==='cat'?1.1:.52)+i*1.57;
    npc.group.position.x=npc.x+Math.sin(angle)*.18;
    npc.group.position.z=npc.z+Math.cos(angle*.83)*.16;
    npc.react=Math.max(0,npc.react-dt*1.8);
    npc.group.position.y=Math.max(0,Math.sin(angle*1.8)*.025)+npc.react*.14;
    const scale=1+npc.react*.08;
    npc.group.scaling.set(scale,scale,scale);
    npc.group.rotation.y=-.3+Math.sin(angle*.6)*.23;
    npc.halo.material.alpha=.27+.13*Math.sin(angle*2);
  }
}
function loop(now) {
  if (!game || !game.playing || !world) return;
  const dt=lastTick?clamp((now-lastTick)/1000,0,.05):0;
  lastTick=now;
  if (game.phase==='shift'||game.phase==='ready') game.elapsed+=dt;
  if (game.phase==='shift') {
    game.powerCooldown=Math.max(0,game.powerCooldown-dt);
    game.sprint=Math.max(0,game.sprint-dt);
    if(game.elapsed>=game.nextEvent) { randomEvent();game.nextEvent+=22; }
    game.peace=clamp(game.peace-dt*(.045+(5-game.attributes.calm)*.008),0,100);
  }
  game.messageTime=Math.max(0,game.messageTime-dt);
  if (game.messageTime===0 && game.message) { game.message='';$('event-text').textContent='';$('game-toast').hidden=true; }
  updateAmbient(dt);

  if (game.active) {
    game.active.elapsed+=dt;
    $('action-bar').style.width=clamp(game.active.elapsed/game.active.duration*100,0,100)+'%';
    if (game.active.elapsed>=game.active.duration) completeAction();
  } else if(game.phase!=='result') {
    const rawX=(pressed.has('d')||pressed.has('arrowright')?1:0)
       -(pressed.has('a')||pressed.has('arrowleft')?1:0)+touchMove.x;
    const rawY=(pressed.has('s')||pressed.has('arrowdown')?1:0)
       -(pressed.has('w')||pressed.has('arrowup')?1:0)+touchMove.y;
    const length=Math.hypot(rawX,rawY);
    if (length>.06) {
      const sx=rawX/Math.max(1,length),sy=rawY/Math.max(1,length);
      const worldX=(sx+sy)*Math.SQRT1_2,worldZ=(sy-sx)*Math.SQRT1_2;
      const speed=(2.45+game.attributes.speed*.36)*(game.sprint>0?1.75:1);
      const nextX=clamp(world.player.position.x+worldX*speed*dt,-8.1,8.1);
      if (!blocked(nextX,world.player.position.z)) world.player.position.x=nextX;
      const nextZ=clamp(world.player.position.z+worldZ*speed*dt,-6,6.25);
      if (!blocked(world.player.position.x,nextZ)) world.player.position.z=nextZ;
      world.player.rotation.y=Math.atan2(-worldX,-worldZ);
      world.player.position.y=Math.sin(now*.015)*.055;
    } else {
      world.player.position.y*=.8;
    }
  }
  if (!game || !game.playing || !world) return;
  const objective=world.indicator;
  if(objective.isVisible) {
    objective.rotation.y=now*.0005;
    const pulse=1+Math.sin(now*.004)*.08;
    objective.scaling.set(pulse,pulse,pulse);
    world.markerPole.material.alpha=.12+Math.sin(now*.003)*.045;
  }
  // Babylon.js owns the orthographic anime camera, including mobile framing.
  world.followPlayer(dt);
  updateHud();
  // No automatic game-over: players decide when their shift is complete.
  if (!game.playing || !world) return;
  world.render();
  frame=requestAnimationFrame(loop);
}
function disposeWorld() {
  cancelAnimationFrame(frame);
  if (!world) return;
  world.dispose();
  world=null;
}
function backToSetup() {
  if (game) game.playing=false;
  pressed.clear();resetJoystick();disposeWorld();
  $('game').hidden=true;$('result').hidden=true;$('setup').hidden=false;
  setObjectiveOpen(false);
  $('game-toast').hidden=true;
  $('start-btn').textContent='Vào quán khám phá ↗';
  renderStats();
}
$('exit-btn').addEventListener('click',backToSetup);
$('change-btn').addEventListener('click',backToSetup);
$('retry-btn').addEventListener('click',nextDay);
$('shift-btn').addEventListener('click',()=>{
  if (!game || !world) return;
  if (game.phase==='explore') startShift();
  else if (game.phase==='ready') finishShift();
});
$('interact-btn').addEventListener('click',interact);
$('skill-btn').addEventListener('click',usePower);
window.addEventListener('keydown',event=>{
  const key=event.key.toLowerCase();
  if (!game || !game.playing) return;
  if (['arrowup','arrowdown','arrowleft','arrowright',' '].includes(key)) event.preventDefault();
  pressed.add(key);
  if (key==='e' && !event.repeat) interact();
  if (key==='q' && !event.repeat) usePower();
});
window.addEventListener('keyup',event=>pressed.delete(event.key.toLowerCase()));
window.addEventListener('blur',()=>{pressed.clear();resetJoystick();});
const joystick=$('joystick');
function updateJoystick(event) {
  const rect=joystick.querySelector('.joystick-ring').getBoundingClientRect();
  const middleX=rect.left+rect.width/2,middleY=rect.top+rect.height/2;
  const dx=event.clientX-middleX,dy=event.clientY-middleY;
  const ratio=Math.min(1,34/Math.max(1,Math.hypot(dx,dy)));
  touchMove.x=clamp(dx/34,-1,1)*ratio;
  touchMove.y=clamp(dy/34,-1,1)*ratio;
  $('joystick-thumb').style.transform='translate('+touchMove.x*34+'px,'+touchMove.y*34+'px)';
}
function resetJoystick() {
  touchMove.x=0;touchMove.y=0;touchMove.pointer=null;
  $('joystick-thumb').style.transform='translate(0,0)';
}
joystick.addEventListener('pointerdown',event=>{
  if (!game || !game.playing) return;
  touchMove.pointer=event.pointerId;joystick.setPointerCapture(event.pointerId);
  updateJoystick(event);event.preventDefault();
});
joystick.addEventListener('pointermove',event=>{
  if (touchMove.pointer===event.pointerId) updateJoystick(event);
});
for (const type of ['pointerup','pointercancel','lostpointercapture']) {
  joystick.addEventListener(type,event=>{
    if (touchMove.pointer===event.pointerId) resetJoystick();
  });
}
