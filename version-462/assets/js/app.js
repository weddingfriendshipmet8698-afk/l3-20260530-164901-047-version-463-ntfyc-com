(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function clean(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMobileMenu() {
    var button = qs('[data-mobile-menu-button]');
    var menu = qs('[data-mobile-menu]');
    if (!button || !menu) return;
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupGlobalSearch() {
    qsa('[data-global-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = qs('input[name="q"]', form);
        var query = input ? input.value.trim() : '';
        var target = './search.html';
        if (query) target += '?q=' + encodeURIComponent(query);
        window.location.href = target;
      });
    });
  }

  function setupHeroSlider() {
    var slider = qs('[data-hero-slider]');
    if (!slider) return;
    var slides = qsa('[data-hero-slide]', slider);
    var dots = qsa('[data-hero-dot]', slider);
    var prev = qs('[data-hero-prev]', slider);
    var next = qs('[data-hero-next]', slider);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('is-active', itemIndex === index);
      });
    }

    function restart() {
      if (timer) clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  function eraMatches(year, era) {
    var y = parseInt(year, 10);
    if (!era) return true;
    if (!Number.isFinite(y)) return true;
    if (era === '2020') return y >= 2020;
    if (era === '2010') return y >= 2010 && y <= 2019;
    if (era === '2000') return y >= 2000 && y <= 2009;
    if (era === '1990') return y < 2000;
    return true;
  }

  function setupFilters() {
    var toolbar = qs('[data-filter-scope]');
    var results = qs('[data-filter-results]');
    if (!toolbar || !results) return;
    var input = qs('[data-filter-input]', toolbar);
    var type = qs('[data-filter-type]', toolbar);
    var era = qs('[data-filter-era]', toolbar);
    var cards = qsa('[data-movie-card]', results);
    var empty = qs('[data-filter-empty]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    if (input && initialQuery) input.value = initialQuery;

    function apply() {
      var query = clean(input && input.value);
      var typeValue = clean(type && type.value);
      var eraValue = era ? era.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = clean([
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-category'),
          card.textContent
        ].join(' '));
        var cardType = clean(card.getAttribute('data-type'));
        var cardYear = card.getAttribute('data-year') || '';
        var matched = (!query || haystack.indexOf(query) !== -1) && (!typeValue || cardType.indexOf(typeValue) !== -1) && eraMatches(cardYear, eraValue);
        card.style.display = matched ? '' : 'none';
        if (matched) visible += 1;
      });
      if (empty) empty.classList.toggle('is-visible', visible === 0);
    }

    [input, type, era].forEach(function (control) {
      if (!control) return;
      control.addEventListener('input', apply);
      control.addEventListener('change', apply);
    });

    apply();
  }

  function loadHlsLibrary() {
    return new Promise(function (resolve) {
      if (window.Hls) {
        resolve(window.Hls);
        return;
      }
      var existing = document.querySelector('script[data-hls-loader]');
      if (existing) {
        existing.addEventListener('load', function () { resolve(window.Hls); });
        existing.addEventListener('error', function () { resolve(null); });
        return;
      }
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
      script.async = true;
      script.setAttribute('data-hls-loader', 'true');
      script.onload = function () { resolve(window.Hls); };
      script.onerror = function () { resolve(null); };
      document.head.appendChild(script);
    });
  }

  window.initializePlayer = function (source) {
    var video = qs('[data-player-video]');
    var cover = qs('[data-player-cover]');
    var trigger = qs('[data-player-trigger]');
    if (!video || !source) return;
    var started = false;
    var hlsInstance = null;

    async function start() {
      if (started) {
        try { await video.play(); } catch (error) {}
        return;
      }
      started = true;
      if (cover) cover.classList.add('is-hidden');
      video.setAttribute('controls', 'controls');
      var nativeHls = video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL');
      if (nativeHls) {
        video.src = source;
      } else {
        var HlsClass = await loadHlsLibrary();
        if (HlsClass && HlsClass.isSupported()) {
          hlsInstance = new HlsClass({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }
      }
      try { await video.play(); } catch (error) {}
    }

    if (cover) cover.addEventListener('click', start);
    if (trigger) trigger.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (!started) start();
    });
    window.addEventListener('pagehide', function () {
      if (hlsInstance && hlsInstance.destroy) hlsInstance.destroy();
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupGlobalSearch();
    setupHeroSlider();
    setupFilters();
  });
})();
