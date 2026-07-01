/* ============================================================
   Kumar Abhinav — 3D Portfolio
   Three.js scenes + animations + interactions
   ============================================================ */

import * as THREE from 'three';

/* ───────── Loader ───────── */
window.addEventListener('load', () => {
  setTimeout(() => document.getElementById('loader').classList.add('hide'), 800);
});

/* ───────── Year ───────── */
document.getElementById('year').textContent = new Date().getFullYear();

/* ───────── AOS ───────── */
AOS.init({ duration: 800, once: true, easing: 'ease-out-cubic', offset: 80 });

/* ───────── GSAP ScrollTrigger ───────── */
gsap.registerPlugin(ScrollTrigger);

/* Navbar shrink on scroll */
const nav = document.querySelector('.glass-nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

/* ───────── Vanilla Tilt (3D card hover) ───────── */
VanillaTilt.init(document.querySelectorAll('.tilt'), {
  max: 12,
  speed: 600,
  glare: true,
  'max-glare': 0.18,
  scale: 1.02,
  perspective: 900,
});

/* ───────── Custom Cursor ───────── */
(function customCursor() {
  const dot  = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;

  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
  });

  // Smooth follow for ring
  function loop() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  }
  loop();

  // Hover targets enlarge ring
  const targets = 'a, button, .tilt, .chips span, input, textarea, .nav-link';
  document.querySelectorAll(targets).forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
  });
})();

/* ============================================================
   SCENE 1 — Background particle galaxy (full-page)
   ============================================================ */
