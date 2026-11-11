/*
 * CEDIREKO FILMS
 *
 * Adding a film: append one object to FILMS. The grid, the player and
 * PREV/NEXT order all come from this array.
 *
 *   id           unique slug
 *   title        shown on the slate, uppercase by convention
 *   type         Commercial | Music video | Fashion reel | ...
 *   client, role, brief
 *   src, poster  paths under projects/ and assets/posters/
 *   orientation  'landscape' | 'portrait'
 *   duration     MM:SS, read off the file with ffprobe (see README)
 *   captions     path to a .vtt, or '' if there isn't one yet
 *   series       optional key into SERIES, groups vertical runs together
 */

const FILMS = [
  {
    id: 'veronikka',
    title: 'VERONIKKA REBRANDING',
    type: 'Commercial',
    client: 'Veronikka',
    role: 'Direction, camera, edit', // EDIT: confirm
    brief: 'Rebrand spot for Veronikka. Shot 4:3 at 1440×1080.', // EDIT: add what was shot
    src: 'projects/VERONIKKA_REVISED_3.mp4',
    poster: 'assets/posters/veronikka.jpg',
    orientation: 'landscape',
    duration: '01:29',
    captions: ''
  },
  {
    id: 'ea',
    title: 'EA PERFORMANCE',
    type: 'Music video',
    client: 'EA', // EDIT: full artist or label name
    role: 'Direction, camera, edit', // EDIT: confirm
    brief: 'Performance video for EA. 16:9 at 1080p.', // EDIT: add venue or setup
    src: 'projects/EA_FINALCUT.mp4',
    poster: 'assets/posters/ea.jpg',
    orientation: 'landscape',
    duration: '04:41',
    captions: ''
  },
  {
    id: 'ficomana-cyra',
    title: 'CYRA',
    type: 'Fashion reel',
    client: 'Fico Mana',
    role: 'Direction, camera, edit', // EDIT: confirm
    brief: 'Part 1 of the Fico Mana vertical series, with Cyra. 9:16 at 1080×1920.', // EDIT
    src: 'projects/FICOMANA_CYRA_2_1.mp4',
    poster: 'assets/posters/ficomana_cyra.jpg',
    orientation: 'portrait',
    duration: '00:27',
    captions: '',
    series: 'ficomana'
  },
  {
    id: 'ficomana-breanna',
    title: 'BREANNA',
    type: 'Fashion reel',
    client: 'Fico Mana',
    role: 'Direction, camera, edit', // EDIT: confirm
    brief: 'Part 2 of the Fico Mana vertical series, with Breanna. 9:16 at 1080×1920.', // EDIT
    src: 'projects/BREANNA_1.mp4',
    poster: 'assets/posters/ficomana_breanna.jpg',
    orientation: 'portrait',
    duration: '00:34',
    captions: '',
    series: 'ficomana'
  },
  {
    id: 'ficomana-leigh',
    title: 'LEIGH',
    type: 'Fashion reel',
    client: 'Fico Mana',
    role: 'Direction, camera, edit', // EDIT: confirm
    brief: 'Part 3 of the Fico Mana vertical series, with Leigh. 9:16 at 1080×1920.', // EDIT
    src: 'projects/FICOMANA_LEIGH_web.mp4',
    poster: 'assets/posters/ficomana_leigh.jpg',
    orientation: 'portrait',
    duration: '00:45',
    captions: '',
    series: 'ficomana'
  }
];

const SERIES = {
  ficomana: {
    label: 'Vertical series',
    title: 'FICO MANA',
    note: 'One label, three reels. Cyra, Breanna and Leigh each got their own.' // EDIT
  }
};

document.documentElement.classList.add('js');

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

const sceneLabel = (index) => `SC.${String(index + 1).padStart(2, '0')}`;

const toSeconds = (mmss) => {
  const [m, s] = String(mmss).split(':').map(Number);
  return (m || 0) * 60 + (s || 0);
};

// Two or more films with an identical runtime almost always means one value
// got copied across entries (this happened before: three Fico Mana reels all said 00:47).
function warnOnSuspectDurations(films) {
  const seen = new Map();
  films.forEach((film) => {
    if (!/^\d{2}:\d{2}$/.test(film.duration)) {
      console.warn(`[FILMS] ${film.id}: duration "${film.duration}" is not MM:SS`);
    }
    seen.set(film.duration, [...(seen.get(film.duration) || []), film.id]);
  });
  seen.forEach((ids, duration) => {
    if (ids.length > 1) {
      console.warn(`[FILMS] ${ids.join(', ')} all list ${duration}. Probably a placeholder, check with ffprobe.`);
    }
  });
}

