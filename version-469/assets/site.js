(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function normalize(text) {
    return String(text || "").toLowerCase().trim();
  }

  function getPrefix() {
    return document.body.getAttribute("data-root") || "./";
  }

  ready(function () {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".site-nav");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length > 1) {
      var current = 0;
      var show = function (index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === current);
        });
      };
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
        });
      });
      window.setInterval(function () {
        show(current + 1);
      }, 5600);
      show(0);
    }

    Array.prototype.slice.call(document.querySelectorAll(".site-search-form")).forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[type='search'], input[name='q']");
        var query = input ? input.value.trim() : "";
        if (query) {
          window.location.href = getPrefix() + "search.html?q=" + encodeURIComponent(query);
        }
      });
    });

    var filterBox = document.querySelector("[data-filter-input]");
    var yearBox = document.querySelector("[data-filter-year]");
    var typeBox = document.querySelector("[data-filter-type]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-search]"));
    var filterCards = function () {
      var keyword = normalize(filterBox && filterBox.value);
      var year = normalize(yearBox && yearBox.value);
      var type = normalize(typeBox && typeBox.value);
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var cardType = normalize(card.getAttribute("data-type"));
        var visible = true;
        if (keyword && text.indexOf(keyword) === -1) {
          visible = false;
        }
        if (year && cardYear !== year) {
          visible = false;
        }
        if (type && cardType !== type) {
          visible = false;
        }
        card.style.display = visible ? "" : "none";
      });
    };
    if (filterBox || yearBox || typeBox) {
      [filterBox, yearBox, typeBox].forEach(function (control) {
        if (control) {
          control.addEventListener("input", filterCards);
          control.addEventListener("change", filterCards);
        }
      });
      filterCards();
    }

    var searchRoot = document.querySelector("[data-search-results]");
    if (searchRoot && window.MOVIE_SEARCH_INDEX) {
      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q") || "";
      var input = document.querySelector("[data-search-page-input]");
      if (input) {
        input.value = initial;
      }
      var render = function () {
        var q = normalize(input && input.value);
        var items = window.MOVIE_SEARCH_INDEX.filter(function (item) {
          if (!q) {
            return item.hot;
          }
          return normalize(item.title + " " + item.year + " " + item.region + " " + item.type + " " + item.genre + " " + item.tags + " " + item.oneLine).indexOf(q) !== -1;
        }).slice(0, 80);
        if (!items.length) {
          searchRoot.innerHTML = '<div class="empty-state">没有找到匹配结果</div>';
          return;
        }
        searchRoot.innerHTML = items.map(function (item) {
          return '<article class="movie-card" data-search="' + item.safeSearch + '" data-year="' + item.year + '" data-type="' + item.type + '">' +
            '<a class="poster-wrap" href="' + item.url + '">' +
            '<img src="' + item.cover + '" alt="' + item.title + '" loading="lazy">' +
            '<span class="poster-badge">' + item.year + ' · ' + item.type + '</span>' +
            '</a>' +
            '<div class="card-body">' +
            '<h2 class="card-title"><a href="' + item.url + '">' + item.title + '</a></h2>' +
            '<p class="card-copy">' + item.oneLine + '</p>' +
            '<div class="card-meta"><span>' + item.region + '</span><span>·</span><span>' + item.genre + '</span></div>' +
            '</div>' +
            '</article>';
        }).join("");
      };
      if (input) {
        input.addEventListener("input", render);
      }
      render();
    }
  });
})();
