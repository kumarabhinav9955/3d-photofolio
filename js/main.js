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

  // Orbiting small spheres
  const orbiters = [];
  const colors = [0xff5ca7, 0x00e5ff, 0xffffff];
  for (let i = 0; i < 3; i++) {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 24, 24),
      new THREE.MeshBasicMaterial({ color: colors[i] })
    );
    m.userData.angle  = (i / 3) * Math.PI * 2;
    m.userData.radius = 2.1 + i * 0.15;
    m.userData.speed  = 0.5 + i * 0.3;
    m.userData.tilt   = (i - 1) * 0.4;
    group.add(m);
    orbiters.push(m);
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
   SCENE 3 — About canvas: morphing torus knot
   ============================================================ */
(function avatarScene() {
  const canvas = document.getElementById('avatar-canvas');
  if (!canvas) return;

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 0, 4.5);

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

  const mat = new THREE.MeshStandardMaterial({
    color: 0x7c5cff,
    metalness: 0.7,
    roughness: 0.15,
    emissive: 0x14043c,
    emissiveIntensity: 0.8,
    wireframe: false,
  });
  const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(1, 0.34, 180, 28), mat);
  scene.add(knot);

  // Inner wireframe
  const wireKnot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1.04, 0.36, 80, 18),
    new THREE.MeshBasicMaterial({ color: 0x00e5ff, wireframe: true, transparent: true, opacity: 0.35 })
  );
  scene.add(wireKnot);

  scene.add(new THREE.AmbientLight(0xffffff, 0.3));
  const p1 = new THREE.PointLight(0x00e5ff, 2.5, 10); p1.position.set(3, 2, 3); scene.add(p1);
  const p2 = new THREE.PointLight(0xff5ca7, 2.0, 10); p2.position.set(-3, -2, 2); scene.add(p2);

  const clock = new THREE.Clock();
  function animate() {
    const t = clock.getElapsedTime();
    knot.rotation.x = t * 0.3;
    knot.rotation.y = t * 0.4;
    wireKnot.rotation.x = -t * 0.25;
    wireKnot.rotation.y = -t * 0.35;
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
