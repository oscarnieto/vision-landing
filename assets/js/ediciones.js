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
  var gsap = window.gsap;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function activeTab() {
    return tabs.filter(function (t) { return t.getAttribute('aria-pressed') === 'true'; })[0] || tabs[0];
  }

  // Coloca la línea amarilla bajo una pestaña (la activa, o la que tiene el ratón encima)
  function moveMarker(tab) {
    if (!marker || !tab) return;
    marker.style.width = tab.offsetWidth + 'px';
    marker.style.transform = 'translate(' + tab.offsetLeft + 'px, ' + (tab.offsetTop + tab.offsetHeight - group.offsetHeight + 8) + 'px)';
  }

  function visible() {
    return cards.filter(function (c) { return !c.hidden; });
  }

  // Muestra solo las tarjetas de la ciudad y mantiene las pestañas en el mismo punto de la pantalla
  function swap(city) {
    var before = group.getBoundingClientRect().top;
    cards.forEach(function (c) {
      c.hidden = city !== 'all' && c.dataset.city !== city;
    });
    if (!window.ScrollTrigger) return;
    window.ScrollTrigger.refresh();
    var delta = group.getBoundingClientRect().top - before;
    if (Math.abs(delta) < 1) return;
    var y = window.scrollY + delta;
    var lenis = window.ScrollKit && window.ScrollKit.lenis;
    if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
    else window.scrollTo(0, y);
  }

  function select(city, animate) {
    tabs.forEach(function (t) { t.setAttribute('aria-pressed', String(t.dataset.filter === city)); });
    moveMarker(activeTab());

    if (!animate || !gsap || reduce) { swap(city); return; }

    // Las tarjetas actuales se desvanecen y las nuevas se despliegan escalonadas
    gsap.killTweensOf(cards);
    gsap.to(visible(), {
      autoAlpha: 0, y: -12, duration: 0.25, ease: 'power2.in',
      onComplete: function () {
        swap(city);
        gsap.fromTo(visible(), { autoAlpha: 0, y: 48 }, {
          autoAlpha: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.07,
          clearProps: 'opacity,visibility,transform'
        });
      }
    });
  }

  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      if (t.getAttribute('aria-pressed') === 'true') return;
      select(t.dataset.filter, true);
    });
    // La línea amarilla se desplaza a la pestaña bajo el ratón
    t.addEventListener('mouseenter', function () { moveMarker(t); });
    t.addEventListener('focus', function () { moveMarker(t); });
  });
  group.addEventListener('mouseleave', function () { moveMarker(activeTab()); });
  group.addEventListener('focusout', function () { moveMarker(activeTab()); });

  select(activeTab().dataset.filter, false);

  // Recolocar la línea cuando cargan las fuentes o cambia el ancho
  var reposition = function () { moveMarker(activeTab()); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(reposition);
  window.addEventListener('resize', reposition);
})();
