/* Sección 2: vídeo de fondo de cada ciudad.
   Quieto con su póster; se reproduce al pasar el ratón (o al enfocar con teclado) y se pausa al salir.
   En pantallas táctiles, sin hover, se reproduce mientras la tarjeta está a la vista. */
(function () {
  'use strict';

  var videos = Array.prototype.slice.call(document.querySelectorAll('.city-video'));
  if (!videos.length) return;

  var section = videos[0].closest('section');
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  function play(v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }

  // Pósters (data-poster): se ponen cuando la sección se acerca, para no descargarlos al abrir la página
  function posters() {
    videos.forEach(function (v) {
      if (v.dataset.poster && !v.getAttribute('poster')) v.setAttribute('poster', v.dataset.poster);
    });
  }

  // Carga diferida: los vídeos empiezan a descargarse cuando la sección se acerca
  // `except`: el vídeo que se va a reproducir ya (play() lo descarga solo; load() lo interrumpiría)
  function preload(except) {
    posters();
    videos.forEach(function (v) {
      if (v === except) { v.preload = 'auto'; return; }
      if (v.preload === 'auto') return;
      v.preload = 'auto';
      v.load();
    });
  }
  if (hasIO && section) {
    // Pósters con algo más de antelación (2 pantallas) que los vídeos (1 pantalla)
    var nearPoster = new IntersectionObserver(function (entries) {
      if (entries.some(function (e) { return e.isIntersecting; })) { posters(); nearPoster.disconnect(); }
    }, { rootMargin: '0px 0px 200% 0px' });
    nearPoster.observe(section);
    var near = new IntersectionObserver(function (entries) {
      if (entries.some(function (e) { return e.isIntersecting; })) { preload(); near.disconnect(); }
    }, { rootMargin: '0px 0px 100% 0px' });
    near.observe(section);
  } else {
    preload();
  }

  if (canHover) {
    videos.forEach(function (v) {
      var card = v.closest('.latest');
      var active = false;
      // Si el primer play() se corta mientras carga, reintentarlo cuando ya se pueda reproducir
      v.addEventListener('canplay', function () { if (active && v.paused) play(v); });
      function start() { active = true; play(v); preload(v); }
      function stop() { active = false; v.pause(); }
      card.addEventListener('mouseenter', start);
      card.addEventListener('mouseleave', stop);
      card.addEventListener('focusin', start);
      card.addEventListener('focusout', stop);
    });
  } else if (hasIO && !reduce) {
    var inView = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) play(e.target); else e.target.pause();
      });
    }, { threshold: 0.6 });
    videos.forEach(function (v) { inView.observe(v); });
  }
})();