function renderReel(grid, films) {
  if (!grid) return;
  let landscapeCount = 0;
  const seriesShown = new Set();

  grid.innerHTML = films.map((film, index) => {
    let lead = '';
    if (film.series && SERIES[film.series] && !seriesShown.has(film.series)) {
      seriesShown.add(film.series);
      const s = SERIES[film.series];
      lead = `
        <div class="reel-series-header" data-series="${escapeHtml(film.series)}">
          <p class="eyebrow">${escapeHtml(s.label)}</p>
          <h3 class="reel-series-title">${escapeHtml(s.title)}</h3>
          <p class="reel-series-desc">${escapeHtml(s.note)}</p>
        </div>`;
    }

    // The first two wide films sit unevenly on purpose: one big, one smaller and dropped.
    let placement = '';
    if (film.orientation === 'landscape') {
      placement = ['reel-card--lead', 'reel-card--drop'][landscapeCount] || '';
      landscapeCount += 1;
    }

    return `${lead}
      <article class="reel-card ${placement}" data-orientation="${escapeHtml(film.orientation)}" data-index="${index}" data-scene="${sceneLabel(index)}">
        <button type="button" class="reel-frame" aria-label="Play ${escapeHtml(film.title)}, ${escapeHtml(film.type)}, ${escapeHtml(film.duration)}">
          <video class="reel-video" src="${escapeHtml(film.src)}" poster="${escapeHtml(film.poster)}" muted loop playsinline preload="none" tabindex="-1" aria-hidden="true">
            <a href="${escapeHtml(film.src)}">Open ${escapeHtml(film.title)} (MP4)</a>
          </video>
          <span class="reel-tc" aria-hidden="true"><span>${escapeHtml(film.duration)}</span></span>
          <span class="play-ring" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 4l14 8-14 8V4z"/></svg></span>
          <span class="reel-slate" aria-hidden="true">
            <span class="reel-scene">${sceneLabel(index)}</span>
            <span class="reel-cat">${escapeHtml(film.type)}</span>
          </span>
        </button>
        <h3 class="reel-title">${escapeHtml(film.title)}</h3>
        <dl class="reel-credit">
          <div><dt>Client</dt><dd>${escapeHtml(film.client)}</dd></div>
          <div><dt>Role</dt><dd>${escapeHtml(film.role)}</dd></div>
        </dl>
        <p class="reel-brief">${escapeHtml(film.brief)}</p>
      </article>`;
  }).join('');
}

class HeaderNavController {
  constructor(options = {}) {
    this.options = Object.assign({
      headerSelector: '.site-header',
      toggleSelector: '#mobile-nav-toggle',
      closeSelector: '#mobile-nav-close',
      navSelector: '#mobile-nav',
      panelSelector: '.mobile-nav__panel',
      backdropSelector: '.mobile-nav__backdrop',
      linksSelector: '.site-header__nav-link, .mobile-nav__link',
      scrollThreshold: 80,
      scrolledClass: 'site-header--scrolled',
      openClass: 'is-open',
      bodyLockClass: 'menu-open'
    }, options);

    this.header = document.querySelector(this.options.headerSelector);
    this.toggleBtn = document.querySelector(this.options.toggleSelector);
    this.closeBtn = document.querySelector(this.options.closeSelector);
    this.mobileNav = document.querySelector(this.options.navSelector);
    this.panel = document.querySelector(this.options.panelSelector);
    this.backdrop = document.querySelector(this.options.backdropSelector);
    this.navLinks = document.querySelectorAll(this.options.linksSelector);

    this.isOpen = false;
    this.isTicking = false;

    this.handleScroll = this.handleScroll.bind(this);
    this.handleToggleClick = this.handleToggleClick.bind(this);
    this.handleCloseClick = this.handleCloseClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleDocumentClick = this.handleDocumentClick.bind(this);
    this.handleLinkClick = this.handleLinkClick.bind(this);
    this.handleResize = this.handleResize.bind(this);

    this.init();
  }

