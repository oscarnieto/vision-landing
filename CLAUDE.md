## Publicación (obligatorio)

- La web se publica con GitHub Pages desde la rama `main`: https://oscarnieto.github.io/vision-landing/
- Después de cada cambio, sin esperar a que se pida: `git add -A`, commit con un mensaje breve en español y `git push origin main`. No dejar cambios sin subir al terminar un turno.
- Trabajar siempre directamente sobre `main`, sin ramas ni pull requests.
- Si `git push` o `curl` fallan con «SSL certificate … unable to get local issuer certificate», es la red corporativa (inspección HTTPS de Versa Networks): usar `/usr/bin/git` y `/usr/bin/curl` del sistema, que confían en los certificados del llavero de macOS. No desactivar la verificación SSL.
- **Cada vez que se haga un cambio**, terminar la respuesta con el enlace de GitHub Pages para verlo, con `?v=<hash corto del commit>` al final para evitar la caché (p. ej. `https://oscarnieto.github.io/vision-landing/?v=a1b2c3d`).
- Antes de dar el enlace, esperar a que el despliegue termine: consultar `https://api.github.com/repos/oscarnieto/vision-landing/actions/runs?per_page=1` hasta que `head_sha` coincida con el commit subido y `status` sea `completed` (si `conclusion` no es `success`, avisar).

## Proyecto

- Landing estática sin compilación (HTML + CSS + ScrollKit).
- Diseño en Figma (fuente de verdad, reproducirlo fielmente): https://www.figma.com/design/jdwx4oQaPNUSJVW76JAmQG/Residential-New-Developments?node-id=231-993 (frame «Index», 1440 px; versión anterior: 225-788). Imágenes y SVG exportados en `assets/figma/`.
- `assets/hero-video/` (vídeos originales, proyecto de Premiere y clips en bruto) está en `.gitignore`. El original actual es `assets/video/hero-video-v2.mp4` (1920×1080, 25 fps, 15,9 Mbps; ignorado en git). La web usa `assets/video/hero.mp4` (1920×1080, 5 Mbps) y `assets/video/hero-mobile.mp4` (1280×720, 2,5 Mbps), oscurecidos −0,6 EV, y el póster `assets/img/hero-poster.jpg`. Por debajo de ~3 Mbps se ve pixelado. Si cambia el original, regenerarlos igual (no hay ffmpeg: usar AVFoundation con Swift).
- Vídeos de las ciudades (sección 2): originales en `assets/video/{barcelona,malaga,sevilla,valencia}.mp4` (ignorados en git). La web usa `assets/video/ciudades/*.mp4`: recorte central 760×720 (lo visible en la tarjeta + margen del parallax), 30 fps, sin oscurecer (Barcelona y Málaga 3,5 Mbps, Sevilla 2,5, Valencia 2), y pósters `assets/img/poster-<ciudad>.jpg`. Se reproducen al pasar el ratón (`assets/js/videos-ciudades.js`).
- Las librerías de ScrollKit se cargan de jsDelivr con `integrity` (SRI). Si cambia su versión o el script inline del `<head>`, recalcular los hashes y actualizar la CSP.
- Aplicar la skill `seguridad-aplicaciones` y entregar el informe de cumplimiento tras cada cambio de código.

## Animaciones y efectos de scroll

- Usar exclusivamente ScrollKit (skill `scrollkit`). Archivos del kit: `scroll-kit/css/scroll-kit.css` y `scroll-kit/js/scroll-kit.js`.
- Catálogo de efectos con códigos E01–E31, snippets y recetas: `.claude/skills/scrollkit/EFECTOS.md`. Leerlo antes de añadir cualquier animación.
- Cuando se pida un efecto por código (p. ej. "E16 en la galería"), aplicar el snippet exacto de su ficha.
- No modificar los archivos del kit salvo petición expresa. El diseño va en el CSS del proyecto.
- Excepción acordada: la barra de progreso de la sección 2 la mueve `assets/js/ediciones.js` leyendo el avance del carril E25 (`_skTween`), porque E07 mide la sección entera y no el tramo fijado.
- Excepción acordada: en la sección 4, la línea amarilla que sigue al ratón por las pestañas y la entrada escalonada de las tarjetas al filtrar (GSAP) están en `assets/js/ediciones.js`; ScrollKit no tiene efectos de filtro ni de hover.
- Excepción acordada: animación de entrada del logo VISIÓN del hero en `assets/js/logo-intro.js` (GSAP). El logo va en línea en `index.html` con los mismos trazados que `assets/figma/vision-logo.svg`; si cambia el logo, actualizar ambos y los recortes `clipPath` (S, O, diagonal de la N). No usar máscaras ni filtros SVG en esa animación: Safari (iPhone) los pinta mal y aparecen manchas blancas.
- El header NO usa E02: va en `position: absolute` sobre el hero, se va con el scroll y no reaparece al subir (petición del usuario).
- Toda página HTML nueva parte de `.claude/skills/scrollkit/plantilla.html`.

## Idioma

- Hablar siempre en español con el usuario.
