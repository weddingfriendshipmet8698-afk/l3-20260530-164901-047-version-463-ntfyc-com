(function() {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function() {
      var open = menuButton.classList.toggle('is-open');
      mobileNav.classList.toggle('is-open', open);
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = setInterval(function() {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function() {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function() {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function setupSearch() {
    var input = document.querySelector('[data-search-input]');
    var yearSelect = document.querySelector('[data-year-filter]');
    var categorySelect = document.querySelector('[data-category-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var empty = document.querySelector('[data-empty-state]');

    if (!cards.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q');
    if (input && initial) {
      input.value = initial;
    }

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var category = categorySelect ? categorySelect.value : '';
      var visible = 0;

      cards.forEach(function(card) {
        var haystack = (card.getAttribute('data-search') || '').toLowerCase();
        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesYear = !year || card.getAttribute('data-year') === year || haystack.indexOf(year.toLowerCase()) !== -1;
        var matchesCategory = !category || haystack.indexOf(category.toLowerCase()) !== -1;
        var show = matchesKeyword && matchesYear && matchesCategory;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', apply);
    }
    if (categorySelect) {
      categorySelect.addEventListener('change', apply);
    }
    apply();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function(player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-play-button]');
      if (!video || !button) {
        return;
      }

      var url = video.getAttribute('data-stream');

      function attach() {
        if (video.getAttribute('data-ready') === '1') {
          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(url);
          hls.attachMedia(video);
          video._hls = hls;
        } else {
          video.src = url;
        }

        video.setAttribute('data-ready', '1');
      }

      function play() {
        attach();
        button.hidden = true;
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function() {
            button.hidden = false;
          });
        }
      }

      button.addEventListener('click', play);
      video.addEventListener('click', function() {
        if (!video.getAttribute('data-ready') || video.paused) {
          play();
        }
      });
      video.addEventListener('play', function() {
        button.hidden = true;
      });
      video.addEventListener('pause', function() {
        if (!video.currentTime) {
          button.hidden = false;
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    setupHero();
    setupSearch();
    setupPlayers();
  });
})();
