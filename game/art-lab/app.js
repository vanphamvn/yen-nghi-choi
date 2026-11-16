/* Yên Art Lab P0: isolated, local-only GLB viewer.
 * No upload, storage, user tracking, or modification to the production game.
 * Babylon 9.36 UMD + GLB loader must be loaded before this file.
 */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const FILE_LIMIT = 40 * 1024 * 1024;
  const stage = $('renderCanvas');
  const fileInput = $('asset-file');
  const animationSelect = $('animation');
  let engine, scene, camera, preview, activeAsset = null;
  let waiting = false, lastSampleAt = 0, fpsSamples = [];
  let lastFilename = '';
  const defaultState = { asset: 'CHƯA CÓ MODEL', status: 'Sân khấu đã sẵn sàng' };

  function status(message) { $('render-state').textContent = message; }
  function error(message) {
    $('asset-error').hidden = false;
    $('asset-error').textContent = message;
    status('Có lỗi');
  }
  function clearError() { $('asset-error').textContent = ''; $('asset-error').hidden = true; }
  function formatBytes(bytes) {
    return bytes >= 1024 * 1024 ? (bytes / (1024 * 1024)).toFixed(2) + ' MB'
      : (bytes / 1024).toFixed(1) + ' KB';
  }
  function median(numbers) {
    if (!numbers.length) return null;
    const copy = numbers.slice().sort((a,b) => a-b);
    const mid = Math.floor(copy.length / 2);
    return copy.length % 2 ? copy[mid] : (copy[mid - 1] + copy[mid]) / 2;
  }
  function setColor(mesh, rgb, emissive = .1) {
    const B = window.BABYLON;
    const material = new B.StandardMaterial('studio-' + mesh.name, scene);
    material.diffuseColor = B.Color3.FromHexString(rgb);
    material.emissiveColor = material.diffuseColor.scale(emissive);
    material.specularColor = B.Color3.FromHexString('#202927');
    mesh.material = material;
    return mesh;
  }
  function init() {
    const B = window.BABYLON;
    if (!B?.Engine || !B?.SceneLoader) {
      error('Không tải được Babylon.js hoặc bộ đọc GLB. Kiểm tra kết nối mạng / trình duyệt và tải lại trang.');
      return;
    }
    try {
      engine = new B.Engine(stage, true, {
        preserveDrawingBuffer: true, stencil: true, antialias: true, adaptToDeviceRatio: false
      });
      engine.setHardwareScalingLevel(Math.max(1, (window.devicePixelRatio || 1) / 1.6));
      scene = new B.Scene(engine);
      scene.clearColor = new B.Color4(.82, .89, .85, 1);
      scene.ambientColor = B.Color3.FromHexString('#e3e6d9');
      camera = new B.ArcRotateCamera('inspection-camera',-Math.PI / 2.75,Math.PI / 2.6,6.8,
        new B.Vector3(0,1.15,0),scene);
      camera.lowerRadiusLimit = 1.1;
      camera.upperRadiusLimit = 22;
      camera.lowerBetaLimit = .15;
      camera.upperBetaLimit = Math.PI / 2.12;
      camera.wheelPrecision = 50;
      camera.pinchPrecision = 85;
      camera.attachControl(stage, true);
      scene.activeCamera = camera;
      const hemi = new B.HemisphericLight('fill',new B.Vector3(0,1,0),scene);
      hemi.intensity = .72;
      hemi.diffuse = B.Color3.FromHexString('#fff5e5');
      hemi.groundColor = B.Color3.FromHexString('#799a88');
      const key = new B.DirectionalLight('key',new B.Vector3(-.7,-1,-.45),scene);
      key.intensity = 1.55;
      key.diffuse = B.Color3.FromHexString('#fff0d7');
      key.position = new B.Vector3(6,11,7);
      const rim = new B.DirectionalLight('rim',new B.Vector3(.75,-.75,.5),scene);
      rim.intensity = .6;
      rim.diffuse = B.Color3.FromHexString('#bad9e8');

      const ground = B.MeshBuilder.CreateGround('studio-floor',{width:40,height:40},scene);
      ground.position.y = -.22;
      setColor(ground,'#c8dbd0',.16);
      const plinth = B.MeshBuilder.CreateCylinder('studio-platform',{
        height:.22,diameterTop:4.2,diameterBottom:4.5,tessellation:48
      },scene);
      plinth.position.y = -.11;
      setColor(plinth,'#f4ede0',.10);
      const accent = B.MeshBuilder.CreateTorus('studio-rim',{diameter:4.26,thickness:.045,tessellation:64},scene);
      accent.position.y = .013;
      setColor(accent,'#d7b68d',.3);

      preview = { ground, plinth, accent };
      try {
        const shadows = new B.ShadowGenerator(1024,key);
        shadows.useBlurExponentialShadowMap = true;
        shadows.blurKernel = 18;
        ground.receiveShadows = true;
        preview.shadows = shadows;
      } catch (e) {
        // An absent shadow extension should never prevent asset inspection.
      }
      engine.runRenderLoop(() => {
        scene.render();
        const t = performance.now();
        if (lastSampleAt) {
          const elapsed = t-lastSampleAt;
          if (elapsed > 0 && elapsed < 200) {
            fpsSamples.push(1000/elapsed);
            if (fpsSamples.length > 120) fpsSamples.shift();
          }
        }
        lastSampleAt = t;
      });
      const resize = () => engine?.resize();
      window.addEventListener('resize',resize);
      window.addEventListener('orientationchange',resize);
      window.addEventListener('pagehide',() => {
        disposeAsset();
        try { engine?.dispose(); } catch (e) { /* browser teardown */ }
      },{once:true});
      setCamera('three-quarter');
      status(defaultState.status);
      setInterval(updateStats,1000);
      updateStats();
    } catch (e) {
      error('Trình duyệt không khởi tạo được WebGL: '+(e?.message || String(e)));
    }
  }

  function setCamera(preset) {
    if (!camera || !window.BABYLON) return;
    const B = window.BABYLON;
    const positions = { front: -Math.PI / 2, 'three-quarter': -Math.PI/2.7,
      side: 0, back: Math.PI/2 };
    const alpha = positions[preset] ?? positions['three-quarter'];
    const radius = Math.max(3.5,camera.radius);
    camera.alpha = alpha;
    camera.beta = Math.PI/2.6;
    camera.radius = radius;
    camera.setTarget(new B.Vector3(0,1.13,0));
    $('camera-view').textContent = preset === 'three-quarter' ? 'Góc 3/4'
      : { front: 'Chính diện', side: 'Ngang', back: 'Phía sau' }[preset] || 'Góc 3/4';
  }

  function disposeAsset() {
    if (!activeAsset) return;
    const old = activeAsset;
    activeAsset = null;
    try {
      for (const animation of old.animationGroups || []) animation.stop();
      old.container.removeAllFromScene();
      old.container.dispose();
      old.anchor.dispose();
    } catch (e) {
      console.warn('Could not fully dispose previous model',e);
    }
  }
  function boundsFromMeshes(meshes) {
    const min = {x:Infinity,y:Infinity,z:Infinity};
    const max = {x:-Infinity,y:-Infinity,z:-Infinity};
    let triangles = 0, drawable = 0;
    for (const mesh of meshes) {
      const n = mesh.getTotalVertices?.() || 0;
      if (n <= 0) continue;
      drawable++;
      triangles += (mesh.getTotalIndices?.() || 0) / 3;
      mesh.computeWorldMatrix(true);
      const b = mesh.getBoundingInfo()?.boundingBox;
      if (!b) continue;
      const low=b.minimumWorld,high=b.maximumWorld;
      for (const k of ['x','y','z']) {
        min[k] = Math.min(min[k],low[k]);
        max[k] = Math.max(max[k],high[k]);
      }
    }
    if (drawable===0) throw new Error('GLB không chứa mesh có hình học để hiển thị');
    if (!Number.isFinite(min.x)) throw new Error('Không xác định được kích thước model');
    return {min,max,triangles:Math.round(triangles),drawable};
  }
  function populateAnimations(groups) {
    animationSelect.replaceChildren();
    const opt=document.createElement('option');
    opt.value='';opt.textContent=groups.length?'Tạm dừng / T-pose':'Không có animation';
    animationSelect.append(opt);
    groups.forEach((g,index)=>{
      const option=document.createElement('option');
      option.value=String(index);option.textContent=g.name || 'Clip '+(index+1);
      animationSelect.append(option);
    });
    animationSelect.value='';
  }
  function playAnimation(value) {
    if (!activeAsset) return;
    for (const group of activeAsset.animationGroups) group.stop();
    if (value === '') return;
    const clip=activeAsset.animationGroups[Number(value)];
    if (clip) clip.start(true,1,clip.from,clip.to,false);
  }
  function updateStats() {
    const fps=median(fpsSamples);
    $('fps').textContent=fps ? Math.round(fps)+' FPS' : '–';
    if (!activeAsset) {
      $('meshes').textContent='0';$('triangles').textContent='0';
      $('clips').textContent='0';$('drawcalls').textContent='–';
      return;
    }
    $('meshes').textContent=String(activeAsset.drawable);
    $('triangles').textContent=activeAsset.triangles.toLocaleString('en-US');
    $('clips').textContent=String(activeAsset.animationGroups.length);
    const drawcalls=scene?.getEngine?.()?._drawCalls?.current;
    $('drawcalls').textContent=Number.isFinite(drawcalls) ? String(drawcalls) : '–';
  }
  async function loadFile(file) {
    if (!file || waiting) return;
    clearError();
    if (!/\.glb$/i.test(file.name)) return error('Chỉ hỗ trợ file GLB tự chứa dữ liệu (.glb).');
    if (file.size > FILE_LIMIT) return error('File vượt 40 MB. Hãy tối ưu model trước khi đưa vào web.');
    if (file.size < 20) return error('File không hợp lệ hoặc bị rỗng.');
    if (!scene || !window.BABYLON?.SceneLoader) return error('Babylon chưa sẵn sàng. Tải lại trang rồi thử lại.');
    waiting = true;status('Đang kiểm tra '+file.name+'…');
    let url;
    let incoming = null;
    try {
      url = URL.createObjectURL(file);
      const B = window.BABYLON;
      // The opaque blob URL has no .glb extension; supply the plugin explicitly.
      incoming = await B.SceneLoader.LoadAssetContainerAsync('',url,scene,undefined,'.glb');
      incoming.addAllToScene();
      for (const group of incoming.animationGroups || []) group.stop();
      const bounds=boundsFromMeshes(incoming.meshes);
      const w=bounds.max.x-bounds.min.x,h=bounds.max.y-bounds.min.y,d=bounds.max.z-bounds.min.z;
      const longest=Math.max(w,h,d,.1);
      const scale=Math.min(6,2.8/longest);
      const anchor=new B.TransformNode('review-root',scene);
      // Parent the imported hierarchy once; do not flatten skinned meshes.
      for (const root of incoming.rootNodes || []) {
        if (!root.parent) root.parent=anchor;
      }
      anchor.scaling.setAll(scale);
      anchor.position.set(
        -(bounds.min.x+bounds.max.x)*.5*scale,
        -bounds.min.y*scale,
        -(bounds.min.z+bounds.max.z)*.5*scale
      );
      if (activeAsset) disposeAsset();
      activeAsset={
        name:file.name,bytes:file.size,container:incoming,anchor,
        animationGroups:incoming.animationGroups||[],drawable:bounds.drawable,
        triangles:bounds.triangles
      };
      const groups=activeAsset.animationGroups;
      populateAnimations(groups);
      $('asset-name').textContent=file.name.toUpperCase();
      $('asset-bytes').textContent=formatBytes(file.size);
      $('camera-preset').value='three-quarter';
      setCamera('three-quarter');
      camera.radius=5.1;
      status('Đã mở · '+bounds.drawable+' mesh · '+groups.length+' clip');
      updateStats();
      if (groups.length) {
        const ix=groups.findIndex(g=>/idle/i.test(g.name));
        const selected=ix<0?0:ix;
        animationSelect.value=String(selected);
        playAnimation(String(selected));
      }
      incoming=null; // ownership moved to activeAsset
    } catch (e) {
      console.error('GLB validation error',e);
      if (incoming) {
        try { incoming.removeAllFromScene();incoming.dispose(); } catch (_ignored) {}
      }
      error('Không đọc được GLB: '+(e?.message || String(e)));
    } finally {
      if (url) URL.revokeObjectURL(url);
      waiting = false;
      fileInput.value='';
    }
  }

  $('camera-preset').addEventListener('change',e=>setCamera(e.target.value));
  $('reset-camera').addEventListener('click',()=>setCamera($('camera-preset').value));
  $('animation').addEventListener('change',e=>playAnimation(e.target.value));
  fileInput.addEventListener('change',e=>loadFile(e.target.files?.[0]));
  const drop=$('file-dropzone');
  drop.addEventListener('click',()=>fileInput.click());
  drop.addEventListener('keydown',e=>{
    if(e.key==='Enter'||e.key===' '){e.preventDefault();fileInput.click();}
  });
  for(const eventName of ['dragenter','dragover'])drop.addEventListener(eventName,e=>{
    e.preventDefault();drop.classList.add('dragging');
  });
  for(const eventName of ['dragleave','drop'])drop.addEventListener(eventName,e=>{
    e.preventDefault();drop.classList.remove('dragging');
    if(eventName==='drop')loadFile(e.dataTransfer?.files?.[0]);
  });
  $('capture').addEventListener('click',()=>{
    if(!scene || !engine) return error('Không có canvas WebGL để chụp ảnh.');
    try{
      scene.render();
      const link=document.createElement('a');
      const safe=(activeAsset?.name || 'empty-stage').replace(/\.glb$/i,'').replace(/[^a-zA-Z0-9_-]/g,'-');
      link.download='yen-art-lab-'+safe+'-'+$('camera-preset').value+'.png';
      link.href=stage.toDataURL('image/png');
      link.click();
      status('Đã chụp ảnh kiểm thử');
    }catch(e){error('Không thể chụp ảnh canvas: '+e.message);}
  });
  init();
})();