  init() {
    if (!this.header) return;

    if (this.toggleBtn) {
      this.toggleBtn.setAttribute('aria-expanded', 'false');
      this.toggleBtn.setAttribute('aria-label', 'Open navigation menu');
      this.toggleBtn.addEventListener('click', this.handleToggleClick);
    }

    if (this.mobileNav) {
      this.mobileNav.setAttribute('aria-hidden', 'true');
      if ('inert' in HTMLElement.prototype) {
        this.mobileNav.setAttribute('inert', '');
      }
    }

    this.closeBtn?.addEventListener('click', this.handleCloseClick);
    this.backdrop?.addEventListener('click', this.handleCloseClick);

    window.addEventListener('scroll', this.handleScroll, { passive: true });
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('click', this.handleDocumentClick);
    window.addEventListener('resize', this.handleResize, { passive: true });

    this.navLinks.forEach(link => link.addEventListener('click', this.handleLinkClick));

    // A reload mid-page should not flash the transparent header.
    this.updateScrollState();
  }

  handleScroll() {
    if (this.isTicking) return;
    this.isTicking = true;
    window.requestAnimationFrame(() => {
      this.updateScrollState();
      this.isTicking = false;
    });
  }

  updateScrollState() {
    if (!this.header) return;
    const y = window.pageYOffset || document.documentElement.scrollTop || 0;
    const shouldBeScrolled = y > this.options.scrollThreshold;
    if (this.header.classList.contains(this.options.scrolledClass) !== shouldBeScrolled) {
      this.header.classList.toggle(this.options.scrolledClass, shouldBeScrolled);
    }
  }

  handleToggleClick(event) {
    event?.preventDefault();
    event?.stopPropagation();
    this.toggleMobileMenu();
  }

  handleCloseClick(event) {
    event?.preventDefault();
    event?.stopPropagation();
    this.closeMobileMenu();
  }

  toggleMobileMenu() {
    if (this.isOpen) this.closeMobileMenu();
    else this.openMobileMenu();
  }

  getBackgroundElements() {
    if (!this.backgroundElements) {
      this.backgroundElements = [
        document.querySelector('.site-header__container'),
        document.getElementById('main-content'),
        document.querySelector('.skip-link'),
        document.querySelector('footer')
      ].filter(Boolean);
    }
    return this.backgroundElements;
  }

  openMobileMenu() {
    if (this.isOpen || !this.mobileNav) return;
    this.isOpen = true;

    if (this.toggleBtn) {
      this.toggleBtn.classList.add('is-active');
      this.toggleBtn.setAttribute('aria-expanded', 'true');
      this.toggleBtn.setAttribute('aria-label', 'Close navigation menu');
    }

    this.mobileNav.classList.add(this.options.openClass);
    this.mobileNav.setAttribute('aria-hidden', 'false');
    if ('inert' in HTMLElement.prototype) {
      this.mobileNav.removeAttribute('inert');
      this.getBackgroundElements().forEach(el => el.setAttribute('inert', ''));
    }

    document.body.classList.add(this.options.bodyLockClass);

    if (this.closeBtn) this.closeBtn.focus();
    else this.panel?.focus();
  }

  closeMobileMenu() {
    if (!this.isOpen) return;
    this.isOpen = false;

    if (this.toggleBtn) {
      this.toggleBtn.classList.remove('is-active');
      this.toggleBtn.setAttribute('aria-expanded', 'false');
      this.toggleBtn.setAttribute('aria-label', 'Open navigation menu');
    }

    if (this.mobileNav) {
      this.mobileNav.classList.remove(this.options.openClass);
      this.mobileNav.setAttribute('aria-hidden', 'true');
      if ('inert' in HTMLElement.prototype) {
        this.mobileNav.setAttribute('inert', '');
        this.getBackgroundElements().forEach(el => el.removeAttribute('inert'));
      }
    }

    document.body.classList.remove(this.options.bodyLockClass);
    this.toggleBtn?.focus();
  }

  handleKeyDown(event) {
    if (event.key === 'Escape' && this.isOpen) {
      event.preventDefault();
      this.closeMobileMenu();
    }
  }

  handleDocumentClick(event) {
    if (!this.isOpen) return;
    const insidePanel = this.panel && this.panel.contains(event.target);
    const onToggle = this.toggleBtn && this.toggleBtn.contains(event.target);
    if (!insidePanel && !onToggle) this.closeMobileMenu();
  }

  handleLinkClick(event) {
    const href = event.currentTarget.getAttribute('href');
    if (href && href.startsWith('#') && this.isOpen) this.closeMobileMenu();
  }

  handleResize() {
    if (this.isOpen && window.innerWidth >= 768) this.closeMobileMenu();
  }

