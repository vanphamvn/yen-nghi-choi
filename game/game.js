/* YÊN: Ai đang làm việc? — self-contained 3D minigame.
 * All game state is ephemeral. No accounts, cookies, analytics or rewards.
 * Three.js is loaded only when the visitor starts a shift.
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
  table: { x: -3.2, z: -1.3, label: 'Bàn khách' },
  bike: { x: 6.2, z: 3.6, label: 'Xe giao hàng' },
  bench: { x: 2.5, z: 3.6, label: 'Ghế dài' },
  plant: { x: -6.2, z: -3.9, label: 'Góc cây' }
};
let selectedRole = 'cat';
let stats = { speed: 3, dexterity: 3, calm: 3, charm: 3 };
let THREE = null;
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

function showError() { $('error').hidden = false; $('start-btn').disabled = false; $('start-btn').textContent = 'Vào ca làm việc ↗'; }
async function startGame() {
  if (totalStats() !== 12) return;
  $('start-btn').disabled = true;
  $('start-btn').textContent = 'Đang mở cửa quán...';
  try {
    if (!THREE) THREE = await import('https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js');
    disposeWorld();
    game = {
      role: selectedRole, attributes: { ...stats }, elapsed: 0, done: 0,
      efficiency: 50, peace: 70, active: null, playing: true,
      nextEvent: 22, powerCooldown: 0, sprint: 0,
      shield: false, quickNext: false, message: '', messageTime: 0
    };
    $('setup').hidden = true; $('result').hidden = true; $('game').hidden = false; $('error').hidden = true;
    $('hud-role').textContent = ROLES[game.role].name;
    $('skill-name').textContent = ROLES[game.role].power;
    buildWorld();
    updateTaskUI();
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
      $('start-btn').textContent = 'Vào ca làm việc ↗';
      $('start-btn').disabled = totalStats() !== 12;
    }
  }
}
$('start-btn').addEventListener('click', startGame);
$('error-back').addEventListener('click', () => { $('error').hidden = true; });

function buildWorld() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xe0e9dc);
  scene.fog = new THREE.Fog(0xe0e9dc, 35, 58);
  const container = $('scene');
  container.textContent = '';
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);
  const camera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 90);
  const sun = new THREE.DirectionalLight(0xffffff, 2.4);
  sun.position.set(-6, 18, 10);
  sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -20; sun.shadow.camera.right = 20;
  sun.shadow.camera.top = 20; sun.shadow.camera.bottom = -20;
  sun.shadow.normalBias = .025;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x9bad91, 2), sun);
  world = { scene, renderer, camera, player: null, indicator: null, markerPole: null, focusedStation: null };

  function mesh(geometry, color, parent = scene, metalness = 0) {
    const material = new THREE.MeshStandardMaterial({ color, roughness: .88, metalness });
    const item = new THREE.Mesh(geometry, material);
    item.castShadow = true; item.receiveShadow = true; parent.add(item);
    return item;
  }
  function box(w,h,d,x,y,z,color,parent=scene) {
    const item = mesh(new THREE.BoxGeometry(w,h,d), color, parent);
    item.position.set(x,y,z); return item;
  }
  function sphere(radius,x,y,z,color,parent=scene) {
    const item = mesh(new THREE.SphereGeometry(radius, 12, 9), color, parent);
    item.position.set(x,y,z); return item;
  }
  function cylinder(rt,rb,h,x,y,z,color,parent=scene,segments=12) {
    const item = mesh(new THREE.CylinderGeometry(rt,rb,h,segments),color,parent);
    item.position.set(x,y,z); return item;
  }
  world.helpers = { box, sphere, cylinder };

  // A compact, deliberately open diorama: no imported meshes or asset downloads.
  box(42,.1,38,0,-.36,0,0xc8d5bf);
  box(18,.32,14,0,-.12,0,0xe8dec8);
  box(18,2.5,.28,0,1.05,-7,0xebdfc9);
  box(.25,2.5,14,-9,1.05,0,0xe8d7c0);
  box(18,.12,.22,0,2.35,-6.95,0xa1ad91);
  box(.25,.12,14,-8.96,2.35,0,0xa1ad91);
  // Long wooden coffee counter with equipment.
  box(5.5,1.2,1.8,3,.6,-3.7,0x7c9a83);
  box(5.8,.15,2,3,1.25,-3.7,0xb89570);
  box(1.2,.9,.72,1.6,1.74,-4.1,0x535d56);
  box(.95,.18,.4,1.6,2.24,-4.1,0xe5cba4);
  cylinder(.31,.31,.14,1.4,1.39,-3.2,0xf4f0e5);
  cylinder(.36,.3,.17,3.3,1.43,-3.25,0xdbdbcd);
  cylinder(.28,.28,.15,4.1,1.42,-3.24,0xe2b27e);
  box(.9,.12,.8,4.55,1.4,-4.1,0xf1e4ca);

  // Four chairs around the round customer table.
  cylinder(1.28,1.28,.16,-3.25,.91,-1.4,0xc69e7c,scene,18);
  cylinder(.18,.22,.85,-3.25,.46,-1.4,0x8c7768);
  for (const [xx,zz] of [[-5,-1.45],[-1.6,-1.4],[-3.25,-3.1],[-3.2,.25]]) {
    cylinder(.42,.36,.13,xx,.58,zz,0x9dac91);
    cylinder(.1,.15,.5,xx,.28,zz,0x9a8a75);
  }
  // Visitor bench with cups.
  box(3.4,.3,1.1,2.5,.55,3.5,0xa67f65);
  box(3.4,1.05,.21,2.5,1.08,4.07,0x8a6e5a);
  for (const x of [1.2,3.8]) box(.17,.55,.17,x,.24,3.5,0x6e6359);
  cylinder(.16,.16,.38,2.2,.85,3.4,0xf1e5d0);
  cylinder(.14,.14,.3,3.2,.83,3.4,0xdde9d5);
  // Plant corner.
  cylinder(.64,.48,.9,-6.2,.45,-4.2,0xc78566);
  for (let i=0;i<6;i++) {
    const a = i * Math.PI / 3;
    const leaf = sphere(.45,-6.2+Math.cos(a)*.54,1.42+Math.sin(i*2)*.13,-4.2+Math.sin(a)*.54, i%2 ? 0x5d9467 : 0x7ba378);
    leaf.scale.set(.64,1.3,.6);
  }
  cylinder(.13,.16,.78,-6.2,1.0,-4.2,0x608367);
  // A tiny scooter near the entrance.
  for (const z of [2.85,4.2]) {
    const wheel = cylinder(.47,.47,.23,6.2,.45,z,0x3b4944);
    wheel.rotation.z=Math.PI/2;
    const hub = sphere(.21,6.2,.45,z,0xe4c2a1);
    hub.scale.set(.3,1,1);
  }
  box(.9,.33,1.7,6.2,.95,3.55,0xd68e66);
  box(.72,.65,.78,6.2,1.38,3.05,0x9dab83);
  box(.95,.24,.6,6.2,1.24,3.93,0x6e7569);
  box(.12,1.05,.12,6.2,1.5,2.8,0x5b6963);
  box(.95,.1,.12,6.2,2,2.8,0x5b6963);
  // Entrance path and arched sign supports.
  box(3.5,.06,1.7,-6.5,.03,5.7,0xf2e6c7);
  box(.18,2.5,.18,-7.8,1.25,6.2,0xa37a62);
  box(.18,2.5,.18,-5.15,1.25,6.2,0xa37a62);
  box(3.0,.45,.2,-6.5,2.45,6.2,0x6d9176);
  // Hand-made shop sign on back wall.
  const signCanvas = document.createElement('canvas');
  signCanvas.width=384;signCanvas.height=128;
  const context = signCanvas.getContext('2d');
  context.fillStyle='#315d49';context.fillRect(0,0,384,128);
  context.fillStyle='#f8f1d9';context.font='italic bold 74px Georgia';context.textAlign='center';
  context.fillText('yên',192,80);
  context.font='bold 15px Arial';context.letterSpacing='5px';
  context.fillText('COFFEE & TEA',192,109);
  const signTexture = new THREE.CanvasTexture(signCanvas);
  signTexture.colorSpace = THREE.SRGBColorSpace;
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(3.8,1.26),
    new THREE.MeshBasicMaterial({ map: signTexture, side: THREE.DoubleSide }));
  sign.position.set(-2.25,1.75,-6.81); scene.add(sign);
  // Guest silhouettes at the table.
  createHumanNPC(-3.9,.1,-.4,0xd8a998);
  createHumanNPC(-2.0,.1,-2.0,0x9dafa3);
  function createHumanNPC(x,y,z,color) {
    const group=new THREE.Group();group.position.set(x,y,z);scene.add(group);
    const body = cylinder(.31,.36,.7,0,.6,0,color,group);
    sphere(.32,0,1.27,0,0xeac7ab,group);
    cylinder(.15,.14,.36,-.19,.17,0,0x6a776b,group);
    cylinder(.15,.14,.36,.19,.17,0,0x6a776b,group);
    group.rotation.y = .6;
  }

  // A distinct procedural avatar for every job.
  const avatar = new THREE.Group();
  avatar.position.set(0,0,4.5);
  scene.add(avatar);
  const shade = new THREE.Mesh(new THREE.CircleGeometry(.53,20),
    new THREE.MeshBasicMaterial({color:0x435747,transparent:true,opacity:.15,depthWrite:false}));
  shade.rotation.x=-Math.PI/2;shade.position.y=.017;avatar.add(shade);
  const role = ROLES[game.role];
  if (game.role === 'cat') {
    const body=sphere(.5,0,.58,0,role.color,avatar); body.scale.set(1.08,.85,1.24);
    sphere(.45,0,1.18,-.08,role.color,avatar);
    for (const x of [-.31,.31]) {
      const ear=mesh(new THREE.ConeGeometry(.22,.46,4),role.color,avatar);
      ear.position.set(x,1.6,-.08);ear.rotation.y=Math.PI/4;
    }
    sphere(.09,-.15,1.23,-.47,0x343c36,avatar);
    sphere(.09,.15,1.23,-.47,0x343c36,avatar);
    sphere(.07,0,1.07,-.53,0xe7a9a2,avatar);
    for (const x of [-.3,.3]) {
      const paw=sphere(.19,x,.2,-.28,0xc08454,avatar);paw.scale.set(1, .7,1);
    }
    const tail=new THREE.CatmullRomCurve3([
      new THREE.Vector3(0,.55,.4),new THREE.Vector3(.5,.65,.65),
      new THREE.Vector3(.72,1.2,.55),new THREE.Vector3(.55,1.35,.36)]);
    const tailMesh=mesh(new THREE.TubeGeometry(tail,12,.1,6,false),role.color,avatar);
    tailMesh.castShadow=true;
  } else {
    for (const x of [-.25,.25]) {
      cylinder(.19,.18,.65,x,.35,0,0x59645e,avatar);
      const shoe=sphere(.22,x,.1,-.1,0x344b40,avatar);shoe.scale.set(1,.52,1.35);
    }
    const torso=box(.82,.9,.51,0,1.05,0,role.color,avatar);
    for (const x of [-.55,.55]) {
      const arm=cylinder(.13,.14,.75,x,1.0,0,0xd9b59b,avatar);
      arm.rotation.z=x<0?-.17:.17;
    }
    sphere(.42,0,1.82,0,0xe4c2a5,avatar);
    sphere(.1,-.13,1.85,-.39,0x404b46,avatar);
    sphere(.1,.13,1.85,-.39,0x404b46,avatar);
    if (game.role === 'guard' || game.role === 'shipper') {
      cylinder(.45,.45,.18,0,2.17,0,game.role==='guard'?0x324e65:0xf1bd6c,avatar);
      cylinder(.27,.27,.18,0,2.29,0,game.role==='guard'?0x324e65:0xf1bd6c,avatar);
    }
    if (game.role === 'barista') box(.51,.63,.09,0,1.01,-.31,0xe9dfc7,avatar);
    if (game.role === 'waiter') {
      const tray=cylinder(.53,.53,.09,-.67,1.45,-.4,0xcdbb9f,avatar);
      tray.rotation.x=.1;
    }
    if (game.role === 'shipper') box(.9,.95,.3,0,1.1,.44,0xe4b371,avatar);
  }
  world.player=avatar;

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(.9,.08,8,44),
    new THREE.MeshBasicMaterial({color:0x84c38a,transparent:true,opacity:.93,depthTest:false}));
  ring.rotation.x=-Math.PI/2;ring.renderOrder=3;scene.add(ring);
  const marker = new THREE.Mesh(
    new THREE.CylinderGeometry(.09,.65,1.5,12,1,true),
    new THREE.MeshBasicMaterial({color:0xb5db9b,transparent:true,opacity:.16,depthWrite:false,side:THREE.DoubleSide}));
  scene.add(marker);
  world.indicator=ring;world.markerPole=marker;
  onResize();
}
function onResize() {
  if (!world) return;
  const canvas = $('scene');
  const width=Math.max(1,canvas.clientWidth);
  const height=Math.max(1,canvas.clientHeight);
  world.renderer.setSize(width,height,false);
  const aspect=width/height;
  const halfW=aspect<.8?8.3:11.9;
  const halfH=halfW/aspect;
  const camera=world.camera;
  camera.left=-halfW;camera.right=halfW;camera.top=halfH;camera.bottom=-halfH;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize',onResize);

function updateTaskUI() {
  if (!game || !game.playing) return;
  const task=ROLES[game.role].tasks[game.done];
  if (!task) return;
  $('objective-count').textContent='NHIỆM VỤ '+(game.done+1)+' / 3';
  $('objective-title').textContent=task.title;
  $('objective-desc').textContent=task.text + ' Đi tới vòng sáng rồi bấm Tương tác.';
  if (world) {
    const station=STATIONS[task.at];
    world.indicator.position.set(station.x,.13,station.z);
    world.markerPole.position.set(station.x,.83,station.z);
    world.focusedStation=station;
  }
}
function showMessage(message,seconds=3) {
  if (!game) return;
  game.message=message;
  game.messageTime=seconds;
  $('event-text').textContent=message;
}
function updateHud() {
  if (!game) return;
  const seconds=Math.ceil(Math.max(0,150-game.elapsed));
  $('clock').textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');
  $('eff-text').textContent=Math.round(game.efficiency)+'%';
  $('yen-text').textContent=Math.round(game.peace)+'%';
  $('eff-bar').style.width=clamp(game.efficiency,0,100)+'%';
  $('yen-bar').style.width=clamp(game.peace,0,100)+'%';
  const distance=world&&world.focusedStation?
    Math.hypot(world.player.position.x-world.focusedStation.x,world.player.position.z-world.focusedStation.z):100;
  $('interact-btn').disabled=distance>1.95 || !!game.active;
  $('interact-btn').firstChild.textContent=game.active?'Đang làm... ':'Tương tác ';
  $('skill-btn').disabled=game.powerCooldown>0;
  $('skill-cooldown').textContent=game.powerCooldown>0?
    Math.ceil(game.powerCooldown)+' giây':'Sẵn sàng';
}
function startAction() {
  if (!game || !game.playing || game.active || !world || !world.focusedStation) return;
  const station=world.focusedStation;
  const distance=Math.hypot(world.player.position.x-station.x,world.player.position.z-station.z);
  if (distance>1.95) { showMessage('Đến gần vòng sáng hơn một chút.'); return; }
  const roleBoost={
    guard:'door',shipper:'bike',barista:'counter',waiter:'table',cat:'plant'
  };
  const task=ROLES[game.role].tasks[game.done];
  let duration=clamp(3.2-(game.attributes.dexterity*.38),.75,3.0);
  if (task.at===roleBoost[game.role]) duration*=.7;
  if (game.quickNext) { duration=.28; game.quickNext=false; }
  game.active={elapsed:0,duration};
  $('action-progress').hidden=false;
  $('action-bar').style.width='0%';
  showMessage('Đang thực hiện: '+task.title,2);
}
function completeAction() {
  if (!game) return;
  game.active=null;
  $('action-progress').hidden=true;
  const roleBonus=game.role==='cat'?4:game.role==='barista'?5:3;
  game.efficiency=clamp(game.efficiency+7+roleBonus+(game.attributes.dexterity-3)*2,0,100);
  game.peace=clamp(game.peace+4+(game.attributes.charm-2)*2+(game.role==='cat'?5:0),0,100);
  game.done++;
  if (game.done===3) { endGame(true); return; }
  showMessage('Xong một việc. Quán vẫn tiếp tục mở cửa.',3);
  updateTaskUI();
}
function usePower() {
  if (!game || !game.playing || game.powerCooldown>0) return;
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
function loop(now) {
  if (!game || !game.playing || !world) return;
  const dt=lastTick?clamp((now-lastTick)/1000,0,.05):0;
  lastTick=now;
  game.elapsed+=dt;
  game.powerCooldown=Math.max(0,game.powerCooldown-dt);
  game.sprint=Math.max(0,game.sprint-dt);
  game.messageTime=Math.max(0,game.messageTime-dt);
  if (game.messageTime===0 && game.message) { game.message='';$('event-text').textContent=''; }
  if (game.elapsed>=game.nextEvent) { randomEvent();game.nextEvent+=22; }
  // Subtle cost of running a cafe, softened by the player's calmness.
  game.peace=clamp(game.peace-dt*(.045+(5-game.attributes.calm)*.008),0,100);

  if (game.active) {
    game.active.elapsed+=dt;
    $('action-bar').style.width=clamp(game.active.elapsed/game.active.duration*100,0,100)+'%';
    if (game.active.elapsed>=game.active.duration) completeAction();
  } else {
    const rawX=(pressed.has('d')||pressed.has('arrowright')?1:0)
       -(pressed.has('a')||pressed.has('arrowleft')?1:0)+touchMove.x;
    const rawY=(pressed.has('s')||pressed.has('arrowdown')?1:0)
       -(pressed.has('w')||pressed.has('arrowup')?1:0)+touchMove.y;
    const length=Math.hypot(rawX,rawY);
    if (length>.06) {
      const sx=rawX/Math.max(1,length),sy=rawY/Math.max(1,length);
      const worldX=(sx+sy)*Math.SQRT1_2,worldZ=(sy-sx)*Math.SQRT1_2;
      const speed=(2.45+game.attributes.speed*.36)*(game.sprint>0?1.75:1);
      world.player.position.x=clamp(world.player.position.x+worldX*speed*dt,-8.1,8.1);
      world.player.position.z=clamp(world.player.position.z+worldZ*speed*dt,-6,6.25);
      world.player.rotation.y=Math.atan2(-worldX,-worldZ);
      world.player.position.y=Math.sin(now*.015)*.055;
    } else {
      world.player.position.y*=.8;
    }
  }
  // Completing the third task ends the game and disposes the 3D scene.
  if (!game || !game.playing || !world) return;
  const objective=world.indicator;
  objective.rotation.z=now*.0005;
  const pulse=1+Math.sin(now*.004)*.08;
  objective.scale.set(pulse,pulse,pulse);
  world.markerPole.material.opacity=.12+Math.sin(now*.003)*.045;
  // Follow the visitor more closely on narrow screens.
  const aspect=$('scene').clientWidth/Math.max(1,$('scene').clientHeight);
  const follow=aspect<.85?.83:.24;
  const focus=new THREE.Vector3(world.player.position.x*follow,.2,world.player.position.z*follow);
  const destination=new THREE.Vector3(focus.x+17,focus.y+22,focus.z+17);
  world.camera.position.lerp(destination,.09);
  world.camera.lookAt(focus);
  updateHud();
  if (game.elapsed>=150) { endGame(false);return; }
  if (!game.playing || !world) return;
  world.renderer.render(world.scene,world.camera);
  frame=requestAnimationFrame(loop);
}
function endGame(completed) {
  if (!game) return;
  game.playing=false;
  cancelAnimationFrame(frame);
  const done=game.done;
  const eff=Math.round(game.efficiency);
  const peace=Math.round(game.peace);
  $('result-tasks').textContent=done+' / 3';
  $('result-eff').textContent=eff+'%';
  $('result-yen').textContent=peace+'%';
  $('result-title').textContent=completed?'Quán vẫn còn nguyên.':'Hết ca, còn việc.';
  $('result-message').textContent=completed?
    'Bạn đã hoàn thành cả ba nhiệm vụ. Đôi khi thế là đủ cho một ngày làm việc.':
    'Không phải nhiệm vụ nào cũng xong. May mà Yên vẫn mở cửa.';
  const balance=Math.round(eff*.5+peace*.5);
  $('result-note').textContent=balance>=80?'Đánh giá: Làm được việc mà vẫn giữ được Yên.':
    balance>=60?'Đánh giá: Quán chạy được. Cần thêm một chút bình tĩnh.':
    'Đánh giá: Hình như cả quán cần một giấy phép nghỉ.';
  $('game').hidden=true;
  $('result').hidden=false;
  pressed.clear();resetJoystick();
  disposeWorld();
}
function disposeWorld() {
  cancelAnimationFrame(frame);
  if (!world) return;
  world.scene.traverse(object => {
    if (object.geometry) object.geometry.dispose();
    if (object.material) {
      const materials=Array.isArray(object.material)?object.material:[object.material];
      for (const mat of materials) {
        if (mat.map) mat.map.dispose();
        mat.dispose();
      }
    }
  });
  world.renderer.dispose();
  world.renderer.domElement.remove();
  world=null;
}
function backToSetup() {
  if (game) game.playing=false;
  pressed.clear();resetJoystick();disposeWorld();
  $('game').hidden=true;$('result').hidden=true;$('setup').hidden=false;
  $('start-btn').textContent='Vào ca làm việc ↗';
  renderStats();
}
$('exit-btn').addEventListener('click',backToSetup);
$('change-btn').addEventListener('click',backToSetup);
$('retry-btn').addEventListener('click',() => {backToSetup();startGame();});
$('interact-btn').addEventListener('click',startAction);
$('skill-btn').addEventListener('click',usePower);
window.addEventListener('keydown',event=>{
  const key=event.key.toLowerCase();
  if (!game || !game.playing) return;
  if (['arrowup','arrowdown','arrowleft','arrowright',' '].includes(key)) event.preventDefault();
  pressed.add(key);
  if (key==='e' && !event.repeat) startAction();
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
