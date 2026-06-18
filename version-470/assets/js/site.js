(function () {
  const mobileButton = document.querySelector('[data-mobile-menu-button]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (mobileButton && mobilePanel) {
    mobileButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('form[action="search.html"]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      const input = form.querySelector('input[name="q"]');
      if (input && input.value.trim() === '') {
        event.preventDefault();
        input.focus();
      }
    });
  });

  const slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
    const prev = slider.querySelector('[data-hero-prev]');
    const next = slider.querySelector('[data-hero-next]');
    let activeIndex = 0;
    let timer = null;

    const showSlide = function (index) {
      if (!slides.length) {
        return;
      }
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    };

    const start = function () {
      stop();
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 6200);
    };

    const stop = function () {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(activeIndex - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(activeIndex + 1);
        start();
      });
    }

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    showSlide(0);
    start();
  }

  const filterInput = document.querySelector('[data-list-filter]');
  const cardGrid = document.querySelector('[data-card-grid]');

  if (filterInput && cardGrid) {
    filterInput.addEventListener('input', function () {
      const keyword = filterInput.value.trim().toLowerCase();
      const cards = Array.from(cardGrid.querySelectorAll('[data-movie-card]'));
      cards.forEach(function (card) {
        const haystack = [
          card.dataset.title || '',
          card.dataset.category || '',
          card.textContent || ''
        ].join(' ').toLowerCase();
        card.classList.toggle('is-hidden-by-filter', keyword !== '' && !haystack.includes(keyword));
      });
    });
  }

  if (cardGrid) {
    document.querySelectorAll('[data-sort]').forEach(function (button) {
      button.addEventListener('click', function () {
        const type = button.dataset.sort;
        const cards = Array.from(cardGrid.querySelectorAll('[data-movie-card]'));
        const sorted = cards.sort(function (a, b) {
          if (type === 'popular') {
            return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
          }
          if (type === 'title') {
            return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-Hans-CN');
          }
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        });
        sorted.forEach(function (card) {
          cardGrid.appendChild(card);
        });
        document.querySelectorAll('[data-sort]').forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
      });
    });
  }
})();
