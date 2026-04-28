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
    setupWindChime();              // every page — music continues across navigations
    if (PAGE === "home") {
      setupHomeScene();
    }
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
        padding: 1rem clamp(1.25rem, 3vw, 2.5rem);
        background: rgba(250, 246, 240, 0.85);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
      }
      @media (max-height: 820px) {
       .site-nav { padding: 0.5rem clamp(1rem, 3vw, 2rem); }
      }
      body { padding-top: 92px; }
      @media (max-width: 768px) { body { padding-top: 76px; } }
      @media (max-height: 820px) { body { padding-top: 68px; } }
 
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
      @media (max-height: 820px) {
        .site-nav__sig svg { width: 64px; height: 40px; }
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
 
      /* Injected mute button (work / gallery / about — home keeps its own) */
      #mute-button.mute-button--injected {
        position: fixed;
        top: 1.25rem;
        right: 1.25rem;
        z-index: 30;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.9rem;
        border: 1px solid rgba(139, 115, 85, 0.32);
        border-radius: 999px;
        background: rgba(250, 246, 240, 0.78);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        color: var(--color-text);
        font-family: var(--font-serif);
        font-size: 0.78rem;
        letter-spacing: 0.22em;
        text-transform: lowercase;
        cursor: pointer;
        transition:
          color 240ms cubic-bezier(.22,.61,.36,1),
          border-color 240ms cubic-bezier(.22,.61,.36,1);
      }
      #mute-button.mute-button--injected:hover {
        color: var(--color-wood);
        border-color: var(--color-wood);
      }
      #mute-button .mute-icon { display: inline-flex; }
      #mute-button .mute-icon--off { display: none; }
      #mute-button[aria-pressed="true"] .mute-icon--on  { display: none; }
      #mute-button[aria-pressed="true"] .mute-icon--off { display: inline-flex; }
      @media (max-width: 768px) {
      #mute-button.mute-button--injected {
      top: auto;
      bottom: 1rem;
      right: 1rem;
     }
   }
      @media (max-width: 480px) {
     #mute-button.mute-button--injected .mute-label { display: none; }
     #mute-button.mute-button--injected { padding: 0.45rem 0.55rem; }
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
     6. Ambient music — runs on every page
        Plays a looping audio file via HTMLAudioElement. Saves
        playback position to localStorage on page hide and resumes
        from there on the next page (advancing by the elapsed real
        time during the reload), so music feels continuous across
        navigations. The mute button is the existing #mute-button
        on home; on other pages a fixed-corner button is auto-
        injected.
 
        ── Drop your music file at this path ──
            assets/chime.mp3
        (mp3 / m4a / ogg / wav are all fine in Chrome.) Change
        AUDIO_SRC below if you want a different name or folder.
     ========================================================= */
  function setupWindChime() {
    /* ── Your music file ────────────────────────────── */
    const AUDIO_SRC = "Windchime.mp3";
    const VOLUME    = 0.35;            // 0.0 – 1.0
    /* ─────────────────────────────────────────────── */
 
    const STORE_ON   = "portfolio.chime.on";
    const STORE_TIME = "portfolio.chime.time";
    const STORE_TS   = "portfolio.chime.ts";
 
    let on = localStorage.getItem(STORE_ON) === "1";
 
    /* ── Find or auto-inject the mute button ── */
    let btn = document.getElementById("mute-button");
    if (!btn) {
      btn = document.createElement("button");
      btn.id = "mute-button";
      btn.className = "mute-button mute-button--injected";
      btn.type = "button";
      btn.setAttribute("aria-label", "Toggle ambient music");
      btn.setAttribute("aria-pressed", "false");
      btn.innerHTML = `
        <span class="mute-icon mute-icon--on" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path d="M3 10v4h4l5 4V6L7 10H3z" fill="currentColor"/>
            <path d="M16 8a5 5 0 0 1 0 8M18.5 5.5a8.5 8.5 0 0 1 0 13"
                  fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
        </span>
        <span class="mute-icon mute-icon--off" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path d="M3 10v4h4l5 4V6L7 10H3z" fill="currentColor"/>
            <path d="M16 9l5 6M21 9l-5 6"
                  fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
        </span>
        <span class="mute-label">music</span>
      `;
      document.body.appendChild(btn);
    }
 
    /* ── Audio element ── */
    const audio = new Audio(AUDIO_SRC);
    audio.loop = true;
    audio.volume = VOLUME;
    audio.preload = "auto";
 
    /* ── Resume from saved time, advanced by the elapsed real
          time spent loading the new page. Makes the music feel
          continuous across full page reloads. ── */
    function computeStartTime() {
      const savedTime = parseFloat(localStorage.getItem(STORE_TIME) || "0");
      const savedTs   = parseInt(localStorage.getItem(STORE_TS)   || "0", 10);
      if (!savedTime || !savedTs) return 0;
      const elapsed = (Date.now() - savedTs) / 1000;
      let t = savedTime + (on ? elapsed : 0);
      const dur = audio.duration;
      if (dur && isFinite(dur) && dur > 0) t = t % dur;
      return Math.max(0, t);
    }
    function applyStartTime() {
      const t = computeStartTime();
      if (t > 0) { try { audio.currentTime = t; } catch (e) {} }
    }
    if (audio.readyState >= 1) applyStartTime();
    else audio.addEventListener("loadedmetadata", applyStartTime, { once: true });
 
    /* ── UI state reflection ── */
    function reflectButtonState() {
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      const label = btn.querySelector(".mute-label");
      if (label) label.textContent = on ? "music" : "muted";
    }
 
    function start() { audio.play().catch(() => { /* autoplay blocked; will retry on gesture */ }); }
    function stop()  { audio.pause(); }
 
    function saveState() {
      const t = audio.currentTime;
      if (typeof t === "number" && isFinite(t)) {
        localStorage.setItem(STORE_TIME, String(t));
        localStorage.setItem(STORE_TS,   String(Date.now()));
      }
    }
 
    reflectButtonState();
 
    btn.addEventListener("click", () => {
      on = !on;
      localStorage.setItem(STORE_ON, on ? "1" : "0");
      reflectButtonState();
      if (on) start();
      else { stop(); saveState(); }
    });
 
    /* Persist before the page unloads so the next page can pick up */
    window.addEventListener("pagehide",     saveState);
    window.addEventListener("beforeunload", saveState);
    /* Periodic save in case neither unload event fires (mobile / crash) */
    setInterval(() => { if (on && !audio.paused) saveState(); }, 2000);
 
    /* If the user previously enabled music, try to resume.
       Browsers block autoplay until a gesture — fall back to a
       one-shot listener that starts on the first interaction. */
    if (on) {
      start();
      const tryGesture = () => {
        if (audio.paused) start();
        window.removeEventListener("pointerdown", tryGesture);
        window.removeEventListener("keydown",     tryGesture);
      };
      window.addEventListener("pointerdown", tryGesture, { once: true });
      window.addEventListener("keydown",     tryGesture, { once: true });
    }
  }
 
  /* =========================================================
     7. Home Three.js scene (Home only)
        Builds a full 3D world inside #three-canvas using the
        Three.js r128 global (loaded from cdnjs in index.html):
          - low-poly Japanese house with paper lantern at door
          - cherry blossom trees on both sides
          - falling sakura petal particle system (InstancedMesh)
          - misty mountain backdrop, warm fog
          - subtle camera parallax driven by mouse position
          - mouse "breath" pushes nearby petals
          - clicking the house (or #enter-button) fades to work.html
     ========================================================= */
  function setupHomeScene() {
    const canvas = document.getElementById("three-canvas");
    if (!canvas || typeof THREE === "undefined") return;
 
    /* ── Renderer ── */
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
 
    /* ── Scene + warm misty fog ── */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF6E6D8);
    scene.fog = new THREE.Fog(0xF6E6D8, 18, 55);
 
    /* ── Camera ── */
    const camera = new THREE.PerspectiveCamera(
      48, window.innerWidth / window.innerHeight, 0.1, 200
    );
    camera.position.set(0, 2.4, 12);
    camera.lookAt(0, 1.6, 0);
 
    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
 
    /* ── Lighting ── */
    scene.add(new THREE.AmbientLight(0xFFE8C8, 0.55));
    scene.add(new THREE.HemisphereLight(0xCDD8E8, 0xA89878, 0.40));
 
    const sun = new THREE.DirectionalLight(0xFFD49C, 0.85);
    sun.position.set(8, 14, 6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 40;
    sun.shadow.camera.left = -16;
    sun.shadow.camera.right = 16;
    sun.shadow.camera.top = 16;
    sun.shadow.camera.bottom = -16;
    scene.add(sun);
 
    /* ── Ground + path ── */
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(140, 140),
      new THREE.MeshStandardMaterial({ color: 0xA7B098, roughness: 0.96 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
 
    const path = new THREE.Mesh(
      new THREE.PlaneGeometry(2.2, 14),
      new THREE.MeshStandardMaterial({ color: 0xC4B499, roughness: 0.92 })
    );
    path.rotation.x = -Math.PI / 2;
    path.position.set(0, 0.005, 4);
    scene.add(path);
 
    /* ── Misty mountain backdrop ── */
    function addMountain(x, z, h, r, color) {
      const m = new THREE.Mesh(
        new THREE.ConeGeometry(r, h, 5, 1),
        new THREE.MeshStandardMaterial({ color, roughness: 1, flatShading: true })
      );
      m.position.set(x, h / 2 - 0.5, z);
      m.rotation.y = Math.random() * Math.PI;
      scene.add(m);
    }
    /* Far range — pale, swallowed by fog */
    addMountain(-22, -45, 14,  9, 0xB6C2CC);
    addMountain(-12, -50, 18, 10, 0xACBAC6);
    addMountain(  0, -52, 22, 12, 0xA4B2BE);
    addMountain( 12, -50, 17,  9, 0xACBAC6);
    addMountain( 22, -45, 13,  8, 0xB6C2CC);
    /* Mid range — warmer, more present */
    addMountain(-18, -28,  9,  6, 0xC2C0AA);
    addMountain(  9, -30, 11,  6, 0xBCBAA4);
 
    /* ── Japanese house ── */
    const house = new THREE.Group();
    house.position.set(0, 0, -1);
    scene.add(house);
 
    /* Foundation / raised platform */
    const foundation = new THREE.Mesh(
      new THREE.BoxGeometry(4.0, 0.30, 3.2),
      new THREE.MeshStandardMaterial({ color: 0x4D3520, roughness: 0.85 })
    );
    foundation.position.y = 0.15;
    foundation.castShadow = foundation.receiveShadow = true;
    house.add(foundation);
 
    /* Main body — warm cedar */
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 1.7, 2.8),
      new THREE.MeshStandardMaterial({ color: 0xA67849, roughness: 0.85 })
    );
    body.position.y = 1.15;
    body.castShadow = body.receiveShadow = true;
    house.add(body);
 
    /* Decorative dark beams + posts on the front face */
    const beamMat = new THREE.MeshStandardMaterial({ color: 0x3C2614, roughness: 0.85 });
    const topBeam = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.12, 0.08), beamMat);
    topBeam.position.set(0, 1.96, 1.43); house.add(topBeam);
    const botBeam = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.12, 0.08), beamMat);
    botBeam.position.set(0, 0.34, 1.43); house.add(botBeam);
    [-1.85, -0.62, 0.62, 1.85].forEach((x) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.10, 1.7, 0.08), beamMat);
      post.position.set(x, 1.15, 1.43);
      house.add(post);
    });
 
    /* Hip-style pyramid roof with overhang */
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(2.95, 1.4, 4, 1),
      new THREE.MeshStandardMaterial({ color: 0x2A1A10, roughness: 0.7, flatShading: true })
    );
    roof.position.y = 2.7;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    house.add(roof);
 
    const ridge = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.15, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x1A0F08, roughness: 0.7 })
    );
    ridge.position.y = 3.45;
    house.add(ridge);
 
    /* Front door */
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 1.4, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x231307, roughness: 0.85 })
    );
    door.position.set(0, 1.0, 1.42);
    house.add(door);
 
    /* Door frame */
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x5A3820, roughness: 0.8 });
    const dfL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.5, 0.05), frameMat);
    dfL.position.set(-0.45, 1.00, 1.44); house.add(dfL);
    const dfR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.5, 0.05), frameMat);
    dfR.position.set( 0.45, 1.00, 1.44); house.add(dfR);
    const dfT = new THREE.Mesh(new THREE.BoxGeometry(1.00, 0.06, 0.05), frameMat);
    dfT.position.set( 0.00, 1.73, 1.44); house.add(dfT);
 
    /* Glowing shoji windows */
    const shojiMat = new THREE.MeshStandardMaterial({
      color: 0xF0E0BC,
      emissive: 0xFFCC60,
      emissiveIntensity: 0.55,
      roughness: 0.7,
    });
    const wL = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.7, 0.04), shojiMat);
    wL.position.set(-1.1, 1.30, 1.42); house.add(wL);
    const wR = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.7, 0.04), shojiMat);
    wR.position.set( 1.1, 1.30, 1.42); house.add(wR);
 
    /* Paper lantern at door */
    const lanternGeo = new THREE.SphereGeometry(0.18, 14, 10);
    lanternGeo.scale(1, 1.3, 1);
    const lantern = new THREE.Mesh(lanternGeo, new THREE.MeshStandardMaterial({
      color: 0xFFD888,
      emissive: 0xFFA840,
      emissiveIntensity: 0.95,
      roughness: 0.9,
      transparent: true,
      opacity: 0.92,
    }));
    lantern.position.set(0.85, 1.85, 1.50);
    house.add(lantern);
 
    const cord = new THREE.Mesh(
      new THREE.CylinderGeometry(0.005, 0.005, 0.45),
      new THREE.MeshStandardMaterial({ color: 0x3C2614 })
    );
    cord.position.set(0.85, 2.13, 1.50);
    house.add(cord);
 
    const lanternLight = new THREE.PointLight(0xFFAA50, 1.5, 5.5, 1.8);
    lanternLight.position.set(0.85, 1.85, 1.55);
    house.add(lanternLight);
 
    /* Collect house meshes for raycasting (clickable area) */
    const houseHitTargets = [];
    house.traverse((o) => { if (o.isMesh) houseHitTargets.push(o); });
 
    /* ── Cherry blossom trees ── */
    const SAKURA_COLORS = [0xE8B4B8, 0xF0BFC2, 0xDFA8AC, 0xE8B4B8, 0xEAB8BC];
 
    function makeTree(x, z, scale) {
      const tree = new THREE.Group();
 
      /* Trunk */
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18 * scale, 0.26 * scale, 2.4 * scale, 8),
        new THREE.MeshStandardMaterial({ color: 0x4A2E18, roughness: 0.93 })
      );
      trunk.position.y = 1.2 * scale;
      trunk.castShadow = true;
      tree.add(trunk);
 
      /* Angular branches */
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2 + Math.random() * 0.6;
        const len = (0.7 + Math.random() * 0.4) * scale;
        const branch = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04 * scale, 0.08 * scale, len, 6),
          new THREE.MeshStandardMaterial({ color: 0x3C2614, roughness: 0.9 })
        );
        branch.position.set(
          Math.cos(angle) * 0.18,
          (1.7 + Math.random() * 0.4) * scale,
          Math.sin(angle) * 0.18
        );
        branch.rotation.z = -Math.cos(angle) * 0.7;
        branch.rotation.x =  Math.sin(angle) * 0.7;
        tree.add(branch);
      }
 
      /* Sakura canopy — clustered low-poly blobs */
      for (let i = 0; i < 7; i++) {
        const blob = new THREE.Mesh(
          new THREE.SphereGeometry((0.55 + Math.random() * 0.35) * scale, 8, 6),
          new THREE.MeshStandardMaterial({
            color: SAKURA_COLORS[i % SAKURA_COLORS.length],
            roughness: 0.95,
            flatShading: true,
          })
        );
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() * 0.7 * scale;
        blob.position.set(
          Math.cos(a) * r,
          (2.4 + Math.random() * 0.6) * scale,
          Math.sin(a) * r
        );
        blob.castShadow = true;
        tree.add(blob);
      }
 
      tree.position.set(x, 0, z);
      return tree;
    }
 
    /* Trees flank both sides — varied scale + depth */
    [
      [-5.2,  1.5, 1.10], [-7.8, -3.0, 1.00], [ -9.5,  3.5, 0.85], [-12,  -8, 1.30],
      [ 5.2,  1.0, 1.10], [ 7.8, -3.0, 1.00], [  9.8,  3.0, 0.92], [ 12,  -8, 1.20],
    ].forEach(([x, z, s]) => scene.add(makeTree(x, z, s)));
 
    /* ── Sakura petal particle system ── */
    const PETAL_COUNT = 240;
 
    /* Round-petal alpha texture */
    function makePetalTexture() {
      const c = document.createElement("canvas");
      c.width = c.height = 64;
      const ctx = c.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.ellipse(32, 32, 16, 28, 0, 0, Math.PI * 2);
      ctx.fill();
      /* soft edge */
      ctx.globalCompositeOperation = "destination-in";
      const grd = ctx.createRadialGradient(32, 32, 4, 32, 32, 30);
      grd.addColorStop(0,   "rgba(255,255,255,1)");
      grd.addColorStop(0.7, "rgba(255,255,255,0.9)");
      grd.addColorStop(1,   "rgba(255,255,255,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(c);
    }
 
    const petals = new THREE.InstancedMesh(
      new THREE.PlaneGeometry(0.18, 0.22),
      new THREE.MeshBasicMaterial({
        map: makePetalTexture(),
        color: 0xE8B4B8,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        opacity: 0.92,
      }),
      PETAL_COUNT
    );
    petals.frustumCulled = false;
    scene.add(petals);
 
    const rand = (a, b) => a + Math.random() * (b - a);
    const petalState = [];
    for (let i = 0; i < PETAL_COUNT; i++) {
      petalState.push({
        x: rand(-15, 15), y: rand(2, 18), z: rand(-10, 8),
        vx: rand(-0.004, 0.004),
        vy: -rand(0.012, 0.026),
        vz: rand(-0.004, 0.004),
        rx: rand(0, Math.PI * 2),
        ry: rand(0, Math.PI * 2),
        rz: rand(0, Math.PI * 2),
        rsx: rand(-0.020, 0.020),
        rsy: rand(-0.020, 0.020),
        rsz: rand(-0.020, 0.020),
        swayPhase: rand(0, Math.PI * 2),
        swayAmp:   rand(0.002, 0.008),
      });
    }
    const dummy = new THREE.Object3D();
 
    /* ── Mouse interactions ── */
    let mouseNX = 0, mouseNY = 0;
    let camTargetX = 0, camTargetY = 2.4;
    let camX = 0, camY = 2.4;
 
    /* World-space mouse projection (for petal disturbance) */
    const mouseWorld = new THREE.Vector3();
    let mouseInScene = false;
 
    const raycaster = new THREE.Raycaster();
    const ptr = new THREE.Vector2();
 
    window.addEventListener("mousemove", (e) => {
      mouseNX = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouseNY = (e.clientY / window.innerHeight - 0.5) * 2;
      camTargetX = mouseNX *  1.0;
      camTargetY = 2.4 + mouseNY * -0.45;
 
      /* Project pointer onto an air plane (y = 4) for petal pushing */
      ptr.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );
      raycaster.setFromCamera(ptr, camera);
      if (Math.abs(raycaster.ray.direction.y) > 0.0001) {
        const t = (4 - raycaster.ray.origin.y) / raycaster.ray.direction.y;
        if (t > 0 && t < 80) {
          mouseWorld
            .copy(raycaster.ray.direction)
            .multiplyScalar(t)
            .add(raycaster.ray.origin);
          mouseInScene = true;
        }
      }
    });
 
    /* House hover → pointer cursor; click → fade to work.html */
    function navigateToWork() {
      if (window.Portfolio && window.Portfolio.navigate) {
        window.Portfolio.navigate("work.html");
      } else {
        window.location.href = "work.html";
      }
    }
 
    canvas.addEventListener("mousemove", (e) => {
      ptr.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );
      raycaster.setFromCamera(ptr, camera);
      const hit = raycaster.intersectObjects(houseHitTargets).length > 0;
      canvas.style.cursor = hit ? "pointer" : "default";
    });
 
    canvas.addEventListener("click", (e) => {
      ptr.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );
      raycaster.setFromCamera(ptr, camera);
      if (raycaster.intersectObjects(houseHitTargets).length > 0) {
        navigateToWork();
      }
    });
 
    const enterBtn = document.getElementById("enter-button");
    if (enterBtn) enterBtn.addEventListener("click", navigateToWork);
 
    /* ── Animation loop ── */
    const clock = new THREE.Clock();
 
    (function animate() {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
 
      /* Smooth camera parallax */
      camX += (camTargetX - camX) * 0.035;
      camY += (camTargetY - camY) * 0.035;
      camera.position.set(camX, camY, 12);
      camera.lookAt(0, 1.6, 0);
 
      /* Petal update */
      for (let i = 0; i < PETAL_COUNT; i++) {
        const p = petalState[i];
 
        /* Wind sway */
        const swayX = Math.sin(t * 0.5 + p.swayPhase) * p.swayAmp;
        const swayZ = Math.cos(t * 0.4 + p.swayPhase) * p.swayAmp * 0.7;
 
        p.x += p.vx + swayX;
        p.y += p.vy;
        p.z += p.vz + swayZ;
 
        /* Mouse "breath" — push petals near the projected pointer */
        if (mouseInScene) {
          const dx = p.x - mouseWorld.x;
          const dy = p.y - mouseWorld.y;
          const dz = p.z - mouseWorld.z;
          const dSq = dx * dx + dy * dy + dz * dz;
          if (dSq < 4) {
            const f = 0.045 / Math.max(0.6, Math.sqrt(dSq));
            p.x += dx * f;
            p.y += dy * f * 0.30;
            p.z += dz * f;
            p.rx += 0.06;
            p.rz += 0.05;
          }
        }
 
        /* Tumbling rotation */
        p.rx += p.rsx;
        p.ry += p.rsy;
        p.rz += p.rsz;
 
        /* Recycle below ground */
        if (p.y < -0.3) {
          p.x  = rand(-15, 15);
          p.y  = rand(15, 22);
          p.z  = rand(-10, 8);
          p.vy = -rand(0.012, 0.026);
        }
 
        dummy.position.set(p.x, p.y, p.z);
        dummy.rotation.set(p.rx, p.ry, p.rz);
        dummy.updateMatrix();
        petals.setMatrixAt(i, dummy.matrix);
      }
      petals.instanceMatrix.needsUpdate = true;
 
      /* Lantern flicker */
      lanternLight.intensity =
        1.5 + Math.sin(t * 1.7) * 0.18 + Math.sin(t * 4.2) * 0.08;
 
      renderer.render(scene, camera);
    })();
  }
 
  /* Expose a tiny hook for future modules (e.g., the Three.js scene)
     that may want to know the page or trigger a fade. */
  window.Portfolio = Object.freeze({
    page: PAGE,
    navigate: navigateWithFade,
  });
})();
