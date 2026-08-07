/* Shared site script: PostHog analytics + GitHub live stats + page transitions + scroll reveal */
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

  /* ---------- Page enter animation ---------- */
  document.body.classList.add('page-enter');
  setTimeout(function () { document.body.classList.remove('page-enter'); }, 500);

  /* ---------- Scroll reveal ---------- */
  var reveal = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveal.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('revealed'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    reveal.forEach(function (el) { io.observe(el); });
  } else {
    reveal.forEach(function (el) { el.classList.add('revealed'); });
  }

  /* ---------- Page-to-page transition ---------- */
  (function () {
    var fade = document.createElement('div');
    fade.id = 'page-fade';
    document.body.appendChild(fade);

    function isInternal(url) {
      var a = document.createElement('a');
      a.href = url;
      return a.origin === location.origin;
    }

    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href]');
      if (!a) return;
      if (a.target && a.target !== '_self') return;
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (!isInternal(a.href)) return;
      var dest = a.href;
      if (dest === location.href) return;

      e.preventDefault();
      document.body.classList.add('page-leaving');
      setTimeout(function () { window.location.href = dest; }, 300);
    });
  })();

  /* ---------- GitHub helpers ---------- */
  var API = 'https://api.github.com/repos/';
  var FALLBACK = function (repo) { return 'https://github.com/' + repo + '/releases'; };

  function pickAsset(assets, exts) {
    for (var i = 0; i < exts.length; i++) {
      var a = assets.find(function (x) { return x.name.toLowerCase().endsWith(exts[i]); });
      if (a) return a;
    }
    return null;
  }

  function fmtK(n) {
    if (n == null) return '';
    return n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n);
  }

  function ago(iso) {
    if (!iso) return '';
    var d = (Date.now() - new Date(iso).getTime()) / 86400000;
    if (d < 1) return 'today';
    if (d < 30) return Math.floor(d) + 'd ago';
    if (d < 365) return Math.floor(d / 30) + 'mo ago';
    return (d / 365).toFixed(1) + 'y ago';
  }

  /* Replace [data-stat="stars|forks|issues|lang|updated|size|desc"] within [data-repo] scope */
  function wireRepo(repo, r) {
    var scope = document.querySelectorAll('[data-repo="' + repo + '"]');
    if (!scope.length) return;

    scope.forEach(function (root) {
      var set = function (sel, txt) {
        var el = root.querySelector(sel);
        if (el && txt) el.textContent = txt;
      };
      set('[data-stat="stars"]', fmtK(r.stargazers_count));
      set('[data-stat="lang"]', r.language);
      set('[data-stat="updated"]', ago(r.pushed_at));
      set('[data-stat="desc"]', r.description);
      if (r.license && r.license.spdx_id) set('[data-stat="license"]', r.license.spdx_id);
      root.querySelectorAll('[data-repo-href]').forEach(function (a) { a.href = r.html_url; });
    });
  }

  function fetchJson(url) {
    return fetch(url, { headers: { Accept: 'application/vnd.github+json' } })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
  }

  var repoScopes = new Set();
  document.querySelectorAll('[data-repo]').forEach(function (el) { repoScopes.add(el.getAttribute('data-repo')); });

  repoScopes.forEach(function (repo) {
    fetchJson(API + repo).then(function (meta) { if (meta && !meta.message) wireRepo(repo, meta); }).catch(function () {});
  });

  /* ---------- Releases (version badges + download links) ---------- */
  function wireRelease(rel, repo) {
    var v = rel.tag_name || rel.name || 'latest';

    /* version badges: <span data-version="owner/repo"> */
    document.querySelectorAll('[data-version="' + repo + '"]').forEach(function (el) {
      el.textContent = v;
    });

    /* download links: <a data-download="owner/repo" data-exts=".exe,.zip"> */
    document.querySelectorAll('[data-download="' + repo + '"]').forEach(function (el) {
      var exts = (el.getAttribute('data-exts') || '.exe,.zip').split(',');
      var asset = pickAsset(rel.assets, exts);
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
      el.textContent = v + (total > 0 ? ' \u00b7 ' + fmtK(total) + ' downloads' : '');
    });
  }

  function fetchRepo(repo) {
    return fetchJson(API + repo + '/releases')
      .then(function (list) { return Array.isArray(list) && list.length ? list[0] : null; });
  }

  var repos = new Set();
  document.querySelectorAll('[data-version], [data-download], [data-meta]').forEach(function (el) {
    var repo = el.getAttribute('data-version') || el.getAttribute('data-download') || el.getAttribute('data-meta');
    if (repo) repos.add(repo);
  });

  repos.forEach(function (repo) {
    fetchRepo(repo)
      .then(function (rel) { if (rel) wireRelease(rel, repo); })
      .catch(function () {});
  });
})();