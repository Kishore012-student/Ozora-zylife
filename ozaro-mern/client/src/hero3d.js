import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { gsap, reduced } from './motion.js';

const isMobile = () => window.innerWidth <= 900;

/** Procedural studio env: softbox key, cool fill and warm kicker for shaped reflections. */
function buildStudioEnvironment(renderer) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const card = (hex, gain, pos, scale, rotY, rotX = 0) => {
    const mat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
    mat.color.set(hex).multiplyScalar(gain);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
    mesh.position.set(...pos);
    mesh.scale.set(...scale);
    mesh.rotation.set(rotX, rotY, 0);
    room.add(mesh);
  };
  card('#ffffff', 3.4, [0, 7.5, 5], [4.2, 2.4, 1], 0);                // overhead softbox (key)
  card('#e8f2ff', 1.6, [6.5, 1.4, 2.4], [3.2, 4, 1], -0.95);          // cool fill from the right
  card('#d8efe4', 0.9, [-6, 0.4, -3], [3.2, 3.4, 1], 0.95);           // warm-green kicker from behind
  card('#fdfbf7', 1.0, [0, -5, 3.5], [8, 3, 1], 0, -Math.PI / 2.4);   // white studio sweep bounce from below
  const target = pmrem.fromScene(room, 0.04);
  pmrem.dispose();
  room.dispose();
  return { texture: target.texture, dispose: () => target.dispose() };
}

/** Soft radial contact darkening, baked once into a canvas texture. */
function buildContactTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, size * 0.04, size / 2, size / 2, size * 0.5);
  g.addColorStop(0, 'rgba(22,52,42,0.20)');
  g.addColorStop(0.45, 'rgba(22,52,42,0.08)');
  g.addColorStop(1, 'rgba(22,52,42,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Gelatin shell shading: edge subsurface bleed, crystalline micro-glints, roughness
 *  waviness, contact darkening at the telescoping seam and a spectral grazing tint. */
function enhanceShell(material, { rim = 0.2, edgeGlow = 0.35, sparkle = 0.05, seamV = 0.02 } = {}) {
  material.defines = { ...(material.defines || {}), USE_UV: '' };
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uRimColor = { value: new THREE.Color('#e8f7f0') };
    shader.uniforms.uRimStrength = { value: rim };
    shader.uniforms.uEdgeGlow = { value: edgeGlow };
    shader.uniforms.uSparkle = { value: sparkle };
    shader.uniforms.uSeamV = { value: seamV };
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>
        uniform vec3 uRimColor; uniform float uRimStrength;
        uniform float uEdgeGlow; uniform float uSparkle; uniform float uSeamV;
        float ozHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float ozNoise(vec2 p) {
          vec2 i = floor(p), f = fract(p);
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(mix(ozHash(i), ozHash(i + vec2(1.0, 0.0)), u.x),
                     mix(ozHash(i + vec2(0.0, 1.0)), ozHash(i + vec2(1.0, 1.0)), u.x), u.y);
        }`)
      .replace('#include <color_fragment>', `
        #include <color_fragment>
        {
          diffuseColor.rgb *= 0.96 + 0.08 * ozNoise(vUv * 7.0);          // gelatin density variation
          float seam = smoothstep(0.0, 0.11, abs(vUv.y - uSeamV));       // contact shading at the telescoping seam
          diffuseColor.rgb *= 0.82 + 0.18 * seam;
        }`)
      .replace('#include <roughnessmap_fragment>', `
        #include <roughnessmap_fragment>
        roughnessFactor *= 0.9 + 0.2 * ozNoise(vUv * 22.0);              // macro waviness (no flat CG gloss)
        roughnessFactor *= 0.95 + 0.1 * ozNoise(vUv * 90.0);             // fine waviness
        float glint = step(0.995, ozHash(floor(vUv * vec2(420.0, 260.0))));
        roughnessFactor = mix(roughnessFactor, 0.05, glint * uSparkle * 10.0);   // crystalline specks`)
      .replace('#include <opaque_fragment>', `
        {
          vec3 rv = normalize(geometryViewDir);
          float ndv = saturate(dot(normal, rv));
          float fres = pow(1.0 - ndv, 3.0);
          outgoingLight += uRimColor * fres * uRimStrength;                                   // cool rim sheen
          outgoingLight += diffuseColor.rgb * vec3(1.0, 0.9, 0.78) * pow(1.0 - ndv, 2.2) * uEdgeGlow;  // warm SSS bleed
          outgoingLight += vec3(0.9, 1.0, 1.18) * pow(fres, 1.6) * 0.07;                      // spectral whisper
        }
        #include <opaque_fragment>`);
  };
  material.customProgramCacheKey = () => 'ozora-gelatin-shell-v2';
}

