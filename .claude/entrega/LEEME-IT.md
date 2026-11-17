# VISIÓN · Landing (Savills) — guía de despliegue para IT

Web estática: HTML, CSS, JavaScript, imágenes y vídeos. **No necesita compilación, base de datos ni código de servidor.** Basta con publicar el contenido de esta carpeta en un servidor web con HTTPS.

## Contenido

```
index.html              Página principal
politica-de-cookies.html  Política de cookies (enlazada desde el pie y desde el aviso)
assets/css/             Estilos
assets/js/              Scripts propios (filtro, vídeos, animación del logo)
assets/img/             Pósters y fotos de las ediciones (AVIF + JPEG de respaldo)
assets/video/           Vídeo del hero (HEVC + H.264, escritorio y móvil) y vídeos de ciudades
assets/figma/           Logotipos, iconos e imágenes del diseño
scroll-kit/             Librería propia de efectos de scroll
servidor/               Ejemplos de configuración (IIS, nginx, Apache) — no hay que publicarla
README.md               Esta guía — no hay que publicarla
```

Todas las rutas son **relativas**: la web funciona igual en la raíz de un dominio (`https://vision.savills.es/`) que en una subcarpeta (`https://www.savills.es/vision/`).

Tamaño total ≈ 38 MB (la mayor parte, vídeo).

## Requisitos del servidor

1. **HTTPS** obligatorio, con redirección 301 desde HTTP.
2. **Peticiones por rangos (HTTP 206 / `Accept-Ranges: bytes`)** para los `.mp4`. Safari (iPhone, Mac) no reproduce vídeo sin ellas. IIS, nginx y Apache las sirven por defecto para archivos estáticos; comprobar que ningún proxy o CDN intermedio las desactive.
3. **Tipos MIME** (algunos servidores antiguos no traen `.avif`):

   | Extensión | Content-Type |
   |---|---|
   | `.avif` | `image/avif` |
   | `.mp4` | `video/mp4` |
   | `.svg` | `image/svg+xml` |
   | `.js` | `text/javascript` |
   | `.css` | `text/css` |

4. **Documento por defecto:** `index.html`.
5. Compresión gzip/brotli recomendada para `.html`, `.css`, `.js` y `.svg` (no para imágenes ni vídeo).

## Dominios externos que carga la página

El navegador del visitante descarga desde:

| Dominio | Qué | Integridad |
|---|---|---|
| `cdn.jsdelivr.net` | GSAP 3.15.0 (ScrollTrigger, SplitText) y Lenis 1.3.27 | Con SRI (`integrity` en el HTML) |
| `fonts.googleapis.com` / `fonts.gstatic.com` | Tipografías Montserrat y Playfair Display | — |

Si la política corporativa no permite estos terceros (o por RGPD se prefiere no enviar la IP del visitante a Google/jsDelivr), se pueden alojar en el propio servidor: pedírnoslo y entregamos la versión con las librerías y fuentes locales.

## Cabeceras de seguridad (Política de Seguridad de Aplicaciones v1)

En GitHub Pages no se podían enviar; **en el servidor corporativo hay que configurarlas**. Los ejemplos de `servidor/` ya las incluyen.

| Control | Cabecera / acción |
|---|---|
| INFO-01 | Ocultar `Server` y `X-Powered-By`; páginas de error genéricas (sin tecnología ni versiones) |
| HDR-01 | `X-Frame-Options: DENY` (y `frame-ancestors 'none'` en la CSP) |
| HDR-02 | `Content-Security-Policy` (ver abajo) |
| HDR-03 | `X-Content-Type-Options: nosniff` |
| HDR-04 | `Referrer-Policy: strict-origin-when-cross-origin` y `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()` |
| HDR-05 | Redirección HTTP → HTTPS y `Strict-Transport-Security: max-age=31536000` |

**Content-Security-Policy** (la página ya la lleva en una etiqueta `<meta>`; como cabecera añade `frame-ancestors`, que en `<meta>` no funciona):

```
default-src 'none'; script-src 'self' https://cdn.jsdelivr.net 'sha256-CwWbBf7jQqvh/bJnN8zix/pIAcILUmqMV5j4DXi/Lmo='; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; media-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; upgrade-insecure-requests
```

El hash `sha256-…` autoriza el único script en línea de la página. Si se modifica ese script, hay que recalcularlo.

Estado del resto de controles: sin backend, formularios, login ni datos de usuario (los controles de autenticación, sesión, autorización e inyección no aplican). Sin secretos en el código. Todos los enlaces externos llevan `rel="noopener noreferrer"`.

## Cookies y privacidad

- La web **no instala cookies** propias ni de terceros. Muestra un aviso de consentimiento (`assets/js/cookies.js`) que guarda la elección del visitante en el almacenamiento local (`vision-consent`, 12 meses).
- Si en el futuro se añade analítica (p. ej. Google Analytics), debe cargarse **solo** cuando `VisionConsent.get().analytics === true` (ver `VisionConsent.onChange`), actualizar `politica-de-cookies.html` y ampliar la CSP con los dominios del proveedor.
- La política de cookies y el aviso deben revisarlos el equipo legal / DPO de Savills.

## Caché recomendada

- `index.html`: sin caché o caché corta (`Cache-Control: no-cache`), para que los cambios se vean al momento.
- Resto (`assets/`, `scroll-kit/`): `Cache-Control: public, max-age=604800` (7 días). Los CSS y JS se piden con `?v=<huella>` (cambia cuando cambia el archivo), así que una actualización nunca mezcla archivos nuevos y antiguos; el CDN/proxy no debe ignorar la query string. Si se actualizan imágenes o vídeos con el mismo nombre, purgar la caché del CDN/proxy.

## Notas sobre el vídeo

El hero usa `<source>` con `media` y `type`: el navegador elige solo una de estas cuatro versiones (HEVC en Safari/Chrome con soporte, H.264 en el resto; versión vertical en móvil). No renombrar los archivos de `assets/video/`.

## Comprobación tras el despliegue

1. La página carga sin errores en la consola del navegador (F12) y sin avisos de CSP.
2. El vídeo del hero se reproduce en Chrome, Edge, Firefox y Safari (también en iPhone).
3. `curl -I https://<dominio>/assets/video/hero.mp4 -H "Range: bytes=0-1"` devuelve `206 Partial Content`.
4. Las cabeceras de seguridad aparecen en `curl -I https://<dominio>/` (o en securityheaders.com).
