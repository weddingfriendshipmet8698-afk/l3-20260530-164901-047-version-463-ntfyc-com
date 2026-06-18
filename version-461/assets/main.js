(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');
    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"], input[type="search"]');
            if (!input) {
                return;
            }
            var keyword = input.value.trim();
            if (!keyword) {
                event.preventDefault();
                input.focus();
                return;
            }
            if (location.pathname.endsWith('/search.html') || location.pathname.endsWith('search.html')) {
                event.preventDefault();
                applyFilter(keyword);
                var pageInput = document.querySelector('[data-search-page-input]');
                var pageFilter = document.querySelector('[data-search-page-filter]');
                if (pageInput) {
                    pageInput.value = keyword;
                }
                if (pageFilter) {
                    pageFilter.value = keyword;
                }
                history.replaceState(null, '', 'search.html?q=' + encodeURIComponent(keyword));
            }
        });
    });

    function applyFilter(keyword) {
        var query = (keyword || '').trim().toLowerCase();
        var cards = document.querySelectorAll('[data-card]');
        var visible = 0;
        cards.forEach(function (card) {
            var haystack = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
            var matched = !query || haystack.indexOf(query) !== -1;
            card.classList.toggle('is-filter-hidden', !matched);
            if (matched) {
                visible += 1;
            }
        });
        var emptyTip = document.querySelector('[data-empty-tip]');
        if (emptyTip) {
            emptyTip.hidden = visible !== 0;
        }
    }

    document.querySelectorAll('[data-local-filter]').forEach(function (input) {
        input.addEventListener('input', function () {
            applyFilter(input.value);
        });
    });

    var params = new URLSearchParams(location.search);
    var q = params.get('q');
    if (q) {
        var searchInput = document.querySelector('[data-search-page-input]');
        var searchFilter = document.querySelector('[data-search-page-filter]');
        if (searchInput) {
            searchInput.value = q;
        }
        if (searchFilter) {
            searchFilter.value = q;
        }
        applyFilter(q);
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;
        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }
        function startTimer() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startTimer();
            });
        });
        if (slides.length > 1) {
            startTimer();
        }
    }

    var video = document.getElementById('movie-player');
    var button = document.querySelector('[data-player-button]');
    if (video && typeof playerSource === 'string' && playerSource) {
        var hlsInstance = null;
        function attachSource() {
            if (video.getAttribute('data-ready') === '1') {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = playerSource;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hlsInstance.loadSource(playerSource);
                hlsInstance.attachMedia(video);
            } else {
                video.src = playerSource;
            }
            video.setAttribute('data-ready', '1');
        }
        function startVideo() {
            attachSource();
            if (button) {
                button.classList.add('is-hidden');
            }
            var playResult = video.play();
            if (playResult && typeof playResult.catch === 'function') {
                playResult.catch(function () {});
            }
        }
        if (button) {
            button.addEventListener('click', startVideo);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                startVideo();
            }
        });
        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('is-hidden');
            }
        });
        video.addEventListener('ended', function () {
            if (button) {
                button.classList.remove('is-hidden');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }
})();