(function bgScene() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 6;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Stars
  const starCount = 1800;
  const positions = new Float32Array(starCount * 3);
  const colors    = new Float32Array(starCount * 3);
  const palette = [
    new THREE.Color('#7c5cff'),
    new THREE.Color('#00e5ff'),
    new THREE.Color('#ff5ca7'),
    new THREE.Color('#ffffff'),
  ];

  for (let i = 0; i < starCount; i++) {
    const r   = Math.random() * 25 + 5;
    const t   = Math.random() * Math.PI * 2;
    const p   = Math.acos((Math.random() * 2) - 1);
    positions[i * 3]     = r * Math.sin(p) * Math.cos(t);
    positions[i * 3 + 1] = r * Math.sin(p) * Math.sin(t);
    positions[i * 3 + 2] = r * Math.cos(p);

    const c = palette[Math.floor(Math.random() * palette.length)];
    colors[i * 3]     = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.035,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const stars = new THREE.Points(geo, mat);
  scene.add(stars);

  // Mouse parallax
  const mouse = { x: 0, y: 0 };
  window.addEventListener('mousemove', e => {
    mouse.x = (e.clientX / window.innerWidth)  * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  });

  // Scroll-driven rotation
  let scrollY = 0;
  window.addEventListener('scroll', () => { scrollY = window.scrollY; });

  const clock = new THREE.Clock();
  function animate() {
    const t = clock.getElapsedTime();
    stars.rotation.y = t * 0.04 + scrollY * 0.0006;
    stars.rotation.x = t * 0.02 + scrollY * 0.0003;
    camera.position.x += (mouse.x * 0.6 - camera.position.x) * 0.04;
    camera.position.y += (-mouse.y * 0.6 - camera.position.y) * 0.04;
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();

/* ============================================================
   SCENE 2 — Hero canvas: wireframe icosahedron + inner orb
   ============================================================ */
(function heroScene() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 6);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  // Group offset to right side on large screens
  const group = new THREE.Group();
  scene.add(group);
  const isLg = () => window.innerWidth >= 992;
  function applyOffset() { group.position.x = isLg() ? 2.2 : 0; }
  applyOffset();
  window.addEventListener('resize', applyOffset);

  // Wireframe icosahedron
  const icoGeo = new THREE.IcosahedronGeometry(1.5, 1);
  const wire   = new THREE.WireframeGeometry(icoGeo);
  const wireMat = new THREE.LineBasicMaterial({
    color: 0x00e5ff, transparent: true, opacity: 0.55,
  });
  const ico = new THREE.LineSegments(wire, wireMat);
  group.add(ico);

  // Inner solid orb
  const orb = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.9, 2),
    new THREE.MeshStandardMaterial({
      color: 0x7c5cff,
      metalness: 0.6,
      roughness: 0.2,
      emissive: 0x2a1e7a,
      emissiveIntensity: 0.6,
      flatShading: true,
    })
  );
  group.add(orb);

  // Orbiting small spheres (increased count and variety)
  const orbiters = [];
  const colors = [0xff5ca7, 0x00e5ff, 0xffffff, 0x7c5cff, 0xffd700];
  for (let i = 0; i < 6; i++) {
    const geoms = [
      new THREE.SphereGeometry(0.08, 24, 24),
      new THREE.OctahedronGeometry(0.08),
      new THREE.TetrahedronGeometry(0.09),
      new THREE.BoxGeometry(0.12, 0.12, 0.12)
    ];
    const m = new THREE.Mesh(
      geoms[i % geoms.length],
      new THREE.MeshStandardMaterial({ 
        color: colors[i % colors.length],
        metalness: 0.8,
        roughness: 0.2,
        emissive: colors[i % colors.length],
        emissiveIntensity: 0.3
      })
    );
    m.userData.angle  = (i / 6) * Math.PI * 2;
    m.userData.radius = 2.2 + (i % 3) * 0.2;
    m.userData.speed  = 0.4 + i * 0.2;
    m.userData.tilt   = (i - 2.5) * 0.35;
    m.userData.rotSpeed = (Math.random() - 0.5) * 0.05;
    group.add(m);
    orbiters.push(m);
  }

  // Add floating geometric shapes around the main object
  const floatingShapes = [];
  for (let i = 0; i < 8; i++) {
    const shapes = [
      new THREE.TorusGeometry(0.15, 0.05, 16, 32),
      new THREE.ConeGeometry(0.08, 0.25, 8),
      new THREE.DodecahedronGeometry(0.1)
    ];
    const shape = new THREE.Mesh(
      shapes[i % shapes.length],
      new THREE.MeshPhongMaterial({
        color: colors[i % colors.length],
        transparent: true,
        opacity: 0.4,
        wireframe: i % 2 === 0
      })
    );
    const angle = (i / 8) * Math.PI * 2;
    shape.position.set(
      Math.cos(angle) * 3,
      (Math.random() - 0.5) * 2,
      Math.sin(angle) * 3
    );
    shape.userData.baseY = shape.position.y;
    shape.userData.floatSpeed = 0.001 + Math.random() * 0.002;
    shape.userData.floatPhase = Math.random() * Math.PI * 2;
    group.add(shape);
    floatingShapes.push(shape);
  }

  // Lights
  const pl1 = new THREE.PointLight(0x00e5ff, 2.4, 12);
  pl1.position.set(3, 2, 3); scene.add(pl1);
  const pl2 = new THREE.PointLight(0xff5ca7, 2.0, 12);
  pl2.position.set(-3, -2, 2); scene.add(pl2);
  scene.add(new THREE.AmbientLight(0xffffff, 0.25));

  // Pointer reactivity
  const ptr = { x: 0, y: 0 };
  window.addEventListener('mousemove', e => {
    ptr.x = (e.clientX / window.innerWidth)  * 2 - 1;
    ptr.y = (e.clientY / window.innerHeight) * 2 - 1;
  });

  const clock = new THREE.Clock();
  function animate() {
    const t = clock.getElapsedTime();
    ico.rotation.x = t * 0.25;
    ico.rotation.y = t * 0.3;
    orb.rotation.x = -t * 0.4;
    orb.rotation.y = t * 0.5;

    orbiters.forEach(m => {
      m.userData.angle += 0.008 * m.userData.speed;
      const a = m.userData.angle;
      m.position.x = Math.cos(a) * m.userData.radius;
      m.position.z = Math.sin(a) * m.userData.radius;
      m.position.y = Math.sin(a * 2) * m.userData.tilt;
      // Add individual rotation
      m.rotation.x += m.userData.rotSpeed;
      m.rotation.y += m.userData.rotSpeed * 0.7;
    });

    // Animate floating shapes
    floatingShapes.forEach(shape => {
      shape.rotation.x += 0.01;
      shape.rotation.y += 0.015;
      shape.position.y = shape.userData.baseY + Math.sin(t * shape.userData.floatSpeed * 1000 + shape.userData.floatPhase) * 0.5;
    });

    group.rotation.y += (ptr.x * 0.5 - group.rotation.y) * 0.04;
    group.rotation.x += (ptr.y * 0.3 - group.rotation.x) * 0.04;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  // Scroll-driven scale + fade
  ScrollTrigger.create({
    trigger: '#home',
    start: 'top top',
    end:   'bottom top',
    onUpdate: self => {
      const p = self.progress;
      group.scale.setScalar(1 - p * 0.4);
      wireMat.opacity = 0.55 * (1 - p);
    }
  });
})();

/* ============================================================
   SCENE 3 — About canvas: DNA Double Helix
   ============================================================ */