  destroy() {
    window.removeEventListener('scroll', this.handleScroll);
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('click', this.handleDocumentClick);
    window.removeEventListener('resize', this.handleResize);
    this.toggleBtn?.removeEventListener('click', this.handleToggleClick);
    this.closeBtn?.removeEventListener('click', this.handleCloseClick);
    this.backdrop?.removeEventListener('click', this.handleCloseClick);
    this.navLinks.forEach(link => link.removeEventListener('click', this.handleLinkClick));

    if ('inert' in HTMLElement.prototype) {
      this.getBackgroundElements().forEach(el => el.removeAttribute('inert'));
    }

    this.backgroundElements = null;
    document.body.classList.remove(this.options.bodyLockClass);
    this.isOpen = false;
  }
}

class ReelFilterController {
  #grid;
  #buttons;

  constructor() {
    this.#grid = document.querySelector('.reel-grid');
    this.#buttons = Array.from(document.querySelectorAll('.reel-toggle-btn'));
    if (!this.#grid || !this.#buttons.length) return;

    this.#buttons.forEach((btn, index) => {
      btn.addEventListener('click', () => this.setView(btn.dataset.view, btn));

      btn.addEventListener('keydown', (e) => {
        const last = this.#buttons.length - 1;
        const target = {
          ArrowRight: index === last ? 0 : index + 1,
          ArrowDown: index === last ? 0 : index + 1,
          ArrowLeft: index === 0 ? last : index - 1,
          ArrowUp: index === 0 ? last : index - 1,
          Home: 0,
          End: last
        }[e.key];
        if (target === undefined) return;
        e.preventDefault();
        const next = this.#buttons[target];
        next.focus();
        this.setView(next.dataset.view, next);
      });
    });
  }

  setView(view, activeBtn) {
    if (!this.#grid) return;
    this.#grid.dataset.view = view;
    this.#buttons.forEach(btn => {
      const selected = btn === activeBtn || (!activeBtn && btn.dataset.view === view);
      btn.classList.toggle('is-active', selected);
      btn.setAttribute('aria-selected', selected ? 'true' : 'false');
    });
  }
}

class VideoModalPlayerController {
  #dialog;
  #video;
  #track;
  #fallback;
  #grid;
  #fields;
  #closeBtn;
  #prevBtn;
  #nextBtn;
  #announcer;
  #currentIndex = -1;
  #lastActiveElement = null;
  #mouseDownInside = false;

  constructor(films) {
    this.films = films;
    this.#dialog = document.getElementById('video-modal');
    if (!this.#dialog) return;

    const $ = (sel) => this.#dialog.querySelector(sel);
    this.#video = $('#modal-video');
    this.#track = $('#modal-captions');
    this.#fallback = $('#modal-fallback');
    this.#closeBtn = $('.modal-close');
    this.#prevBtn = $('#modal-prev-btn');
    this.#nextBtn = $('#modal-next-btn');
    this.#announcer = $('#modal-announcer');
    this.#grid = document.getElementById('reel-grid');
    this.#fields = {
      title: $('#modal-title'),
      type: $('#modal-cat'),
      duration: $('#modal-tc'),
      scene: $('#modal-scene'),
      client: $('#modal-client'),
      role: $('#modal-role'),
      brief: $('#modal-brief')
    };

    this.#bind();
  }

  #bind() {
    this.#closeBtn?.addEventListener('click', () => this.close());

