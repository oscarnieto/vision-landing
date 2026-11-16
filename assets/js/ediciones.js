/* Sección 2: barra de progreso y arrastre del carril horizontal.
   Sección 3: textos por líneas que se recolocan si cambia el zoom.
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

  /* ---------- Arrastre del carril con el ratón (sección 2) ----------
     El carril avanza con el scroll vertical (1 px de scroll = 1 px de carril), así que arrastrar
     a la izquierda o a la derecha mueve el scroll dentro del tramo fijado. Solo ratón/lápiz:
     en pantallas táctiles el carril pasa a columna. */
  if (wrap) {
    var drag = null;
    var moved = false;

    var scrollY = function () {
      var l = window.ScrollKit && window.ScrollKit.lenis;
      return l ? l.scroll : window.scrollY;
    };
    var scrollTo = function (y, smooth) {
      var l = window.ScrollKit && window.ScrollKit.lenis;
      if (l) l.scrollTo(y, smooth ? { duration: 0.9 } : { immediate: true, force: true });
      else window.scrollTo(0, y);
    };

    wrap.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 || e.pointerType === 'touch' || !wrap.classList.contains('sk-h-active')) return;
      var st = wrap._skTween && wrap._skTween.scrollTrigger;
      if (!st) return;
      drag = { x: e.clientX, y0: scrollY(), min: st.start, max: st.end, lastX: e.clientX, lastT: e.timeStamp, v: 0, id: e.pointerId };
      moved = false;
    });

    window.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x;
      if (!moved && Math.abs(dx) < 5) return;
      if (!moved) { moved = true; wrap.classList.add('is-dragging'); }
      var dt = Math.max(1, e.timeStamp - drag.lastT);
      drag.v = (e.clientX - drag.lastX) / dt;            // px por ms, para la inercia al soltar
      drag.lastX = e.clientX; drag.lastT = e.timeStamp;
      scrollTo(Math.min(drag.max, Math.max(drag.min, drag.y0 - dx)));
    });

    var end = function () {
      if (!drag) return;
      if (moved) {
        wrap.classList.remove('is-dragging');
        // Inercia suave al soltar, sin salir del tramo del carril
        var target = Math.min(drag.max, Math.max(drag.min, scrollY() - drag.v * 250));
        scrollTo(target, true);
      }
      drag = null;
    };
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);

    // Tras arrastrar, el clic no abre el enlace sobre el que se suelta
    wrap.addEventListener('click', function (e) {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
    }, true);
    // Sin arrastre nativo de imágenes ni enlaces
    wrap.addEventListener('dragstart', function (e) { e.preventDefault(); });
  }

  /* ---------- Textos que aparecen por líneas (E09) ----------
     ScrollKit los parte en líneas una vez. Si después cambia el ancho (p. ej. al hacer zoom en el
     navegador) y alguna línea ya mostrada queda partida en dos, se devuelve el texto a su forma normal
     para que vuelva a ajustarse bien. Los textos de estos bloques son planos (sin etiquetas). */
  var lineTexts = Array.prototype.slice.call(document.querySelectorAll('[data-reveal="lines"]'));
  if (lineTexts.length) {
    var fixLines = function () {
      lineTexts.forEach(function (el) {
        var lines = el.querySelectorAll('div');
        if (!lines.length) return;
        var lh = parseFloat(window.getComputedStyle(el).lineHeight) || parseFloat(window.getComputedStyle(el).fontSize) * 1.2;
        var broken = Array.prototype.some.call(lines, function (d) {
          return !d.querySelector('div') && d.getBoundingClientRect().height > lh * 1.5;
        });
        if (broken) el.textContent = el.textContent.replace(/\s+/g, ' ').trim();
      });
    };
    var t;
    window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(fixLines, 300); });
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
