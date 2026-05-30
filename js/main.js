/* ============================================================
   SUPERFUTURES — Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  // ── Navigation scroll behaviour ────────────────────────
  const nav = document.querySelector('.site-nav');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (nav) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 60) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  // ── Active nav highlighting ─────────────────────────────
  function setActiveNav() {
    const current = window.location.pathname;
    document.querySelectorAll('.nav-links a').forEach(link => {
      const href = link.getAttribute('href');
      if (href === current || href === current.replace(/\/$/, '') ||
          (current.includes(href) && href !== '/' && href !== 'index.html')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  setActiveNav();

  // ── Intersection Observer for fade-in ──────────────────
  const fadeEls = document.querySelectorAll('.fade-in');

  if (fadeEls.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    fadeEls.forEach(el => observer.observe(el));
  } else {
    fadeEls.forEach(el => el.classList.add('visible'));
  }

  // ── Hero Canvas — Structural field visualisation ────────
  // Represents complex adaptive systems: particles move in
  // fields of attraction/repulsion — no linear trajectories.
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles, animId;
  const N_PARTICLES = 55;
  const SPEED = 0.28;

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function randomIn(min, max) {
    return Math.random() * (max - min) + min;
  }

  class Particle {
    constructor() { this.reset(true); }

    reset(initial) {
      this.x = randomIn(0, W);
      this.y = initial ? randomIn(0, H) : -8;
      this.vx = randomIn(-0.6, 0.6) * SPEED;
      this.vy = randomIn(0.3, 1.1) * SPEED;
      this.life = 0;
      this.maxLife = randomIn(180, 420);
      this.radius = randomIn(0.6, 2.2);
      // Colour: green teal family, muted
      const hue = randomIn(155, 185);
      const sat = randomIn(25, 50);
      const lit = randomIn(42, 65);
      this.color = `hsl(${hue}, ${sat}%, ${lit}%)`;
    }

    update() {
      // Gentle Perlin-like drift using sin/cos fields
      const t = this.life * 0.007;
      this.vx += Math.sin(this.y * 0.012 + t) * 0.012;
      this.vy += Math.cos(this.x * 0.012 + t) * 0.006;

      // Dampen
      this.vx *= 0.992;
      this.vy *= 0.994;

      this.x += this.vx;
      this.y += this.vy;
      this.life++;

      if (this.life > this.maxLife || this.y > H + 20 ||
          this.x < -20 || this.x > W + 20) {
        this.reset(false);
      }
    }

    draw() {
      const alpha = Math.sin((this.life / this.maxLife) * Math.PI) * 0.55;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color.replace(')', `, ${alpha})`).replace('hsl', 'hsla');
      ctx.fill();
    }
  }

  // Connection lines between nearby particles
  function drawConnections() {
    const maxDist = 90;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(74, 124, 111, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function init() {
    resize();
    particles = Array.from({ length: N_PARTICLES }, () => new Particle());
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    animId = requestAnimationFrame(loop);
  }

  const resizeObs = new ResizeObserver(() => {
    resize();
  });
  resizeObs.observe(canvas.parentElement);

  window.addEventListener('resize', resize, { passive: true });

  init();
  loop();

  // ── Work page filter ────────────────────────────────────
  const filterBtns = document.querySelectorAll('.filter-btn');
  const workCards = document.querySelectorAll('[data-type]');

  if (filterBtns.length && workCards.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;

        workCards.forEach(card => {
          if (filter === 'all' || card.dataset.type === filter) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // ── Smooth anchor scrolling with offset ────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

})();

  // ── Video vignette player ───────────────────────────────
  const vignPlayer = document.getElementById('vignette-player');
  const vignVideo  = document.getElementById('vignette-video');
  const vignBtn    = document.getElementById('vignette-play-btn');

  if (vignPlayer && vignVideo && vignBtn) {
    function playVignette() {
      vignVideo.play();
      vignPlayer.classList.add('playing');
    }

    function pauseVignette() {
      vignVideo.pause();
      vignPlayer.classList.remove('playing');
    }

    vignPlayer.addEventListener('click', () => {
      if (vignVideo.paused) {
        playVignette();
      } else {
        pauseVignette();
      }
    });

    vignVideo.addEventListener('ended', () => {
      vignPlayer.classList.remove('playing');
      vignVideo.currentTime = 0;
    });

    // Keyboard accessibility
    vignBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (vignVideo.paused) { playVignette(); } else { pauseVignette(); }
      }
    });
  }
