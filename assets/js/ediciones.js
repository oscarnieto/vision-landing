/* Filtro de ediciones por ciudad (sección 4). Sin JS se ven todas las tarjetas. */
(function () {
  'use strict';

  var filters = Array.prototype.slice.call(document.querySelectorAll('.filter'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.card'));
  if (!filters.length || !cards.length) return;

  var bar = filters[0].parentNode;

  function apply(city) {
    filters.forEach(function (f) {
      f.setAttribute('aria-pressed', String(f.dataset.filter === city));
    });
    cards.forEach(function (c) {
      c.hidden = city !== 'all' && c.dataset.city !== city;
    });
    // La altura de la sección cambia: recalcular los efectos de scroll
    if (window.ScrollKit) window.ScrollKit.refresh();
  }

  filters.forEach(function (f) {
    f.addEventListener('click', function () {
      // Mantener los botones en el mismo punto de la pantalla aunque cambie la altura
      var before = bar.getBoundingClientRect().top;
      apply(f.dataset.filter);
      if (!window.ScrollTrigger) return;
      window.ScrollTrigger.refresh();
      var delta = bar.getBoundingClientRect().top - before;
      if (Math.abs(delta) < 1) return;
      var y = window.scrollY + delta;
      var lenis = window.ScrollKit && window.ScrollKit.lenis;
      if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
      else window.scrollTo(0, y);
    });
  });

  var active = filters.filter(function (f) { return f.getAttribute('aria-pressed') === 'true'; })[0];
  apply(active ? active.dataset.filter : 'all');
})();
