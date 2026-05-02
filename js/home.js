/* =============================================
   HOMEPAGE PARALLAX ENGINE
   ============================================= */
document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── CANVAS ANIMATION ─────────────────────── */
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W = canvas.width  = window.innerWidth;
  let H = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    initParticles();
  });

  // Colors
  const C_BEIGE  = 'rgba(251,245,233,';
  const C_GREEN  = 'rgba(9,69,62,';
  const C_MUTED  = 'rgba(104,123,117,';

  // Particle represents a floating "UI element"
  class Particle {
    constructor(index, total) {
      this.index = index;
      this.total = total;
      this.reset();
      // Start randomly placed
      this.x = Math.random() * W;
      this.y = Math.random() * H;
    }

    reset() {
      this.chaos_x  = Math.random() * W;
      this.chaos_y  = Math.random() * H;
      this.chaos_vx = (Math.random() - 0.5) * 0.4;
      this.chaos_vy = (Math.random() - 0.5) * 0.4;

      // Grid target (ordered state)
      const cols  = Math.ceil(Math.sqrt(this.total));
      const rows  = Math.ceil(this.total / cols);
      const col   = this.index % cols;
      const row   = Math.floor(this.index / cols);
      const padX  = (W - cols * 80) / 2;
      const padY  = (H - rows * 70) / 2;
      this.grid_x = padX + col * 80 + 40;
      this.grid_y = padY + row * 70 + 35;

      this.size   = Math.random() * 2 + 1;
      this.type   = Math.floor(Math.random() * 4); // 0=dot, 1=line, 2=rect, 3=circle
      this.alpha  = Math.random() * 0.5 + 0.2;
      this.phase  = Math.random() * Math.PI * 2;
    }

    draw(t, progress) {
      // progress 0 = chaos, 0.5 = grid, 1 = connected
      const p1 = Math.min(progress * 2, 1);          // 0→1 chaos→grid
      const p2 = Math.max((progress - 0.5) * 2, 0); // 0→1 grid→connected

      const tx = this.chaos_x * (1 - p1) + this.grid_x * p1;
      const ty = this.chaos_y * (1 - p1) + this.grid_y * p1;
      this.x = tx;
      this.y = ty;

      // Chaos drift when not morphed
      if (p1 < 1) {
        this.chaos_x += this.chaos_vx;
        this.chaos_y += this.chaos_vy;
        if (this.chaos_x < 0 || this.chaos_x > W) this.chaos_vx *= -1;
        if (this.chaos_y < 0 || this.chaos_y > H) this.chaos_vy *= -1;
      }

      const pulse   = Math.sin(t * 0.001 + this.phase) * 0.15 + 0.85;
      const opacity = this.alpha * pulse;
      const sz      = this.size * (1 + p1 * 0.5);

      ctx.save();
      ctx.globalAlpha = opacity * (1 - p2 * 0.3);

      switch (this.type) {
        case 0: // Dot
          ctx.beginPath();
          ctx.arc(this.x, this.y, sz, 0, Math.PI * 2);
          ctx.fillStyle = `${C_MUTED}1)`;
          ctx.fill();
          break;
        case 1: // Horizontal line (like a text row)
          ctx.beginPath();
          ctx.moveTo(this.x - sz * 10, this.y);
          ctx.lineTo(this.x + sz * 10, this.y);
          ctx.strokeStyle = `${C_MUTED}0.6)`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
          break;
        case 2: // Rectangle (card)
          ctx.strokeStyle = `${C_MUTED}0.4)`;
          ctx.lineWidth = 0.8;
          ctx.strokeRect(this.x - sz * 6, this.y - sz * 4, sz * 12, sz * 8);
          break;
        case 3: // Circle (avatar/icon)
          ctx.beginPath();
          ctx.arc(this.x, this.y, sz * 3, 0, Math.PI * 2);
          ctx.strokeStyle = `${C_MUTED}0.35)`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
          break;
      }
      ctx.restore();
    }
  }

  let particles = [];
  function initParticles() {
    particles = [];
    const count = Math.min(Math.floor((W * H) / 14000), 60);
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(i, count));
    }
  }

  function drawConnections(progress) {
    const p2 = Math.max((progress - 0.5) * 2, 0);
    if (p2 <= 0) return;

    ctx.save();
    ctx.globalAlpha = p2 * 0.25;
    ctx.strokeStyle = `${C_BEIGE}1)`;
    ctx.lineWidth = 0.5;

    for (let i = 0; i < particles.length - 1; i++) {
      const a = particles[i];
      const b = particles[i + 1];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (dist < 120) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  initParticles();

  // Background radial glow for scene 3
  function drawBgGlow(progress) {
    const p2 = Math.max((progress - 0.5) * 2, 0);
    if (p2 <= 0) return;
    const grad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W * 0.5);
    grad.addColorStop(0, `rgba(9,69,62,${p2 * 0.18})`);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  /* ─── SCROLL SCENES ───────────────────────── */
  const heroWrapper  = document.querySelector('.hero-wrapper');
  const scenes       = document.querySelectorAll('.hero-scene');
  const dots         = document.querySelectorAll('.hero-dot');
  let   currentScene = 0;
  let   rafId;

  function setScene(idx) {
    if (idx === currentScene) return;
    scenes[currentScene].classList.remove('active');
    scenes[currentScene].classList.add('exiting');
    setTimeout(() => scenes[currentScene].classList.remove('exiting'), 900);
    currentScene = idx;
    scenes[currentScene].classList.add('active');
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  }

  function getScrollProgress() {
    if (!heroWrapper) return 0;
    const rect   = heroWrapper.getBoundingClientRect();
    const total  = heroWrapper.offsetHeight - window.innerHeight;
    const scrolled = -rect.top;
    return Math.max(0, Math.min(1, scrolled / total));
  }

  let animT = 0;
  function loop(timestamp) {
    animT = timestamp;
    ctx.clearRect(0, 0, W, H);

    const prog = getScrollProgress();

    // Background glow
    drawBgGlow(prog);

    // Particles
    particles.forEach(p => p.draw(timestamp, prog));

    // Connections in scene 3
    drawConnections(prog);

    // Scene switching (3 equal zones)
    const zone = prog < 0.33 ? 0 : prog < 0.66 ? 1 : 2;
    if (zone !== currentScene) setScene(zone);

    rafId = requestAnimationFrame(loop);
  }

  if (!prefersReducedMotion) {
    // Start first scene immediately
    scenes[0].classList.add('active');
    dots[0].classList.add('active');
    requestAnimationFrame(loop);
  } else {
    // Show last scene immediately
    scenes[2].classList.add('active');
    dots[2].classList.add('active');
    particles.forEach(p => { p.x = p.grid_x; p.y = p.grid_y; });
  }

  // Dot navigation — smooth scrolls to that scene zone
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      if (!heroWrapper) return;
      const total  = heroWrapper.offsetHeight - window.innerHeight;
      const target = heroWrapper.offsetTop + total * (i / 2.5);
      window.scrollTo({ top: target, behavior: 'smooth' });
    });
  });
});
