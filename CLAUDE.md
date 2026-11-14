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
- Los originales (vídeos del hero y de las ciudades, proyecto de Premiere, clips en bruto y fotos de las ediciones a tamaño completo) ya no están en el proyecto: se movieron a la Papelera el 2026-11-14. Si llegan originales nuevos, dejarlos en `assets/hero-video/`, `assets/video/<nombre>.mp4` o `assets/img/<ciudad>_<n>.jpg` (ignorados en git) y generar las versiones optimizadas.
- Vídeo del hero (original 1920×1080, 25 fps; oscurecido −0,6 EV): escritorio `assets/video/hero.hevc.mp4` (HEVC 5,5 Mbps) y `hero.mp4` (H.264 7 Mbps); móvil = recorte vertical central 760×1080 a resolución completa, `hero-mobile.hevc.mp4` (HEVC 2,2 Mbps) y `hero-mobile.mp4` (H.264 3,5 Mbps). Se eligen con `<source media type>` en el HTML (el HEVC debe llevar la etiqueta `hvc1`) y empiezan a cargar al abrir la página; E29 solo pausa/reanuda. Detrás hay una miniatura borrosa del primer fotograma en línea en el CSS para que no se vea gris. Póster `assets/img/hero-poster.jpg`. Codificar con AVFoundation en Swift (no hay ffmpeg).
- Vídeos de las ciudades (sección 2): `assets/video/ciudades/*.mp4`, recorte central 760×720 (lo visible en la tarjeta + margen del parallax), 30 fps, sin oscurecer (Barcelona y Málaga 3,5 Mbps, Sevilla 2,5, Valencia 2). Pósters `assets/img/poster-<ciudad>.jpg`, que se cargan al acercarse a la sección (`data-poster`). Se reproducen al pasar el ratón (`assets/js/videos-ciudades.js`).
- Fotos de las ediciones (sección 4): `assets/img/ediciones/<ciudad>-<n>.avif` + `.jpg` de respaldo, 760 px por el lado corto y con medidas pares (Chrome pinta en blanco algunos AVIF de ancho impar). `<n>` = posición en la pestaña de la ciudad, de la más reciente a la más antigua.
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
