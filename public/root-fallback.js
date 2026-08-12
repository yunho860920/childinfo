(function () {
  function showFallbackError(message) {
    var el = document.getElementById('root-fallback');
    if (!el) return;

    var errEl = document.getElementById('load-error');
    var btnEl = document.getElementById('retry-btn');
    var spinEl = el.querySelector('.spinner');

    if (errEl) {
      errEl.style.display = 'block';
      if (message) {
        errEl.replaceChildren(
          document.createTextNode('앱 로딩 중 오류가 발생했습니다.'),
          document.createElement('br'),
          document.createTextNode('페이지를 새로고침해 주세요.'),
          document.createElement('br')
        );
        var details = document.createElement('small');
        details.style.opacity = '0.5';
        details.style.wordBreak = 'break-all';
        details.textContent = message || 'Unknown Error';
        errEl.appendChild(details);
      }
    }
    if (btnEl) btnEl.style.display = 'inline-block';
    if (spinEl) spinEl.style.display = 'none';
  }

  var retryBtn = document.getElementById('retry-btn');
  if (retryBtn) {
    retryBtn.addEventListener('click', function () {
      window.location.reload();
    });
  }

  window.__rootTimeout = setTimeout(function () {
    showFallbackError();
  }, 10000);

  window.onerror = function (msg, src, line, col, err) {
    console.error('Global error caught:', msg, src, line, col, err);
    clearTimeout(window.__rootTimeout);
    showFallbackError(String(msg || 'Unknown Error'));
  };
})();