/** Grain shader: irregular surface, per-grain albedo jitter, warm subsurface and crystallike glint. */
function enhanceMolecules(material) {
  const uniforms = {
    uGrainSSS: { value: 0.42 },
    uGrainGlint: { value: 0.09 },
  };
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float aGrainSeed;\nvarying float vGrainSeed;')
      .replace('#include <begin_vertex>', `
        #include <begin_vertex>
        vGrainSeed = aGrainSeed;
        // Uniform scale only — keeps every grain perfectly spherical.
        transformed *= 0.92 + 0.16 * fract(sin(aGrainSeed * 57.3) * 43758.5453);
      `);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uGrainSSS;\nuniform float uGrainGlint;\nvarying float vGrainSeed;')
      .replace('#include <color_fragment>', `
        #include <color_fragment>
        diffuseColor.rgb *= 0.88 + 0.24 * fract(sin(vGrainSeed * 91.7) * 43758.5453);
      `)
      .replace('#include <opaque_fragment>', `
        {
          vec3 grainV = normalize(vViewPosition);
          float grainNdV = saturate(dot(normal, grainV));
          float grainRim = pow(1.0 - grainNdV, 2.0);
          outgoingLight += diffuseColor.rgb * grainRim * vec3(0.5, 0.38, 0.3) * uGrainSSS;
          outgoingLight += vec3(1.0) * pow(1.0 - grainNdV, 7.0) * uGrainGlint * (0.5 + vGrainSeed);
        }
        #include <opaque_fragment>`);
  };
  material.customProgramCacheKey = () => 'ozora-molecule-v1';
  return uniforms;
}

/** Soft studio sweep: near-white centre falling to a cool grey vignette — product-photo depth. */
function buildBackdropTexture() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size * 0.42, size * 0.05, size / 2, size * 0.5, size * 0.78);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.55, '#f6f9f7');
  g.addColorStop(1, '#e7eeea');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Fine grain + soft blotches: breaks up "perfect CG gloss" as roughness variation. */
