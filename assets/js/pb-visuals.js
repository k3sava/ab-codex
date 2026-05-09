/* pb-visuals.js — scroll-triggered reveal for playbook visual components */
(function () {
  'use strict';
  if (typeof IntersectionObserver === 'undefined') {
    /* Fallback: show all immediately in old browsers */
    document.querySelectorAll('[data-observe]').forEach(function (el) {
      el.classList.add('is-visible');
    });
    return;
  }

  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  function init() {
    document.querySelectorAll('[data-observe]').forEach(function (el) {
      obs.observe(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
