/* Animación de entrada del logo VISIÓN del hero (inspirada en el motion graphics de referencia):
   la V aparece sola en el centro, se desliza a su sitio con desenfoque de movimiento, las I y los
   palos de la N entran desde la derecha, la S, la O y la diagonal de la N se dibujan, la barra se traza
   y, ya construido, el logo pasa de grande a pequeño.
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

  var gsap = window.gsap;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!gsap) { show(); return; }
  if (reduce) { settleSmall(); show(); return; }

  try {
    var q = function (sel) { return svg.querySelectorAll(sel); };
    var v = svg.querySelector('.l-v');
    var is = q('.l-i');
    var n = svg.querySelector('.l-n');
    var bar = svg.querySelector('.l-bar');
    var draws = q('mask .draw');
    var blurV = svg.querySelector('#blur-v feGaussianBlur');
    var blurI = svg.querySelector('#blur-i feGaussianBlur');

    // La V empieza centrada en el logo (centro del logo 730.5 − centro de la V 126.7)
    var toCenter = 603.8;

    // Estado inicial
    gsap.set(v, { x: toCenter, autoAlpha: 0, scale: 0.92, transformOrigin: '50% 50%' });
    gsap.set(is, { x: 260, autoAlpha: 0 });
    gsap.set(n, { x: 260, autoAlpha: 0 });
    gsap.set(draws, { attr: { 'stroke-dasharray': 1, 'stroke-dashoffset': 1 } });
    gsap.set(bar, { scaleX: 0, rotation: -10, transformOrigin: '0% 50%' });
    v.setAttribute('filter', 'url(#blur-v)');
    is.forEach(function (el) { el.setAttribute('filter', 'url(#blur-i)'); });
    n.setAttribute('filter', 'url(#blur-i)');
    show();

    var tl = gsap.timeline({
      delay: 0.35,
      onComplete: function () {
        // Al terminar, quitar filtros y máscaras: el logo queda idéntico al original
        [v, n].concat(Array.prototype.slice.call(is)).forEach(function (el) { el.removeAttribute('filter'); });
        q('[mask]').forEach(function (el) { el.removeAttribute('mask'); });
        // Fijar el tamaño pequeño con CSS para que se adapte si cambia el ancho de la ventana
        settleSmall();
      }
    });

    // 1 · La V aparece sola en el centro
    tl.to(v, { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'power2.out' });

    // 2 · La V se desliza a su sitio con desenfoque de movimiento
    tl.to(v, { x: 0, duration: 0.75, ease: 'expo.inOut' }, '+=0.35');
    tl.fromTo(blurV, { attr: { stdDeviation: '0 0' } }, { attr: { stdDeviation: '22 0' }, duration: 0.35, ease: 'power2.in', yoyo: true, repeat: 1 }, '<');

    // 3 · Las I y los palos de la N entran desde la derecha, escalonados
    tl.to([is[0], is[1], n], { x: 0, autoAlpha: 1, duration: 0.7, ease: 'expo.out', stagger: 0.09 }, '<0.3');
    tl.fromTo(blurI, { attr: { stdDeviation: '18 0' } }, { attr: { stdDeviation: '0 0' }, duration: 0.7, ease: 'power2.out' }, '<');

    // 4 · Se dibujan la S, la O y la diagonal de la N, y se traza la barra
    tl.to(draws[0], { attr: { 'stroke-dashoffset': 0 }, duration: 0.8, ease: 'power2.inOut' }, '-=0.25');     // S
    tl.to(draws[1], { attr: { 'stroke-dashoffset': 0 }, duration: 0.9, ease: 'power2.inOut' }, '<0.12');      // O
    tl.to(draws[2], { attr: { 'stroke-dashoffset': 0 }, duration: 0.55, ease: 'power2.inOut' }, '<0.1');      // diagonal N
    tl.to(bar, { scaleX: 1, rotation: 0, duration: 0.7, ease: 'expo.out' }, '<0.25');

    // 5 · Una vez construido, pasa de grande a pequeño (centrado)
    tl.to(svg, {
      scale: function () { return smallRatio() / 1.0146; },  // el logo grande ocupa el 101,46 % del ancho
      transformOrigin: '50% 50%', duration: 1.3, ease: 'expo.inOut'
    }, '+=0.45');
  } catch (e) {
    show();
  }
})();