(function avatarScene() {
  const canvas = document.getElementById('avatar-canvas');
  if (!canvas) return;

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 0, 5.5);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  // Create DNA helix structure
  const group = new THREE.Group();
  scene.add(group);
  
  const helixPoints = [];
  const segments = 40;
  const height = 3.5;
  const radius = 0.8;
  
  // Create two helical strands
  for (let i = 0; i < segments; i++) {
    const t = (i / segments) * Math.PI * 4;
    const y = (i / segments) * height - height / 2;
    
    // Strand 1
    const sphere1 = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0x00e5ff,
        metalness: 0.7,
        roughness: 0.2,
        emissive: 0x00e5ff,
        emissiveIntensity: 0.4
      })
    );
    sphere1.position.set(
      Math.cos(t) * radius,
      y,
      Math.sin(t) * radius
    );
    group.add(sphere1);
    
    // Strand 2
    const sphere2 = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0xff5ca7,
        metalness: 0.7,
        roughness: 0.2,
        emissive: 0xff5ca7,
        emissiveIntensity: 0.4
      })
    );
    sphere2.position.set(
      Math.cos(t + Math.PI) * radius,
      y,
      Math.sin(t + Math.PI) * radius
    );
    group.add(sphere2);
    
    // Connect strands with lines every few segments
    if (i % 4 === 0) {
      const points = [];
      points.push(sphere1.position.clone());
      points.push(sphere2.position.clone());
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(
        lineGeo,
        new THREE.LineBasicMaterial({ 
          color: 0x7c5cff, 
          transparent: true, 
          opacity: 0.5 
        })
      );
      group.add(line);
    }
  }

  // Add outer glowing ring
  const ringGeo = new THREE.TorusGeometry(1.2, 0.02, 16, 100);
  const ring = new THREE.Mesh(
    ringGeo,
    new THREE.MeshBasicMaterial({ 
      color: 0x7c5cff, 
      transparent: true, 
      opacity: 0.3 
    })
  );
  ring.rotation.x = Math.PI / 2;
  group.add(ring);

  // Add floating particles around helix
  const particleCount = 30;
  const particleGeo = new THREE.SphereGeometry(0.03, 8, 8);
  const particles = [];
  for (let i = 0; i < particleCount; i++) {
    const particle = new THREE.Mesh(
      particleGeo,
      new THREE.MeshBasicMaterial({ 
        color: [0x00e5ff, 0xff5ca7, 0x7c5cff][i % 3],
        transparent: true,
        opacity: 0.6
      })
    );
    const angle = (i / particleCount) * Math.PI * 2;
    const dist = 1.5 + Math.random() * 0.5;
    particle.position.set(
      Math.cos(angle) * dist,
      (Math.random() - 0.5) * 3,
      Math.sin(angle) * dist
    );
    particle.userData.angle = angle;
    particle.userData.dist = dist;
    particle.userData.speed = 0.0005 + Math.random() * 0.001;
    group.add(particle);
    particles.push(particle);
  }

  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  const p1 = new THREE.PointLight(0x00e5ff, 2.5, 10); 
  p1.position.set(3, 2, 3); 
  scene.add(p1);
  const p2 = new THREE.PointLight(0xff5ca7, 2.0, 10); 
  p2.position.set(-3, -2, 2); 
  scene.add(p2);

  // Mouse interaction
  const mouse = { x: 0, y: 0 };
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  });

  const clock = new THREE.Clock();
  function animate() {
    const t = clock.getElapsedTime();
    
    // Rotate the entire helix
    group.rotation.y = t * 0.3;
    
    // Rotate the ring independently
    ring.rotation.z = t * 0.5;
    
    // Animate particles orbiting
    particles.forEach((p, i) => {
      p.userData.angle += p.userData.speed * 1000;
      p.position.x = Math.cos(p.userData.angle) * p.userData.dist;
      p.position.z = Math.sin(p.userData.angle) * p.userData.dist;
      p.position.y += Math.sin(t * 2 + i) * 0.002;
    });
    
    // Subtle mouse interaction
    group.rotation.x = mouse.y * 0.3;
    
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
})();

/* ============================================================
   SCENE 4 — Skills canvas: orbiting tech sphere with sprites
   ============================================================ */
