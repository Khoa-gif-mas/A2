/* =========================================================
   Doan Minh Khoa — Japanese Aesthetic Portfolio
   Shared behaviors: nav injection, page fade, lightbox, chime
   ========================================================= */
(() => {
  "use strict";
 
  /* ---------- Page detection ---------- */
  const PAGES = [
    { href: "index.html",   label: "Home",    key: "home"    },
    { href: "work.html",    label: "Work",    key: "work"    },
    { href: "gallery.html", label: "Gallery", key: "gallery" },
    { href: "about.html",   label: "About",   key: "about"   },
  ];
 
  function currentPageKey() {
    const path = location.pathname.split("/").pop() || "index.html";
    if (path === "" || path === "index.html") return "home";
    const m = path.match(/^([a-z]+)\.html$/);
    return m ? m[1] : "home";
  }
 
  const PAGE = currentPageKey();
  document.documentElement.dataset.page = PAGE;
 
  /* ---------- Bootstrap ---------- */
  const ready = (fn) =>
    document.readyState === "loading"
      ? document.addEventListener("DOMContentLoaded", fn, { once: true })
      : fn();
 
  ready(() => {
    injectDynamicStyles();
    injectSiteNav();
    setupPageFade();
    setupLightbox();
    if (PAGE === "home") setupWindChime();
  });
 
  /* =========================================================
     1. Dynamic styles
        Static styles live in style.css; this block adds rules
        for elements created by main.js (signature animation,
        drawer, lightbox, hamburger).
     ========================================================= */
  function injectDynamicStyles() {
    const css = `
      .site-nav {
        position: fixed;
        top: 0; left: 0; right: 0;
        background: rgba(250, 246, 240, 0.85);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
      }
      body { padding-top: 92px; }
      @media (max-width: 768px) { body { padding-top: 76px; } }
 
      .site-nav__sig {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        background: transparent;
        border: 0;
        padding: 0;
      }
      .site-nav__sig svg {
        width: 86px;
        height: 56px;
        overflow: visible;
      }
      .site-nav__sig .sig-mk {
        fill: none;
        stroke: var(--color-text);
        stroke-width: 2.4;
        stroke-linecap: round;
        stroke-linejoin: round;
        stroke-dasharray: var(--sig-len, 320);
        stroke-dashoffset: var(--sig-len, 320);
        animation: sigDraw 1400ms var(--ease-glide, cubic-bezier(.65,0,.35,1)) 200ms forwards;
      }
      .site-nav__sig .sig-jp {
        font-family: var(--font-jp), serif;
        font-size: 13px;
        letter-spacing: 0.18em;
        fill: var(--color-wood);
        clip-path: inset(0 100% 0 0);
        animation: sigReveal 1100ms var(--ease-glide, cubic-bezier(.65,0,.35,1)) 1100ms forwards;
      }
      @keyframes sigDraw  { to { stroke-dashoffset: 0; } }
      @keyframes sigReveal { to { clip-path: inset(0 0 0 0); } }
 
      .site-nav__menu a.is-active {
        font-weight: 600;
        color: var(--color-text);
      }
      .site-nav__menu a.is-active::after {
        width: 100%;
        left: 0;
      }
 
      .site-nav__hamburger {
        display: none;
        width: 40px;
        height: 40px;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--color-line);
        border-radius: 999px;
        background: transparent;
      }
      .site-nav__hamburger span {
        position: relative;
        width: 18px;
        height: 1.5px;
        background: var(--color-text);
        transition: transform 300ms var(--ease-soft, ease),
                    opacity 200ms var(--ease-soft, ease);
      }
      .site-nav__hamburger span::before,
      .site-nav__hamburger span::after {
        content: "";
        position: absolute;
        left: 0;
        width: 100%;
        height: 1.5px;
        background: var(--color-text);
        transition: transform 300ms var(--ease-soft, ease);
      }
      .site-nav__hamburger span::before { top: -6px; }
      .site-nav__hamburger span::after  { top:  6px; }
      .site-nav__hamburger.is-open span               { background: transparent; }
      .site-nav__hamburger.is-open span::before       { transform: translateY(6px) rotate(45deg); }
      .site-nav__hamburger.is-open span::after        { transform: translateY(-6px) rotate(-45deg); }
 
      .site-drawer {
        position: fixed;
        inset: 0;
        z-index: 19;
        background: var(--color-bg);
        display: grid;
        place-items: center;
        opacity: 0;
        visibility: hidden;
        transform: translateY(-12px);
        transition: opacity 480ms var(--ease-glide, ease),
                    transform 480ms var(--ease-glide, ease),
                    visibility 0s linear 480ms;
      }
      .site-drawer.is-open {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
        transition-delay: 0s, 0s, 0s;
      }
      .site-drawer__menu {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        text-align: center;
        font-family: var(--font-serif, serif);
        font-size: 1.75rem;
        letter-spacing: 0.18em;
        text-transform: lowercase;
        color: var(--color-text-soft);
      }
      .site-drawer__menu a.is-active { color: var(--color-text); font-weight: 600; }
      .site-drawer__jp {
        margin-top: 2rem;
        font-family: var(--font-jp, serif);
        letter-spacing: 0.6em;
        color: var(--color-wood);
      }
      body.nav-open { overflow: hidden; }
 
      @media (max-width: 768px) {
        .site-nav__menu        { display: none; }
        .site-nav__hamburger   { display: inline-flex; }
      }
 
      .lightbox {
        position: fixed;
        inset: 0;
        z-index: 9000;
        display: grid;
        place-items: center;
        background: rgba(44, 44, 44, 0.92);
        opacity: 0;
        visibility: hidden;
        transition: opacity 360ms var(--ease-glide, ease),
                    visibility 0s linear 360ms;
      }
      .lightbox.is-open {
        opacity: 1;
        visibility: visible;
        transition-delay: 0s, 0s;
      }
      .lightbox__stage {
        position: relative;
        max-width: min(92vw, 1280px);
        max-height: 86vh;
        display: grid;
        place-items: center;
      }
      .lightbox__img {
        max-width: 100%;
        max-height: 86vh;
        object-fit: contain;
        box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        transform: scale(0.98);
        opacity: 0;
        transition: transform 360ms var(--ease-glide, ease),
                    opacity 360ms var(--ease-glide, ease);
      }
      .lightbox.is-open .lightbox__img {
        transform: scale(1);
        opacity: 1;
      }
      .lightbox__caption {
        position: absolute;
        left: 0; right: 0; bottom: -2.25rem;
        text-align: center;
        color: rgba(250, 246, 240, 0.78);
        font-size: 0.85rem;
        letter-spacing: 0.24em;
        text-transform: lowercase;
      }
      .lightbox__btn {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 48px;
        height: 48px;
        border-radius: 999px;
        border: 1px solid rgba(250,246,240,0.4);
        color: rgba(250,246,240,0.85);
        background: rgba(44,44,44,0.4);
        display: grid;
        place-items: center;
        font-size: 1.4rem;
        transition: background 200ms ease, border-color 200ms ease;
      }
      .lightbox__btn:hover {
        background: rgba(44,44,44,0.7);
        border-color: rgba(250,246,240,0.8);
      }
      .lightbox__btn--prev  { left:  -3.5rem; }
      .lightbox__btn--next  { right: -3.5rem; }
      .lightbox__close {
        position: absolute;
        top: 1.5rem;
        right: 1.5rem;
        width: 44px;
        height: 44px;
        border-radius: 999px;
        border: 1px solid rgba(250,246,240,0.35);
        color: rgba(250,246,240,0.9);
        background: transparent;
        display: grid;
        place-items: center;
        font-size: 1.1rem;
      }
      @media (max-width: 768px) {
        .lightbox__btn--prev { left:  0.5rem; }
        .lightbox__btn--next { right: 0.5rem; }
      }
    `;
    const style = document.createElement("style");
    style.id = "main-dynamic-styles";
    style.textContent = css;
    document.head.appendChild(style);
  }
 
  /* =========================================================
     2. Site nav (with handwritten signature)
     ========================================================= */
  function injectSiteNav() {
    if (document.querySelector(".site-nav[data-injected]")) return;
 
    const existing = document.querySelector(".site-nav");
    if (existing) existing.remove();
 
    const nav = document.createElement("nav");
    nav.className = "site-nav";
    nav.setAttribute("aria-label", "Primary");
    nav.dataset.injected = "true";
    nav.innerHTML = `
      <button class="site-nav__sig" type="button" aria-label="Doan Minh Khoa — home">
        <svg viewBox="0 0 86 56" role="img" aria-hidden="true">
          <path class="sig-mk" d="
            M 6 34
            c 0 -10, 5 -16, 8 -6
            c 1 4, 3 4, 4 0
            c 1 -10, 5 -14, 8 -6
            c 1 4, 3 4, 4 0
            c 1 -8, 5 -8, 7 1
            l 1 8
            M 42 12
            l 0 28
            M 42 28
            l 12 -12
            M 46 24
            l 11 18
            "/>
          <text class="sig-jp" x="2" y="52">素朴味</text>
        </svg>
      </button>
 
      <ul class="site-nav__menu" role="list">
        ${PAGES.map(p => `
          <li><a href="${p.href}" data-page="${p.key}">${p.label}</a></li>
        `).join("")}
      </ul>
 
      <button class="site-nav__hamburger" type="button"
              aria-label="Open menu" aria-expanded="false" aria-controls="site-drawer">
        <span></span>
      </button>
    `;
    document.body.prepend(nav);
 
    /* set dash length so animation is exact */
    requestAnimationFrame(() => {
      const path = nav.querySelector(".sig-mk");
      if (path && typeof path.getTotalLength === "function") {
        const len = Math.max(120, Math.ceil(path.getTotalLength()));
        path.style.setProperty("--sig-len", String(len));
      }
    });
 
    /* signature → home (with fade) */
    nav.querySelector(".site-nav__sig").addEventListener("click", (e) => {
      e.preventDefault();
      navigateWithFade("index.html");
    });
 
    /* highlight active link */
    nav.querySelectorAll(".site-nav__menu a").forEach((a) => {
      if (a.dataset.page === PAGE) {
        a.classList.add("is-active");
        a.setAttribute("aria-current", "page");
      }
    });
 
    setupHamburger(nav);
  }
 
  /* =========================================================
     3. Mobile drawer
     ========================================================= */
  function setupHamburger(nav) {
    const btn = nav.querySelector(".site-nav__hamburger");
 
    const drawer = document.createElement("div");
    drawer.className = "site-drawer";
    drawer.id = "site-drawer";
    drawer.setAttribute("role", "dialog");
    drawer.setAttribute("aria-modal", "true");
    drawer.setAttribute("aria-label", "Site menu");
    drawer.innerHTML = `
      <div>
        <ul class="site-drawer__menu" role="list">
          ${PAGES.map(p => `
            <li><a href="${p.href}" data-page="${p.key}">${p.label}</a></li>
          `).join("")}
        </ul>
        <p class="site-drawer__jp">素 · 朴 · 味</p>
      </div>
    `;
    document.body.appendChild(drawer);
 
    drawer.querySelectorAll("a").forEach((a) => {
      if (a.dataset.page === PAGE) a.classList.add("is-active");
    });
 
    const close = () => {
      drawer.classList.remove("is-open");
      btn.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-label", "Open menu");
      document.body.classList.remove("nav-open");
    };
    const open = () => {
      drawer.classList.add("is-open");
      btn.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
      btn.setAttribute("aria-label", "Close menu");
      document.body.classList.add("nav-open");
    };
 
    btn.addEventListener("click", () => {
      drawer.classList.contains("is-open") ? close() : open();
    });
 
    drawer.addEventListener("click", (e) => {
      if (e.target === drawer) close();
    });
 
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && drawer.classList.contains("is-open")) close();
    });
  }
 /* =========================================================
     4. Page fade transitions
     ========================================================= */
  function setupPageFade() {
    let fade = document.getElementById("page-fade");
    if (!fade) {
      fade = document.createElement("div");
      fade.id = "page-fade";
      fade.className = "page-fade";
      document.body.appendChild(fade);
    }
 
    /* fade-in on bfcache restore */
    window.addEventListener("pageshow", (e) => {
      if (e.persisted) fade.classList.remove("is-active");
    });
 
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a) return;
 
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      if (a.target && a.target !== "_self") return;
      if (a.hasAttribute("download")) return;
 
      const url = new URL(href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return;
 
      e.preventDefault();
      navigateWithFade(url.href);
    });
  }
 
  function navigateWithFade(href) {
    const fade = document.getElementById("page-fade");
    if (!fade) { location.href = href; return; }
 
    fade.classList.add("is-active");
    const drawer = document.querySelector(".site-drawer.is-open");
    if (drawer) drawer.classList.remove("is-open");
 
    const cs = getComputedStyle(document.documentElement);
    const dur = parseDuration(cs.getPropertyValue("--fade-duration")) || 700;
 
    setTimeout(() => { location.href = href; }, dur);
  }
 
  function parseDuration(v) {
    if (!v) return 0;
    v = v.trim();
    if (v.endsWith("ms")) return parseFloat(v);
    if (v.endsWith("s"))  return parseFloat(v) * 1000;
    return parseFloat(v) || 0;
  }
 
  /* =========================================================
     5. Gallery lightbox
        Markup contract on gallery.html:
          <a class="gallery__item"
             data-lightbox
             href="full-size.jpg"
             data-caption="...">
            <img src="thumb.jpg" alt="...">
          </a>
     ========================================================= */
  function setupLightbox() {
    let items = [];
    let index = 0;
 
    const box = document.createElement("div");
    box.className = "lightbox";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-hidden", "true");
    box.innerHTML = `
      <button class="lightbox__close" type="button" aria-label="Close">&times;</button>
      <div class="lightbox__stage">
        <button class="lightbox__btn lightbox__btn--prev" type="button" aria-label="Previous">&larr;</button>
        <img class="lightbox__img" alt="">
        <button class="lightbox__btn lightbox__btn--next" type="button" aria-label="Next">&rarr;</button>
        <p class="lightbox__caption" aria-live="polite"></p>
      </div>
    `;
    document.body.appendChild(box);
 
    const img      = box.querySelector(".lightbox__img");
    const caption  = box.querySelector(".lightbox__caption");
    const btnClose = box.querySelector(".lightbox__close");
    const btnPrev  = box.querySelector(".lightbox__btn--prev");
    const btnNext  = box.querySelector(".lightbox__btn--next");
 
    function refreshItems() {
      items = Array.from(document.querySelectorAll("[data-lightbox]"));
    }
 
    function show(i) {
      if (!items.length) return;
      index = (i + items.length) % items.length;
      const node = items[index];
      const src  = node.getAttribute("href")
                || node.getAttribute("data-src")
                || node.querySelector("img")?.src;
      const cap  = node.getAttribute("data-caption") || "";
 
      img.style.opacity = "0";
      const pre = new Image();
      pre.onload = () => {
        img.src = pre.src;
        img.alt = cap;
        caption.textContent = cap;
        img.style.opacity = "";
      };
      pre.src = src;
 
      btnPrev.style.display = items.length > 1 ? "" : "none";
      btnNext.style.display = items.length > 1 ? "" : "none";
    }
 
    function open(i) {
      refreshItems();
      if (!items.length) return;
      show(i);
      box.classList.add("is-open");
      box.setAttribute("aria-hidden", "false");
      document.body.classList.add("nav-open");
      btnClose.focus();
    }
 
    function close() {
      box.classList.remove("is-open");
      box.setAttribute("aria-hidden", "true");
      document.body.classList.remove("nav-open");
    }
 
    document.addEventListener("click", (e) => {
      const trigger = e.target.closest("[data-lightbox]");
      if (!trigger) return;
      e.preventDefault();
      refreshItems();
      const i = items.indexOf(trigger);
      open(i >= 0 ? i : 0);
    });
 
    btnClose.addEventListener("click", close);
    btnPrev .addEventListener("click", () => show(index - 1));
    btnNext .addEventListener("click", () => show(index + 1));
    box.addEventListener("click", (e) => { if (e.target === box) close(); });
 
    document.addEventListener("keydown", (e) => {
      if (!box.classList.contains("is-open")) return;
      if (e.key === "Escape")     close();
      if (e.key === "ArrowLeft")  show(index - 1);
      if (e.key === "ArrowRight") show(index + 1);
    });
  }
 
  /* =========================================================
     6. Ambient wind chime (Home only)
        Web Audio API — synthesized bell tones at gentle
        random intervals, controlled by the existing
        #mute-button in index.html. Persists state in
        localStorage; defaults to muted (browsers require a
        user gesture to start audio).
     ========================================================= */
  function setupWindChime() {
    const btn = document.getElementById("mute-button");
    if (!btn) return;
 
    const STORE_KEY = "portfolio.chime.on";
    let on = localStorage.getItem(STORE_KEY) === "1";
 
    let ctx = null;
    let master = null;
    let timer = null;
 
    /* Pentatonic-ish chime pitches (Hz) — soft, no semitone clash */
    const PITCHES = [523.25, 587.33, 698.46, 783.99, 880.00, 1046.50];
 
    function reflectButtonState() {
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      const label = btn.querySelector(".mute-label");
      if (label) label.textContent = on ? "wind chime" : "muted";
    }
 
    function ensureContext() {
      if (ctx) return ctx;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.18;
      master.connect(ctx.destination);
      return ctx;
    }
 
    function pluck(time, freq) {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = "sine";
      osc2.type = "sine";
      osc1.frequency.value = freq;
      osc2.frequency.value = freq * 2.01;
 
      const g = ctx.createGain();
      const peak = 0.35 + Math.random() * 0.25;
      g.gain.setValueAtTime(0.0001, time);
      g.gain.exponentialRampToValueAtTime(peak, time + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, time + 3.2 + Math.random() * 1.6);
 
      const pan = ctx.createStereoPanner
        ? ctx.createStereoPanner()
        : null;
      if (pan) pan.pan.value = (Math.random() * 2 - 1) * 0.6;
 
      const mix = ctx.createGain();
      mix.gain.value = 0.7;
      osc1.connect(mix);
      const harmGain = ctx.createGain();
      harmGain.gain.value = 0.18;
      osc2.connect(harmGain).connect(mix);
 
      mix.connect(g);
      if (pan) g.connect(pan).connect(master);
      else      g.connect(master);
 
      osc1.start(time);
      osc2.start(time);
      osc1.stop(time + 5);
      osc2.stop(time + 5);
    }
 
    function scheduleNext() {
      if (!on || !ctx) return;
      const wait = 1500 + Math.random() * 5500;
      timer = setTimeout(() => {
        const now = ctx.currentTime + 0.02;
        const cluster = Math.random() < 0.35 ? 2 : 1;
        for (let i = 0; i < cluster; i++) {
          const f = PITCHES[Math.floor(Math.random() * PITCHES.length)];
          pluck(now + i * (0.18 + Math.random() * 0.22), f);
        }
        scheduleNext();
      }, wait);
    }
 
    function start() {
      if (!ensureContext()) return;
      if (ctx.state === "suspended") ctx.resume();
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.6);
      scheduleNext();
    }
 
    function stop() {
      if (timer) { clearTimeout(timer); timer = null; }
      if (master && ctx) {
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
      }
    }
 
    reflectButtonState();
 
    btn.addEventListener("click", () => {
      on = !on;
      localStorage.setItem(STORE_KEY, on ? "1" : "0");
      reflectButtonState();
      if (on) start();
      else    stop();
    });
 
    /* If the user previously enabled it, resume on first interaction
       (browsers block autoplay until a gesture happens). */
    if (on) {
      const resume = () => {
        start();
        window.removeEventListener("pointerdown", resume);
        window.removeEventListener("keydown", resume);
      };
      window.addEventListener("pointerdown", resume, { once: true });
      window.addEventListener("keydown",     resume, { once: true });
    }
  }
 
  /* Expose a tiny hook for future modules (e.g., the Three.js scene)
     that may want to know the page or trigger a fade. */
  window.Portfolio = Object.freeze({
    page: PAGE,
    navigate: navigateWithFade,
  });
})();
