/* =====================================================================
   Allure Pools Service & Repair — main.js
   Nav · anchors · reveals · parallax · counters · magnetic ·
   word reveal · quote modal · multi-step contact wizard · form submit
   ===================================================================== */
(function () {
  'use strict';

  var ENDPOINT = 'https://allure-pools-api.vercel.app/api/contact';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }
  function setStatus(el, msg, color) { if (el) { el.textContent = msg; el.style.color = color; } }

  /* shared lead submission used by both the wizard form and the modal */
  function submitLead(formEl, statusEl, btn, onSuccess) {
    if (!formEl.checkValidity()) { formEl.reportValidity(); return; }
    if (btn) btn.disabled = true;
    setStatus(statusEl, 'Sending your request…', '#6B7A99');
    var payload = {};
    new FormData(formEl).forEach(function (v, k) { payload[k] = v; });
    var leadName = payload['Name'] || 'Website Visitor';
    var leadArea = payload['Service Area'] ? ' (' + payload['Service Area'] + ')' : '';
    payload.subject = 'New Pool Quote Request — ' + leadName + leadArea;
    if (payload['Email']) payload.replyto = payload['Email'];
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (r) { return r.json(); })
      .then(function (json) {
        if (json && json.success) {
          setStatus(statusEl, 'Thank you! Your request has been sent — Douglas will be in touch shortly. Prefer to talk now? Call 702-483-8424.', '#1A2F6A');
          formEl.reset();
          formEl.querySelectorAll('.opt.selected').forEach(function (o) { o.classList.remove('selected'); });
          if (onSuccess) onSuccess();
        } else {
          setStatus(statusEl, 'Sorry, something went wrong. Please call Douglas directly at 702-483-8424.', '#b00020');
        }
      })
      .catch(function () { setStatus(statusEl, 'Network error — please call Douglas at 702-483-8424 and we\'ll take care of you.', '#b00020'); })
      .finally(function () { if (btn) btn.disabled = false; });
  }

  ready(function () {
    var body = document.body;
    if (!reduceMotion) body.classList.add('motion-ok');

    /* ===================== Mobile nav ===================== */
    var header = document.querySelector('.site-header');
    var mobileBar = document.querySelector('.mobile-bar');
    var lastY = window.scrollY;
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
    if (toggle && nav) toggle.addEventListener('click', function () { nav.classList.contains('open') ? closeMenu() : openMenu(); });
    if (backdrop) backdrop.addEventListener('click', closeMenu);
    if (nav) nav.querySelectorAll('a').forEach(function (l) { l.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
    window.addEventListener('resize', function () { if (window.innerWidth > 900) closeMenu(); });

    /* ===================== Smooth anchors ===================== */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var id = this.getAttribute('href');
        if (id === '#' || id.length < 2) return;
        var target = document.querySelector(id);
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      });
    });

    /* ===================== Scroll reveals ===================== */
    document.querySelectorAll('[data-stagger]').forEach(function (group) {
      group.querySelectorAll(':scope > .reveal, :scope > * > .reveal').forEach(function (el, i) { el.style.transitionDelay = (i * 0.09) + 's'; });
    });
    var revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && revealEls.length) {
      var revObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) { if (entry.isIntersecting) { entry.target.classList.add('visible'); revObserver.unobserve(entry.target); } });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      revealEls.forEach(function (el) { revObserver.observe(el); });
    } else { revealEls.forEach(function (el) { el.classList.add('visible'); }); }

    /* ===================== Word-by-word statement ===================== */
    document.querySelectorAll('[data-words]').forEach(function (el) {
      var tmp = document.createElement('div'); tmp.innerHTML = el.innerHTML;
      function wrap(node, bucket) {
        node.childNodes.forEach(function (child) {
          if (child.nodeType === 3) {
            child.textContent.split(/(\s+)/).forEach(function (part) {
              if (part.trim() === '') { bucket.appendChild(document.createTextNode(part)); return; }
              var s = document.createElement('span'); s.className = 'word'; s.textContent = part; bucket.appendChild(s);
            });
          } else if (child.nodeType === 1) { var clone = child.cloneNode(false); bucket.appendChild(clone); wrap(child, clone); }
        });
      }
      var out = document.createElement('span'); wrap(tmp, out); el.innerHTML = ''; el.appendChild(out);
      el.querySelectorAll('.word').forEach(function (w, i) { w.style.transitionDelay = (i * 0.07) + 's'; });
      if ('IntersectionObserver' in window) {
        var wObs = new IntersectionObserver(function (entries) { entries.forEach(function (en) { if (en.isIntersecting) { el.classList.add('visible'); wObs.unobserve(el); } }); }, { threshold: 0.4 });
        wObs.observe(el);
      } else { el.classList.add('visible'); }
    });

    /* ===================== Animated counters ===================== */
    document.querySelectorAll('[data-count]').forEach(function (el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var suffix = el.getAttribute('data-suffix') || '';
      if (reduceMotion || isNaN(target)) { el.textContent = target + suffix; return; }
      var done = false;
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && !done) {
            done = true; var start = null, dur = 1400;
            function step(ts) { if (!start) start = ts; var p = Math.min((ts - start) / dur, 1); el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix; if (p < 1) requestAnimationFrame(step); }
            requestAnimationFrame(step); obs.unobserve(el);
          }
        });
      }, { threshold: 0.6 });
      obs.observe(el);
    });

    /* ===================== Scroll-driven: header + hero ===================== */
    var hero = document.querySelector('.hero');
    var heroContent = document.querySelector('.hero-content');
    var heroVideo = document.querySelector('.hero-video');
    var ticking = false;
    function applyScroll() {
      ticking = false; var y = window.scrollY;
      if (header) {
        if (y > 12) header.classList.add('scrolled'); else header.classList.remove('scrolled');
        if (!nav || !nav.classList.contains('open')) {
          if (y > 560 && y > lastY + 4) header.classList.add('nav-hidden');
          else if (y < lastY - 4) header.classList.remove('nav-hidden');
        }
      }
      lastY = y;
      if (mobileBar) {
        var blocked = body.style.overflow === 'hidden';
        var onMobile = window.innerWidth <= 760;
        mobileBar.classList.toggle('show', !blocked && (onMobile || y > 480));
      }
      if (reduceMotion || !hero) return;
      var h = hero.offsetHeight || 1; var p = Math.min(Math.max(y / h, 0), 1);
      if (heroContent) { heroContent.style.transform = 'translate3d(0,' + (p * 70) + 'px,0)'; heroContent.style.opacity = String(1 - p * 1.05); }
      if (heroVideo) { heroVideo.style.transform = 'scale(' + (1 + p * 0.12) + ')'; }
    }
    function requestTick() { if (!ticking) { ticking = true; requestAnimationFrame(applyScroll); } }
    window.addEventListener('scroll', requestTick, { passive: true });
    window.addEventListener('resize', requestTick, { passive: true });
    applyScroll();

    /* ===================== Magnetic buttons ===================== */
    if (finePointer && !reduceMotion) {
      document.querySelectorAll('.btn').forEach(function (btn) {
        btn.addEventListener('mousemove', function (e) {
          var r = btn.getBoundingClientRect();
          btn.style.transform = 'translate3d(' + ((e.clientX - (r.left + r.width / 2)) * 0.28) + 'px,' + ((e.clientY - (r.top + r.height / 2)) * 0.28) + 'px,0)';
        });
        btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
      });
    }

    /* ===================== Custom cursor ===================== */
    if (finePointer && !reduceMotion) {
      var dot = document.createElement('div'); dot.className = 'cursor-dot';
      var ring = document.createElement('div'); ring.className = 'cursor-ring';
      body.appendChild(dot); body.appendChild(ring); body.classList.add('cursor-on');
      var mx = window.innerWidth / 2, my = window.innerHeight / 2, rx = mx, ry = my, shown = false;
      document.addEventListener('mousemove', function (e) {
        mx = e.clientX; my = e.clientY;
        dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0) translate(-50%,-50%)';
        if (!shown) { shown = true; dot.style.opacity = '1'; ring.style.opacity = '1'; }
      }, { passive: true });
      (function loop() {
        rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
        ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0) translate(-50%,-50%)';
        requestAnimationFrame(loop);
      })();
      document.addEventListener('mouseleave', function () { dot.style.opacity = '0'; ring.style.opacity = '0'; shown = false; });
      var interactiveSel = 'a, button, .opt, summary, .gallery-item, [role="button"]';
      document.addEventListener('mouseover', function (e) { if (e.target.closest && e.target.closest(interactiveSel)) ring.classList.add('cursor-grow'); });
      document.addEventListener('mouseout', function (e) { if (e.target.closest && e.target.closest(interactiveSel)) ring.classList.remove('cursor-grow'); });
    }

    /* ===================== Image lightbox ===================== */
    (function () {
      var medias = Array.prototype.slice.call(document.querySelectorAll('.svc__media, .gallery-item'));
      if (!medias.length) return;
      var expandIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>';
      var items = [];
      medias.forEach(function (m) {
        var img = m.querySelector('img'); if (!img) return;
        var badge = document.createElement('span'); badge.className = 'svc__expand'; badge.innerHTML = expandIcon; m.appendChild(badge);
        var idx = items.length;
        items.push({ src: img.getAttribute('src'), alt: img.getAttribute('alt') || '' });
        m.addEventListener('click', function () { openLb(idx); });
      });

      var lb = document.createElement('div'); lb.className = 'lightbox'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-hidden', 'true');
      lb.innerHTML =
        '<button class="lightbox__close" aria-label="Close">&times;</button>' +
        '<button class="lightbox__nav prev" aria-label="Previous photo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button>' +
        '<img alt="">' +
        '<button class="lightbox__nav next" aria-label="Next photo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></button>' +
        '<div class="lightbox__cap"></div>';
      body.appendChild(lb);
      var lbImg = lb.querySelector('img'); var lbCap = lb.querySelector('.lightbox__cap'); var cur = 0;

      function render() { lbImg.src = items[cur].src; lbImg.alt = items[cur].alt; lbCap.textContent = items[cur].alt; }
      function openLb(i) { cur = i; render(); lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false'); body.style.overflow = 'hidden'; }
      function closeLb() { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); body.style.overflow = ''; }
      function go(d) { cur = (cur + d + items.length) % items.length; render(); }

      lb.querySelector('.lightbox__close').addEventListener('click', closeLb);
      lb.querySelector('.prev').addEventListener('click', function (e) { e.stopPropagation(); go(-1); });
      lb.querySelector('.next').addEventListener('click', function (e) { e.stopPropagation(); go(1); });
      lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
      document.addEventListener('keydown', function (e) {
        if (!lb.classList.contains('open')) return;
        if (e.key === 'Escape') closeLb();
        else if (e.key === 'ArrowLeft') go(-1);
        else if (e.key === 'ArrowRight') go(1);
      });
      var sx = 0;
      lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
      lb.addEventListener('touchend', function (e) { var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); });
    })();

    /* ===================== Multi-step contact wizard ===================== */
    var wizard = document.getElementById('contact-wizard');
    if (wizard) {
      var steps = Array.prototype.slice.call(wizard.querySelectorAll('.wizard__step'));
      var bar = wizard.querySelector('.wizard__bar');
      var current = 0;

      function showStep(i) {
        current = Math.max(0, Math.min(i, steps.length - 1));
        steps.forEach(function (s, idx) { s.classList.toggle('is-active', idx === current); });
        if (bar) bar.style.width = Math.round(((current + 1) / steps.length) * 100) + '%';
      }
      // option selection
      wizard.querySelectorAll('.optgrid').forEach(function (grid) {
        var fieldName = grid.getAttribute('data-field');
        var hidden = wizard.querySelector('input[name="' + fieldName + '"]');
        var nextBtn = grid.closest('.wizard__step').querySelector('[data-next]');
        grid.querySelectorAll('.opt').forEach(function (opt) {
          opt.addEventListener('click', function () {
            grid.querySelectorAll('.opt').forEach(function (o) { o.classList.remove('selected'); });
            opt.classList.add('selected');
            if (hidden) hidden.value = opt.getAttribute('data-value');
            if (nextBtn) nextBtn.disabled = false;
          });
        });
      });
      wizard.querySelectorAll('[data-next]').forEach(function (b) { b.addEventListener('click', function () { showStep(current + 1); }); });
      wizard.querySelectorAll('[data-prev]').forEach(function (b) { b.addEventListener('click', function () { showStep(current - 1); }); });
      showStep(0);
    }

    /* ===================== Contact form submit ===================== */
    var form = document.querySelector('#contact-form');
    if (form) {
      var statusEl = document.querySelector('#form-status');
      var submitBtn = form.querySelector('button[type="submit"]');
      form.addEventListener('submit', function (e) { e.preventDefault(); submitLead(form, statusEl, submitBtn); });
    }

    /* ===================== Timed quote pop-up ===================== */
    var modal = document.getElementById('quote-modal');
    if (modal) {
      var KEY = 'ap_quote_seen';
      function suppressed() { try { var t = localStorage.getItem(KEY); return t && (Date.now() - parseInt(t, 10) < 3 * 24 * 3600 * 1000); } catch (e) { return false; } }
      function suppress() { try { localStorage.setItem(KEY, String(Date.now())); } catch (e) {} }
      function openModal() { if (suppressed() || modal.classList.contains('open')) return; modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); body.style.overflow = 'hidden'; }
      function closeModal() { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); body.style.overflow = ''; suppress(); }
      modal.querySelectorAll('[data-close]').forEach(function (el) { el.addEventListener('click', closeModal); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });
      if (!suppressed()) {
        setTimeout(function () { openModal(); }, 22000);
        document.addEventListener('mouseout', function (e) { if (e.clientY <= 0 && !e.relatedTarget) openModal(); });
        var depthFired = false;
        window.addEventListener('scroll', function () {
          if (depthFired || suppressed()) return;
          if ((window.scrollY + window.innerHeight) / document.body.scrollHeight > 0.6) { depthFired = true; openModal(); }
        }, { passive: true });
      }
      var mForm = document.getElementById('quote-modal-form');
      if (mForm) {
        var mStatus = document.getElementById('quote-modal-status');
        var mBtn = mForm.querySelector('button[type="submit"]');
        mForm.addEventListener('submit', function (e) { e.preventDefault(); submitLead(mForm, mStatus, mBtn, function () { setTimeout(closeModal, 2800); }); });
      }
    }
  });
})();