(function skillsScene() {
  const canvas = document.getElementById('skills-canvas');
  if (!canvas) return;

  const skills = [
    'JS', 'TS', 'React', 'Node', 'Java', 'Spring',
    'Python', 'AWS', 'Docker', 'SQL', 'Mongo', 'Git',
    'Bootstrap', 'CSS', 'HTML', 'Next', 'Three.js', 'GSAP',
    'REST', 'GraphQL', 'Redis', 'Kafka',
  ];

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 0, 6);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  const group = new THREE.Group();
  scene.add(group);

  // Faint inner sphere
  group.add(new THREE.Mesh(
    new THREE.SphereGeometry(1.55, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0x7c5cff, transparent: true, opacity: 0.06, wireframe: true })
  ));

  // Make text sprite
  function makeLabel(text) {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 128;
    const ctx = c.getContext('2d');
    ctx.fillStyle = 'rgba(7, 7, 26, 0.65)';
    const r = 20;
    const w = 230, h = 70, x = (256 - w) / 2, y = (128 - h) / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y,     x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x,     y + h, r);
    ctx.arcTo(x,     y + h, x,     y,     r);
    ctx.arcTo(x,     y,     x + w, y,     r);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.65)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#e9ecff';
    ctx.font = '600 30px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 64);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
    spr.scale.set(1.05, 0.52, 1);
    return spr;
  }

  // Distribute on sphere via Fibonacci sequence
  const R = 2.2;
  skills.forEach((s, i) => {
    const phi   = Math.acos(-1 + (2 * i) / skills.length);
    const theta = Math.sqrt(skills.length * Math.PI) * phi;
    const spr = makeLabel(s);
    spr.position.setFromSphericalCoords(R, phi, theta);
    group.add(spr);
  });

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));

  // Pointer drag inertia
  const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
  canvas.addEventListener('pointermove', e => {
    const rect = canvas.getBoundingClientRect();
    ptr.tx = ((e.clientX - rect.left) / rect.width)  * 2 - 1;
    ptr.ty = ((e.clientY - rect.top)  / rect.height) * 2 - 1;
  });

  function animate() {
    ptr.x += (ptr.tx - ptr.x) * 0.06;
    ptr.y += (ptr.ty - ptr.y) * 0.06;
    group.rotation.y += 0.004 + ptr.x * 0.03;
    group.rotation.x += ptr.y * 0.01;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
})();

/* ============================================================
   SCENE 5 — Projects: Floating geometric shapes background
   ============================================================ */
(function projectsScene() {
  const canvas = document.getElementById('projects-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 15;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  function resize() {
    const section = document.getElementById('projects');
    if (!section) return;
    const w = section.clientWidth;
    const h = section.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  // Create floating shapes
  const shapes = [];
  const geometries = [
    new THREE.OctahedronGeometry(1),
    new THREE.TetrahedronGeometry(1),
    new THREE.BoxGeometry(1.2, 1.2, 1.2),
    new THREE.TorusGeometry(0.8, 0.3, 16, 100),
    new THREE.ConeGeometry(0.8, 1.5, 8),
    new THREE.DodecahedronGeometry(0.9),
  ];

  const colors = [0x7c5cff, 0x00e5ff, 0xff5ca7, 0xffd700, 0x4ade80];

  for (let i = 0; i < 15; i++) {
    const geometry = geometries[i % geometries.length];
    const material = new THREE.MeshPhongMaterial({
      color: colors[i % colors.length],
      transparent: true,
      opacity: 0.15,
      wireframe: i % 2 === 0,
      shininess: 100
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    
    // Random position
    mesh.position.set(
      (Math.random() - 0.5) * 30,
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 15
    );
    
    // Random rotation
    mesh.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    
    // Store animation data
    mesh.userData.rotationSpeed = {
      x: (Math.random() - 0.5) * 0.02,
      y: (Math.random() - 0.5) * 0.02,
      z: (Math.random() - 0.5) * 0.02
    };
    mesh.userData.floatSpeed = 0.0005 + Math.random() * 0.001;
    mesh.userData.floatRadius = 1 + Math.random() * 2;
    mesh.userData.floatPhase = Math.random() * Math.PI * 2;
    mesh.userData.baseY = mesh.position.y;
    
    scene.add(mesh);
    shapes.push(mesh);
  }

  // Add particles
  const particleCount = 100;
  const particleGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const particleColors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 40;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    
    const color = new THREE.Color(colors[i % colors.length]);
    particleColors[i * 3] = color.r;
    particleColors[i * 3 + 1] = color.g;
    particleColors[i * 3 + 2] = color.b;
  }

  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

  const particleMaterial = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
  });

  const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particleSystem);

  // Lighting
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const pointLight1 = new THREE.PointLight(0x00e5ff, 1, 50);
  pointLight1.position.set(10, 10, 10);
  scene.add(pointLight1);
  
  const pointLight2 = new THREE.PointLight(0xff5ca7, 1, 50);
  pointLight2.position.set(-10, -10, 5);
  scene.add(pointLight2);

  // Mouse interaction
  const mouse = { x: 0, y: 0 };
  window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  const clock = new THREE.Clock();
  function animate() {
    const t = clock.getElapsedTime();
    
    // Animate shapes
    shapes.forEach((shape, i) => {
      shape.rotation.x += shape.userData.rotationSpeed.x;
      shape.rotation.y += shape.userData.rotationSpeed.y;
      shape.rotation.z += shape.userData.rotationSpeed.z;
      
      // Float up and down
      shape.position.y = shape.userData.baseY + 
        Math.sin(t * shape.userData.floatSpeed * 1000 + shape.userData.floatPhase) * 
        shape.userData.floatRadius;
      
      // Subtle horizontal drift
      shape.position.x += Math.sin(t * 0.3 + i) * 0.01;
    });
    
    // Rotate particle system
    particleSystem.rotation.y = t * 0.05;
    particleSystem.rotation.x = t * 0.03;
    
    // Mouse parallax effect
    camera.position.x += (mouse.x * 2 - camera.position.x) * 0.05;
    camera.position.y += (mouse.y * 2 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);
    
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
})();

