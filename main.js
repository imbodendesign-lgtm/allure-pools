/* =====================================================================
   Allure Pools Service & Repair — main.js
   Mobile nav, scroll header, scroll reveal, smooth anchors
   ===================================================================== */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    /* ---------- Sticky header shadow on scroll ---------- */
    var header = document.querySelector('.site-header');
    function onScroll() {
      if (!header) return;
      if (window.scrollY > 12) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ---------- Mobile hamburger menu ---------- */
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.main-nav');
    var backdrop = document.querySelector('.nav-backdrop');

    function closeMenu() {
      if (!nav) return;
      nav.classList.remove('open');
      if (toggle) {
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
      if (backdrop) backdrop.classList.remove('show');
      document.body.style.overflow = '';
    }

    function openMenu() {
      if (!nav) return;
      nav.classList.add('open');
      if (toggle) {
        toggle.classList.add('open');
        toggle.setAttribute('aria-expanded', 'true');
      }
      if (backdrop) backdrop.classList.add('show');
      document.body.style.overflow = 'hidden';
    }

    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        if (nav.classList.contains('open')) {
          closeMenu();
        } else {
          openMenu();
        }
      });
    }

    if (backdrop) backdrop.addEventListener('click', closeMenu);

    // Close menu when a nav link is tapped
    if (nav) {
      nav.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', closeMenu);
      });
    }

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });

    // Reset menu state if resized back to desktop
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) closeMenu();
    });

    /* ---------- Smooth scroll for in-page anchors ---------- */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var id = this.getAttribute('href');
        if (id === '#' || id.length < 2) return;
        var target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    /* ---------- Scroll reveal via IntersectionObserver ---------- */
    var revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && revealEls.length) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

      revealEls.forEach(function (el) { observer.observe(el); });
    } else {
      // Fallback: just show everything
      revealEls.forEach(function (el) { el.classList.add('visible'); });
    }

    /* ---------- Contact form -> Web3Forms (real submission) ---------- */
    var form = document.querySelector('#contact-form');
    if (form) {
      var status = document.querySelector('#form-status');
      var submitBtn = form.querySelector('button[type="submit"]');

      function setStatus(msg, color) {
        if (!status) return;
        status.textContent = msg;
        status.style.color = color;
      }

      form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Native required-field validation
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }

        if (submitBtn) { submitBtn.disabled = true; }
        setStatus('Sending your request…', '#6B7A99');

        var payload = {};
        new FormData(form).forEach(function (value, key) { payload[key] = value; });

        // Smart subject so the lead's name + area show in the inbox at a glance,
        // and reply-to set to the customer so Douglas can reply with one tap.
        var leadName = payload['Name'] || 'Website Visitor';
        var leadArea = payload['Service Area'] ? ' (' + payload['Service Area'] + ')' : '';
        payload.subject = 'New Pool Quote Request — ' + leadName + leadArea;
        if (payload['Email']) { payload.replyto = payload['Email']; }

        fetch('https://api.web3forms.com/submit', {
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
          .finally(function () {
            if (submitBtn) { submitBtn.disabled = false; }
          });
      });
    }
  });
})();
