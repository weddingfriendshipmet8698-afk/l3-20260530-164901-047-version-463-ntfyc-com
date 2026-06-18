(function () {
  const params = new URLSearchParams(window.location.search);
  const keyword = (params.get('q') || '').trim();
  const status = document.getElementById('search-status');
  const results = document.getElementById('search-results');
  const pageInput = document.querySelector('.page-search-form input[name="q"]');
  const headerInput = document.querySelector('.header-search input[name="q"]');

  if (pageInput) {
    pageInput.value = keyword;
  }

  if (headerInput) {
    headerInput.value = keyword;
  }

  if (!keyword || !results || !Array.isArray(window.SEARCH_MOVIES)) {
    return;
  }

  const normalized = keyword.toLowerCase();
  const matched = window.SEARCH_MOVIES.filter(function (movie) {
    const haystack = [
      movie.title,
      movie.oneLine,
      movie.summary,
      movie.region,
      movie.type,
      movie.year,
      movie.genre,
      movie.category,
      (movie.tags || []).join(' ')
    ].join(' ').toLowerCase();
    return haystack.includes(normalized);
  });

  const createCard = function (movie) {
    const tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<a class="movie-card" href="' + escapeHtml(movie.href) + '">',
      '  <div class="movie-cover" style="background-image: linear-gradient(180deg, rgba(15, 23, 42, 0.06), rgba(15, 23, 42, 0.58)), url(\'' + escapeHtml(movie.cover) + '\');">',
      '    <span class="cover-badge">' + escapeHtml(movie.category) + '</span>',
      '    <span class="cover-duration">' + escapeHtml(movie.duration) + '</span>',
      '  </div>',
      '  <div class="movie-card-body">',
      '    <h3>' + escapeHtml(movie.title) + '</h3>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="movie-meta">',
      '      <span>' + escapeHtml(movie.year) + '</span>',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + Number(movie.views).toLocaleString() + '次</span>',
      '    </div>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</a>'
    ].join('');
  };

  results.innerHTML = matched.slice(0, 240).map(createCard).join('');

  if (status) {
    status.textContent = matched.length > 0
      ? '关键词“' + keyword + '”找到 ' + matched.length + ' 个相关结果'
      : '未找到“' + keyword + '”相关影片，换个关键词试试';
  }

  if (matched.length === 0) {
    results.innerHTML = '<div class="search-status">没有匹配结果，可返回分类总览继续浏览。</div>';
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();