/* ============================================================
   Section reveal animations (GSAP)
   ============================================================ */
gsap.utils.toArray('.section-title').forEach(el => {
  gsap.from(el, {
    y: 40, opacity: 0, duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 85%' }
  });
});

/* Stat counter (simple) */
gsap.utils.toArray('.stat-card h3').forEach(el => {
  const txt = el.textContent.trim();
  const match = txt.match(/^(\d+)(.*)$/);
  if (!match) return;
  const end = parseInt(match[1], 10);
  const suffix = match[2] || '';
  const obj = { n: 0 };
  gsap.to(obj, {
    n: end,
    duration: 1.6,
    ease: 'power2.out',
    scrollTrigger: { trigger: el, start: 'top 85%' },
    onUpdate: () => { el.firstChild ? el.innerHTML = Math.round(obj.n) + (suffix ? `<span>${suffix}</span>` : '') : null; }
  });
});

/* Smooth-close mobile menu after click */
document.querySelectorAll('#navMain .nav-link').forEach(a => {
  a.addEventListener('click', () => {
    const navEl = document.getElementById('navMain');
    if (navEl.classList.contains('show')) {
      new bootstrap.Collapse(navEl).hide();
    }
  });
});

/* ============================================================
   Scroll to Top Button
   ============================================================ */
(function() {
  const scrollTopBtn = document.getElementById('scroll-top');
  if (!scrollTopBtn) return;

  // Show/hide button based on scroll position
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      scrollTopBtn.classList.add('show');
    } else {
      scrollTopBtn.classList.remove('show');
    }
  });

  // Scroll to top with smooth animation
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
})();

/* ============================================================
   Enhanced Parallax Effects for Sections
   ============================================================ */
gsap.utils.toArray('.section').forEach((section, i) => {
  gsap.to(section, {
    y: i % 2 === 0 ? -30 : 30,
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1,
    }
  });
});

/* ============================================================
   Web3Forms Contact Form
   ============================================================ */
(function() {
  const form = document.getElementById('contact-form');
  const formMsg = document.getElementById('form-msg');
  
  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const btn = form.querySelector('button[type="submit"]');
      const btnText = btn.querySelector('.btn-text');
      const originalText = btnText.textContent;
      
      // Show loading state
      btn.disabled = true;
      btnText.textContent = 'Sending...';
      formMsg.style.display = 'none';
      
      // Get form data
      const formData = new FormData(form);
      
      try {
        // Send to Web3Forms API
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
          // Success
          formMsg.className = 'mt-3 text-success';
          formMsg.innerHTML = '<i class="bi bi-check-circle-fill me-1"></i> Message sent successfully! I\'ll get back to you soon.';
          formMsg.style.display = 'block';
          form.reset();
        } else {
          // Error from API
          throw new Error(result.message || 'Something went wrong');
        }
      } catch (error) {
        // Network or other error
        console.error('Form submission error:', error);
        formMsg.className = 'mt-3 text-danger';
        formMsg.innerHTML = '<i class="bi bi-x-circle-fill me-1"></i> Failed to send message. Please try again or email me directly at kumarabhinavwork002@gmail.com';
        formMsg.style.display = 'block';
      } finally {
        // Reset button
        btn.disabled = false;
        btnText.textContent = originalText;
      }
    });
  }
})();
