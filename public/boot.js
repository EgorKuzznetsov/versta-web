// Runs before the app (kept as a file so the Content-Security-Policy can forbid inline scripts).
(function () {
  try { if (matchMedia('(prefers-reduced-motion: reduce)').matches) document.documentElement.classList.add('rm'); } catch (e) {}
  // web fonts are requested as media="print" (non-blocking) and switched on once loaded
  var f = document.getElementById('fonts');
  if (f) { if (f.sheet) f.media = 'all'; else f.addEventListener('load', function () { f.media = 'all'; }); }
})();
