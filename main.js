/* =====================================================================
   Allure Pools Service & Repair — main.js
   Nav · smooth anchors · scroll reveals · parallax · counters ·
   magnetic buttons · word reveals · contact form
   ===================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var body = document.body;
    if (!reduceMotion) body.classList.add('motion-ok');

    /* ===================== Header ===================== */
    var header = document.querySelector('.site-header');
    var lastY = window.scrollY;

    /* ===================== Mobile nav ===================== */
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.main-nav');
    var backdrop = document.querySelector('.nav-backdrop');

    function closeMenu() {
      if (!nav) return;
      nav.classList.remove('open');
      if (toggle) { toggle.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
      if (backdrop) backdrop.classList.remove('show');
      body.style.overflow = '';
    }
    function openMenu() {
      if (!nav) return;
      nav.classList.add('open');
      if (toggle) { toggle.classList.add('open'); toggle.setAttribute('aria-expanded', 'true'); }
      if (backdrop) backdrop.classList.add('show');
      body.style.overflow = 'hidden';
    }
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        nav.classList.contains('open') ? closeMenu() : openMenu();
      });
    }
    if (backdrop) backdrop.addEventListener('click', closeMenu);
    if (nav) nav.querySelectorAll('a').forEach(function (l) { l.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
    window.addEventListener('resize', function () { if (window.innerWidth > 900) closeMenu(); });

    /* ===================== Smooth in-page anchors ===================== */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var id = this.getAttribute('href');
        if (id === '#' || id.length < 2) return;
        var target = document.querySelector(id);
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      });
    });

    /* ===================== Scroll reveals (staggered) ===================== */
    // Auto-stagger direct .reveal children inside a [data-stagger] container.
    document.querySelectorAll('[data-stagger]').forEach(function (group) {
      var kids = group.querySelectorAll(':scope > .reveal, :scope > * > .reveal');
      kids.forEach(function (el, i) { el.style.transitionDelay = (i * 0.09) + 's'; });
    });

    var revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && revealEls.length) {
      var revObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      revealEls.forEach(function (el) { revObserver.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add('visible'); });
    }

    /* ===================== Word-by-word statement reveal ===================== */
    document.querySelectorAll('[data-words]').forEach(function (el) {
      var html = el.innerHTML;
      // wrap each word (keeping <em> emphasis) in a span
      var tmp = document.createElement('div');
      tmp.innerHTML = html;
      function wrap(node, bucket) {
        node.childNodes.forEach(function (child) {
          if (child.nodeType === 3) {
            child.textContent.split(/(\s+)/).forEach(function (part) {
              if (part.trim() === '') { bucket.appendChild(document.createTextNode(part)); return; }
              var s = document.createElement('span'); s.className = 'word'; s.textContent = part; bucket.appendChild(s);
            });
          } else if (child.nodeType === 1) {
            var clone = child.cloneNode(false); bucket.appendChild(clone); wrap(child, clone);
          }
        });
      }
      var out = document.createElement('span'); wrap(tmp, out);
      el.innerHTML = ''; el.appendChild(out);
      el.querySelectorAll('.word').forEach(function (w, i) { w.style.transitionDelay = (i * 0.07) + 's'; });
      if ('IntersectionObserver' in window) {
        var wObs = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) { if (en.isIntersecting) { el.classList.add('visible'); wObs.unobserve(el); } });
        }, { threshold: 0.4 });
        wObs.observe(el);
      } else { el.classList.add('visible'); }
    });

    /* ===================== Animated stat counters ===================== */
    document.querySelectorAll('[data-count]').forEach(function (el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var suffix = el.getAttribute('data-suffix') || '';
      if (reduceMotion || isNaN(target)) { el.textContent = target + suffix; return; }
      var done = false;
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && !done) {
            done = true;
            var start = null, dur = 1400;
            function step(ts) {
              if (!start) start = ts;
              var p = Math.min((ts - start) / dur, 1);
              var eased = 1 - Math.pow(1 - p, 3);
              el.textContent = Math.round(target * eased) + suffix;
              if (p < 1) requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
            obs.unobserve(el);
          }
        });
      }, { threshold: 0.6 });
      obs.observe(el);
    });

    /* ===================== Scroll-driven: header + hero + parallax ===================== */
    var hero = document.querySelector('.hero');
    var heroContent = document.querySelector('.hero-content');
    var heroVideo = document.querySelector('.hero-video');
    var parallaxEls = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
    var ticking = false;

    function applyScroll() {
      ticking = false;
      var y = window.scrollY;

      // Header: subtle shadow + hide on scroll-down past hero, show on scroll-up
      if (header) {
        if (y > 12) header.classList.add('scrolled'); else header.classList.remove('scrolled');
        if (!nav || !nav.classList.contains('open')) {
          if (y > 560 && y > lastY + 4) header.classList.add('nav-hidden');
          else if (y < lastY - 4) header.classList.remove('nav-hidden');
        }
      }
      lastY = y;

      if (reduceMotion) return;

      // Hero: fade + lift content, gentle zoom on video
      if (hero) {
        var h = hero.offsetHeight || 1;
        var p = Math.min(Math.max(y / h, 0), 1);
        if (heroContent) { heroContent.style.transform = 'translate3d(0,' + (p * 70) + 'px,0)'; heroContent.style.opacity = String(1 - p * 1.05); }
        if (heroVideo) { heroVideo.style.transform = 'scale(' + (1 + p * 0.12) + ')'; }
      }

      // Generic parallax inside clipped frames
      var vh = window.innerHeight;
      parallaxEls.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.bottom < -100 || rect.top > vh + 100) return;
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0.12;
        var centerProgress = (rect.top + rect.height / 2 - vh / 2) / vh; // -0.5..0.5-ish
        var shift = -centerProgress * speed * 100;
        el.style.transform = 'translate3d(0,' + shift.toFixed(2) + 'px,0)';
      });
    }
    function requestTick() { if (!ticking) { ticking = true; requestAnimationFrame(applyScroll); } }
    window.addEventListener('scroll', requestTick, { passive: true });
    window.addEventListener('resize', requestTick, { passive: true });
    applyScroll();

    /* ===================== Magnetic buttons ===================== */
    if (finePointer && !reduceMotion) {
      document.querySelectorAll('.btn').forEach(function (btn) {
        var strength = 0.28;
        btn.addEventListener('mousemove', function (e) {
          var r = btn.getBoundingClientRect();
          var mx = e.clientX - (r.left + r.width / 2);
          var my = e.clientY - (r.top + r.height / 2);
          btn.style.transform = 'translate3d(' + (mx * strength) + 'px,' + (my * strength) + 'px,0)';
        });
        btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
      });
    }

    /* ===================== Contact form -> Vercel/Resend ===================== */
    var form = document.querySelector('#contact-form');
    if (form) {
      var statusEl = document.querySelector('#form-status');
      var submitBtn = form.querySelector('button[type="submit"]');
      function setStatus(msg, color) { if (!statusEl) return; statusEl.textContent = msg; statusEl.style.color = color; }

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }
        if (submitBtn) submitBtn.disabled = true;
        setStatus('Sending your request…', '#6B7A99');

        var payload = {};
        new FormData(form).forEach(function (value, key) { payload[key] = value; });
        var leadName = payload['Name'] || 'Website Visitor';
        var leadArea = payload['Service Area'] ? ' (' + payload['Service Area'] + ')' : '';
        payload.subject = 'New Pool Quote Request — ' + leadName + leadArea;
        if (payload['Email']) payload.replyto = payload['Email'];

        fetch('https://allure-pools-api.vercel.app/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload)
        })
          .then(function (r) { return r.json(); })
          .then(function (json) {
            if (json && json.success) {
              setStatus('Thank you! Your request has been sent — Douglas will be in touch shortly. Prefer to talk now? Call 702-483-8424.', '#1A2F6A');
              form.reset();
            } else {
              setStatus('Sorry, something went wrong sending your message. Please call Douglas directly at 702-483-8424.', '#b00020');
            }
          })
          .catch(function () {
            setStatus('Network error — please call Douglas at 702-483-8424 and we\'ll take care of you.', '#b00020');
          })
          .finally(function () { if (submitBtn) submitBtn.disabled = false; });
      });
    }
  });
})();