    this.#prevBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.navigate(-1);
    });
    this.#nextBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.navigate(1);
    });

    this.#dialog.addEventListener('close', () => this.#cleanupMedia());

    document.addEventListener('keydown', (e) => {
      if (!this.#dialog.open || e.altKey || e.ctrlKey || e.metaKey) return;
      // The native cancel event covers real Escape presses, but not every browser
      // (or synthetic event) goes through it.
      if (e.key === 'Escape') {
        this.close();
        return;
      }
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      // Leave arrows alone where they already mean something: text fields, and the
      // video element itself, where they scrub.
      const t = e.target;
      if (t && (t.closest?.('input, textarea, select, [contenteditable=""], [contenteditable="true"]') || t.tagName === 'VIDEO')) return;
      e.preventDefault();
      this.navigate(e.key === 'ArrowLeft' ? -1 : 1);
    });

    this.#dialog.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab' || !this.#dialog.open) return;
      const focusables = Array.from(
        this.#dialog.querySelectorAll('button, [href], video, [tabindex]:not([tabindex="-1"])')
      ).filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    // A drag that starts on the video and ends on the backdrop is a scrub, not a dismiss.
    this.#dialog.addEventListener('mousedown', (e) => {
      const r = this.#dialog.getBoundingClientRect();
      this.#mouseDownInside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    });

    this.#dialog.addEventListener('click', (e) => {
      if (e.target === this.#dialog) {
        const r = this.#dialog.getBoundingClientRect();
        const outside = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
        if (outside && !this.#mouseDownInside) this.close();
      }
      this.#mouseDownInside = false;
    });

    this.#dialog.querySelector('.modal-inner')?.addEventListener('click', (e) => e.stopPropagation());

    this.#video?.addEventListener('loadedmetadata', () => {
      const film = this.films[this.#currentIndex];
      if (!film || !Number.isFinite(this.#video.duration)) return;
      const drift = Math.abs(this.#video.duration - toSeconds(film.duration));
      if (drift > 1.5) {
        console.warn(`[FILMS] ${film.id}: listed as ${film.duration}, file runs ${this.#video.duration.toFixed(1)}s`);
      }
    });
  }

  // PREV/NEXT stays inside whatever the filter is showing. If the open film
  // isn't part of that set (filter changed mid-playback), fall back to everything.
  #playableIndexes() {
    const all = this.films.map((_, i) => i);
    const view = this.#grid?.dataset.view || 'all';
    if (view === 'all') return all;
    const list = all.filter(i => this.films[i].orientation === view);
    return list.includes(this.#currentIndex) ? list : all;
  }

  #neighbour(delta) {
    const list = this.#playableIndexes();
    const pos = Math.max(0, list.indexOf(this.#currentIndex));
    return list[(pos + delta + list.length) % list.length];
  }

  navigate(delta) {
    if (this.#currentIndex < 0 || !this.films.length) return;
    this.open(this.#neighbour(delta));
  }

  open(index) {
    const film = this.films[index];
    if (!this.#dialog || !film) return;

    if (!this.#dialog.open) this.#lastActiveElement = document.activeElement;
    this.#currentIndex = index;

    const f = this.#fields;
    f.title.textContent = film.title;
    f.type.textContent = film.type;
    f.duration.textContent = film.duration;
    f.scene.textContent = sceneLabel(index);
    f.client.textContent = film.client;
    f.role.textContent = film.role;
    f.brief.textContent = film.brief;

    this.#dialog.dataset.orientation = film.orientation;

    const prev = this.films[this.#neighbour(-1)];
    const next = this.films[this.#neighbour(1)];
    this.#prevBtn?.setAttribute('aria-label', `Previous film: ${prev.title}`);
    this.#nextBtn?.setAttribute('aria-label', `Next film: ${next.title}`);

    if (this.#fallback) this.#fallback.href = film.src;
    if (this.#track) {
      if (film.captions) this.#track.src = film.captions;
      else this.#track.removeAttribute('src');
    }

    if (this.#video) {
      this.#video.poster = film.poster;
      this.#video.src = film.src;
      this.#video.load();
      this.#video.play().catch(() => {});
    }

    // Clearing first makes screen readers re-announce even when the title repeats.
    if (this.#announcer) {
      this.#announcer.textContent = '';
      requestAnimationFrame(() => {
        this.#announcer.textContent = `Now playing ${film.title}, ${film.type}, ${film.duration}`;
      });
    }

    document.body.style.overflow = 'hidden';

    if (!this.#dialog.open) {
      if (typeof this.#dialog.showModal === 'function') this.#dialog.showModal();
      else this.#dialog.setAttribute('open', '');
      this.#closeBtn?.focus();
    }
  }

  close() {
    if (!this.#dialog?.open) return;
    if (typeof this.#dialog.close === 'function') this.#dialog.close();
    else this.#dialog.removeAttribute('open');
    this.#cleanupMedia();
  }

  #cleanupMedia() {
    if (this.#video) {
      this.#video.pause();
      this.#video.removeAttribute('src');
      this.#video.load();
    }
    document.body.style.overflow = '';
    this.#lastActiveElement?.focus?.();
    this.#lastActiveElement = null;
    this.#currentIndex = -1;
  }
}

// Hover previews only on real pointers, and never when the visitor asked for less motion.
class MediaPreviewController {
  #grid;
  #player;
  #playing = null;

  constructor(player) {
    this.#grid = document.getElementById('reel-grid');
    this.#player = player;
    if (!this.#grid) return;

    this.#grid.addEventListener('click', (e) => {
      const card = e.target.closest('.reel-card[data-index]');
      if (!card) return;
      e.preventDefault();
      this.#stop();
      this.#player?.open(Number(card.dataset.index));
    });

    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!canHover) return;

    this.#grid.querySelectorAll('.reel-card').forEach((card) => {
      const video = card.querySelector('.reel-video');
      if (!video) return;
      card.addEventListener('mouseenter', () => {
        if (reducedMotion.matches) return;
        if (this.#playing && this.#playing !== video) this.#stop();
        this.#playing = video;
        video.play().catch(() => {});
      });
      card.addEventListener('mouseleave', () => {
        if (this.#playing === video) this.#stop();
      });
    });
  }

  #stop() {
    const video = this.#playing;
    if (!video) return;
    video.pause();
    // load() drops back to the poster frame instead of freezing on wherever playback stopped.
    video.load();
    this.#playing = null;
  }
}

class HeroLoopController {
  constructor() {
    this.video = document.querySelector('.hero__video-media');
    if (!this.video) return;
    this.apply = this.apply.bind(this);
    this.apply();
    reducedMotion.addEventListener?.('change', this.apply);
  }

  apply() {
    if (reducedMotion.matches) {
      this.video.autoplay = false;
      this.video.removeAttribute('autoplay');
      this.video.pause();
    } else {
      this.video.autoplay = true;
      this.video.setAttribute('autoplay', '');
      this.video.play().catch(() => {});
    }
  }
}

class CinematicOpenerController {
  #timecodeEl;
  #wordmarkEl;
  #rafId = null;
  #startTime = null;

  constructor(options = {}) {
    this.options = Object.assign({ fps: 24, settleDelayMs: 950 }, options);
    this.#timecodeEl = document.getElementById('hero-live-timecode');
    this.#wordmarkEl = document.querySelector('.kinetic-wordmark');
    this.tick = this.tick.bind(this);

    if (this.#timecodeEl) this.#rafId = requestAnimationFrame(this.tick);

    // SVG blur on live text is expensive and leaves it soft; only keep it for the entrance.
    if (this.#wordmarkEl) {
      setTimeout(() => { this.#wordmarkEl.style.filter = 'none'; }, reducedMotion.matches ? 0 : this.options.settleDelayMs);
    }
  }

  tick(now) {
    if (this.#startTime === null) this.#startTime = now;
    if (!reducedMotion.matches) {
      const fps = this.options.fps;
      const frames = Math.floor(((now - this.#startTime) / 1000) * fps);
      const pad = (n) => String(n).padStart(2, '0');
      this.#timecodeEl.textContent = [
        pad(Math.floor(frames / (fps * 3600)) % 24),
        pad(Math.floor(frames / (fps * 60)) % 60),
        pad(Math.floor(frames / fps) % 60),
        pad(frames % fps)
      ].join(':');
    }
    this.#rafId = requestAnimationFrame(this.tick);
  }

  destroy() {
    if (this.#rafId) cancelAnimationFrame(this.#rafId);
    this.#rafId = null;
  }
}

// Only two things move on scroll: the shot list wipes in like a cut, the slate claps once.
// Everything else just sits there.
function rollOnEntry() {
  const targets = document.querySelectorAll('.shot-log, .slate');
  if (!targets.length || !('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('is-rolling'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-rolling');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.3 });
  targets.forEach(el => io.observe(el));
}

class PortfolioApp {
  constructor() {
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;
    warnOnSuspectDurations(FILMS);
    renderReel(document.getElementById('reel-grid'), FILMS);

    this.headerNav = new HeaderNavController();
    this.reelFilter = new ReelFilterController();
    this.videoModal = new VideoModalPlayerController(FILMS);
    this.mediaPreview = new MediaPreviewController(this.videoModal);
    this.heroLoop = new HeroLoopController();
    this.opener = new CinematicOpenerController();
    rollOnEntry();

    this.isInitialized = true;
  }
}

const bootstrapApp = () => {
  const app = new PortfolioApp();
  app.init();
  window.__cedirekoApp = app;
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapApp);
} else {
  bootstrapApp();
}

// The opener waits for 'load', but a slow hero video shouldn't hold the title back.
const revealHero = () => document.getElementById('hero')?.classList.add('revealed');
if (document.readyState === 'complete') {
  revealHero();
} else {
  window.addEventListener('load', revealHero);
  setTimeout(revealHero, 250);
}
