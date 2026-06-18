(function() {
  var menuButton = document.querySelector('[data-menu-button]');
  var nav = document.getElementById('site-nav');

  if (menuButton && nav) {
    menuButton.addEventListener('click', function() {
      nav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero-carousel]').forEach(function(carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function activate(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        activate(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function() {
        activate(current + 1);
      }, 6000);
    }
  });

  document.querySelectorAll('[data-filter-root]').forEach(function(root) {
    var search = root.querySelector('[data-filter-search]');
    var year = root.querySelector('[data-filter-year]');
    var type = root.querySelector('[data-filter-type]');
    var region = root.querySelector('[data-filter-region]');
    var cards = Array.prototype.slice.call(root.querySelectorAll('[data-movie-card]'));
    var empty = root.querySelector('[data-empty-state]');

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function matches(card) {
      var query = normalize(search && search.value);
      var selectedYear = normalize(year && year.value);
      var selectedType = normalize(type && type.value);
      var selectedRegion = normalize(region && region.value);
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' '));
      var ok = true;

      if (query) {
        ok = ok && haystack.indexOf(query) !== -1;
      }
      if (selectedYear) {
        ok = ok && normalize(card.getAttribute('data-year')) === selectedYear;
      }
      if (selectedType) {
        ok = ok && normalize(card.getAttribute('data-type')) === selectedType;
      }
      if (selectedRegion) {
        ok = ok && normalize(card.getAttribute('data-region')) === selectedRegion;
      }
      return ok;
    }

    function applyFilter() {
      var visible = 0;
      cards.forEach(function(card) {
        var show = matches(card);
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [search, year, type, region].forEach(function(control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  });
})();
