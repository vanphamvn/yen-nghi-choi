/*
 * Anime-style 3D world renderer for Yên Coffee & Tea.
 * Babylon.js handles the scene, camera, mesh lifecycle and cel-shaded rendering.
 * The existing game.js remains the source of truth for shifts, scoring and dialog.
 * No externally hosted models, textures, or player data.
 */
export function createAnimeWorld(B, container, roleId, roles, npcData) {
  if (!B?.Engine || !B?.Scene) throw new Error('Babylon.js was not loaded');
  const canvas=document.createElement('canvas');
  canvas.className='yen-world-canvas';
  canvas.setAttribute('aria-label','Quán Yên phong cách anime 3D. Di chuyển bằng joystick hoặc WASD');
  canvas.style.cssText='display:block;width:100%;height:100%;touch-action:none;outline:0';
  container.replaceChildren(canvas);
  const engine=new B.Engine(canvas,true,{
    preserveDrawingBuffer:false,stencil:false,antialias:true,adaptToDeviceRatio:false
  });
  engine.setHardwareScalingLevel(Math.max(1,(window.devicePixelRatio||1)/1.5));
  const scene=new B.Scene(engine);
  scene.clearColor=new B.Color4(.80,.89,.91,1);
  scene.ambientColor=B.Color3.FromHexString('#e7e2d1');
  scene.imageProcessingConfiguration.contrast=1.08;
  scene.imageProcessingConfiguration.exposure=1.08;
  const camera=new B.FreeCamera('anime-camera',new B.Vector3(18,23,19),scene);
  camera.mode=B.Camera.ORTHOGRAPHIC_CAMERA;
  camera.minZ=.1;camera.maxZ=110;
  camera.setTarget(new B.Vector3(0,.4,0));
  scene.activeCamera=camera;
  const ambient=new B.HemisphericLight('sky',new B.Vector3(0,1,0),scene);
  ambient.intensity=.92;
  ambient.diffuse=new B.Color3(.98,.93,.85);
  const sunlight=new B.DirectionalLight('afternoon-light',new B.Vector3(-.65,-1,-.35),scene);
  sunlight.intensity=.78;
  sunlight.diffuse=new B.Color3(1,.9,.79);

  // Three-tone hand-drawn light and ink contours: no generic metallic shading.
  B.Effect.ShadersStore.yenAnimeVertexShader=[
    'precision highp float;',
    'attribute vec3 position; attribute vec3 normal;',
    'uniform mat4 worldViewProjection; uniform mat4 world;',
    'varying vec3 vWorldNormal;',
    'void main(){',
    'vWorldNormal=mat3(world)*normal;',
    'gl_Position=worldViewProjection*vec4(position,1.0);',
    '}'
  ].join('\n');
  B.Effect.ShadersStore.yenAnimeFragmentShader=[
    'precision highp float;',
    'varying vec3 vWorldNormal;',
    'uniform vec3 baseColor;',
    'void main(){',
    'vec3 n=normalize(vWorldNormal);',
    'float d=max(dot(n,normalize(vec3(-0.50,0.83,0.35))),0.0);',
    'float lightBand=d>0.66?1.07:(d>0.27?0.86:0.68);',
    'vec3 color=baseColor*lightBand;',
    'gl_FragColor=vec4(color,1.0);',
    '}'
  ].join('\n');
  const ink=B.Color3.FromHexString('#3c4c50');
  const cache=new Map();
  const hexString=n=>('#'+n.toString(16).padStart(6,'0'));
  const tint=n=>B.Color3.FromHexString(hexString(n));
  function toon(n,unique=false){
    if(!unique && cache.has(n)) return cache.get(n);
    const material=new B.ShaderMaterial('cel-'+n+'-'+cache.size,scene,
      {vertex:'yenAnime',fragment:'yenAnime'},
      {attributes:['position','normal'],uniforms:['world','worldViewProjection','baseColor']});
    material.setColor3('baseColor',tint(n));
    material.backFaceCulling=true;
    if(!unique)cache.set(n,material);
    return material;
  }
  function flat(n,alpha=1){
    const material=new B.StandardMaterial('flat-'+n+'-'+alpha,scene);
    material.diffuseColor=tint(n);
    material.emissiveColor=tint(n).scale(.53);
    material.specularColor=B.Color3.Black();
    material.alpha=alpha;
    material.backFaceCulling=false;
    return material;
  }
  let seq=0;
  function apply(mesh,x,y,z,color,parent,outlined=false) {
    mesh.position.set(x,y,z);
    mesh.material=toon(color);
    if(parent) mesh.parent=parent;
    if(outlined) {
      mesh.renderOutline=true;
      mesh.outlineColor=ink;
      mesh.outlineWidth=.029;
    }
    return mesh;
  }
  function box(w,h,d,x,y,z,color,parent=null,outlined=false) {
    return apply(B.MeshBuilder.CreateBox('block-'+(++seq),{width:w,height:h,depth:d},scene),x,y,z,color,parent,outlined);
  }
  function sphere(rx,ry,rz,x,y,z,color,parent=null,outlined=false) {
    const mesh=B.MeshBuilder.CreateSphere('shape-'+(++seq),{diameter:2,segments:12},scene);
    mesh.scaling.set(rx,ry,rz);
    return apply(mesh,x,y,z,color,parent,outlined);
  }
  function cylinder(rt,rb,h,x,y,z,color,parent=null,outlined=false) {
    return apply(B.MeshBuilder.CreateCylinder('round-'+(++seq),{
      height:h,diameterTop:rt*2,diameterBottom:rb*2,tessellation:18
    },scene),x,y,z,color,parent,outlined);
  }
  function cone(r,h,x,y,z,color,parent=null) {
    return cylinder(0,r,h,x,y,z,color,parent,true);
  }
  function tube(points,r,color,parent=null) {
    const mesh=B.MeshBuilder.CreateTube('curve-'+(++seq),{
      path:points.map(p=>new B.Vector3(...p)),radius:r,tessellation:8,cap:B.Mesh.CAP_ROUND
    },scene);
    mesh.material=toon(color);
    if(parent) mesh.parent=parent;
    return mesh;
  }
  function disc(x,z,r,color,alpha=.3,parent=null) {
    const circle=B.MeshBuilder.CreateDisc('shadow-'+(++seq),{radius:r,tessellation:28},scene);
    circle.rotation.x=Math.PI/2;
    circle.position.set(x,.031,z);
    circle.material=flat(color,alpha);
    if(parent) circle.parent=parent;
    return circle;
  }
  function fabricStripe(x,z,w,color) {
    const stripe=box(w,.085,1.15,x,3.46,z,color);
    stripe.rotation.z=.10;
  }
  function sign(text,width,height,x,y,z,background,foreground,subtitle='') {
    const texture=new B.DynamicTexture('lettering-'+(++seq),{width:768,height:256},scene,false);
    const ctx=texture.getContext();
    ctx.fillStyle=background;
    ctx.fillRect(0,0,768,256);
    ctx.fillStyle=foreground;
    ctx.textAlign='center';
    ctx.font='italic bold 139px Georgia, serif';
    ctx.fillText(text,384,151);
    if(subtitle){
      ctx.font='bold 28px Arial';
      ctx.fillText(subtitle,384,221);
    }
    texture.hasAlpha=false;texture.update();
    const material=new B.StandardMaterial('poster-'+seq,scene);
    material.diffuseTexture=texture;material.emissiveTexture=texture;
    material.disableLighting=true;material.backFaceCulling=false;
    const plane=B.MeshBuilder.CreatePlane('sign-'+seq,{width,height,sideOrientation:B.Mesh.DOUBLESIDE},scene);
    plane.material=material;plane.position.set(x,y,z);
    return plane;
  }
  const palette={
    lawn:0xb4cba9,cream:0xfff0d6,wall:0xf8e8ce,outline:0x4d6256,
    wood:0xc79b76,woodDark:0x9a775b,leaf:0x75ab83,roof:0x729a87,
    pink:0xf3b5b9,glaze:0x95ccca,shadow:0x4d665a
  };

  // The world is a layered anime diorama with an intentionally open front.
  box(38,.34,29,0,-.43,0,palette.lawn);
  box(18,.27,14,0,-.2,0,0xf7e8ce);
  box(18,2.9,.25,0,1.31,-7,0xffead2);
  box(.23,2.9,14,-9,1.31,0,0xf9dfbf);
  box(18,.2,.4,0,2.75,-6.88,0x789682);
  box(.4,.2,14,-8.85,2.75,0,0x789682);
  for(let x=-7.9;x<9;x+=2.35) {
    box(.11,2.65,.09,x,1.32,-6.83,0xe0c5a6);
    box(.17,.09,14,-8.78,2.52,0,0xc9a78d);
  }
  // Awnings frame the café without obscuring the camera.
  box(8.2,.17,2.0,3.7,3.3,-5.92,0x9dc5ac);
  for(let i=0;i<7;i++) fabricStripe(-.05+i*1.17,-5.05,1.0,i%2?0xffe8cc:0x79aa98);
  for(const x of [0,7.6]){
    cylinder(.08,.08,2.8,x,1.65,-5.0,0x8b9c82);
    sphere(.18,.18,.18,x,2.95,-5,0xffedb9);
  }
  sign('yên',5.3,1.65,-2.9,1.87,-6.79,'#386c59','#fff4dc','C O F F E E   &   T E A');

  // Large colored windows with mullions and warm interior sill.
  for(const x of [-7.05,6.92]){
    box(1.8,1.65,.09,x,1.55,-6.79,0x91c5b7);
    box(1.96,.1,.2,x,2.36,-6.7,0x8d987e);
    box(1.96,.1,.2,x,.72,-6.7,0x8d987e);
    box(.1,1.72,.18,x,1.55,-6.66,0x8d987e);
    box(1.8,.1,.18,x,1.55,-6.66,0x8d987e);
  }
  // Floor tiles, lily shadows and entrance stones.
  for(let x=-8;x<=8;x+=2.5) for(let z=-5.6;z<=5.9;z+=2.5){
    const t=box(2.34,.018,2.34,x,-.043,z,(Math.round(x+z)%2)?0xf2e0c8:0xf7e9d3);
    t.renderOutline=false;
  }
  for(let i=0;i<6;i++){
    cylinder(.85,.83,.065,-6.6,0.02,7+i*.88,0xd7d2b6);
    if(i%2===0)disc(-6.6,7+i*.88,.9,0x788971,.13);
  }

  // Bar: pastel green panels, wood top, café equipment and menu cards.
  box(5.45,1.35,1.65,3,.68,-3.72,0x75a18b,true);
  box(5.76,.18,1.94,3,1.42,-3.68,0xc68b65,null,true);
  for(const x of [.85,2.08,3.31,4.54]) box(.055,1.09,.05,x,.72,-2.88,0xe4e6c3);
  box(1.18,.82,.65,1.58,1.9,-4.12,0x60756e,null,true);
  box(.93,.18,.52,1.58,2.4,-4.10,0xe6b79c);
  const machineLight=sphere(.12,.12,.12,1.08,1.89,-3.75,0x9b9188);
  cylinder(.46,.40,.14,3.75,1.61,-3.35,0xf7d6ac);
  cylinder(.29,.23,.40,4.4,1.7,-3.31,0xf5efdf);
  tube([[4.4,1.85,-3.3],[4.57,1.85,-3.28],[4.58,1.60,-3.22]],.05,0xd39d84);
  for (let i=0;i<5;i++) cylinder(.18,.18,.22,3.0+i*.33,1.63,-4.06,[0xebc5a2,0xc9b2a4,0xa7c4ad][i%3]);
  sign('MENU',1.7,.65,5.44,2.35,-4.82,'#426857','#fff8d9');

  // Customer table and a set of painted chairs.
  const tableTop=cylinder(1.35,1.35,.15,-3.25,.97,-1.4,0xc99373,null,true);
  cylinder(.16,.22,.9,-3.25,.49,-1.4,0x9e826b);
  const tableCup=cylinder(.16,.12,.28,-3.0,1.21,-1.46,0xf4cebd);
  sphere(.16,.07,.16,-3.0,1.38,-1.46,0xe9f0dd);
  const chairSpots=[[-5,-1.45],[-1.62,-1.4],[-3.25,-3.1],[-3.2,.25]];
  for(let i=0;i<chairSpots.length;i++){
    const [x,z]=chairSpots[i];
    cylinder(.48,.44,.15,x,.6,z,i%2?0x95b8ae:0xe4ae9f);
    cylinder(.1,.12,.6,x,.3,z,0xb49a7d);
    if(i<2)box(.83,.66,.12,x,1.03,z+(i===0?-.35:.35),i%2?0x95b8ae:0xe4ae9f);
  }
  // Soft bench, cushion, side table and paper cups.
  box(3.55,.35,1.12,2.5,.60,3.5,0xa6826d,null,true);
  box(3.56,1.03,.24,2.5,1.14,4.06,0x86a692,null,true);
  for(const x of [1.2,3.8]) box(.19,.5,.19,x,.30,3.5,0x7b715c);
  const benchPillow=box(.84,.23,.62,2.5,.91,3.63,0xf4bfb7);
  cylinder(.18,.18,.33,1.45,.94,3.34,0xf6ebdf);
  cylinder(.17,.17,.28,3.63,.91,3.36,0xf4d7ab);
  // Rug gives the central floor a playful hand-drawn softness.
  box(3.9,.015,2.6,.9,-.022,0.35,0xdccdb4);

  // Big succulent pot with low-poly round leaf clusters.
  cylinder(.72,.54,.91,-6.2,.46,-4.2,0xd6a17f,null,true);
  const plantLeaves=[];
  for(let i=0;i<9;i++){
    const theta=i*Math.PI*2/9;
    const leaf=sphere(.33,.59,.24,
      -6.2+Math.cos(theta)*.44,1.46,-4.2+Math.sin(theta)*.48,
      i%3===0?0x91bd8c:0x6a9e7b);
    leaf.rotation.z=Math.cos(theta)*.55;
    leaf.rotation.x=-Math.sin(theta)*.35;
    plantLeaves.push(leaf);
  }
  sphere(.55,.56,.55,-6.2,1.38,-4.2,0x83b08a);
  // More greenery and soft flower accents at window height.
  for(const [px,pz] of [[-8.08,-5.1],[7.77,-5.18],[-7.8,4.84]]){
    cylinder(.30,.29,.46,px,.25,pz,0xc79c77);
    for(let i=0;i<5;i++){
      const a=i*1.25;
      sphere(.26,.44,.25,px+Math.cos(a)*.17,.83+i*.05,pz+Math.sin(a)*.17,
        i%2?0x74a88a:0x9cc398);
    }
  }
  // Cherry blossom branches hang from the rear garden wall.
  for(const [px,pz] of [[-5,-6.54],[1.8,-6.56],[6.1,-6.56]]){
    tube([[px,2.8,pz],[px+.3,3.07,pz+.30],[px+.75,3.34,pz+.36]],.055,0x95745f);
    for(let i=0;i<6;i++){
      const a=i*2.4;
      sphere(.13,.11,.13,px+.48+Math.cos(a)*.22,3.13+Math.sin(a)*.25,pz+.31,
        i%2?0xf5c2cb:0xffe2ce);
    }
  }
  // Paper lanterns across café front with warm cores.
  tube([[-8,3.0,2],[-3,2.9,2],[2,3.04,2],[7,2.92,2]],.025,0x9c8871);
  for(let i=0;i<6;i++){
    const x=-7.3+i*2.5;
    tube([[x,3,2],[x,2.62,2]],.025,0x9c8871);
    sphere(.27,.34,.27,x,2.43,2,i%2?0xffd5be:0xffe3a8,null,true);
    cylinder(.04,.07,.16,x,2.04,2,0xd3a981);
  }
  // Entrance sign with two little timber posts.
  box(3.9,.08,1.65,-6.5,.02,5.7,0xe9d5b0);
  for(const x of [-7.84,-5.12]) cylinder(.1,.1,2.5,x,1.25,6.2,0xa68165);
  const doorPanel=box(3.1,.52,.22,-6.48,2.45,6.2,0x699f87,null,true);

  // Scooter with glossy rounded body and delivery box.
  for(const z of [3.0,4.3]){
    const wheel=cylinder(.49,.49,.22,6.2,.48,z,0x4c5760);
    wheel.rotation.z=Math.PI/2;
    sphere(.23,.23,.07,6.32,.48,z,0xe8ddbb);
  }
  sphere(.60,.40,.99,6.2,1.0,3.62,0xf2a393,null,true);
  box(.89,.72,.85,6.2,1.61,3.06,0x9ac0a6,null,true);
  box(.65,.14,.50,6.2,1.38,4.08,0x475c58);
  cylinder(.07,.07,.9,6.2,1.76,2.92,0x4f6361);
  box(.9,.09,.12,6.2,2.17,2.92,0x4f6361);
  const bikeLamp=sphere(.19,.19,.08,6.23,1.12,4.44,0xffe0a7);
  bikeLamp.isVisible=false;

  // NPCs are stylized chibi anime characters with expressive eyes and hair.
  function makeHuman(root,bodyColor,kind,hairColor){
    disc(0,0,.56,0x526658,.25,root);
    for(const x of [-.22,.22]){
      cylinder(.17,.19,.64,x,.36,0,0x596878,root);
      sphere(.22,.115,.31,x,.13,.14,0x4b5f67,root,true);
    }
    sphere(.45,.52,.36,0,1.00,0,bodyColor,root,true);
    sphere(.14,.33,.14,-.53,1.04,0,bodyColor,root);
    sphere(.14,.33,.14,.53,1.04,0,bodyColor,root);
    sphere(.57,.61,.50,0,1.89,.06,0xf9d6bc,root,true);
    // Manga hair silhouette + tapered bangs and side locks.
    sphere(.59,.33,.53,0,2.32,.04,hairColor,root,true);
    for(let i=0;i<4;i++){
      const x=-.37+i*.24;
      const bang=cone(.14,.42,x,2.19,.45,hairColor,root);
      bang.rotation.z=i<2?-.23:.18;
    }
    for(const x of [-.49,.49]){
      sphere(.17,.41,.14,x,1.99,.06,hairColor,root);
      sphere(.13,.09,.035,x*1.0,1.70,.48,0xf0a6ac,root);
    }
    for(const x of [-.23,.23]){
      sphere(.16,.23,.078,x,1.93,.517,0xffffff,root);
      sphere(.093,.155,.056,x,1.93,.587,0x42556c,root);
      sphere(.038,.060,.025,x-.033,2.001,.636,0xffffff,root);
    }
    tube([[-.09,1.59,.53],[0,1.56,.56],[.09,1.60,.53]],.024,0xaf7768,root);
    if(kind==='staff'){
      box(.50,.56,.09,0,1.02,.35,0xf6ead3,root);
      box(.38,.12,.12,0,1.32,.41,0xefd3b1,root);
    }
    return root;
  }
  function makeCat(root,color){
    disc(0,0,.58,0x526658,.25,root);
    sphere(.50,.42,.63,0,.62,0,color,root,true);
    sphere(.52,.48,.48,0,1.25,.20,color,root,true);
    for(const x of [-.34,.34]){
      const ear=cone(.23,.50,x,1.77,.22,color,root);
      ear.rotation.z=x>0?.1:-.1;
      cone(.13,.28,x,1.78,.42,0xf2b8b6,root);
      sphere(.19,.16,.23,x,.20,.40,color,root);
    }
    for(const x of [-.22,.22]){
      sphere(.16,.21,.07,x,1.30,.64,0xfff7ed,root);
      sphere(.09,.15,.047,x,1.31,.71,0x425568,root);
      sphere(.032,.045,.02,x-.025,1.37,.75,0xffffff,root);
    }
    sphere(.085,.06,.06,0,1.13,.68,0xc78083,root);
    for(const dir of [-1,1]){
      for(let i=0;i<2;i++){
        tube([[dir*.09,1.1-i*.075,.64],[dir*.4,1.16-i*.12,.67]],.012,0x6c6760,root);
      }
    }
    tube([[0,.59,-.42],[.48,.65,-.55],[.69,1.12,-.42],[.52,1.3,-.32]],.12,color,root);
    return root;
  }
  function makeCharacter(id,x,z,color,kind,player=false){
    const root=new B.TransformNode('actor-'+id,scene);
    root.position.set(x,0,z);
    const hair=kind==='customer'?0x655b63:
      id==='npc_guard'||id==='guard'?0x394e60:
      id==='npc_barista'||id==='barista'?0x69554d:
      id==='npc_waiter'||id==='waiter'?0x66576e:
      id==='shipper'?0x7c6053:0x5c666a;
    if(kind==='cat'||id==='cat') makeCat(root,color);
    else makeHuman(root,color,kind,hair);
    if (id==='guard'||id==='npc_guard'){
      cylinder(.46,.46,.14,0,2.48,.04,0x456b78,root,true);
      cylinder(.30,.31,.20,0,2.60,.04,0x456b78,root);
    } else if(id==='shipper'){
      sphere(.55,.28,.48,0,2.37,.06,0xf1c16d,root,true);
      box(.65,.67,.25,0,1.04,-.39,0xf3cc76,root,true);
    } else if(id==='barista'||id==='npc_barista'){
      box(.53,.58,.09,0,1.04,.38,0xf7e5ce,root);
      cylinder(.14,.14,.16,0,2.54,0,0xf5e6d6,root);
    } else if(id==='waiter'||id==='npc_waiter'){
      cylinder(.39,.39,.075,-.65,1.41,.33,0xd8bd9a,root);
      cylinder(.12,.09,.22,-.75,1.58,.32,0xf7ead8,root);
    } else if(id==='guest_minh'){
      box(.48,.09,.35,-.3,1.27,.35,0xfaf0d0,root);
    }
    const halo=B.MeshBuilder.CreateTorus('interaction-aura-'+id,{
      diameter:1.15,thickness:.055,tessellation:30
    },scene);
    halo.parent=root;halo.position.y=.052;
    halo.material=flat(player?0xe3c887:0x92b9a3,.36);
    return {root,halo};
  }
  const npcs=[];
  for(const n of npcData){
    const model=makeCharacter(n.id,n.x,n.z,n.color,n.kind);
    npcs.push({...n,group:model.root,halo:model.halo,interactions:0,react:0});
  }
  const hero=makeCharacter(roleId,0,4.5,roles[roleId].color,
    roleId==='cat'?'cat':'staff',true);
  const player=hero.root;
  player.rotation.y=Math.PI*.0;

  // Objective marker and nearby interactions. The scene itself has no UI overlay.
  const indicator=B.MeshBuilder.CreateTorus('task-ring',{diameter:1.8,thickness:.105,tessellation:36},scene);
  indicator.material=flat(0xa0d0a2,.87);
  indicator.position.y=.15;
  const markerPole=B.MeshBuilder.CreateCylinder('task-beam',{
    height:1.6,diameterTop:.10,diameterBottom:1.0,tessellation:12
  },scene);
  markerPole.material=flat(0xb3dbc1,.13);
  markerPole.position.y=.9;
  const nearRing=B.MeshBuilder.CreateTorus('near-ring',{
    diameter:1.25,thickness:.078,tessellation:28
  },scene);
  nearRing.material=flat(0xefc992,.82);
  nearRing.position.y=.08;
  nearRing.isVisible=false;

  const refs={machineLight,tableCup,bikeLamp,benchPillow,doorPanel,plantLeaves};
  const result={
    engine,scene,camera,canvas,player,npcs,refs,indicator,markerPole,nearRing,
    focusedStation:null,
    setTint(mesh,hex){mesh.material=toon(hex);},
    resize(){
      engine.resize();
      const width=Math.max(1,container.clientWidth),height=Math.max(1,container.clientHeight);
      const aspect=width/height;
      const halfW=aspect<.8?8.2:11.65;
      const halfH=halfW/aspect;
      camera.orthoLeft=-halfW;camera.orthoRight=halfW;
      camera.orthoTop=halfH;camera.orthoBottom=-halfH;
      camera.getProjectionMatrix(true);
    },
    followPlayer(dt=1){
      const aspect=container.clientWidth/Math.max(1,container.clientHeight);
      const follow=aspect<.85?.82:.28;
      const target=new B.Vector3(player.position.x*follow,.55,player.position.z*follow);
      const destination=target.add(new B.Vector3(18,23,19));
      camera.position=B.Vector3.Lerp(camera.position,destination,.085);
      camera.setTarget(target);
    },
    render(){scene.render();},
    dispose(){
      scene.dispose();engine.dispose();
      if(canvas.parentNode)canvas.parentNode.removeChild(canvas);
    }
  };
  result.resize();
  return result;
}
