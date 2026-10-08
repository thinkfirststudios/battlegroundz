/* BattleGroundZ — spec mockup. Plain JS, no build step.
   No strobe, no flicker, no autoplay. Everything decorative stops under prefers-reduced-motion. */
(function () {
  "use strict";
  document.documentElement.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var header = document.querySelector(".site-header");
  function onScroll() { if (header) header.classList.toggle("is-condensed", window.scrollY > 40); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile: full-screen coloured activity grid */
  var btn = document.querySelector(".menu-btn");
  var panel = document.getElementById("mobile-nav");
  function setMenu(open) {
    btn.setAttribute("aria-expanded", String(open));
    panel.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  }
  if (btn && panel) btn.addEventListener("click", function () { setMenu(btn.getAttribute("aria-expanded") !== "true"); });

  /* Desktop: Experiences mega-panel */
  var megaBtn = document.querySelector("[data-mega]");
  var mega = document.getElementById("mega");
  function setMega(open) { megaBtn.setAttribute("aria-expanded", String(open)); mega.classList.toggle("is-open", open); }
  if (megaBtn && mega) {
    megaBtn.addEventListener("click", function () { setMega(megaBtn.getAttribute("aria-expanded") !== "true"); });
    document.addEventListener("click", function (e) { if (!mega.contains(e.target) && e.target !== megaBtn && !megaBtn.contains(e.target)) setMega(false); });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (megaBtn && megaBtn.getAttribute("aria-expanded") === "true") { setMega(false); megaBtn.focus(); }
    if (btn && btn.getAttribute("aria-expanded") === "true") { setMenu(false); btn.focus(); }
  });

  /* Scroll reveals (also triggers the paintball splatter mask scaling in) */
  var targets = document.querySelectorAll(".rv, .rv-stagger, .tile--paintball");
  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("on"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("on"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* Count-up — "9 experiences" is the only verified figure we have */
  document.querySelectorAll("[data-count]").forEach(function (el) {
    var end = parseInt(el.getAttribute("data-count"), 10);
    if (reduce || !("IntersectionObserver" in window)) { el.textContent = String(end); return; }
    var cio = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      cio.disconnect();
      var start = performance.now();
      (function step(now) {
        var p = Math.min(1, (now - start) / 700);
        el.textContent = String(Math.round(end * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(step);
      })(start);
    }, { threshold: 0.6 });
    cio.observe(el);
  });

  /* Waiver validity is a dated string, never hardcoded prose.
     Published fact: valid until December 31st. Rolls over automatically each year.
     [WHO OWNS THE 31 DECEMBER ROLLOVER — CONFIRM (L5)] */
  var yr = new Date().getFullYear();
  document.querySelectorAll("[data-waiver-expiry]").forEach(function (t) {
    t.setAttribute("datetime", yr + "-12-31");
    t.textContent = "December 31, " + yr;
  });

  /* Events: list view first, month grid as a toggle */
  var toggle = document.querySelector("[data-view-toggle]");
  if (toggle) {
    toggle.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      toggle.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      document.querySelectorAll("[data-view]").forEach(function (v) { v.hidden = v.getAttribute("data-view") !== b.getAttribute("data-show"); });
    });
  }

  document.querySelectorAll("[data-phase2]").forEach(function (b) { b.addEventListener("click", function (e) { e.preventDefault(); }); });

  document.querySelectorAll("form[data-mock]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var n = f.querySelector(".form-note");
      if (n) { n.classList.add("is-shown"); n.focus(); }
    });
  });


  /* v3 motion: scroll progress bar + gentle 3D tilt on activity tiles (pointer devices only) */
  if (!reduce) {
    var bar = document.createElement("div"); bar.className = "progress"; bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);
    var setBar = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ")";
    };
    window.addEventListener("scroll", setBar, { passive: true }); setBar();
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      document.querySelectorAll(".tile").forEach(function (t) {
        t.addEventListener("pointermove", function (e) {
          var r = t.getBoundingClientRect();
          var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
          t.style.setProperty("--ry", (x * 8).toFixed(2) + "deg");
          t.style.setProperty("--rx", (y * -8).toFixed(2) + "deg");
        });
        t.addEventListener("pointerleave", function () { t.style.removeProperty("--rx"); t.style.removeProperty("--ry"); });
      });
    }
  }

  document.querySelectorAll("[data-year]").forEach(function (n) { n.textContent = yr; });
})();
