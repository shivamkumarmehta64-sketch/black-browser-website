/* Shared site script: PostHog analytics + GitHub release fetcher */
(function () {
  'use strict';

  /* ---------- PostHog ---------- */
  if (window.posthog && typeof window.posthog.init === 'function') {
    window.posthog.init('phc_kVSLe9S9kJvDtkdZh4PtzcvA93DLwcUa8E2odXrFsJpJ', {
      api_host: 'https://us.i.posthog.com',
      disable_session_recording: true,
      capture_dead_clicks: false,
      capture_heatmaps: false,
    });
  }

  /* ---------- GitHub releases ---------- */
  var API = 'https://api.github.com/repos/';
  var FALLBACK = function (repo) { return 'https://github.com/' + repo + '/releases'; };

  function pickAsset(assets, exts) {
    for (var i = 0; i < exts.length; i++) {
      var a = assets.find(function (x) { return x.name.toLowerCase().endsWith(exts[i]); });
      if (a) return a;
    }
    return null;
  }

  function fmt(n) {
    if (n == null) return '';
    return n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n);
  }

  function wireRelease(rel, repo) {
    var v = rel.tag_name || rel.name || 'latest';

    /* version badges: <span data-version="owner/repo"> */
    document.querySelectorAll('[data-version="' + repo + '"]').forEach(function (el) {
      el.textContent = v;
    });

    /* download links: <a data-download="owner/repo" data-exts=".exe,.zip"> */
    document.querySelectorAll('[data-download="' + repo + '"]').forEach(function (el) {
      var exts = (el.getAttribute('data-exts') || '.exe,.zip').split(',');
      var asset = pickAsset(rel.assets || [], exts);
      if (asset) {
        el.href = asset.browser_download_url;
        el.setAttribute('download', '');
      } else {
        el.href = FALLBACK(repo);
      }
    });

    /* meta line: <span data-meta="owner/repo"> v2.1.0 · 12.3k downloads */
    document.querySelectorAll('[data-meta="' + repo + '"]').forEach(function (el) {
      var total = (rel.assets || []).reduce(function (s, a) { return s + (a.download_count || 0); }, 0);
      el.textContent = v + (total > 0 ? ' \u00b7 ' + fmt(total) + ' downloads' : '');
    });
  }

  function fetchRepo(repo) {
    return fetch(API + repo + '/releases', { headers: { Accept: 'application/vnd.github+json' } })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (list) {
        return Array.isArray(list) && list.length ? list[0] : null;
      });
  }

  var repos = new Set();
  document.querySelectorAll('[data-version], [data-download], [data-meta]').forEach(function (el) {
    var repo = el.getAttribute('data-version') || el.getAttribute('data-download') || el.getAttribute('data-meta');
    if (repo) repos.add(repo);
  });

  repos.forEach(function (repo) {
    fetchRepo(repo)
      .then(function (rel) { if (rel) wireRelease(rel, repo); })
      .catch(function () { /* keep default GitHub fallback hrefs */ });
  });
})();
