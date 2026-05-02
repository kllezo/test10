document.addEventListener('DOMContentLoaded', () => {

  /* ─── NAVBAR SCROLL STATE ─────────────────── */
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    if (window.scrollY > 60) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ─── MOBILE MENU ─────────────────────────── */
  const hamburger = document.querySelector('.navbar__hamburger');
  const overlay   = document.querySelector('.navbar__overlay');
  if (hamburger && overlay) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      overlay.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    overlay.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ─── SCROLL PROGRESS ─────────────────────── */
  const progressBar = document.getElementById('scrollProgress');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = (window.scrollY / h * 100) + '%';
    }, { passive: true });
  }

  /* ─── INTERSECTION OBSERVER (REVEAL) ──────── */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion) {
    const revealEls = document.querySelectorAll('.reveal, .line-reveal');
    const obs = new IntersectionObserver((entries, o) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          o.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
    revealEls.forEach(el => obs.observe(el));
  } else {
    document.querySelectorAll('.reveal, .line-reveal').forEach(el => el.classList.add('visible'));
  }

  /* ─── MAGNETIC BUTTONS ────────────────────── */
  document.querySelectorAll('.btn-magnetic').forEach(wrapper => {
    const btn = wrapper.querySelector('a, button') || wrapper;
    let raf;

    wrapper.addEventListener('mousemove', e => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r  = wrapper.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width  / 2) * 0.28;
        const dy = (e.clientY - r.top  - r.height / 2) * 0.28;
        wrapper.style.transform = `translate(${dx}px, ${dy}px)`;
      });
    });

    wrapper.addEventListener('mouseleave', () => {
      cancelAnimationFrame(raf);
      wrapper.style.transition = 'transform 600ms cubic-bezier(0.16,1,0.3,1)';
      wrapper.style.transform  = 'translate(0,0)';
      setTimeout(() => { wrapper.style.transition = ''; }, 650);
    });
  });

  /* ─── CTA GLOW ON HOVER ───────────────────── */
  document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r  = btn.getBoundingClientRect();
      const x  = e.clientX - r.left;
      const y  = e.clientY - r.top;
      btn.style.setProperty('--mx', x + 'px');
      btn.style.setProperty('--my', y + 'px');
    });
  });

  /* ─── COOKIE BANNER ───────────────────────── */
  const banner     = document.getElementById('cookieBanner');
  const acceptBtn  = document.getElementById('acceptCookies');
  if (banner && acceptBtn) {
    if (!localStorage.getItem('kllezo_cookies')) {
      setTimeout(() => banner.classList.add('visible'), 2500);
    }
    acceptBtn.addEventListener('click', () => {
      localStorage.setItem('kllezo_cookies', '1');
      banner.classList.remove('visible');
    });
  }

  /* ─── WHATSAPP FLOAT ──────────────────────── */
  // Show after 3 seconds
  const wa = document.querySelector('.whatsapp-float');
  if (wa) {
    wa.style.opacity = '0';
    wa.style.transform = 'translateY(20px)';
    wa.style.transition = 'opacity 500ms ease, transform 500ms ease';
    setTimeout(() => {
      wa.style.opacity  = '1';
      wa.style.transform = 'translateY(0)';
    }, 3000);
  }

  /* ─── SMOOTH SECTION ANCHORS ──────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ─── PAGE TRANSITIONS ─────────────────────── */
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (
      href &&
      !href.startsWith('#') &&
      !href.startsWith('http') &&
      !href.startsWith('mailto') &&
      !href.startsWith('tel') &&
      !link.hasAttribute('target')
    ) {
      link.addEventListener('click', e => {
        e.preventDefault();
        document.body.classList.add('page-exit');
        setTimeout(() => { window.location.href = href; }, 240);
      });
    }
  });
});
