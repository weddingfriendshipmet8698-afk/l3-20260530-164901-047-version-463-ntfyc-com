(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function bindMobileMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function bindSearchForms() {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        if (query) {
          var root = form.getAttribute("data-root") || "";
          window.location.href = root + "search.html?q=" + encodeURIComponent(query);
        }
      });
    });
  }

  function bindHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var activate = function (nextIndex) {
      index = nextIndex;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    };
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        activate(dotIndex);
      });
    });
    window.setInterval(function () {
      activate((index + 1) % slides.length);
    }, 5200);
  }

  function bindPlayer() {
    var video = document.getElementById("movieVideo");
    var cover = document.querySelector("[data-video-cover]");
    var button = document.querySelector("[data-play-button]");
    var videoUrl = window.currentVideoUrl;
    if (!video || !videoUrl) {
      return;
    }
    var hlsInstance = null;
    var started = false;
    var start = function () {
      if (started) {
        video.play();
        return;
      }
      started = true;
      if (cover) {
        cover.classList.add("is-hidden");
      }
      video.controls = true;
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(videoUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play();
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal && hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoUrl;
        video.addEventListener("loadedmetadata", function () {
          video.play();
        }, { once: true });
        video.load();
      }
    };
    if (button) {
      button.addEventListener("click", start);
    }
    if (cover) {
      cover.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (!started) {
        start();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  function htmlEscape(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function setupSearchPage() {
    var input = document.getElementById("searchPageInput");
    var results = document.getElementById("searchResults");
    if (!input || !results || !window.movieSearchData) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;
    var render = function (query) {
      var keyword = query.trim().toLowerCase();
      var items = keyword
        ? window.movieSearchData.filter(function (movie) {
            return movie.text.indexOf(keyword) !== -1;
          }).slice(0, 120)
        : window.movieSearchData.slice(0, 48);
      var heading = document.getElementById("searchHeading");
      if (heading) {
        heading.textContent = keyword ? "搜索结果" : "热门推荐";
      }
      results.innerHTML = items.map(function (movie) {
        return [
          '<a class="movie-card" href="' + movie.url + '">',
          '<div class="poster-frame" style="--cover: url(' + movie.cover + ');">',
          '<span class="movie-badge">' + htmlEscape(movie.year) + '</span>',
          '<span class="play-circle">▶</span>',
          '</div>',
          '<div class="card-body">',
          '<h3 class="card-title">' + htmlEscape(movie.title) + '</h3>',
          '<div class="card-meta"><span>' + htmlEscape(movie.region) + '</span><span>·</span><span>' + htmlEscape(movie.type) + '</span></div>',
          '<p class="card-line">' + htmlEscape(movie.line) + '</p>',
          '</div>',
          '</a>'
        ].join('');
      }).join('');
      if (!items.length) {
        results.innerHTML = '<div class="content-card"><h2>未找到相关内容</h2><p>可以尝试更换影片名称、类型或关键词。</p></div>';
      }
    };
    render(initial);
    input.addEventListener("input", function () {
      render(input.value);
    });
  }

  ready(function () {
    bindMobileMenu();
    bindSearchForms();
    bindHero();
    bindPlayer();
    setupSearchPage();
  });
})();
