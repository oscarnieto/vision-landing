/* Sección 2: barra de progreso del carril horizontal.
   Sección 4: filtro de ediciones por ciudad. Sin JS se ven todas las tarjetas. */
(function () {
  'use strict';

  /* ---------- Barra de progreso del carril (sección 2) ----------
     Sigue el avance real del carril de ScrollKit (E25). E07 no sirve aquí porque
     mide la sección entera, no el tramo fijado. */
  var wrap = document.querySelector('[data-horizontal]');
  var bar = document.querySelector('.s2-progress__bar');
  if (wrap && bar && window.gsap) {
    var last = -1;
    window.gsap.ticker.add(function () {
      var tween = wrap._skTween;
      var p = tween ? tween.progress() : 0;
      if (Math.abs(p - last) < 0.0005) return;
      last = p;
      bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    });
  }

  /* ---------- Filtro de ediciones (sección 4) ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.ed-card'));
  var marker = document.querySelector('.tabs__active');
  if (!tabs.length || !cards.length) return;
  var group = tabs[0].parentNode;

  // Coloca la línea amarilla bajo la pestaña activa
  function moveMarker(tab) {
    if (!marker || !tab) return;
    marker.style.width = tab.offsetWidth + 'px';
    marker.style.transform = 'translate(' + tab.offsetLeft + 'px, ' + (tab.offsetTop + tab.offsetHeight - group.offsetHeight + 8) + 'px)';
  }

  function apply(city) {
    var active = null;
    tabs.forEach(function (t) {
      var on = t.dataset.filter === city;
      t.setAttribute('aria-pressed', String(on));
      if (on) active = t;
    });
    cards.forEach(function (c) {
      c.hidden = city !== 'all' && c.dataset.city !== city;
    });
    moveMarker(active);
    // La altura de la sección cambia: recalcular los efectos de scroll
    if (window.ScrollKit) window.ScrollKit.refresh();
  }

  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      // Mantener las pestañas en el mismo punto de la pantalla aunque cambie la altura
      var before = group.getBoundingClientRect().top;
      apply(t.dataset.filter);
      if (!window.ScrollTrigger) return;
      window.ScrollTrigger.refresh();
      var delta = group.getBoundingClientRect().top - before;
      if (Math.abs(delta) < 1) return;
      var y = window.scrollY + delta;
      var lenis = window.ScrollKit && window.ScrollKit.lenis;
      if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
      else window.scrollTo(0, y);
    });
  });

  var current = tabs.filter(function (t) { return t.getAttribute('aria-pressed') === 'true'; })[0] || tabs[0];
  apply(current.dataset.filter);

  // Recolocar la línea cuando cargan las fuentes o cambia el ancho
  var reposition = function () {
    moveMarker(tabs.filter(function (t) { return t.getAttribute('aria-pressed') === 'true'; })[0]);
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(reposition);
  window.addEventListener('resize', reposition);
})();
