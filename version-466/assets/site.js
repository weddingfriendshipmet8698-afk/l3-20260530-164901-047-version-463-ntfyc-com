(function () {
  function setupMobileMenu() {
    var button = document.querySelector('[data-menu-button]');
    var nav = document.querySelector('[data-mobile-nav]');

    if (!button || !nav) {
      return;
    }

    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      button.textContent = nav.classList.contains('is-open') ? '×' : '☰';
    });
  }

  function setupHeroCarousel() {
    var carousel = document.querySelector('[data-hero-carousel]');

    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;
    var timer = null;

    function activate(index) {
      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    function start() {
      if (slides.length < 2) {
        return;
      }

      timer = window.setInterval(function () {
        activate(activeIndex + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        stop();
        activate(index);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    activate(0);
    start();
  }

  function setupGridFilter() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

    panels.forEach(function (panel) {
      var input = panel.querySelector('[data-grid-search]');
      var grid = panel.parentElement.querySelector('[data-filter-grid]');

      if (!input || !grid) {
        return;
      }

      var cards = Array.prototype.slice.call(grid.children);

      input.addEventListener('input', function () {
        var keyword = input.value.trim().toLowerCase();

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-year') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-genre') || '',
            card.textContent || ''
          ].join(' ').toLowerCase();

          card.classList.toggle('is-hidden-by-filter', keyword && haystack.indexOf(keyword) === -1);
        });
      });
    });
  }

  function setupImageFallback() {
    var images = Array.prototype.slice.call(document.querySelectorAll('img'));

    images.forEach(function (image) {
      image.addEventListener('error', function () {
        image.style.opacity = '0.15';
        image.style.background = 'linear-gradient(135deg, #111827, #dc2626)';
      }, { once: true });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupGridFilter();
    setupImageFallback();
  });
})();
