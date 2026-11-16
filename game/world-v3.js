/*
 * YÊN Game 3D — v3 asset-driven stylized café
 * Licensed Kenney CC0 GLB characters and props (see assets/v3/CREDITS.md).
 * Babylon.js rendering stays separate from game state and day/shift rules.
 */
export async function createAnimeWorld(B, mount, roleId, roles, descriptors) {
  if (!B?.Engine || !B?.SceneLoader) throw new Error('Babylon.js GLB loader is missing');
  const began = performance.now();
  const canvas = document.createElement('canvas');
  canvas.className='yen-world-canvas';
  canvas.setAttribute('aria-label','Quán Yên 3D: nhân vật hoạt hình và nội thất có thể tương tác');
  // Canvas styling lives in game/style.css so a strict CSP does not reject inline styles.
  mount.replaceChildren(canvas);
  let engine=null, scene=null;
  const imported=[];
  try {
    engine=new B.Engine(canvas,true,{antialias:true,stencil:false,preserveDrawingBuffer:false,adaptToDeviceRatio:false});
    engine.setHardwareScalingLevel(Math.max(1,(window.devicePixelRatio||1)/1.6));
    scene=new B.Scene(engine);
    scene.clearColor=new B.Color4(.79,.88,.87,1);
    scene.ambientColor=B.Color3.FromHexString('#e9e6dc');
    scene.imageProcessingConfiguration.toneMappingEnabled=true;
    scene.imageProcessingConfiguration.toneMappingType=B.ImageProcessingConfiguration.TONEMAPPING_ACES;
    scene.imageProcessingConfiguration.contrast=1.11;
    scene.imageProcessingConfiguration.exposure=1.14;
    const camera=new B.FreeCamera('isometric-3d',new B.Vector3(16,20,18),scene);
    camera.mode=B.Camera.ORTHOGRAPHIC_CAMERA;
    camera.minZ=.1;camera.maxZ=120;
    scene.activeCamera=camera;
    camera.setTarget(new B.Vector3(0,.7,0));
    const ambient=new B.HemisphericLight('ambient-sky',new B.Vector3(0,1,0),scene);
    ambient.intensity=.78;
    ambient.diffuse=B.Color3.FromHexString('#fff6e6');
    ambient.groundColor=B.Color3.FromHexString('#809f8c');
    const sun=new B.DirectionalLight('warm-afternoon',new B.Vector3(-.64,-1,-.42),scene);
    sun.position=new B.Vector3(10,20,11);
    sun.intensity=2.0;
    sun.diffuse=B.Color3.FromHexString('#fff0d7');
    const bounce=new B.PointLight('coffee-warm-bounce',new B.Vector3(2,3,-2),scene);
    bounce.intensity=.38;
    bounce.diffuse=B.Color3.FromHexString('#ffd0a1');
    const shadows=new B.ShadowGenerator(1024,sun);
    shadows.useBlurExponentialShadowMap=true;
    shadows.blurKernel=24;
    let drawId=0;
    const c=hex=>B.Color3.FromHexString(hex);
    function mat(color,rough=.88){
      const m=new B.PBRMaterial('paint-'+(++drawId),scene);
      m.albedoColor=c(color);m.roughness=rough;m.metallic=0;
      return m;
    }
    const materials={
      sand:mat('#dfd7be'),pale:mat('#fff0d7'),wall:mat('#f4e4c8'),
      sage:mat('#6d947a'),dark:mat('#466c5d'),terracotta:mat('#c98e72'),
      wood:mat('#b98d6b'),woodDark:mat('#815f4b'),glass:mat('#89bdb5',.17),
      chalk:mat('#f8f4e7'),grass:mat('#a5bc93'),stone:mat('#b5a890'),
      tile:mat('#eed9be'),gold:mat('#ddb77f'),pink:mat('#ecafa2'),
      leaf:mat('#6c9d7d'),ink:mat('#385346')
    };
    function shadowTarget(mesh){mesh.receiveShadows=true;return mesh;}
    function box(id,w,h,d,x,y,z,m,shadow=true){
      const item=B.MeshBuilder.CreateBox(id,{width:w,height:h,depth:d},scene);
      item.position.set(x,y,z);item.material=m;
      if(shadow){shadows.addShadowCaster(item);item.receiveShadows=true;}
      return item;
    }
    function cylinder(id,diameter,height,x,y,z,m,shadow=true){
      const item=B.MeshBuilder.CreateCylinder(id,{diameter,height,tessellation:18},scene);
      item.position.set(x,y,z);item.material=m;
      if(shadow)shadows.addShadowCaster(item);
      return item;
    }
    function ball(id,diameter,x,y,z,m){
      const item=B.MeshBuilder.CreateSphere(id,{diameter,segments:12},scene);
      item.position.set(x,y,z);item.material=m;shadows.addShadowCaster(item);return item;
    }
    function card(text,w,h,x,y,z,background,foreground,size=68){
      const t=new B.DynamicTexture('letter-'+(++drawId),{width:640,height:256},scene,false);
      const ctx=t.getContext();
      ctx.fillStyle=background;ctx.fillRect(0,0,640,256);
      ctx.fillStyle=foreground;ctx.textAlign='center';
      ctx.font='italic bold '+size+'px Georgia, serif';
      ctx.fillText(text,320,139);
      ctx.font='bold 27px Arial';
      ctx.fillText('COFFEE  &  TEA',320,213);
      t.update();
      const m=new B.StandardMaterial('sign-'+drawId,scene);
      m.diffuseTexture=t;m.emissiveTexture=t;
      m.disableLighting=true;m.backFaceCulling=false;
      const mesh=B.MeshBuilder.CreatePlane('brand-'+drawId,{width:w,height:h,sideOrientation:B.Mesh.DOUBLESIDE},scene);
      mesh.position.set(x,y,z);mesh.material=m;
      return mesh;
    }
    const floor=B.MeshBuilder.CreateBox('yen-wooden-floor',{width:18.1,height:.38,depth:14.1},scene);
    floor.position.set(0,-.22,0);floor.material=materials.pale;shadowTarget(floor);
    box('garden-land',40,.22,34,0,-.49,0,materials.grass,false);
    box('foundation',19,.38,15,0,-.54,0,materials.woodDark,false);
    // Warm plank texture painted as one tiling canvas, rather than dozens of draw calls.
    const plank=new B.DynamicTexture('wood-plank-illustrated',{width:1024,height:1024},scene,false);
    const pen=plank.getContext();
    pen.fillStyle='#d4b493';pen.fillRect(0,0,1024,1024);
    const plankColors=['#dfbd99','#cfa781','#d9b08a','#e4c3a4'];
    for(let row=0;row<16;row++){
      for(let col=0;col<8;col++){
        const x=col*128+(row%2?-55:0),y=row*64;
        pen.fillStyle=plankColors[(row+col)%4];pen.fillRect(x+2,y+2,124,60);
        pen.strokeStyle='rgba(99,62,43,.22)';pen.strokeRect(x+2,y+2,124,60);
        pen.strokeStyle='rgba(140,98,69,.15)';
        for(let j=0;j<3;j++){pen.beginPath();pen.moveTo(x+12,y+13+j*13);pen.lineTo(x+116,y+13+j*13);pen.stroke()}
      }
    }
    plank.update();plank.uScale=2;plank.vScale=2;
    const floorMaterial=new B.StandardMaterial('floor-texture',scene);
    floorMaterial.diffuseTexture=plank;floorMaterial.specularColor=c('#353331');
    floor.material=floorMaterial;
    // Walls and their timber structure. Camera faces the open corner.
    box('rear-plaster',18,3.55,.23,0,1.67,-7,materials.wall);
    box('left-plaster',.23,3.55,14,-9,1.67,0,materials.wall);
    box('rear-top-timber',18,.21,.38,0,3.54,-6.85,materials.woodDark);
    box('left-top-timber',.34,.21,14,-8.85,3.54,0,materials.woodDark);
    box('lower-wall-trim',18,.16,.3,0,.37,-6.84,materials.wood);
    for(const x of [-8.6,-6.4,-4.2,-2,0.2,2.4,4.6,6.8,8.6]){
      box('vertical-timber-'+x,.095,3.35,.09,x,1.66,-6.79,materials.wood);
    }
    // High windows with translucent turquoise glass and thin frames.
    for(const x of [-7.1,6.9]){
      box('glazing-'+x,1.85,1.69,.055,x,1.78,-6.72,materials.glass);
      box('window-top-'+x,2,.10,.19,x,2.67,-6.65,materials.woodDark);
      box('window-bottom-'+x,2,.10,.19,x,.87,-6.65,materials.woodDark);
      box('window-cross-'+x,.095,1.8,.16,x,1.76,-6.63,materials.woodDark);
      box('window-sash-'+x,1.96,.08,.17,x,1.76,-6.62,materials.woodDark);
    }
    // A small shop sign; exact logo can later be replaced by approved vector texture.
    const brand=card('yên',4.15,1.48,-2.0,2.28,-6.80,'#315d49','#f8f0d8',132);
    box('hanging-sign-frame',4.35,1.61,.08,-2,2.27,-6.88,materials.woodDark);
    brand.position.z=-6.79;
    // Canopy and columns reference the lightness of the real café.
    box('awning-soft-roof',7.75,.20,2.25,3.45,3.79,-5.7,materials.sage);
    box('awning-leading',8,.19,.28,3.45,3.69,-4.53,materials.woodDark);
    for(const x of [0,6.9]){
      cylinder('awning-post-'+x,.14,3.7,x,1.85,-4.5,materials.wood);
    }
    // Glass blocks as a playful real-world decorative echo.
    for(let i=0;i<5;i++)for(let j=0;j<3;j++){
      const glass=box('glass-block-'+i+'-'+j,.31,.31,.16,-8.83,1.23+j*.33,1.2+i*.36,materials.glass,false);
      glass.material.alpha=.72;glass.material.transparencyMode=B.Material.MATERIAL_ALPHABLEND;
    }
    // Counter: stronger silhouette, actual GLB equipment will be placed on top.
    box('bar-mint-main',5.55,1.32,1.85,3,0.68,-3.72,materials.sage);
    box('bar-solid-top',5.92,.18,2.02,3,1.40,-3.72,materials.woodDark);
    for(const x of [.77,2.05,3.33,4.61]){
      box('bar-slats-'+x,.14,1.0,.08,x,.73,-2.755,materials.pale);
    }
    box('bar-foot',5.62,.17,1.96,3,.13,-3.72,materials.woodDark);
    for(let i=0;i<4;i++)cylinder('counter-cup-'+i,.27,.19,3.35+i*.39,1.58,-4.26,materials.pink);
    // Decorations that frame rather than block the focal scene.
    box('display-ledge',2.7,.15,.45,-6.5,2.46,-6.61,materials.wood);
    box('poster',.75,1.12,.04,-5.0,1.9,-6.74,materials.terracotta);
    for(const x of [-5.6,-5.1,-4.6]) ball('poster-paint-'+x,.12,x,2.23,-6.69,materials.gold);
    for(const x of [-6.6,2.0,5.3]){
      const lantern=ball('hanging-lamp-'+x,.48,x,3.20,-3.35,materials.gold);
      lantern.material.emissiveColor=c('#ffcd89').scale(.20);
      cylinder('lamp-cord-'+x,.035,.3,x,3.53,-3.35,materials.ink);
    }
    // Outdoor path, small patches of moss and foliage; no Japanese cherry blossoms.
    box('walkway',3.6,.09,2.95,-6.55,-.02,5.7,materials.sand,false);
    for(const [x,z] of [[-7.5,7.2],[-6.4,8.1],[-5.3,8.9],[-4.4,9.5]]){
      cylinder('steppingstone',.7,.10,x,-.05,z,materials.stone,false);
    }
    for(const [x,z] of [[-10,-3],[-10,4],[10,6],[10,-4]]){
      cylinder('tree-trunk',.42,3,x,1.35,z,materials.woodDark);
      for(const [dx,dy,dz] of [[0,0,0],[-.48,-.30,.18],[.43,-.28,-.25]]){
        ball('branch-crown',2.25,x+dx,3.32+dy,z+dz,materials.leaf);
      }
    }
    // Scene content/model metadata
    const specs={
      // New characters come from CC0 source and carry genuine skeleton animations.
      'guard':'character-male-a',
      'shipper':'character-male-b',
      'barista':'character-female-b',
      'waiter':'character-female-a',
      'cat':'animal-cat',
      'guest_minh':'character-male-c',
      'guest_lan':'character-female-c',
      'npc_guard':'character-male-a',
      'npc_barista':'character-female-b',
      'npc_waiter':'character-female-a',
      'npc_cat':'animal-cat'
    };
    const base='./assets/v3/';
    async function loadGLB(kind,name) {
      const location=base+(kind==='characters'?'characters/':'props/');
      const container=await B.SceneLoader.LoadAssetContainerAsync(location,name+'.glb',scene);
      imported.push(container);
      container.addAllToScene();
      for(const mesh of container.meshes){
        if(mesh.getTotalVertices && mesh.getTotalVertices()>0){
          mesh.receiveShadows=true;
          if(kind==='characters')shadows.addShadowCaster(mesh);
        }
      }
      return container;
    }
    function measure(models) {
      const min={x:Infinity,y:Infinity,z:Infinity}, max={x:-Infinity,y:-Infinity,z:-Infinity};
      let faces=0;
      for(const mesh of models.meshes){
        if(!mesh.getTotalVertices || mesh.getTotalVertices()===0)continue;
        mesh.computeWorldMatrix(true);
        const b=mesh.getBoundingInfo()?.boundingBox;
        if(!b)continue;
        for(const axis of ['x','y','z']){
          min[axis]=Math.min(min[axis],b.minimumWorld[axis]);
          max[axis]=Math.max(max[axis],b.maximumWorld[axis]);
        }
        faces+=(mesh.getTotalIndices?.()||0)/3;
      }
      if(!Number.isFinite(min.y))throw Error('GLB has no renderable meshes');
      return {min,max,faces};
    }
    async function attachAsset(kind,name,id,position,height,rot=0) {
      const importedAsset=await loadGLB(kind,name);
      const bounds=measure(importedAsset);
      const parent=new B.TransformNode('instance-'+id,scene);
      parent.position.set(position[0],position[1],position[2]);
      parent.rotation.y=rot;
      const holder=new B.TransformNode('normalize-'+id,scene);
      holder.parent=parent;
      const sizeY=Math.max(.01,bounds.max.y-bounds.min.y);
      const factor=height/sizeY;
      holder.scaling.setAll(factor);
      holder.position.set(-(bounds.min.x+bounds.max.x)*.5*factor,
        -bounds.min.y*factor,-(bounds.min.z+bounds.max.z)*.5*factor);
      for(const root of importedAsset.rootNodes)if(!root.parent)root.parent=holder;
      const groups=importedAsset.animationGroups||[];
      for(const g of groups)g.stop();
      let current='';
      function play(action='idle'){
        const matches={
          idle:['idle','static'],walk:['walk','sprint'],interact:['interact-right','pick-up','emote-yes','idle'],
          talk:['emote-yes','idle'],sit:['sit','idle'],cheer:['dance','gesture-positive','emote-yes','idle']
        };
        const wanted=matches[action]||matches.idle;
        const group=wanted.map(x=>groups.find(g=>g.name?.toLowerCase()===x)).find(Boolean);
        if(!group||current===group.name)return;
        for(const g of groups)g.stop();
        group.start(true,1,group.from,group.to,false);
        current=group.name;
      }
      play('idle');
      return {root:parent,holder,groups,play,bounds,importedAsset};
    }
    // Load the entire vertical slice and character cast; each GLB has an authored mesh.
    const heroFile=specs[roleId]||specs.barista;
    const playerModel=await attachAsset('characters',heroFile,'player',[0,0,4.5],
      roleId==='cat'?1.45:2.18,Math.PI);
    const player=playerModel.root;
    const npcEntries=await Promise.all(descriptors.map(async (n,i)=>{
      const model=await attachAsset('characters',specs[n.id],n.id,[n.x,0,n.z],
        n.kind==='cat'?1.05:2.05,Math.PI*.15);
      const halo=B.MeshBuilder.CreateTorus('npc-halo-'+n.id,
        {diameter:1.15,thickness:.052,tessellation:28},scene);
      halo.material=new B.StandardMaterial('npc-ring-mat-'+n.id,scene);
      halo.material.diffuseColor=c('#87bb9f');
      halo.material.emissiveColor=c('#609478').scale(.55);
      halo.material.alpha=.4;
      halo.position.y=.05;halo.parent=model.root;
      return {...n,group:model.root,model,halo,interactions:0,react:0};
    }));
    const npcs=npcEntries;
    // Props are textured low-poly GLB assets instead of anonymous primitives.
    const propSpecs=[
      ['coffeemachine','kitchencoffeemachine',[1.7,1.5,-3.74],.73,0],
      ['diningtable','table',[-3.25,0,-1.4],.92,0],
      ['chair1','chairmodernframecushion',[-5.02,0,-1.45],.86,Math.PI/2],
      ['chair2','chairmodernframecushion',[-1.58,0,-1.4],.86,-Math.PI/2],
      ['chair3','chairrounded',[-3.25,0,-3.10],.86,0],
      ['chair4','chairrounded',[-3.16,0,.25],.86,Math.PI],
      ['bench','benchcushion',[2.5,0,3.5],1.07,Math.PI],
      ['bookcase','bookcaseopen',[-7.55,0,-5.62],2.2,-Math.PI/2],
      ['plant','plantsmall1',[-6.2,0,-4.2],1.36,0],
      ['plantNearWindow','plantsmall1',[7.9,0,-5.4],1.1,0],
      ['guestCup','cup-coffee',[-3.0,.94,-1.47],.26,0],
      ['counterMug','mug',[4.4,1.5,-3.35],.31,0],
      ['outdoorTree','tree-default',[10,0,-4.5],4.4,0],
      ['barTrim','kitchenbar',[6.25,0,-5.35],1.1,Math.PI/2]
    ];
    const propEntries=await Promise.all(propSpecs.map(async ([id,name,pos,h,r])=>
      [id,await attachAsset('props',name,id,pos,h,r)]));
    const propMap=Object.fromEntries(propEntries);
    // Extra café details with a few stable meshes; geometry is architecture, not fake characters.
    const bike=B.MeshBuilder.CreateBox('small-delivery-scooter',{width:.76,height:.70,depth:1.3},scene);
    bike.position.set(6.2,.75,3.55);bike.material=materials.terracotta;
    const bikeSeat=box('scooter-seat',.84,.19,.65,6.2,1.1,3.5,materials.ink);
    for(const z of [2.95,4.2]){
      const wheel=B.MeshBuilder.CreateTorus('bike-tire-'+z,{diameter:.84,thickness:.21,tessellation:22},scene);
      wheel.position.set(6.2,.48,z);wheel.rotation.z=Math.PI/2;wheel.material=materials.ink;
    }
    const bikeLamp=ball('bike-light',.20,6.2,.96,4.27,materials.gold);bikeLamp.isVisible=false;
    box('entry-sign-pole',.12,2.2,.12,-6.5,1.1,6.25,materials.woodDark);
    const doorPanel=box('entry-sign',2.3,.59,.13,-6.5,2.13,6.25,materials.sage);
    const machineLight=ball('machine-led',.13,1.21,1.82,-3.6,materials.pink);
    const benchPillow=box('bench-cushion',.8,.22,.50,2.5,1.04,3.45,materials.pink);
    const plantLeaves=[];
    for(let i=0;i<6;i++){
      const a=i*Math.PI/3;
      const mesh=ball('plant-leaf-'+i,.39,-6.2+Math.cos(a)*.37,1.20,-4.2+Math.sin(a)*.35,materials.leaf);
      plantLeaves.push(mesh);
    }
    const ringMaterial=new B.StandardMaterial('task-ring-material',scene);
    ringMaterial.diffuseColor=c('#91cba4');ringMaterial.emissiveColor=c('#5aa67e');
    const indicator=B.MeshBuilder.CreateTorus('task-ring',{diameter:1.8,thickness:.09,tessellation:40},scene);
    indicator.material=ringMaterial;indicator.position.y=.12;indicator.isVisible=false;
    const markerPole=B.MeshBuilder.CreateCylinder('task-pillar',{height:1.45,diameterTop:.07,diameterBottom:.72,tessellation:12},scene);
    markerPole.position.y=.85;markerPole.material=new B.StandardMaterial('task-cone',scene);
    markerPole.material.alpha=.12;markerPole.material.diffuseColor=c('#a8dbbd');
    markerPole.isVisible=false;
    const nearRing=B.MeshBuilder.CreateTorus('near-ring',{diameter:1.2,thickness:.065,tessellation:30},scene);
    nearRing.material=new B.StandardMaterial('interaction-ring',scene);
    nearRing.material.diffuseColor=c('#f6c991');nearRing.material.emissiveColor=c('#c9a87a');
    nearRing.material.alpha=.72;nearRing.position.y=.07;nearRing.isVisible=false;
    const refs={machineLight,tableCup:propMap.guestCup.root,bikeLamp,
      benchPillow,doorPanel,plantLeaves};
    const propDefault={
      machineLight:materials.pink,door:materials.sage
    };
    const resetInteractive=()=>{
      refs.tableCup.setEnabled(true);
      refs.bikeLamp.isVisible=false;
      refs.benchPillow.position.x=2.5;
      refs.doorPanel.material=materials.sage;
      refs.machineLight.material=materials.pink;
      for(const leaf of refs.plantLeaves)leaf.scaling.setAll(1);
    };
    const setPropState=(id,next)=>{
      if(id==='counter')refs.machineLight.material=next?materials.leaf:materials.pink;
      if(id==='table')refs.tableCup.setEnabled(!next);
      if(id==='bike')refs.bikeLamp.isVisible=!!next;
      if(id==='bench')refs.benchPillow.position.x=next?2.96:2.5;
      if(id==='door')refs.doorPanel.material=next?materials.terracotta:materials.sage;
      if(id==='plant')for(const leaf of refs.plantLeaves)leaf.scaling.y=next?1.4:1;
    };
    let lastMode='idle';
    const world={
      engine,scene,camera,canvas,player,npcs,refs,indicator,markerPole,nearRing,
      focusedStation:null,
      assetCount:imported.length,
      meshCount:scene.meshes.length,
      loadMs:Math.round(performance.now()-began),
      setTint(mesh,color){mesh.material=mat('#'+color.toString(16).padStart(6,'0'));},
      setPropState,resetInteractive,
      setMotion(mode){
        if(mode===lastMode)return;
        playerModel.play(mode);
        lastMode=mode;
      },
      playAction(){
        playerModel.play('interact');
        lastMode='interact';
      },
      resize(){
        engine.resize();
        const aspect=mount.clientWidth/Math.max(1,mount.clientHeight);
        const halfW=aspect<.85?6.25:11.65;
        const halfH=halfW/aspect;
        camera.orthoLeft=-halfW;camera.orthoRight=halfW;
        camera.orthoTop=halfH;camera.orthoBottom=-halfH;
        camera.getProjectionMatrix(true);
      },
      followPlayer(){
        const aspect=mount.clientWidth/Math.max(1,mount.clientHeight);
        const follow=aspect<.85?.96:.32;
        const target=new B.Vector3(player.position.x*follow,.84,player.position.z*follow);
        const desired=target.add(new B.Vector3(16,20,18));
        camera.position=B.Vector3.Lerp(camera.position,desired,.085);
        camera.setTarget(target);
      },
      render(){scene.render();},
      dispose(){
        for(const actor of [playerModel,...npcs.map(n=>n.model)]){
          for(const clip of actor.groups)clip.stop();
        }
        scene.dispose();engine.dispose();
        if(canvas.parentNode)canvas.parentNode.removeChild(canvas);
      }
    };
    world.resize();
    world.resetInteractive();
    world.setMotion('idle');
    console.info('Yencafeday v3 3D scene ready', {assets:world.assetCount,meshes:world.meshCount,loadMs:world.loadMs});
    return world;
  } catch(error){
    if(scene)scene.dispose();
    if(engine)engine.dispose();
    if(canvas.parentNode)canvas.parentNode.removeChild(canvas);
    throw error;
  }
}
