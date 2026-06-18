(function () {
  var form = document.querySelector('[data-search-form]');
  var input = document.querySelector('[data-search-input]');
  var status = document.querySelector('[data-search-status]');
  var results = document.querySelector('[data-search-results]');
  var data = window.MOVIE_SEARCH_DATA || [];

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function createCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="poster-link" href="' + escapeHtml(movie.detailPath) + '" aria-label="' + escapeHtml(movie.title) + '">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="poster-play">▶</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <h3><a href="' + escapeHtml(movie.detailPath) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p class="movie-line">' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="movie-meta">',
      '      <span>' + escapeHtml(movie.year) + '</span>',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(movie.type) + '</span>',
      '    </div>',
      '    <div class="movie-tags">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('\n');
  }

  function runSearch(query) {
    var keyword = String(query || '').trim().toLowerCase();

    if (!keyword) {
      status.textContent = '请输入关键词开始搜索。';
      results.innerHTML = '';
      return;
    }

    var matched = data.filter(function (movie) {
      var haystack = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.category,
        (movie.tags || []).join(' '),
        movie.oneLine,
        movie.summary
      ].join(' ').toLowerCase();

      return haystack.indexOf(keyword) !== -1;
    }).slice(0, 120);

    status.textContent = '搜索 “' + keyword + '” ，找到 ' + matched.length + ' 条结果。';
    results.innerHTML = matched.map(createCard).join('\n');
  }

  function syncFromLocation() {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (input) {
      input.value = query;
    }

    runSearch(query);
  }

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input ? input.value.trim() : '';
      var url = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
      history.pushState(null, '', url);
      runSearch(query);
    });
  }

  window.addEventListener('popstate', syncFromLocation);
  document.addEventListener('DOMContentLoaded', syncFromLocation);
  syncFromLocation();
})();
