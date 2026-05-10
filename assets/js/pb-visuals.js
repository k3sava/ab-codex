/* pb-visuals.js — scroll-triggered reveal + share button for playbook visual components */
(function () {
  'use strict';

  /* ── 1. Scroll reveal ─────────────────────────────────────────────────────── */
  if (typeof IntersectionObserver === 'undefined') {
    document.querySelectorAll('[data-observe]').forEach(function (el) {
      el.classList.add('is-visible');
    });
  } else {
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
  }

  /* ── 2. Share button ──────────────────────────────────────────────────────── */
  var SVG_SHARE = '<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>';
  var h2cReady = false;

  function loadH2C() {
    if (h2cReady || window.html2canvas) { h2cReady = true; return Promise.resolve(); }
    return new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      s.crossOrigin = 'anonymous';
      s.onload = function () { h2cReady = true; res(); };
      s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  function addShareBtn(pbv) {
    var btn = document.createElement('button');
    btn.className = 'pbv-share-btn';
    btn.setAttribute('aria-label', 'Share as image');
    btn.innerHTML = SVG_SHARE + ' <span>Share</span>';
    pbv.appendChild(btn);

    var autoTimer = null;

    function show() { btn.classList.add('pbv-share-visible'); }
    function hide() { btn.classList.remove('pbv-share-visible'); }

    /* Show for 3 s when visual enters view */
    if (pbv.classList.contains('is-visible')) {
      show();
      autoTimer = setTimeout(hide, 3000);
    } else {
      var mo = new MutationObserver(function () {
        if (pbv.classList.contains('is-visible')) {
          mo.disconnect();
          show();
          autoTimer = setTimeout(hide, 3000);
        }
      });
      mo.observe(pbv, { attributes: true, attributeFilter: ['class'] });
    }

    /* Hover: show / hide */
    pbv.addEventListener('mouseenter', function () {
      clearTimeout(autoTimer);
      show();
    });
    pbv.addEventListener('mouseleave', function () {
      hide();
    });

    /* Click: capture PNG → native share or download */
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var label = pbv.getAttribute('aria-label') || "a builder's codex";
      var span = btn.querySelector('span');
      span.textContent = '…';
      btn.disabled = true;

      loadH2C().then(function () {
        btn.style.visibility = 'hidden'; /* hide btn from capture */
        return window.html2canvas(pbv, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#F5F0E8',
          logging: false
        });
      }).then(function (canvas) {
        btn.style.visibility = '';
        btn.disabled = false;
        span.textContent = 'Share';

        var fname = label.replace(/[^a-z0-9]+/gi, '-').toLowerCase().slice(0, 48) + '.png';
        canvas.toBlob(function (blob) {
          var file = new File([blob], fname, { type: 'image/png' });
          if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            navigator.share({ files: [file], title: label }).catch(function () {});
          } else {
            var a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = fname;
            a.click();
            setTimeout(function () { URL.revokeObjectURL(a.href); }, 60000);
          }
        }, 'image/png');
      }).catch(function (err) {
        btn.style.visibility = '';
        btn.disabled = false;
        span.textContent = 'Share';
        console.warn('pbv share failed', err);
      });
    });
  }

  function initShareBtns() {
    document.querySelectorAll('.pbv[data-observe]').forEach(addShareBtn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShareBtns);
  } else {
    initShareBtns();
  }
}());
