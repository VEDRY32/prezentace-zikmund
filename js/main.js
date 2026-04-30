/* ============================================================
   ZIKMUND LUCEMBURSKÝ — INTERACTIVE PRESENTATION
   Main Application Script
   ============================================================ */

(function() {
  'use strict';

  // ─── STATE ───────────────────────────────────────
  const state = {
    currentSlide: 0,
    totalSlides: 11,
    isTransitioning: false,
    muteLevel: parseInt(localStorage.getItem('zikmund-mute')) || 0, // 0=all, 1=effects only, 2=muted
    mapOpen: false,
    secretVisible: false,
    audioInitialized: false,
    secretBuffer: '',
    loaded: false
  };

  const SLIDE_NAMES = [
    'Titulní', 'Syn otce vlasti', 'Koruna sv. Štěpána',
    'Katastrofa na Dunaji', 'Bratr proti bratrovi', 'Plameny v Kostnici',
    'Křížové výpravy', 'Koruna imperia', 'Pergamen míru',
    'Svíce dohasíná', 'Lišák nebo státník?'
  ];

  const LATIN_QUOTES = [
    { latin: 'Sic transit gloria mundi', cs: 'Tak prchá sláva světa' },
    { latin: 'Memento mori', cs: 'Pamatuj na smrt' },
    { latin: 'Pax et concordia', cs: 'Mír a svornost' },
    { latin: 'Ave Caesar, morituri te salutant', cs: 'Zdráv buď Caesare, umírající tě zdraví' },
    { latin: 'Divide et impera', cs: 'Rozděl a panuj' },
    { latin: 'Veni, vidi, vici', cs: 'Přišel, viděl, zvítězil' },
    { latin: 'Carpe diem', cs: 'Užívej dne' },
    { latin: 'Tempus fugit', cs: 'Čas utíká' },
    { latin: 'Alea iacta est', cs: 'Kostky jsou vrženy' },
    { latin: 'Dona nobis pacem', cs: 'Dej nám mír' }
  ];

  const LOADING_QUOTES = [
    { latin: 'Sic transit gloria mundi', cs: 'Tak prchá sláva světa' },
    { latin: 'Constantia et virtute', cs: 'Stálostí a ctností' },
    { latin: 'Memento mori', cs: 'Pamatuj na smrt' },
    { latin: 'Tempus fugit', cs: 'Čas utíká' }
  ];

  // ─── DOM REFS ────────────────────────────────────
  let slides, progressBar, muteBtn, mapBtn, mapOverlay, mapClose;
  let navPrev, navNext, scrollHint, customCursor, loadingScreen, latinQuoteEl;
  let transitionOverlay;

  // ─── INIT ────────────────────────────────────────
  function init() {
    // Cache DOM references
    slides = document.querySelectorAll('.slide');
    progressBar = document.getElementById('progress-bar');
    muteBtn = document.getElementById('mute-btn');
    mapBtn = document.getElementById('map-btn');
    mapOverlay = document.getElementById('map-overlay');
    mapClose = document.getElementById('map-close');
    navPrev = document.getElementById('nav-prev');
    navNext = document.getElementById('nav-next');
    scrollHint = document.getElementById('scroll-hint');
    customCursor = document.getElementById('custom-cursor');
    loadingScreen = document.getElementById('loading-screen');
    latinQuoteEl = document.getElementById('latin-quote');
    transitionOverlay = document.getElementById('transition-overlay');

    buildProgressBar();
    setupNavigation();
    setupCustomCursor();
    setupMap();
    setupEasterEggs();
    setupAudio();
    setupThreeScenes();
    updateMuteButton();

    // Loading screen
    simulateLoading();

    // Latin quotes timer
    setInterval(showLatinQuote, 30000);
    setTimeout(showLatinQuote, 8000);

    // Register GSAP
    gsap.registerPlugin(ScrollTrigger);
  }

  // ─── LOADING ──────────────────────────────────────
  function simulateLoading() {
    const fill = document.getElementById('loading-fill');
    const latinEl = document.getElementById('loading-latin');
    // Show a random Latin quote during loading
    const q = LOADING_QUOTES[Math.floor(Math.random() * LOADING_QUOTES.length)];
    if (latinEl) latinEl.textContent = q.latin + ' — ' + q.cs;

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          loadingScreen.classList.add('hidden');
          state.loaded = true;
          animateSlideIn(0);
        }, 800);
      }
      fill.style.width = progress + '%';
    }, 200);
  }

  // ─── PROGRESS BAR ────────────────────────────────
  function buildProgressBar() {
    for (let i = 0; i < state.totalSlides; i++) {
      const seg = document.createElement('div');
      seg.className = 'progress-segment' + (i === 0 ? ' active' : '');
      seg.dataset.slide = i;
      const tooltip = document.createElement('span');
      tooltip.className = 'tooltip';
      tooltip.textContent = SLIDE_NAMES[i];
      seg.appendChild(tooltip);
      seg.addEventListener('click', () => goToSlide(i));
      progressBar.appendChild(seg);
    }
  }

  function updateProgressBar(index) {
    const segments = progressBar.querySelectorAll('.progress-segment');
    segments.forEach((s, i) => {
      s.classList.toggle('active', i <= index);
    });
  }

  // ─── NAVIGATION ──────────────────────────────────
  function setupNavigation() {
    // Keyboard
    document.addEventListener('keydown', handleKey);

    // Scroll
    let scrollTimeout = null;
    let accumulatedDelta = 0;
    window.addEventListener('wheel', (e) => {
      if (state.isTransitioning || state.mapOpen || state.secretVisible) return;
      accumulatedDelta += e.deltaY;
      if (scrollTimeout) return;
      scrollTimeout = setTimeout(() => {
        if (Math.abs(accumulatedDelta) > 50) {
          if (accumulatedDelta > 0) nextSlide();
          else prevSlide();
        }
        accumulatedDelta = 0;
        scrollTimeout = null;
      }, 100);
    }, { passive: true });

    // Touch swipe
    let touchStartY = 0;
    window.addEventListener('touchstart', (e) => { touchStartY = e.touches[0].clientY; }, { passive: true });
    window.addEventListener('touchend', (e) => {
      const diff = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(diff) > 60) {
        if (diff > 0) nextSlide();
        else prevSlide();
      }
    }, { passive: true });

    // Nav buttons
    navPrev.addEventListener('click', prevSlide);
    navNext.addEventListener('click', nextSlide);

    // Update button states
    updateNavButtons();
  }

  function handleKey(e) {
    if (state.secretVisible) {
      if (e.key === 'Escape') closeSecretSlide();
      return;
    }
    if (state.mapOpen && e.key === 'Escape') {
      closeMap();
      return;
    }

    // Easter egg buffer — check "1437" but still allow digit navigation
    if (e.key.length === 1 && '0123456789'.includes(e.key)) {
      state.secretBuffer += e.key;
      if (state.secretBuffer.endsWith('1437')) {
        const before = state.secretBuffer.slice(0, -4);
        if (before.length === 0 || !'0123456789'.includes(before.slice(-1))) {
          openSecretSlide();
          state.secretBuffer = '';
          return;
        }
      }
      if (state.secretBuffer.length > 8) state.secretBuffer = state.secretBuffer.slice(-8);
      // Fall through to switch for slide navigation
    }

    switch (e.key) {
      case 'ArrowRight':
      case ' ':
      case 'ArrowDown':
        e.preventDefault();
        nextSlide();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        prevSlide();
        break;
      case 'Escape':
        if (state.currentSlide !== 0) goToSlide(0);
        break;
      case '1': case '2': case '3': case '4': case '5':
      case '6': case '7': case '8': case '9':
        goToSlide(parseInt(e.key) - 1);
        break;
      case '0':
        goToSlide(9);
        break;
      case '-':
        goToSlide(10);
        break;
      case 'm': case 'M':
        if (state.mapOpen) closeMap();
        else openMap();
        break;
    }
  }

  function nextSlide() {
    if (state.currentSlide < state.totalSlides - 1) {
      goToSlide(state.currentSlide + 1);
    }
  }

  function prevSlide() {
    if (state.currentSlide > 0) {
      goToSlide(state.currentSlide - 1);
    }
  }

  function goToSlide(index) {
    if (index === state.currentSlide || state.isTransitioning || index < 0 || index >= state.totalSlides) return;
    if (state.mapOpen) closeMap();

    state.isTransitioning = true;
    const from = state.currentSlide;
    const to = index;

    // Play transition animation
    playTransition(from, to);

    // Animate out current
    animateSlideOut(from);

    // After transition delay, animate in next
    setTimeout(() => {
      slides[from].classList.remove('active');
      slides[to].classList.add('active');
      state.currentSlide = to;
      updateProgressBar(to);
      updateNavButtons();
      animateSlideIn(to);
      playTransitionSound(from, to);
      initThreeScene(to);

      // Clean up previous Three.js scene
      if (from === 3 || from === 5 || from === 7) {
        destroyThreeScene(from);
      }

      // Stop fire SFX loop when leaving slide 6
      if (from === 5 && audioManager.sfx && audioManager.sfx.fire) {
        audioManager.sfx.fire.stop();
      }
      // Stop bell when leaving slide 3 (Koruna sv. Štěpána)
      if (from === 2 && audioManager.sfx && audioManager.sfx.bell) {
        audioManager.sfx.bell.stop();
      }
      // Stop drums loop when leaving slide 7 (Křížové výpravy)
      if (from === 6 && audioManager.sfx && audioManager.sfx.drums) {
        audioManager.sfx.drums.stop();
      }

      setTimeout(() => { state.isTransitioning = false; }, 800);
    }, 600);

    // Hide scroll hint after first navigation
    scrollHint.style.opacity = '0';
  }

  function updateNavButtons() {
    navPrev.disabled = state.currentSlide === 0;
    navNext.disabled = state.currentSlide === state.totalSlides - 1;
  }

  // ─── SLIDE ANIMATIONS (GSAP) ─────────────────────
  function animateSlideIn(index) {
    const slide = slides[index];
    const elements = slide.querySelectorAll('.slide-element');
    if (!elements.length) return;

    const tl = gsap.timeline();

    elements.forEach(el => {
      const anim = el.dataset.anim || 'fadeInUp';
      const delay = parseFloat(el.dataset.delay) || 0;

      let startVars = { opacity: 0 };
      switch (anim) {
        case 'fadeInUp': startVars.y = 40; break;
        case 'fadeInLeft': startVars.x = -40; break;
        case 'fadeInRight': startVars.x = 40; break;
        case 'scaleIn': startVars.scale = 0.8; break;
        default: startVars.y = 30;
      }

      tl.fromTo(el,
        startVars,
        { opacity: 1, x: 0, y: 0, scale: 1, duration: 0.8, ease: 'power2.out' },
        delay
      );
    });
  }

  function animateSlideOut(index) {
    const slide = slides[index];
    const elements = slide.querySelectorAll('.slide-element');

    gsap.to(elements, {
      opacity: 0,
      y: -20,
      duration: 0.4,
      ease: 'power2.in',
      stagger: 0.02
    });
  }

  // ─── THEMATIC TRANSITIONS ─────────────────────────
  function playTransition(from, to) {
    if (!transitionOverlay) return;
    const overlay = transitionOverlay;

    // Reset overlay
    overlay.innerHTML = '';
    overlay.style.opacity = '0';
    overlay.className = 'transition-overlay';

    // Map transition pairs to animations
    const transitionKey = from + '->' + to;

    switch(transitionKey) {
      case '0->1': // Book page turn
        overlay.innerHTML = '<div class="transition-book-page"></div>';
        overlay.style.opacity = '1';
        gsap.fromTo(overlay.querySelector('.transition-book-page'),
          { rotateY: -90, opacity: 0, transformOrigin: 'left center' },
          { rotateY: 0, opacity: 1, duration: 0.6, ease: 'power2.inOut', onComplete: () => {
            gsap.to(overlay, { opacity: 0, duration: 0.3 });
          }}
        );
        break;

      case '4->5': // Wagon with Hus — key transition
        overlay.innerHTML = `
          <svg class="transition-wagon" viewBox="0 0 1200 600" style="width:100%;height:100%;position:absolute;top:0;left:0;">
            <!-- Snow particles -->
            <g class="snow-particles" opacity="0.6">
              ${Array.from({length: 30}, () =>
                `<circle cx="${Math.random()*1200}" cy="${Math.random()*600}" r="${1+Math.random()*2}" fill="#e8d8b0" opacity="${0.3+Math.random()*0.4}"/>`
              ).join('')}
            </g>
            <!-- Medieval wagon -->
            <g transform="translate(0, 300)">
              <rect x="0" y="0" width="120" height="50" rx="3" fill="#8b6914" stroke="#c9a14a" stroke-width="2"/>
              <!-- Canopy -->
              <rect x="5" y="-30" width="110" height="35" rx="2" fill="#722f37" opacity="0.7"/>
              <!-- Figure (Hus) -->
              <ellipse cx="60" cy="-15" rx="8" ry="12" fill="#3a2817"/>
              <!-- Wheels -->
              <circle cx="20" cy="55" r="15" fill="none" stroke="#5a3f2a" stroke-width="3"/>
              <circle cx="100" cy="55" r="15" fill="none" stroke="#5a3f2a" stroke-width="3"/>
              <!-- Cross on figure -->
              <line x1="60" y1="-25" x2="60" y2="-5" stroke="#c9a14a" stroke-width="2"/>
              <line x1="53" y1="-15" x2="67" y2="-15" stroke="#c9a14a" stroke-width="2"/>
            </g>
          </svg>`;
        overlay.style.opacity = '1';
        gsap.fromTo(overlay.querySelector('.transition-wagon'),
          { x: 1200 },
          { x: -200, duration: 1.2, ease: 'power1.inOut', onComplete: () => {
            gsap.to(overlay, { opacity: 0, duration: 0.3 });
          }}
        );
        break;

      case '5->6': // Flames to council
        overlay.style.opacity = '1';
        overlay.innerHTML = '<div class="transition-flames"></div>';
        gsap.fromTo(overlay.querySelector('.transition-flames'),
          { scale: 1.5, opacity: 0.8 },
          { scale: 0.2, opacity: 0, duration: 0.8, ease: 'power2.in', onComplete: () => {
            overlay.style.opacity = '0';
          }}
        );
        break;

      case '6->7': // Flames transform to wagon fortress
        overlay.style.opacity = '1';
        overlay.innerHTML = `
          <svg viewBox="0 0 200 200" style="width:300px;height:300px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);">
            <g class="flame-to-wagon">
              <path d="M100,20 Q80,60 90,100 Q100,80 110,100 Q120,60 100,20" fill="#ff6600" opacity="0.8"/>
              <path d="M100,30 Q90,60 95,90 Q100,75 105,90 Q110,60 100,30" fill="#ffbf69" opacity="0.6"/>
            </g>
          </svg>`;
        gsap.to(overlay.querySelector('.flame-to-wagon'), {
          scaleX: 3, scaleY: 0.3, opacity: 0, duration: 0.7, ease: 'power2.in',
          onComplete: () => { overlay.style.opacity = '0'; }
        });
        break;

      case '7->8': // Shield breaks to reveal Holy Roman Empire crown
        overlay.style.opacity = '1';
        overlay.innerHTML = `
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);">
            <img src="assets/svg/holy-roman-empire.svg" width="150" height="180" alt="Holy Roman Empire" style="opacity:0;">
          </div>`;
        // First break apart existing shield, then fade in Holy Roman Empire
        const shieldPieces = [];
        for (let i = 0; i < 9; i++) {
          const piece = document.createElement('div');
          piece.style.cssText = `position:absolute;width:80px;height:80px;background:#c9a14a;border:1px solid #8b6914;
            top:${300 + (Math.floor(i/3)-1)*100}px;left:${600 + (i%3-1)*100}px;opacity:0.8;`;
          overlay.appendChild(piece);
          shieldPieces.push(piece);
        }
        shieldPieces.forEach((p, i) => {
          gsap.to(p, {
            x: (Math.random()-0.5)*800, y: (Math.random()-0.5)*600, rotation: Math.random()*720-360,
            opacity: 0, scale: 0.3, duration: 0.8, ease: 'power2.in', delay: 0.1
          });
        });
        // Fade in Holy Roman Empire eagle
        const hreImg = overlay.querySelector('img');
        gsap.fromTo(hreImg, { opacity: 0, scale: 0.5 }, { opacity: 0.9, scale: 1, duration: 1, delay: 0.6, ease: 'power2.out' });
        setTimeout(() => { overlay.style.opacity = '0'; }, 1400);
        break;

      case '8->9': // Parchment unroll
        overlay.style.opacity = '1';
        overlay.innerHTML = '<div class="transition-parchment"></div>';
        gsap.fromTo(overlay.querySelector('.transition-parchment'),
          { scaleY: 0, transformOrigin: 'top center', opacity: 1 },
          { scaleY: 1, opacity: 0.6, duration: 0.6, ease: 'power2.out', onComplete: () => {
            gsap.to(overlay, { opacity: 0, duration: 0.3 });
          }}
        );
        break;

      case '9->10': // Procession to darkness
        overlay.style.opacity = '1';
        overlay.innerHTML = '<div class="transition-procession"></div>';
        gsap.fromTo(overlay.querySelector('.transition-procession'),
          { x: 0, opacity: 0.8 },
          { x: 100, opacity: 0, duration: 0.8, ease: 'power2.in', onComplete: () => {
            overlay.style.opacity = '0';
          }}
        );
        break;

      case '10->11': // Luxemburg coat → Habsburg eagle
        overlay.style.opacity = '1';
        overlay.innerHTML = `
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);display:flex;align-items:center;justify-content:center;gap:40px;">
            <img src="assets/svg/czech-lion.svg" width="120" height="150" alt="Czech Lion" class="transition-lion" style="opacity:0.8;">
            <img src="assets/svg/habsburg-eagle.svg" width="140" height="170" alt="Habsburg Eagle" class="transition-eagle" style="opacity:0;">
          </div>`;
        // Fade out Czech lion (Luxemburg)
        const lionImg = overlay.querySelector('.transition-lion');
        const eagleImg = overlay.querySelector('.transition-eagle');
        gsap.to(lionImg, {
          opacity: 0, scale: 0.3, rotation: 180, duration: 0.8, ease: 'power2.in'
        });
        // Fade in Habsburg eagle
        gsap.fromTo(eagleImg, { opacity: 0, scale: 1.5 }, { opacity: 0.9, scale: 1, duration: 1, delay: 0.5, ease: 'power2.out' });
        setTimeout(() => { overlay.style.opacity = '0'; }, 1600);
        break;

      default:
        // Generic fade
        break;
    }
  }

  // ─── THREE.JS SCENES ─────────────────────────────
  const threeScenes = {};

  function setupThreeScenes() {
    // Will be initialized on demand when slides become active
  }

  function initThreeScene(slideIndex) {
    const key = 'slide-' + slideIndex;
    // If scene exists but is paused, just resume the animation loop
    if (threeScenes[key] && threeScenes[key].rafId === -1 && threeScenes[key].animate) {
      threeScenes[key].rafId = 0;
      threeScenes[key].animate();
      return;
    }
    switch (slideIndex) {
      case 3: initNikopolScene(); break;
      case 5: initKostniceScene(); initLottieFire(); break;
      case 7: initCoronationScene(); break;
    }
  }

  function destroyThreeScene(slideIndex) {
    // Don't fully destroy — just pause the animation loop to save resources.
    // This avoids WebGL context issues when re-initializing.
    const key = 'slide-' + slideIndex;
    if (threeScenes[key]) {
      cancelAnimationFrame(threeScenes[key].rafId);
      threeScenes[key].rafId = -1; // Mark as paused
    }
  }

  // ── Nikopol Scene: Improved cavalry with better shapes ──
  function initNikopolScene() {
    const canvas = document.getElementById('nikopol-canvas');
    if (!canvas) return;
    if (threeScenes['slide-3']) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a0800);
    scene.fog = new THREE.FogExp2(0x3a0a0a, 0.005); // Denser fog, darker red

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 3, 12);
    camera.lookAt(0, 1, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lights
    const ambientLight = new THREE.AmbientLight(0x8b3a40, 0.4);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xff4400, 0.8);
    dirLight.position.set(-5, 10, 5);
    scene.add(dirLight);

    // Red moon/sun in background
    const moonGeo = new THREE.CircleGeometry(15, 32);
    const moonMat = new THREE.MeshBasicMaterial({ color: 0x8b1a1a, transparent: true, opacity: 0.3 });
    const moon = new THREE.Mesh(moonGeo, moonMat);
    moon.position.set(0, 8, -40);
    scene.add(moon);

    // Ground plane
    const groundGeo = new THREE.PlaneGeometry(200, 200);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x2a0a0a });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1;
    scene.add(ground);

    // Build a better horse shape
    function createHorse() {
      const group = new THREE.Group();
      const bodyMat = new THREE.MeshLambertMaterial({ color: 0x1a0f08 });

      // Body (elongated)
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 2.2, 6), bodyMat);
      body.rotation.z = Math.PI / 2;
      body.position.y = 1.1;
      group.add(body);

      // Neck
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.25, 1.2, 6), bodyMat);
      neck.position.set(0.9, 1.7, 0);
      neck.rotation.z = -0.5;
      group.add(neck);

      // Head
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.2), bodyMat);
      head.position.set(1.3, 2.2, 0);
      group.add(head);

      // 4 legs
      const legGeo = new THREE.CylinderGeometry(0.06, 0.06, 1, 4);
      [[-0.6, 0.5, 0.2], [-0.6, 0.5, -0.2], [0.6, 0.5, 0.2], [0.6, 0.5, -0.2]].forEach(pos => {
        const leg = new THREE.Mesh(legGeo, bodyMat);
        leg.position.set(...pos);
        group.add(leg);
      });

      return group;
    }

    // Build a rider with helmet
    function createRider() {
      const group = new THREE.Group();
      const riderMat = new THREE.MeshLambertMaterial({ color: 0x1a0f08 });

      // Body
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 1, 6), riderMat);
      body.position.y = 2.3;
      group.add(body);

      // Head
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), riderMat);
      head.position.y = 3;
      group.add(head);

      // Helmet (cone on top)
      const helmet = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.3, 6), riderMat);
      helmet.position.y = 3.2;
      group.add(helmet);

      // Lance
      const lance = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 3.5, 4),
        new THREE.MeshLambertMaterial({ color: 0x3a2817 }));
      lance.position.set(0.3, 3, 0.3);
      lance.rotation.z = -0.3;
      group.add(lance);

      // Lance tip
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.2, 4),
        new THREE.MeshLambertMaterial({ color: 0x8b6914 }));
      tip.position.set(0.3, 4.8, 0.3);
      group.add(tip);

      return group;
    }

    // Foreground cavalry (5 large riders)
    for (let i = 0; i < 5; i++) {
      const mount = new THREE.Group();
      mount.add(createHorse());
      mount.add(createRider());
      mount.position.set(
        -8 + i * 4,
        0,
        -2 + Math.random() * 3
      );
      mount.rotation.y = Math.random() * 0.3 - 0.15;
      scene.add(mount);
    }

    // Mid-ground cavalry (10 smaller)
    for (let i = 0; i < 10; i++) {
      const mount = new THREE.Group();
      mount.add(createHorse());
      mount.add(createRider());
      mount.scale.set(0.6, 0.6, 0.6);
      mount.position.set(
        -12 + i * 3,
        0,
        -8 + Math.random() * 4
      );
      mount.rotation.y = Math.random() * 0.4 - 0.2;
      scene.add(mount);
    }

    // Background: minarets/city silhouette
    for (let i = 0; i < 5; i++) {
      const minaretMat = new THREE.MeshLambertMaterial({ color: 0x3a2817 });
      const minaret = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 8, 8), minaretMat);
      minaret.position.set(-15 + i * 7, 3, -20);
      scene.add(minaret);

      const top = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.5, 8), minaretMat);
      top.position.set(-15 + i * 7, 8, -20);
      scene.add(top);
    }

    // Bones on ground (defeat)
    for (let i = 0; i < 8; i++) {
      const boneMat = new THREE.MeshLambertMaterial({ color: 0xd4c094 });
      const bone = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.5, 4), boneMat);
      bone.position.set(
        (Math.random() - 0.5) * 20,
        -0.8,
        (Math.random() - 0.5) * 10
      );
      bone.rotation.z = Math.random() * Math.PI;
      scene.add(bone);
    }

    // Particle system: yellow-orange embers with glow
    const particleCount = 300;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = Math.random() * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 25;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xff8c00,
      size: 0.15,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Animation loop
    let time = 0;
    function animate() {
      time += 0.01;
      camera.position.x = Math.sin(time * 0.3) * 1;
      const pos = particles.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        pos[i * 3 + 1] += 0.01;
        if (pos[i * 3 + 1] > 8) pos[i * 3 + 1] = 0;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
      threeScenes['slide-3'].rafId = requestAnimationFrame(animate);
    }

    threeScenes['slide-3'] = { renderer, canvas, rafId: 0, animate };
    animate();

    window.addEventListener('resize', () => {
      if (!threeScenes['slide-3']) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  // ── Kostnice Scene: Better fire with stake, figure, gothic hall ──
  function initKostniceScene() {
    const canvas = document.getElementById('kostnice-canvas');
    if (!canvas) return;
    if (threeScenes['slide-5']) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d0500);
    scene.fog = new THREE.FogExp2(0x2a0500, 0.006);

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(2, 2, 8); // Offset camera so fire doesn't cover text
    camera.lookAt(0, 1, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Fire light
    const fireLight = new THREE.PointLight(0xff4400, 2, 20);
    fireLight.position.set(-1, 3, 0);
    scene.add(fireLight);
    const ambientLight = new THREE.AmbientLight(0x3a1000, 0.3);
    scene.add(ambientLight);

    // Stake/pyre: 5-6 logs leaning together
    const logMat = new THREE.MeshLambertMaterial({ color: 0x3a2010 });
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const log = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 3, 6), logMat);
      log.position.set(-1 + Math.cos(angle) * 0.5, 1.5, Math.sin(angle) * 0.5);
      log.rotation.z = (i % 2 ? 0.2 : -0.2);
      log.rotation.x = 0.1;
      scene.add(log);
    }

    // Central stake
    const stake = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 4, 6), logMat);
    stake.position.set(-1, 2, 0);
    scene.add(stake);

    // Figure silhouette on stake (dark, simple)
    const figureMat = new THREE.MeshBasicMaterial({ color: 0x1a0a00 });
    // Body
    const figBody = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 1.5, 6), figureMat);
    figBody.position.set(-1, 3.2, 0);
    scene.add(figBody);
    // Head
    const figHead = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), figureMat);
    figHead.position.set(-1, 4.1, 0);
    scene.add(figHead);
    // Arms (tied)
    const armGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 4);
    const armL = new THREE.Mesh(armGeo, figureMat);
    armL.position.set(-1.3, 3.5, 0);
    armL.rotation.z = 0.8;
    scene.add(armL);
    const armR = new THREE.Mesh(armGeo, figureMat);
    armR.position.set(-0.7, 3.5, 0);
    armR.rotation.z = -0.8;
    scene.add(armR);

    // Gothic hall windows in background
    const windowMat = new THREE.MeshBasicMaterial({ color: 0x1a0a00, transparent: true, opacity: 0.4 });
    for (let i = 0; i < 5; i++) {
      const gothicWindow = new THREE.Group();
      // Tall rectangle
      const winBody = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 3), windowMat);
      winBody.position.y = 4;
      gothicWindow.add(winBody);
      // Pointed arch top
      const archGeo = new THREE.CircleGeometry(0.4, 16, 0, Math.PI);
      const arch = new THREE.Mesh(archGeo, windowMat);
      arch.position.y = 5.5;
      gothicWindow.add(arch);

      gothicWindow.position.set(-6 + i * 3, 0, -8);
      scene.add(gothicWindow);
    }

    // Fire particles — fewer, larger, more transparent, in cone shape
    const fireCount = 200;
    const fireGeo = new THREE.BufferGeometry();
    const firePos = new Float32Array(fireCount * 3);
    const fireVel = new Float32Array(fireCount);
    const fireSizes = new Float32Array(fireCount);
    for (let i = 0; i < fireCount; i++) {
      // Cone-shaped distribution: narrow at bottom, wider at top
      const h = Math.random() * 5;
      const spread = h * 0.3; // Wider as it goes up
      firePos[i * 3] = -1 + (Math.random() - 0.5) * spread;
      firePos[i * 3 + 1] = h;
      firePos[i * 3 + 2] = (Math.random() - 0.5) * spread * 0.5;
      fireVel[i] = 0.02 + Math.random() * 0.03;
      fireSizes[i] = 0.2 + Math.random() * 0.3;
    }
    fireGeo.setAttribute('position', new THREE.BufferAttribute(firePos, 3));
    const fireMat = new THREE.PointsMaterial({
      color: 0xff6600,
      size: 0.3,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });
    const fireParticles = new THREE.Points(fireGeo, fireMat);
    scene.add(fireParticles);

    // Animation
    let time = 0;
    function animate() {
      time += 0.016;
      const pos = fireParticles.geometry.attributes.position.array;
      for (let i = 0; i < fireCount; i++) {
        pos[i * 3 + 1] += fireVel[i];
        pos[i * 3] += (Math.random() - 0.5) * 0.015;
        if (pos[i * 3 + 1] > 5) {
          const spread = 0.3;
          pos[i * 3] = -1 + (Math.random() - 0.5) * spread;
          pos[i * 3 + 1] = 0;
          pos[i * 3 + 2] = (Math.random() - 0.5) * spread * 0.5;
        }
      }
      fireParticles.geometry.attributes.position.needsUpdate = true;

      fireLight.intensity = 2 + Math.sin(time * 10) * 0.5;
      camera.position.x = 2 + Math.sin(time * 0.2) * 0.3;

      renderer.render(scene, camera);
      threeScenes['slide-5'].rafId = requestAnimationFrame(animate);
    }

    threeScenes['slide-5'] = { renderer, canvas, rafId: 0, animate };
    animate();

    window.addEventListener('resize', () => {
      if (!threeScenes['slide-5']) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  // ── Lottie Fire on Slide 6 ──
  let lottieFireAnim = null;
  function initLottieFire() {
    const container = document.querySelector('#slide-6 .lottie-fire');
    if (!container || lottieFireAnim) return;
    try {
      lottieFireAnim = lottie.loadAnimation({
        container: container,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'assets/lottie/fire.json'
      });
    } catch(e) {
      console.warn('Lottie fire failed to load, falling back to Three.js only', e);
    }
  }

  // ── Coronation Scene: Single 3D crown, no SVG, better material ──
  function initCoronationScene() {
    const canvas = document.getElementById('coronation-canvas');
    if (!canvas) return;
    if (threeScenes['slide-7']) return;

    const scene = new THREE.Scene();
    // Gold-warm parchment background instead of gray
    scene.background = new THREE.Color(0x2a1f0a);

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 8);
    camera.lookAt(0, 2, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lighting — point light above crown instead of spotlight cone
    const ambientLight = new THREE.AmbientLight(0xc9a14a, 0.4);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffdd66, 2.5, 25);
    pointLight.position.set(0, 8, 0);
    scene.add(pointLight);
    // Subtle fill from below
    const fillLight = new THREE.PointLight(0xffdd66, 0.5, 15);
    fillLight.position.set(0, 0, 5);
    scene.add(fillLight);

    // Imperial crown — better material
    const crownGroup = new THREE.Group();
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xb8860b, metalness: 0.95, roughness: 0.15
    });

    // Crown base ring
    const ringGeo = new THREE.TorusGeometry(1.2, 0.18, 12, 32);
    const ring = new THREE.Mesh(ringGeo, goldMat);
    ring.rotation.x = Math.PI / 2;
    crownGroup.add(ring);

    // Crown band (cylinder)
    const bandGeo = new THREE.CylinderGeometry(1.2, 1.25, 0.6, 32, 1, true);
    const band = new THREE.Mesh(bandGeo, goldMat);
    band.position.y = 0.1;
    crownGroup.add(band);

    // Crown points (8)
    for (let i = 0; i < 8; i++) {
      const pointGeo = new THREE.ConeGeometry(0.12, 0.7, 4);
      const point = new THREE.Mesh(pointGeo, goldMat);
      const angle = (i / 8) * Math.PI * 2;
      point.position.set(Math.cos(angle) * 1.2, 0.5, Math.sin(angle) * 1.2);
      crownGroup.add(point);
    }

    // Imperial arch (characteristic of Holy Roman Imperial crown)
    const archGeo = new THREE.TorusGeometry(1.0, 0.06, 8, 32, Math.PI);
    const arch = new THREE.Mesh(archGeo, goldMat);
    arch.rotation.x = Math.PI / 2;
    arch.rotation.z = Math.PI / 2;
    arch.position.y = 0.9;
    crownGroup.add(arch);
    // Second arch perpendicular
    const arch2 = new THREE.Mesh(archGeo, goldMat);
    arch2.rotation.x = Math.PI / 2;
    arch2.position.y = 0.9;
    crownGroup.add(arch2);

    // Cross on top
    const crossVGeo = new THREE.BoxGeometry(0.08, 0.6, 0.08);
    const crossHGeo = new THREE.BoxGeometry(0.35, 0.08, 0.08);
    const crossV = new THREE.Mesh(crossVGeo, goldMat);
    crossV.position.y = 1.3;
    crownGroup.add(crossV);
    const crossH = new THREE.Mesh(crossHGeo, goldMat);
    crossH.position.y = 1.45;
    crownGroup.add(crossH);

    // Gems (colored spheres)
    const gemColors = [0x722f37, 0x1a3a8b, 0x1a6b3a, 0x722f37, 0x1a3a8b, 0x1a6b3a, 0x722f37, 0x1a3a8b];
    gemColors.forEach((color, i) => {
      const gemMat = new THREE.MeshStandardMaterial({ color, metalness: 0.5, roughness: 0.2 });
      const gem = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), gemMat);
      const angle = (i / 8) * Math.PI * 2;
      gem.position.set(Math.cos(angle) * 1.2, 0.1, Math.sin(angle) * 1.2);
      crownGroup.add(gem);
    });
    // Central gem
    const centerGemMat = new THREE.MeshStandardMaterial({ color: 0x1a3a8b, metalness: 0.6, roughness: 0.1 });
    const centerGem = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 12), centerGemMat);
    centerGem.position.y = 0.9;
    crownGroup.add(centerGem);

    crownGroup.position.y = 3;
    scene.add(crownGroup);

    // Subtle parchment-textured plane below
    const planeGeo = new THREE.PlaneGeometry(20, 20);
    const planeMat = new THREE.MeshStandardMaterial({
      color: 0xe8d8b0, roughness: 0.9, metalness: 0
    });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -0.5;
    scene.add(plane);

    // Animation — floating, rotating, bobbing
    let time = 0;
    function animate() {
      time += 0.01;
      crownGroup.position.y = 3 + Math.sin(time * 0.8) * 0.2;
      crownGroup.rotation.y += 0.003;

      // Subtle gold shimmer
      pointLight.intensity = 2.5 + Math.sin(time * 3) * 0.3;

      renderer.render(scene, camera);
      threeScenes['slide-7'].rafId = requestAnimationFrame(animate);
    }

    threeScenes['slide-7'] = { renderer, canvas, rafId: 0, animate };
    animate();

    window.addEventListener('resize', () => {
      if (!threeScenes['slide-7']) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  // ─── AUDIO ───────────────────────────────────────
  const audioManager = {
    bgMusic: null,
    sfx: {},
    initialized: false,
    webAudioCtx: null
  };

  function setupAudio() {
    const initOnInteraction = () => {
      if (audioManager.initialized) return;
      audioManager.initialized = true;
      state.audioInitialized = true;

      // Initialize Web Audio context
      try {
        audioManager.webAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch(e) {}

      // Background music — use a simple oscillator-based ambient as fallback
      try {
        audioManager.bgMusic = new Howl({
          src: ['assets/audio/medieval-ambient.mp3'],
          loop: true,
          volume: state.muteLevel === 0 ? 0.25 : 0,
          autoplay: false,
          onloaderror: function() {
            createAmbientFallback();
          }
        });
        if (state.muteLevel === 0) audioManager.bgMusic.play();
      } catch(e) {
        createAmbientFallback();
      }

      // SFX — try external, fallback to Web Audio
      audioManager.sfx = {
        pageFlip: new Howl({ src: ['assets/audio/page-flip.mp3'], volume: 0.4, onloaderror: () => {} }),
        bell: new Howl({ src: ['assets/audio/bell.mp3'], volume: 0.4, onloaderror: () => {} }),
        battle: new Howl({ src: ['assets/audio/battle.mp3'], volume: 0.35, onloaderror: () => {} }),
        fire: new Howl({ src: ['assets/audio/fire.mp3'], volume: 0.3, loop: true, onloaderror: () => {} }),
        drums: new Howl({ src: ['assets/audio/drums.mp3'], volume: 0.35, loop: true, onloaderror: () => {} }),
        fanfare: new Howl({ src: ['assets/audio/fanfare.mp3'], volume: 0.4, onloaderror: () => {} }),
        candle: new Howl({ src: ['assets/audio/candle.mp3'], volume: 0.4, onloaderror: () => {} }),
      };

      document.removeEventListener('click', initOnInteraction);
      document.removeEventListener('keydown', initOnInteraction);
    };

    document.addEventListener('click', initOnInteraction, { once: false });
    document.addEventListener('keydown', initOnInteraction, { once: false });

    // Mute button
    muteBtn.addEventListener('click', cycleMute);
  }

  function createAmbientFallback() {
    try {
      const ctx = audioManager.webAudioCtx || new (window.AudioContext || window.webkitAudioContext)();
      audioManager.webAudioCtx = ctx;
      const masterGain = ctx.createGain();
      masterGain.gain.value = state.muteLevel === 0 ? 0.05 : 0;
      masterGain.connect(ctx.destination);

      // Multi-oscillator organ-like ambient
      const freqs = [110, 165, 220, 330];
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = i === 0 ? 'sine' : 'triangle';
        osc.frequency.value = freq;
        filter.type = 'lowpass';
        filter.frequency.value = 200 + i * 50;
        gain.gain.value = 0;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        osc.start();
      });

      audioManager.bgMusic = {
        play: () => {
          if (state.muteLevel < 2) masterGain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 1);
        },
        pause: () => { masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5); },
        volume: (v) => { masterGain.gain.linearRampToValueAtTime(v, ctx.currentTime + 0.3); }
      };

      if (state.muteLevel === 0) audioManager.bgMusic.play();
    } catch(e) {}
  }

  // Web Audio API SFX generators
  function playWebAudioSFX(type) {
    if (!audioManager.webAudioCtx) return;
    const ctx = audioManager.webAudioCtx;
    if (state.muteLevel === 2) return;

    switch(type) {
      case 'pageFlip': {
        // White noise burst with fade
        const bufferSize = ctx.sampleRate * 0.15;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i/bufferSize);
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        const gain = ctx.createGain();
        gain.gain.value = 0.1;
        src.connect(gain).connect(ctx.destination);
        src.start();
        break;
      }
      case 'bell': {
        // Sine 800Hz with exponential decay
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 800;
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);
        osc.connect(gain).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 2);
        break;
      }
      case 'fire': {
        // Pink noise with low-pass
        const bufferSize = ctx.sampleRate * 0.5;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1);
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 500;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        src.connect(filter).connect(gain).connect(ctx.destination);
        src.start();
        src.stop(ctx.currentTime + 0.5);
        break;
      }
      case 'fanfare': {
        // 3 sines in thirds with envelope
        [523, 659, 784].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.15);
          gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + i * 0.15 + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 1);
          osc.connect(gain).connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.15);
          osc.stop(ctx.currentTime + i * 0.15 + 1);
        });
        break;
      }
    }
  }

  // 3-state mute: 0=all, 1=effects only, 2=muted
  function cycleMute() {
    state.muteLevel = (state.muteLevel + 1) % 3;
    localStorage.setItem('zikmund-mute', state.muteLevel);
    updateMuteButton();

    const volMultiplier = state.muteLevel === 0 ? 1 : 0;
    const bgVol = state.muteLevel === 0 ? 0.25 : 0;

    if (audioManager.bgMusic) {
      if (state.muteLevel === 0) {
        audioManager.bgMusic.volume(0.25);
        if (audioManager.bgMusic.playing && !audioManager.bgMusic.playing()) {
          audioManager.bgMusic.play();
        }
      } else if (state.muteLevel === 1) {
        // Effects only — mute bg music
        audioManager.bgMusic.volume(0);
      } else {
        // Fully muted
        audioManager.bgMusic.volume(0);
      }
    }

    // Mute/unmute all SFX
    if (audioManager.sfx) {
      Object.values(audioManager.sfx).forEach(sfx => {
        if (state.muteLevel === 2) {
          sfx.volume(0);
        } else {
          // Restore original volume based on type
          const origVols = { pageFlip: 0.4, bell: 0.4, battle: 0.35, fire: 0.3, drums: 0.35, fanfare: 0.4, candle: 0.4 };
          const name = Object.keys(audioManager.sfx).find(k => audioManager.sfx[k] === sfx);
          sfx.volume(origVols[name] || 0.3);
        }
      });
    }
  }

  function updateMuteButton() {
    const btn = muteBtn;
    const onIcon = btn.querySelector('.mute-icon--on');
    const offIcon = btn.querySelector('.mute-icon--off');
    const fxIcon = btn.querySelector('.mute-icon--fx');

    // Remove existing fx icon if any
    const existingFx = btn.querySelector('.mute-icon--fx');
    if (existingFx) existingFx.remove();

    switch(state.muteLevel) {
      case 0: // All on
        if (onIcon) onIcon.style.display = '';
        if (offIcon) offIcon.style.display = 'none';
        btn.title = 'Ztlumit zvuk';
        break;
      case 1: // Effects only
        if (onIcon) onIcon.style.display = 'none';
        if (offIcon) offIcon.style.display = 'none';
        // Add FX icon
        const fxSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        fxSvg.classList.add('mute-icon', 'mute-icon--fx');
        fxSvg.setAttribute('width', '20');
        fxSvg.setAttribute('height', '20');
        fxSvg.setAttribute('viewBox', '0 0 24 24');
        fxSvg.setAttribute('fill', 'none');
        fxSvg.setAttribute('stroke', 'currentColor');
        fxSvg.setAttribute('stroke-width', '2');
        fxSvg.innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>';
        btn.insertBefore(fxSvg, btn.firstChild);
        btn.title = 'Pouze efekty';
        break;
      case 2: // Muted
        if (onIcon) onIcon.style.display = 'none';
        if (offIcon) offIcon.style.display = '';
        btn.title = 'Zapnout zvuk';
        break;
    }
  }

  function playTransitionSound(from, to) {
    if (state.muteLevel === 2 || !audioManager.initialized) return;

    // Transition → Sound mapping per spec
    const sfxMap = {
      1: 'pageFlip',  // 0→1 (or any→1)
      2: 'bell',       // →2 coronation bell
      3: 'battle',     // →3 Nikopol battle
      4: 'pageFlip',   // →4
      5: 'fire',       // →5 fire loop start (will be stopped on leave)
      6: 'drums',     // →6 drums
      7: 'fanfare',    // →7 fanfare
      8: 'pageFlip',   // →8
      9: 'candle',     // →9 candle
      10: 'pageFlip'  // →10
    };

    const sfxName = sfxMap[to];
    if (sfxName && audioManager.sfx[sfxName]) {
      try {
        // Stop fire loop if we're NOT going to slide 6 (index 5)
        if (sfxName !== 'fire' && audioManager.sfx.fire) {
          audioManager.sfx.fire.stop();
        }
        audioManager.sfx[sfxName].play();
      } catch(e) {}
    }
  }

  // ─── CUSTOM CURSOR ───────────────────────────────
  function setupCustomCursor() {
    document.addEventListener('mousemove', (e) => {
      customCursor.style.left = e.clientX + 'px';
      customCursor.style.top = e.clientY + 'px';
    });

    const interactiveSelectors = 'button, a, .map-point-group, .progress-segment, .coat-of-arms';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactiveSelectors)) {
        customCursor.classList.add('hovering');
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactiveSelectors)) {
        customCursor.classList.remove('hovering');
      }
    });

    document.addEventListener('mouseleave', () => { customCursor.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { customCursor.style.opacity = '1'; });
  }

  // ─── MAP ──────────────────────────────────────────
  function setupMap() {
    mapBtn.addEventListener('click', openMap);
    mapClose.addEventListener('click', closeMap);

    document.querySelectorAll('.map-point-group').forEach(point => {
      point.addEventListener('click', () => {
        const slideIndex = parseInt(point.dataset.slide) - 1;
        closeMap();
        setTimeout(() => goToSlide(slideIndex), 400);

        const dot = point.querySelector('.map-point-dot');
        gsap.fromTo(dot, { scale: 1 }, { scale: 2, duration: 0.3, yoyo: true, repeat: 1 });
      });
    });
  }

  function openMap() {
    mapOverlay.classList.add('open');
    state.mapOpen = true;
  }

  function closeMap() {
    mapOverlay.classList.remove('open');
    state.mapOpen = false;
  }

  // ─── EASTER EGGS ─────────────────────────────────
  function setupEasterEggs() {
    // "1437" easter egg handled in handleKey
  }

  function openSecretSlide() {
    document.getElementById('slide-secret').classList.add('visible');
    state.secretVisible = true;
  }

  function closeSecretSlide() {
    document.getElementById('slide-secret').classList.remove('visible');
    state.secretVisible = false;
  }

  // ─── LATIN QUOTES ────────────────────────────────
  function showLatinQuote() {
    if (state.isTransitioning) return;
    const q = LATIN_QUOTES[Math.floor(Math.random() * LATIN_QUOTES.length)];
    latinQuoteEl.innerHTML = `<span class="latin-text">${q.latin}</span><br><span class="latin-cs">${q.cs}</span>`;

    gsap.fromTo(latinQuoteEl,
      { opacity: 0, y: 10 },
      { opacity: 0.5, y: 0, duration: 1, ease: 'power2.out',
        onComplete: () => {
          gsap.to(latinQuoteEl, { opacity: 0, y: -10, duration: 1, delay: 4, ease: 'power2.in' });
        }
      }
    );
  }

  // ─── INK STAIN ON HOVER ─────────────────────────
  document.addEventListener('mouseover', (e) => {
    const hoverTarget = e.target.closest('blockquote, .fun-fact, img');
    if (hoverTarget) {
      const stain = document.createElement('div');
      stain.className = 'ink-stain';
      stain.style.left = (e.offsetX - 30) + 'px';
      stain.style.top = (e.offsetY - 30) + 'px';
      stain.style.opacity = '0.5';
      hoverTarget.style.position = hoverTarget.style.position || 'relative';
      hoverTarget.appendChild(stain);
      setTimeout(() => { stain.style.opacity = '0'; }, 100);
      setTimeout(() => { stain.remove(); }, 1600);
    }
  });

  // ─── COAT OF ARMS HOVER ─────────────────────────
  // Handled via CSS .coat-of-arms:hover transform

  // ─── WINDOW RESIZE ──────────────────────────────
  window.addEventListener('resize', () => {
    // Recalculate any needed dimensions
  });

  // ─── START ──────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();