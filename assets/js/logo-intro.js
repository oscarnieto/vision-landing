/* Animación de entrada del logo VISIÓN del hero (inspirada en el motion graphics de referencia):
   la V aparece sola en el centro y se desliza a su sitio, las I y los palos de la N entran desde la
   derecha, la S, la O y la diagonal de la N se van descubriendo, la barra se traza y, ya construido,
   el logo pasa de grande a pequeño y aparece la insignia «10º ANIVERSARIO» debajo.
   Solo usa transformaciones y recortes (clipPath): sin filtros ni máscaras SVG, que Safari pinta mal.
   ScrollKit no tiene un efecto de construcción de logotipo, por eso va aparte con GSAP. */
(function () {
  'use strict';

  var logo = document.querySelector('.hero-logo');
  var svg = logo && logo.querySelector('.logo-anim');
  if (!svg) return;

  function show() { logo.style.visibility = 'visible'; }

  // Tamaño final del logo (ver CSS .hero-logo.is-small): 31,14 % del ancho en escritorio, 64 % en móvil
  function smallRatio() { return window.matchMedia('(max-width: 767px)').matches ? 0.64 : 0.3114; }
  function settleSmall() {
    logo.classList.add('is-small');
    if (window.gsap) window.gsap.set(svg, { clearProps: 'transform' });
  }

  // «10º ANIVERSARIO»: la banda amarilla se despliega de izquierda a derecha y el texto sube dentro.
  // El logo no se mueve. Estado final en CSS: .is-badged
  function badgeIn() {
    var badge = logo.querySelector('.hero-badge');
    var text = logo.querySelector('.hero-badge__text');
    if (!badge || !text) return;
    var g = window.gsap;
    g.timeline({
      onComplete: function () {
        logo.classList.add('is-badged');
        g.set([badge, text], { clearProps: 'all' });
      }
    })
      .set(badge, { opacity: 1, clipPath: 'inset(0% 100% 0% 0%)' })
      .set(text, { yPercent: 120 })
      .to(badge, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'expo.inOut' }, 0.1)
      .to(text, { yPercent: 0, duration: 0.8, ease: 'expo.out' }, 0.55);
  }

  var gsap = window.gsap;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!gsap) { show(); return; }
  if (reduce) { settleSmall(); logo.classList.add('is-badged'); show(); return; }

  try {
    var v = svg.querySelector('.l-v');
    var is = svg.querySelectorAll('.l-i');
    var n = svg.querySelector('.l-n');
    var bar = svg.querySelector('.l-bar');
    var wipeS = svg.querySelector('.wipe-s');
    var wedgeO = svg.querySelector('.wedge-o');
    var wipeN = svg.querySelector('.wipe-n');

    // La V empieza centrada en el logo (centro del logo 730.5 − centro de la V 126.7)
    var toCenter = 603.8;

    // Sector circular que descubre la O empezando arriba y en el sentido de las agujas del reloj
    var o = { p: 0 };
    function drawWedge() {
      var cx = 1010, cy = 202, r = 170, pts = [cx + ',' + cy];
      var end = -90 + 360 * o.p;
      for (var a = -90; a < end; a += 6) {
        pts.push((cx + r * Math.cos(a * Math.PI / 180)).toFixed(1) + ',' + (cy + r * Math.sin(a * Math.PI / 180)).toFixed(1));
      }
      pts.push((cx + r * Math.cos(end * Math.PI / 180)).toFixed(1) + ',' + (cy + r * Math.sin(end * Math.PI / 180)).toFixed(1));
      wedgeO.setAttribute('points', pts.join(' '));
    }

    // Estado inicial
    gsap.set(v, { x: toCenter, autoAlpha: 0, scale: 0.92, transformOrigin: '50% 50%' });
    gsap.set(is, { x: 260, autoAlpha: 0 });
    gsap.set(n, { x: 260, autoAlpha: 0 });
    gsap.set(bar, { scaleX: 0, transformOrigin: '0% 50%' });
    show();

    var tl = gsap.timeline({
      delay: 0.35,
      onComplete: function () {
        // Al terminar, quitar los recortes: el logo queda idéntico al original
        svg.querySelectorAll('[clip-path]').forEach(function (el) { el.removeAttribute('clip-path'); });
        // Fijar el tamaño pequeño con CSS para que se adapte si cambia el ancho de la ventana
        settleSmall();
        badgeIn();
      }
    });

    // 1 · La V aparece sola en el centro
    tl.to(v, { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'power2.out' });

    // 2 · La V se desliza a su sitio
    tl.to(v, { x: 0, duration: 0.75, ease: 'expo.inOut' }, '+=0.35');

    // 3 · Las I y los palos de la N entran desde la derecha, escalonados
    tl.to([is[0], is[1], n], { x: 0, autoAlpha: 1, duration: 0.7, ease: 'expo.out', stagger: 0.09 }, '<0.3');

    // 4 · Se descubren la S, la O y la diagonal de la N, y se traza la barra
    tl.to(wipeS, { attr: { height: 300 }, duration: 0.8, ease: 'power2.inOut' }, '-=0.25');
    tl.to(o, { p: 1, duration: 0.9, ease: 'power2.inOut', onUpdate: drawWedge }, '<0.12');
    tl.to(wipeN, { attr: { width: 335 }, duration: 0.55, ease: 'power2.inOut' }, '<0.1');
    tl.to(bar, { scaleX: 1, duration: 0.7, ease: 'expo.out' }, '<0.25');

    // 5 · Una vez construido, pasa de grande a pequeño (centrado)
    tl.to(svg, {
      scale: function () { return smallRatio() / 1.0146; },  // el logo grande ocupa el 101,46 % del ancho
      transformOrigin: '50% 50%', duration: 1.3, ease: 'expo.inOut'
    }, '+=0.45');
  } catch (e) {
    svg.querySelectorAll('[clip-path]').forEach(function (el) { el.removeAttribute('clip-path'); });
    show();
  }
})();
