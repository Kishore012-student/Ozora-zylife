import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { gsap, reduced } from './motion.js';

const isMobile = () => window.innerWidth <= 900;

/** 3D capsule hero: rotates, splits open, granules burst and re-form as a helix. Returns scrubbable state + cleanup. */
export function createHero(canvas, hero) {
  const isMob = isMobile();
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  // Adaptive pixel ratio: Capped at 1.25 on mobile to eliminate GPU fragment bottleneck while keeping full retina crispness
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMob ? 1.25 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#ffffff');
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 7.2);

  const key = new THREE.DirectionalLight('#ffffff', 1.4); key.position.set(3, 4, 5); scene.add(key);
  const rim = new THREE.DirectionalLight('#f38021', 0.6); rim.position.set(-4, -2, -3); scene.add(rim);

  const rig = new THREE.Group(); scene.add(rig);     // pointer tilt + layout shift
  const cap = new THREE.Group(); rig.add(cap);       // scrubbed capsule state

  const GREEN = new THREE.Color('#277161'), ORANGE = new THREE.Color('#f38021'), WHITE = new THREE.Color('#ffffff');

  function halfCapsule(R, L, thick = 0.035){
    const pts = [];
    pts.push(new THREE.Vector2(R - thick, 0));
    pts.push(new THREE.Vector2(R, 0));
    pts.push(new THREE.Vector2(R, L));
    for(let i = 1; i <= 24; i++){ const a = (i/24) * Math.PI/2; pts.push(new THREE.Vector2(Math.cos(a)*R, L + Math.sin(a)*R)); }
    return new THREE.LatheGeometry(pts, 96);
  }
  const R = 0.58, L = 0.95;
  const topMat = new THREE.MeshPhysicalMaterial({ color: GREEN, roughness: .22, metalness: 0, clearcoat: 1, clearcoatRoughness: .08, side: THREE.DoubleSide });
  const botMat = new THREE.MeshPhysicalMaterial({ color: WHITE, roughness: .28, metalness: 0, clearcoat: 1, clearcoatRoughness: .1, side: THREE.DoubleSide, sheen: .3 });
  const top = new THREE.Mesh(halfCapsule(R, L), topMat);
  const bot = new THREE.Mesh(halfCapsule(R - 0.025, L), botMat);
  bot.rotation.z = Math.PI;               // mirror downward
  const topWrap = new THREE.Group(); topWrap.add(top); topWrap.position.y = -0.22;
  const botWrap = new THREE.Group(); botWrap.add(bot); botWrap.position.y = 0.22;
  const band = new THREE.Mesh(new THREE.TorusGeometry(R - 0.012, 0.022, 16, 120), new THREE.MeshPhysicalMaterial({ color: ORANGE, roughness: .3, clearcoat: 1 }));
  band.rotation.x = Math.PI/2; band.position.y = -0.24; botWrap.add(band);
  cap.add(topWrap, botWrap);

  /* granules */
  const N = isMobile() ? 350 : 550;
  const gGeo = new THREE.SphereGeometry(0.042, 14, 14);
  const gMat = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: .35, clearcoat: .6 });
  const grains = new THREE.InstancedMesh(gGeo, gMat, N);
  grains.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  cap.add(grains);
  const inside = [], burst = [], helix = [], scl = [], delay = [];
  for(let i = 0; i < N; i++){
    const r = Math.sqrt(Math.random()) * 0.44, a = Math.random() * Math.PI * 2;
    inside.push(new THREE.Vector3(Math.cos(a)*r*0.95, (Math.random()*2-1)*0.72, Math.sin(a)*r*0.95));
    const d = new THREE.Vector3().randomDirection().multiplyScalar(1.0 + Math.random()*1.45);
    d.y *= 1.2; burst.push(d);
    const t = i / N, strand = i % 2;
    let p;
    if(i % 9 === 0){                       // rungs between strands
      const ang = t*Math.PI*7, f = Math.random();
      const p1 = new THREE.Vector3(Math.cos(ang)*1.2, 0, Math.sin(ang)*1.2), p2 = new THREE.Vector3(Math.cos(ang+Math.PI)*1.2, 0, Math.sin(ang+Math.PI)*1.2);
      p = p1.lerp(p2, f); p.y = (t - .5) * 6.6;
    } else {
      const ang = t*Math.PI*7 + strand*Math.PI, jitter = (Math.random()-.5)*0.12;
      p = new THREE.Vector3(Math.cos(ang)*(1.2+jitter), (t-.5)*6.6 + jitter, Math.sin(ang)*(1.2+jitter));
    }
    helix.push(p);
    scl.push(0.65 + Math.random()*0.75);
    delay.push(Math.random());
    const c = Math.random(); grains.setColorAt(i, c < .62 ? WHITE : c < .82 ? ORANGE : GREEN);
  }
  grains.instanceColor.needsUpdate = true;

  /* scrubbed state */
  const S = { rotZ: -0.62, spin: 0, open: 0, burst: 0, helix: 0, ispin: 0, hz: 0, shiftY: 0, hide: 0, camZ: 7.2, shiftX: 0, intro: reduced ? 1 : 0 };
  const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
  const onPtr = e => { ptr.tx = (e.clientX / innerWidth - .5); ptr.ty = (e.clientY / innerHeight - .5); };
  window.addEventListener('pointermove', onPtr);

  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), sv = new THREE.Vector3(), tmp = new THREE.Vector3();
  let helixSpin = 0, clock = new THREE.Clock();
  const ease = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
  const clamp01 = x => Math.max(0, Math.min(1, x));

  function frame(){
    const dt = Math.min(clock.getDelta(), 0.05), time = clock.elapsedTime;
    ptr.x += (ptr.tx - ptr.x) * .06; ptr.y += (ptr.ty - ptr.y) * .06;
    rig.rotation.y = ptr.x * 0.35; rig.rotation.x = ptr.y * 0.22;
    rig.position.x = S.shiftX; rig.position.y = Math.sin(time*0.9)*0.05 * (1 - S.helix) + S.shiftY;   // idle float
    camera.position.z = S.camZ;
    cap.rotation.z = S.rotZ * (1 - S.helix) + S.hz;
    cap.rotation.y = S.spin + S.ispin + time*0.12*(1 - S.open) ;
    const sIntro = ease(S.intro);
    cap.scale.setScalar(0.0001 + sIntro);
    topWrap.position.y = -0.22 + ease(S.open)*1.55 + S.hide*2.2;
    botWrap.position.y =  0.22 - ease(S.open)*1.55 - S.hide*2.2;
    topWrap.rotation.z = S.open*0.35; botWrap.rotation.z = -S.open*0.25;
    const hs = Math.max(0.0001, 1 - ease(S.hide)); topWrap.scale.setScalar(hs); botWrap.scale.setScalar(hs);
    helixSpin += dt * (0.18 + S.helix*0.25);
    const cs = Math.cos(helixSpin*S.helix), sn = Math.sin(helixSpin*S.helix);
    for(let i = 0; i < N; i++){
      const b = ease(clamp01((S.burst - delay[i]*0.35) / 0.65));
      const h = ease(clamp01((S.helix - delay[i]*0.3) / 0.7));
      v.copy(inside[i]).lerp(burst[i], b);
      // gentle drift while floating
      v.x += Math.sin(time*0.8 + i)*0.04*b*(1-h); v.y += Math.cos(time*0.7 + i*1.3)*0.04*b*(1-h);
      tmp.copy(helix[i]); const hx = tmp.x*cs - tmp.z*sn, hz = tmp.x*sn + tmp.z*cs; tmp.x = hx; tmp.z = hz;
      v.lerp(tmp, h);
      const s = scl[i] * (1 - h) + 1.0 * h;
      sv.setScalar(s); m.compose(v, q, sv); grains.setMatrixAt(i, m);
    }
    grains.instanceMatrix.needsUpdate = true;
    renderer.render(scene, camera);
  }
  function resize(){
    const w = hero.clientWidth, h = hero.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    camera.fov = w < h ? 46 : 32; camera.updateProjectionMatrix();
  }
  resize(); window.addEventListener('resize', resize);
  let isVisible = true;
  let observer = null;
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    }, { threshold: 0.05 });
    observer.observe(hero);
  }

  const tick = () => {
    if (!isVisible) return;
    const rect = hero.getBoundingClientRect();
    if (rect.bottom > 0 && rect.top < window.innerHeight) {
      frame();
    }
  };
  gsap.ticker.add(tick);
  frame();

  return {
    S,
    destroy() {
      gsap.ticker.remove(tick);
      if (observer) observer.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPtr);
      scene.traverse(o => { o.geometry?.dispose?.(); o.material?.dispose?.(); });
      pmrem.dispose(); renderer.dispose();
    },
  };
}
