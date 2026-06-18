(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var prev = document.querySelector('.hero-prev');
  var next = document.querySelector('.hero-next');
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === current);
    });

    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === current);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }

    clearInterval(timer);
    timer = setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-goto') || 0));
      startHero();
    });
  });

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(current - 1);
      startHero();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(current + 1);
      startHero();
    });
  }

  startHero();

  var searchInput = document.querySelector('.movie-search');
  var filters = Array.prototype.slice.call(document.querySelectorAll('.filter-select'));

  function applyFilters() {
    var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var values = {};

    filters.forEach(function (filter) {
      values[filter.getAttribute('data-filter')] = filter.value;
    });

    Array.prototype.slice.call(document.querySelectorAll('[data-search-scope] .movie-card')).forEach(function (card) {
      var text = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-type'),
        card.getAttribute('data-genre')
      ].join(' ').toLowerCase();

      var matchQuery = !query || text.indexOf(query) !== -1;
      var matchType = !values.type || (card.getAttribute('data-type') || '').indexOf(values.type) !== -1 || (card.getAttribute('data-genre') || '').indexOf(values.type) !== -1;
      var matchYear = !values.year || card.getAttribute('data-year') === values.year;

      card.classList.toggle('is-hidden', !(matchQuery && matchType && matchYear));
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  filters.forEach(function (filter) {
    filter.addEventListener('change', applyFilters);
  });

  Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(function (shell) {
    var video = shell.querySelector('video');
    var cover = shell.querySelector('.player-cover');

    if (!video || !cover) {
      return;
    }

    var stream = video.getAttribute('data-stream');
    var hlsInstance = null;

    function loadVideo() {
      if (!stream) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (!video.src) {
          video.src = stream;
        }
      } else if (window.Hls && window.Hls.isSupported()) {
        if (!hlsInstance) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        }
      } else if (!video.src) {
        video.src = stream;
      }
    }

    function playVideo() {
      loadVideo();
      cover.classList.add('is-hidden');
      var playing = video.play();

      if (playing && typeof playing.catch === 'function') {
        playing.catch(function () {});
      }
    }

    cover.addEventListener('click', playVideo);
    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });
  });
})();