function buildSurfaceNoise() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#d2d2d2';                        // base multiplier ≈ 0.82
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 5200; i++) {
    const v = 190 + Math.floor(Math.random() * 65); // 0.75 – 1.0
    ctx.fillStyle = `rgba(${v},${v},${v},0.5)`;
    ctx.fillRect(Math.random() * size, Math.random() * size, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }
  for (let i = 0; i < 10; i++) {
    const x = Math.random() * size, y = Math.random() * size, r = 30 + Math.random() * 70;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const v = Math.random() > 0.5 ? 255 : 160;
    g.addColorStop(0, `rgba(${v},${v},${v},0.12)`);
    g.addColorStop(1, `rgba(${v},${v},${v},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/** Grain plus two mould-parting ridges — real capsule shells carry a seam line. */
function buildBumpTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 4200; i++) {
    const v = 108 + Math.floor(Math.random() * 40);
    ctx.fillStyle = `rgba(${v},${v},${v},0.35)`;
    ctx.fillRect(Math.random() * size, Math.random() * size, 1.5, 1.5);
  }
  for (const x of [size * 0.25, size * 0.75]) {
    const g = ctx.createLinearGradient(x - 4, 0, x + 4, 0);
    g.addColorStop(0, 'rgba(128,128,128,0)');
    g.addColorStop(0.4, 'rgba(196,196,196,0.85)');
    g.addColorStop(0.58, 'rgba(72,72,72,0.7)');
    g.addColorStop(1, 'rgba(128,128,128,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - 4, 0, 8, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}
/** Rounded micro-tablet (flat disc, bevelled rim) — reads as a pharma pellet among spheres. */
function tabletGeometry(rad = 0.056, h = 0.034, seg = 22) {
  const rim = h * 0.5, flat = rad - rim;
  const pts = [new THREE.Vector2(0, -h / 2), new THREE.Vector2(flat, -h / 2)];
  for (let i = 1; i < 12; i++) {
    const a = -Math.PI / 2 + (i / 12) * Math.PI;
    pts.push(new THREE.Vector2(flat + Math.cos(a) * rim, Math.sin(a) * rim));
  }
  pts.push(new THREE.Vector2(flat, h / 2), new THREE.Vector2(0, h / 2));
  return new THREE.LatheGeometry(pts, seg);
}

/** Shared scrub state. The caller may own it so three.js can load lazily and bind
 *  to timelines that are already running. */
const makeHeroState = () => ({ rotZ: -0.62, spin: 0, open: 0, burst: 0, helix: 0, ispin: 0, hz: 0, shiftY: 0, hide: 0, camZ: 7.2, shiftX: 0, intro: reduced ? 1 : 0 });

function fallbackHero(extS) {
  return { S: extS || makeHeroState(), destroy() {} };
}

/** 3D capsule hero: rotates, splits open, granules burst and re-form as a helix. Returns scrubbable state + cleanup. */
export function createHero(canvas, hero, extS) {
  const isMob = isMobile();
  // Low-end phones/laptops get a light render path: fewer beads, no shadow pass,
  // smaller pixel ratio and a 30 fps cap (below) — keeps the scroll story smooth.
  const lowEnd = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  } catch (err) {
    console.warn('[hero3d] WebGL unavailable — hero renders as static layout only.', err);
    return fallbackHero(extS);
  }
  let contextLost = false;
  const onContextLost = (e) => { e.preventDefault(); contextLost = true; };
  const onContextRestored = () => { contextLost = false; };
  canvas.addEventListener('webglcontextlost', onContextLost, false);
  canvas.addEventListener('webglcontextrestored', onContextRestored, false);

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMob || lowEnd ? 1.25 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = !lowEnd;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  const backdropTex = buildBackdropTexture();
  scene.background = backdropTex;
  const env = buildStudioEnvironment(renderer);
  scene.environment = env.texture;
  scene.environmentIntensity = 0.85;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 7.2);

  const rig = new THREE.Group(); scene.add(rig);     // pointer tilt + layout shift
  const cap = new THREE.Group(); rig.add(cap);       // scrubbed capsule state
  cap.rotation.order = 'ZYX';   // spin around its own axis FIRST, then in-plane tilt
                                // (XYZ order tilted before spinning → depth wobble made the
                                //  body project longer than the cap at certain angles)
  const stage = new THREE.Group(); scene.add(stage); // grounding, never pointer tilt

  const GREEN = new THREE.Color('#277161'), ORANGE = new THREE.Color('#f38021'), WHITE = new THREE.Color('#ffffff');

  /* ---------------- lighting ---------------- */
  const key = new THREE.DirectionalLight('#ffffff', 1.5);
  key.position.set(3, 4, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(lowEnd ? 512 : isMob ? 1024 : 2048, lowEnd ? 512 : isMob ? 1024 : 2048);
  key.shadow.camera.near = 1; key.shadow.camera.far = 14;
  key.shadow.camera.left = -2.6; key.shadow.camera.right = 2.6;
  key.shadow.camera.top = 2.6; key.shadow.camera.bottom = -2.6;
  key.shadow.bias = -0.0007; key.shadow.normalBias = 0.035; key.shadow.radius = 4;
  stage.add(key, key.target);
  const fill = new THREE.DirectionalLight('#dce8ff', 0.5); fill.position.set(-3.6, 0.7, 2.3); scene.add(fill);
  const rim = new THREE.DirectionalLight('#e4f5ed', 0.45); rim.position.set(-4, -2, -3); scene.add(rim);

  /* ---------------- grounding ---------------- */
  const shadowMat = new THREE.ShadowMaterial({ color: 0x162c24, opacity: 0.07, transparent: true, depthWrite: false });
  const shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), shadowMat);
  shadowPlane.position.set(0, -0.15, -1.2);
  shadowPlane.receiveShadow = true;
  stage.add(shadowPlane);
  const contactTex = buildContactTexture();
  const contact = new THREE.Mesh(
    new THREE.PlaneGeometry(4.6, 4.6),
    new THREE.MeshBasicMaterial({ map: contactTex, transparent: true, depthWrite: false, opacity: 0.9 }),
  );
  contact.position.set(0, -0.28, -1.5);
  contact.renderOrder = 1;
  stage.add(contact);

  /* ---------------- capsule shell ---------------- */
  // Real size-0 hard gelatin anatomy (USP ⟨1151⟩): two telescoping pieces — a
  // slightly wider cap slides over a narrower body, so the seam is a real overlap
  // lip with a visible diameter step. Profile points are spaced for even UVs so
  // the shell shading reads consistently along the wall.
  function halfCapsule(Rr, Lc, thick = 0.035) {
    const pts = [new THREE.Vector2(Rr - thick, 0), new THREE.Vector2(Rr, 0)];
    const wallSteps = 22, domeSteps = 20;
    for (let i = 1; i <= wallSteps; i++) pts.push(new THREE.Vector2(Rr, (i / wallSteps) * Lc));
    for (let i = 1; i <= domeSteps; i++) {
      const a = (i / domeSteps) * Math.PI / 2;
      pts.push(new THREE.Vector2(Math.cos(a) * Rr, Lc + Math.sin(a) * Rr));
    }
    return new THREE.LatheGeometry(pts, 96);
  }
  const R = 0.58;                  // cap outer radius (Ø 1.16 ≈ 7.6 mm)
  const BODY_R = R - 0.02;         // body is a hair narrower — telescopes inside the cap
  const L = 1.06, BODY_L = 1.44;   // seam sits EXACTLY mid-axis: 1.64 units of shell on each
                                   // side of it → both halves equal at every reading,
                                   // overall 3.28 (1 : 2.83, size-0 is 1 : 2.85)
  const noiseTex = buildSurfaceNoise();
  const bumpTex = buildBumpTexture();
  noiseTex.repeat.set(2, 1.2);
  // Transmission costs an extra scene render — desktop only. Mobile keeps a
  // glossy opaque green shell, which still reads correctly on a white page.
  const glass = !isMob && !lowEnd;
  const topMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#2e7d64'),
    roughness: glass ? 0.13 : 0.22, metalness: 0,
    roughnessMap: noiseTex, bumpMap: bumpTex, bumpScale: 0.32,
    transmission: glass ? 0.6 : 0, thickness: 1.25, ior: 1.46,
    dispersion: glass ? 0.18 : 0,
    attenuationColor: new THREE.Color('#0a5c46'), attenuationDistance: 0.5,
    clearcoat: 1, clearcoatRoughness: 0.07, iridescence: 0.08, iridescenceIOR: 1.32,
    sheen: 0.1, sheenRoughness: 0.7, sheenColor: new THREE.Color('#d8efe4'),
    envMapIntensity: glass ? 1.1 : 1.0, side: THREE.DoubleSide,
  });
  const botMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#f7f9f7'), roughness: glass ? 0.13 : 0.26, metalness: 0,
    roughnessMap: noiseTex, bumpMap: bumpTex, bumpScale: 0.28,
    clearcoat: 1, clearcoatRoughness: 0.07, sheen: 0.4, sheenRoughness: 0.7,
    sheenColor: WHITE, envMapIntensity: glass ? 1.35 : 1.2, side: THREE.DoubleSide,
  });
  // Gold band is printed gelatin, not metal: glossy, slightly waxy, catches the softbox.
  const bandMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#b6913c'), metalness: 0.25, roughness: 0.18,
    clearcoat: 1, clearcoatRoughness: 0.08, sheen: 0.35, sheenRoughness: 0.6,
    sheenColor: new THREE.Color('#f5e6c0'),
    envMapIntensity: 1.05, side: THREE.DoubleSide,
  });
  const bandEdgeMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#c9a24b'), metalness: 0.35, roughness: 0.12, envMapIntensity: 1.15,
  });
  enhanceShell(topMat, { rim: glass ? 0.22 : 0.16, edgeGlow: 0.45, sparkle: 0.05, seamV: 0.02 });
  enhanceShell(botMat, { rim: glass ? 0.18 : 0.12, edgeGlow: 0.26, sparkle: 0.04, seamV: 0.19 });

  const top = new THREE.Mesh(halfCapsule(R, L), topMat);            // cap (green, printed)
  const bot = new THREE.Mesh(halfCapsule(BODY_R, BODY_L), botMat);  // body (white, narrower)
  top.castShadow = true; bot.castShadow = true;
  bot.rotation.z = Math.PI;               // mirror downward
  const topWrap = new THREE.Group(); topWrap.add(top); topWrap.position.y = -0.14;
  const botWrap = new THREE.Group(); botWrap.add(bot); botWrap.position.y = 0.22;
  // Slim gelatin band centred exactly on the shell seam (as real banding is applied),
  // with two fine edge rims. A closed cross-section prevents the shell showing through.
  const bandGeo = new THREE.LatheGeometry([
    new THREE.Vector2(R + 0.008, -0.07),
    new THREE.Vector2(R + 0.008, 0.07),
    new THREE.Vector2(R - 0.02, 0.07),
    new THREE.Vector2(R - 0.02, -0.07),
    new THREE.Vector2(R + 0.008, -0.07),
  ], 96);
  const band = new THREE.Mesh(bandGeo, bandMat);
  band.position.y = -0.36; band.castShadow = true; botWrap.add(band);   // centre = seam (world -0.14)
  for (const ey of [-0.36 - 0.07, -0.36 + 0.07]) {
    const edge = new THREE.Mesh(new THREE.TorusGeometry(R + 0.009, 0.006, 8, 96), bandEdgeMat);
    edge.rotation.x = Math.PI / 2; edge.position.y = ey; botWrap.add(edge);
  }
  cap.add(topWrap, botWrap);

  /* ---------------- granules: pellets + micro-tablets ---------------- */
  const N = lowEnd ? 320 : isMob ? 420 : 700;
  const hash = (x) => { const s = Math.sin(x * 127.1) * 43758.5453; return s - Math.floor(s); };
  const gGeo = new THREE.SphereGeometry(0.042, lowEnd ? 8 : 14, lowEnd ? 8 : 14);
  const tGeo = tabletGeometry(0.056, 0.034, lowEnd ? 12 : 22);
  // Deterministic split: ~30 % of the fill is flat micro-tablets among round pellets.
  const isTab = new Uint8Array(N), slotS = new Int32Array(N), slotT = new Int32Array(N);
  let nS = 0, nT = 0;
  for (let i = 0; i < N; i++) {
    if (hash(i * 3.7 + 0.11) > 0.7) { isTab[i] = 1; slotT[i] = nT++; } else slotS[i] = nS++;
  }
  const seedsS = new Float32Array(nS), seedsT = new Float32Array(nT);
  const tabRot = new Array(N);
  for (let i = 0; i < N; i++) {
    const seed = Math.random();
    if (isTab[i]) {
      seedsT[slotT[i]] = seed;
      tabRot[i] = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI));
    } else seedsS[slotS[i]] = seed;
  }
  gGeo.setAttribute('aGrainSeed', new THREE.InstancedBufferAttribute(seedsS, 1));
  tGeo.setAttribute('aGrainSeed', new THREE.InstancedBufferAttribute(seedsT, 1));
  const gMat = new THREE.MeshPhysicalMaterial({
    color: '#ffffff', roughness: 0.32, metalness: 0,
    clearcoat: 0.7, clearcoatRoughness: 0.18,
    envMapIntensity: 1.2,
  });
  enhanceMolecules(gMat);
  const grains = new THREE.InstancedMesh(gGeo, gMat, nS);
  const tabs = new THREE.InstancedMesh(tGeo, gMat, nT);
  for (const mesh of [grains, tabs]) {
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.frustumCulled = false;   // instances travel far from their (cached) bounds
    cap.add(mesh);
  }

  // DNA target in true B-form geometry: right-handed, 10.5 bp/turn, strands offset
  // ~120° so a wide major groove and a narrow minor groove open up, propeller-twisted
  // pairs. Ball-and-stick look per the reference: WIDE chunky helix (the previous
  // radius read compressed), dense pearl-string rails, stacked base pairs — molecules
  // keep the brand orange / white / green.
  const inside = [], burst = [], helix = [], scl = [], delay = [], helixScl = [], helixTint = [];
  const bpCount = 36, rise = 6.6, radius = 0.85, phase = 2.09;   // Ø 1.70 — width ×1.55 vs before, ~3.3 turns
  const stepAngle = Math.PI * 2 / 10.5;                             // ~34.3° per bp
  const perStrand = Math.floor(N * 0.24);
  const baseTotal = N - perStrand * 2;
  const perHalf = Math.max(2, Math.floor(baseTotal / (bpCount * 2)));
  const bpAngle = (j) => j * stepAngle + (hash(j + 1) - 0.5) * 0.07;  // sequence jitter
  const strandPoint = (u, s) => {
    const jf = u * (bpCount - 1), j0 = Math.min(bpCount - 2, Math.floor(jf)), t = jf - j0;
    const a0 = bpAngle(j0), a1 = bpAngle(j0 + 1);
    const a = a0 + (a1 - a0) * t + s * phase;
    const wob = (hash(u * 97 + s * 13) - 0.5) * 0.035;             // natural backbone waviness
    return new THREE.Vector3(Math.cos(a) * (radius + wob), (u - 0.5) * rise, Math.sin(a) * (radius + wob));
  };
  const addPoint = (p, tint, scale) => {
    const idx = helix.length;
    helix.push(p); helixTint.push(tint);
    // Mixed bead sizes read as individual atoms; tablets shrink so the helix stays ball-like.
    helixScl.push(scale * (isTab[idx] ? 0.85 : 1) * (0.88 + 0.24 * hash(idx * 2.7 + 1)));
  };
  for (let s = 0; s < 2; s++) {
    for (let k = 0; k < perStrand; k++) {
      const u = k / Math.max(1, perStrand - 1);
      addPoint(strandPoint(u, s), s === 0 ? GREEN : WHITE, 1.55);   // phosphate rails
    }
  }
  for (let j = 0; j < bpCount && helix.length < N; j++) {
    const u = j / (bpCount - 1), y = (u - 0.5) * rise, a = bpAngle(j);
    const p1 = strandPoint(u, 0), p2 = strandPoint(u, 1);
    const centre = new THREE.Vector3(0, y, 0);
    const dir = p2.clone().sub(p1).normalize();
    const perp = new THREE.Vector3(-dir.z, 0, dir.x);
    for (let half = 0; half < 2 && helix.length < N; half++) {
      const start = half === 0 ? p1 : p2;
      const propeller = (half === 0 ? 1 : -1) * 0.045;       // propeller twist of the pair
      for (let m = 0; m < perHalf && helix.length < N; m++) {
        const f = 0.1 + (m + 0.5) / perHalf * 0.42;        // rail → centre, halves meet
        const p = start.clone().lerp(centre, f)
          .addScaledVector(perp, (m % 2 === 0 ? 1 : -1) * 0.03)
          .add(new THREE.Vector3(0, propeller + (hash(j * 7 + m + half * 31) - 0.5) * 0.02, 0));
        // Base pairs in the brand colours.
        addPoint(p, j % 3 === 0 || half === 0 ? ORANGE : WHITE, half === 0 ? 1.3 : 1.15);
      }
    }
  }
  while (helix.length < N) {
    const i = helix.length, src = helix[Math.floor(hash(i + 5) * helix.length)];
    const p = src.clone().add(new THREE.Vector3(
      (hash(i + 11) - 0.5) * 0.05, (hash(i + 23) - 0.5) * 0.03, (hash(i + 37) - 0.5) * 0.05,
    ));
    addPoint(p, hash(i + 53) > 0.5 ? ORANGE : WHITE, 1.15);
  }
  for(let i = 0; i < N; i++){
    const r = Math.sqrt(Math.random()) * 0.44, a = Math.random() * Math.PI * 2;
    inside.push(new THREE.Vector3(Math.cos(a)*r*0.95, (Math.random()*2-1)*0.95 - 0.14, Math.sin(a)*r*0.95));
    const d = new THREE.Vector3().randomDirection().multiplyScalar(1.0 + Math.random()*1.45);
    d.y *= 1.2; burst.push(d);
    scl.push(0.65 + Math.random()*0.75);
    delay.push(Math.random());
    if (isTab[i]) tabs.setColorAt(slotT[i], helixTint[i]); else grains.setColorAt(slotS[i], helixTint[i]);
  }
  if (grains.instanceColor) grains.instanceColor.needsUpdate = true;
  if (tabs.instanceColor) tabs.instanceColor.needsUpdate = true;

  /* ---------------- scrubbed state ---------------- */
  // Caller-owned state (see makeHeroState) lets three.js load as a lazy chunk.
  const S = extS || makeHeroState();
  const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
  const onPtr = e => { ptr.tx = (e.clientX / innerWidth - .5); ptr.ty = (e.clientY / innerHeight - .5); };
  window.addEventListener('pointermove', onPtr);

  /* ---------------- frame loop ---------------- */
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), sv = new THREE.Vector3(), tmp = new THREE.Vector3();
  let helixSpin = 0, granulesMoved = false, clock = new THREE.Clock();
  const ease = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
  const clamp01 = x => Math.max(0, Math.min(1, x));

  function frame(){
    if (contextLost) return;
    const dt = Math.min(clock.getDelta(), 0.05), time = clock.elapsedTime;
    ptr.x += (ptr.tx - ptr.x) * .06; ptr.y += (ptr.ty - ptr.y) * .06;
    rig.rotation.y = ptr.x * 0.35; rig.rotation.x = ptr.y * 0.22;
    rig.position.x = S.shiftX; rig.position.y = Math.sin(time*0.9)*0.05 * (1 - S.helix) + S.shiftY;   // idle float
    stage.position.x = S.shiftX; stage.position.y = S.shiftY * 0.55;
    camera.position.z = S.camZ;
    cap.rotation.z = S.rotZ * (1 - S.helix) + S.hz;
    cap.rotation.y = S.spin + S.ispin + time*0.12*(1 - S.open) ;
    const sIntro = ease(S.intro);
    cap.scale.setScalar(0.0001 + sIntro);
    topWrap.position.y = -0.14 + ease(S.open)*1.55 + S.hide*2.2;
    botWrap.position.y =  0.22 - ease(S.open)*1.55 - S.hide*2.2;
    topWrap.rotation.z = S.open*0.35; botWrap.rotation.z = -S.open*0.25;
    const hs = Math.max(0.0001, 1 - ease(S.hide)); topWrap.scale.setScalar(hs); botWrap.scale.setScalar(hs);
    // At rest the granules sit still inside the capsule (they spin with the cap
    // group), so skip the per-instance matrix writes until burst/helix moves them.
    const granular = S.burst > 0.001 || S.helix > 0.001;
    if (granular || granulesMoved) {
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
      const s = scl[i] * (1 - h) + helixScl[i] * h;
      sv.setScalar(s); m.compose(v, isTab[i] ? tabRot[i] : q, sv);
      if (isTab[i]) tabs.setMatrixAt(slotT[i], m); else grains.setMatrixAt(slotS[i], m);
    }
    grains.instanceMatrix.needsUpdate = true;
    tabs.instanceMatrix.needsUpdate = true;
      granulesMoved = granular;
    }
    contact.position.y = -0.28 - S.hide * 0.1;
    contact.scale.setScalar(1 - 0.25 * S.hide);
    renderer.render(scene, camera);
  }
  function resize(){
    const w = Math.max(1, hero.clientWidth), h = Math.max(1, hero.clientHeight);
    renderer.setSize(w, h, false); camera.aspect = w / h;
    camera.fov = w < h ? 46 : 32; camera.updateProjectionMatrix();
  }
  resize(); window.addEventListener('resize', resize);

  // Warm up shader programs before the intro/scroll so the first scrub never stalls.
  try { renderer.compile(scene, camera); } catch (err) { console.warn('[hero3d] warm-up skipped.', err); }

  let isVisible = true;
  let observer = null;
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    }, { threshold: 0.05 });
    observer.observe(hero);
  }

  let frameAcc = 0;
  const tick = (time, deltaTime) => {
    if (!isVisible || contextLost) return;
    if (lowEnd) { frameAcc += deltaTime || 16; if (frameAcc < 33) return; frameAcc = 0; }  // ~30 fps cap
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
      canvas.removeEventListener('webglcontextlost', onContextLost, false);
      canvas.removeEventListener('webglcontextrestored', onContextRestored, false);
      scene.traverse(o => { o.geometry?.dispose?.(); o.material?.dispose?.(); });
      contactTex.dispose();
      backdropTex.dispose();
      noiseTex.dispose();
      bumpTex.dispose();
      scene.environment = null;
      scene.background = null;
      env.dispose();
      renderer.dispose();
    },
  };
}
