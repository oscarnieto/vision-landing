/* Aviso y gestión del consentimiento de cookies (normativa UE: Directiva ePrivacy, RGPD; en España
   art. 22.2 LSSI y Guía de cookies de la AEPD).
   - «Rechazar» y «Aceptar» con el mismo peso visual; nada premarcado; enlace a la política.
   - La elección se guarda en localStorage (almacenamiento técnico, exento de consentimiento)
     durante 12 meses y se puede cambiar en cualquier momento con los botones [data-cookie-settings].
   - Hoy la web no usa cookies de analítica ni de publicidad. Si se añaden, deben cargarse solo
     cuando VisionConsent.get().analytics sea true (ver VisionConsent.onChange).
   El banner se construye con createElement/textContent a partir de textos fijos (sin innerHTML). */
(function () {
  'use strict';

  var KEY = 'vision-consent';
  var VERSION = 1;                                 // subir si cambian las categorías: vuelve a preguntar
  var MAX_AGE = 365 * 24 * 60 * 60 * 1000;         // 12 meses
  var POLICY = 'politica-de-cookies.html';
  var listeners = [];

  function read() {
    try {
      var v = JSON.parse(window.localStorage.getItem(KEY));
      if (!v || v.v !== VERSION || typeof v.t !== 'number' || Date.now() - v.t > MAX_AGE) return null;
      return v;
    } catch (e) { return null; }
  }
  var state = read();

  // ---------- Construcción del aviso ----------
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  var banner = el('div', 'cookie-banner');
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-modal', 'false');
  banner.setAttribute('aria-labelledby', 'cookie-title');
  banner.setAttribute('aria-describedby', 'cookie-text');
  banner.hidden = true;

  var title = el('p', 'cookie-banner__title', 'Cookies');
  title.id = 'cookie-title';
  var text = el('p', 'cookie-banner__text',
    'Esta web solo usa lo técnicamente necesario para funcionar y no instala cookies de analítica ni de publicidad. ' +
    'Si en el futuro se añaden, solo se activarán con tu consentimiento. Más información en la ');
  text.id = 'cookie-text';
  var link = el('a', null, 'Política de cookies');
  link.href = POLICY;
  text.appendChild(link);
  text.appendChild(document.createTextNode('.'));

  // Segunda capa: categorías
  var prefs = el('div', 'cookie-banner__prefs');
  prefs.hidden = true;
  function option(id, label, desc, checked, disabled) {
    var row = el('label', 'cookie-opt');
    row.htmlFor = id;
    var box = el('input');
    box.type = 'checkbox';
    box.id = id;
    box.checked = checked;
    box.disabled = disabled;
    var txt = el('span', 'cookie-opt__txt');
    txt.appendChild(el('strong', null, label));
    txt.appendChild(el('span', null, desc));
    row.appendChild(box);
    row.appendChild(txt);
    prefs.appendChild(row);
    return box;
  }
  option('cookie-tecnicas', 'Técnicas', 'Necesarias para que la web funcione y para recordar tu elección. Siempre activas.', true, true);
  var analytics = option('cookie-analiticas', 'Analíticas', 'Medición de visitas de forma agregada. Actualmente esta web no las utiliza.', false, false);

  var actions = el('div', 'cookie-banner__actions');
  var btnReject = el('button', 'cookie-btn', 'Rechazar');
  var btnConfig = el('button', 'cookie-btn cookie-btn--ghost', 'Configurar');
  var btnAccept = el('button', 'cookie-btn', 'Aceptar');
  [btnReject, btnConfig, btnAccept].forEach(function (b) { b.type = 'button'; actions.appendChild(b); });

  banner.appendChild(title);
  banner.appendChild(text);
  banner.appendChild(prefs);
  banner.appendChild(actions);

  // ---------- Comportamiento ----------
  function show(withPrefs) {
    analytics.checked = !!(state && state.analytics);
    prefs.hidden = !withPrefs;
    btnConfig.textContent = withPrefs ? 'Guardar selección' : 'Configurar';
    banner.hidden = false;
    // Al reabrirlo desde el footer, llevar el foco al aviso (accesibilidad)
    if (withPrefs) btnConfig.focus({ preventScroll: true });
  }
  function save(acceptAnalytics) {
    state = { v: VERSION, t: Date.now(), analytics: !!acceptAnalytics };
    try { window.localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* sin almacenamiento: se volverá a preguntar */ }
    banner.hidden = true;
    listeners.forEach(function (fn) { try { fn(state); } catch (e) { /* un oyente roto no bloquea el resto */ } });
  }

  btnReject.addEventListener('click', function () { save(false); });
  btnAccept.addEventListener('click', function () { save(true); });
  btnConfig.addEventListener('click', function () {
    if (prefs.hidden) show(true);
    else save(analytics.checked);
  });

  Array.prototype.forEach.call(document.querySelectorAll('[data-cookie-settings]'), function (b) {
    b.addEventListener('click', function () { show(true); });
  });

  document.body.appendChild(banner);
  if (!state) show(false);

  // API para scripts futuros (p. ej. analítica): cargar solo con consentimiento
  window.VisionConsent = {
    get: function () { return state; },
    onChange: function (fn) { if (typeof fn === 'function') listeners.push(fn); },
    open: function () { show(true); }
  };
})();
