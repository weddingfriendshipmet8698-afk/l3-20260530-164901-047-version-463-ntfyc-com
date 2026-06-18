(function () {
  var root = document.documentElement.getAttribute('data-root') || '';

  function resolvePath(path) {
    if (!path) {
      return root;
    }
    if (/^(https?:)?\/\//.test(path) || path.charAt(0) === '/') {
      return path;
    }
    return root + path;
  }

  function setupMobileMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        restart();
      });
    });

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    show(0);
    restart();
  }

  function setupImages() {
    Array.prototype.slice.call(document.querySelectorAll('.poster-box img, .detail-side img, .hero-bg, .hero-poster')).forEach(function (img) {
      img.addEventListener('error', function () {
        var poster = img.closest('.poster-box');
        if (poster) {
          poster.classList.add('no-image');
        }
        img.style.opacity = '0';
      });
    });
  }

  function setupCategoryFilter() {
    var grid = document.querySelector('[data-filter-grid]');
    if (!grid) {
      return;
    }
    var keyword = document.querySelector('[data-filter-keyword]');
    var region = document.querySelector('[data-filter-region]');
    var type = document.querySelector('[data-filter-type]');
    var year = document.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));

    function apply() {
      var q = (keyword && keyword.value || '').trim().toLowerCase();
      var r = region && region.value || '';
      var t = type && type.value || '';
      var y = year && year.value || '';

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-genre')).toLowerCase();
        var ok = true;
        if (q && text.indexOf(q) === -1) {
          ok = false;
        }
        if (r && card.getAttribute('data-region') !== r) {
          ok = false;
        }
        if (t && card.getAttribute('data-type') !== t) {
          ok = false;
        }
        if (y && card.getAttribute('data-year') !== y) {
          ok = false;
        }
        card.classList.toggle('hidden-by-filter', !ok);
      });
    }

    [keyword, region, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  }

  function setupSearchPage() {
    var result = document.querySelector('[data-search-results]');
    if (!result || !window.MOVIES) {
      return;
    }
    var input = document.querySelector('[data-search-page-input]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (input) {
      input.value = initial;
    }

    function render() {
      var q = (input && input.value || '').trim().toLowerCase();
      if (!q) {
        result.innerHTML = '<div class="search-empty">输入关键词后，可以按片名、地区、类型、标签和剧情简介检索影片。</div>';
        return;
      }
      var matches = window.MOVIES.filter(function (movie) {
        var haystack = [movie.title, movie.region, movie.type, movie.genre, movie.tags, movie.oneLine, movie.summary].join(' ').toLowerCase();
        return haystack.indexOf(q) !== -1;
      }).slice(0, 120);

      if (!matches.length) {
        result.innerHTML = '<div class="search-empty">没有找到匹配的影片，请换一个关键词。</div>';
        return;
      }

      result.innerHTML = '<div class="grid movie-grid">' + matches.map(function (movie) {
        return '' +
          '<a class="movie-card" href="' + resolvePath(movie.detailPath) + '">' +
            '<div class="poster-box">' +
              '<img src="' + resolvePath(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
              '<span class="poster-fallback">' + escapeHtml(movie.title) + '</span>' +
              '<span class="badge">' + escapeHtml(movie.year) + '</span>' +
              '<span class="poster-overlay"><span class="play-symbol">▶</span></span>' +
            '</div>' +
            '<h3 class="movie-title">' + escapeHtml(movie.title) + '</h3>' +
            '<p class="movie-meta">' + escapeHtml(movie.genre) + '</p>' +
          '</a>';
      }).join('') + '</div>';
      setupImages();
    }

    if (input) {
      input.addEventListener('input', render);
    }
    render();
  }

  function setupPlayer() {
    var video = document.querySelector('[data-player-video]');
    if (!video) {
      return;
    }
    var source = video.getAttribute('data-src');
    var playButton = document.querySelector('[data-action="play-video"]');
    var likeButton = document.querySelector('[data-action="toggle-like"]');
    var movieId = video.getAttribute('data-movie-id');
    var hlsInstance = null;

    function attachSource() {
      if (!source || video.getAttribute('data-source-attached') === '1') {
        return;
      }
      video.setAttribute('data-source-attached', '1');
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    attachSource();

    if (playButton) {
      playButton.addEventListener('click', function () {
        attachSource();
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      });
    }

    video.addEventListener('play', function () {
      if (playButton) {
        playButton.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (playButton && video.currentTime === 0) {
        playButton.classList.remove('is-hidden');
      }
    });

    if (likeButton && movieId) {
      var liked = JSON.parse(localStorage.getItem('likedMovies') || '[]');
      likeButton.classList.toggle('active', liked.indexOf(movieId) !== -1);
      likeButton.addEventListener('click', function () {
        var list = JSON.parse(localStorage.getItem('likedMovies') || '[]');
        var index = list.indexOf(movieId);
        if (index === -1) {
          list.push(movieId);
          likeButton.classList.add('active');
          likeButton.textContent = '已收藏';
        } else {
          list.splice(index, 1);
          likeButton.classList.remove('active');
          likeButton.textContent = '收藏影片';
        }
        localStorage.setItem('likedMovies', JSON.stringify(list));
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHero();
    setupImages();
    setupCategoryFilter();
    setupSearchPage();
    setupPlayer();
  });
})();
