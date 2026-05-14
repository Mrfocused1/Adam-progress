/* ADAM PROGRESS — site interactions */

/* ============================================================
   Sticky nav style change on scroll
   ============================================================ */
const header = document.getElementById('siteHeader');
window.addEventListener('scroll', () => {
  if (window.scrollY > 30) header.classList.add('scrolled');
  else header.classList.remove('scrolled');
}, { passive: true });

/* ============================================================
   Active nav link on scroll
   ============================================================ */
const sections = ['home','about','stats','fights','content','media','contact']
  .map(id => document.getElementById(id)).filter(Boolean);
const navLinks = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const id = e.target.id;
      navLinks.forEach(l => {
        l.classList.remove('text-red');
        if (l.getAttribute('href') === `#${id}`) l.classList.add('text-red');
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => sectionObserver.observe(s));

/* ============================================================
   Reveal on scroll
   ============================================================ */
const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      // small stagger when many enter together
      const delay = Math.min(i * 60, 240);
      setTimeout(() => e.target.classList.add('in'), delay);
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });

reveals.forEach(el => revealObserver.observe(el));

/* ============================================================
   Animated stat counters
   ============================================================ */
const easeOut = t => 1 - Math.pow(1 - t, 3);

function animateCounter(el) {
  const target = parseFloat(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  const duration = 1800;
  const start = performance.now();

  function tick(now) {
    const t = Math.min((now - start) / duration, 1);
    const value = Math.floor(easeOut(t) * target);
    el.textContent = value + suffix;
    if (t < 1) requestAnimationFrame(tick);
    else el.textContent = target + suffix;
  }
  requestAnimationFrame(tick);
}

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCounter(e.target);
      statObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num').forEach(el => statObserver.observe(el));

/* ============================================================
   Subtle parallax on hero portrait
   ============================================================ */
const portrait = document.querySelector('.hero-portrait-wrap');
if (portrait && window.matchMedia('(pointer:fine)').matches) {
  document.getElementById('home').addEventListener('mousemove', (e) => {
    const rect = portrait.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / window.innerWidth;
    const dy = (e.clientY - cy) / window.innerHeight;
    portrait.style.transform = `translate3d(${dx * -10}px, ${dy * -10}px, 0)`;
  });
  document.getElementById('home').addEventListener('mouseleave', () => {
    portrait.style.transform = '';
  });
}

/* ============================================================
   Set data-text attribute for textured chrome (used by ::after)
   ============================================================ */
document.querySelectorAll('.textured-chrome').forEach(el => {
  el.setAttribute('data-text', el.textContent);
});

/* ============================================================
   Fight section tab switching
   ============================================================ */
const fightTabs   = document.querySelectorAll('.fight-tab');
const fightPanels = document.querySelectorAll('.fight-panel');

fightTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;
    fightTabs.forEach(t => {
      const active = t === tab;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    fightPanels.forEach(p => {
      const active = p.dataset.panel === target;
      p.classList.toggle('is-active', active);
      if (active) p.removeAttribute('hidden');
      else p.setAttribute('hidden', '');
    });
  });
});

/* ============================================================
   Click-to-play LOCAL video (self-hosted full fight)
   ============================================================ */
document.querySelectorAll('.js-local-player').forEach(player => {
  const button = player.querySelector('.yt-play-btn');
  if (!button) return;
  button.addEventListener('click', (e) => {
    e.preventDefault();
    const src    = player.dataset.videoSrc;
    const poster = player.dataset.poster || '';
    if (!src) return;

    const mount = button.closest('.fight-thumb') || player;
    const video = document.createElement('video');
    video.src = src;
    video.poster = poster;
    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.className = 'absolute inset-0 w-full h-full object-cover bg-black';
    video.style.zIndex = '5';

    const toFade = mount.querySelectorAll('.yt-thumb, .yt-overlay, .yt-caption, .yt-play-btn');
    toFade.forEach(el => { el.style.transition = 'opacity .25s ease'; el.style.opacity = '0'; });
    setTimeout(() => {
      toFade.forEach(el => el.remove());
      mount.appendChild(video);
    }, 250);
  });
});

/* ============================================================
   Click-to-play YouTube embed (About section + Fights)
   ============================================================ */
document.querySelectorAll('.js-yt-player').forEach(player => {
  const button = player.querySelector('.yt-play-btn');
  if (!button) return;
  button.addEventListener('click', (e) => {
    e.preventDefault();
    const id = player.dataset.videoId;
    if (!id) return;

    // Mount iframe inside whichever thumb container holds the play button
    const mount =
      button.closest('.fight-thumb') ||
      button.closest('.short-vert-thumb') ||
      button.closest('.ring-card') ||
      player;

    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
    iframe.title = 'Tibaba Progress video';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen';
    iframe.allowFullscreen = true;
    iframe.className = 'absolute inset-0 w-full h-full';
    iframe.style.zIndex = '5';
    iframe.frameBorder = '0';

    const toFade = mount.querySelectorAll('.yt-thumb, .yt-overlay, .yt-caption, .yt-play-btn');
    toFade.forEach(el => { el.style.transition = 'opacity .25s ease'; el.style.opacity = '0'; });
    setTimeout(() => {
      toFade.forEach(el => el.remove());
      mount.appendChild(iframe);
    }, 250);
  });
});
