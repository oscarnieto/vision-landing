## Publicación (obligatorio)

- La web se publica con GitHub Pages desde la rama `main`: https://oscarnieto.github.io/vision-landing/
- Después de cada cambio, sin esperar a que se pida: `git add -A`, commit con un mensaje breve en español y `git push origin main`. No dejar cambios sin subir al terminar un turno.
- Trabajar siempre directamente sobre `main`, sin ramas ni pull requests.
- Si `git push` o `curl` fallan con «SSL certificate … unable to get local issuer certificate», es la red corporativa (inspección HTTPS de Versa Networks): usar `/usr/bin/git` y `/usr/bin/curl` del sistema, que confían en los certificados del llavero de macOS. No desactivar la verificación SSL.
- **Cada vez que se haga un cambio**, terminar la respuesta con el enlace de GitHub Pages para verlo, con `?v=<hash corto del commit>` al final para evitar la caché (p. ej. `https://oscarnieto.github.io/vision-landing/?v=a1b2c3d`).
- Antes de dar el enlace, esperar a que el despliegue termine: consultar `https://api.github.com/repos/oscarnieto/vision-landing/actions/runs?per_page=1` hasta que `head_sha` coincida con el commit subido y `status` sea `completed` (si `conclusion` no es `success`, avisar).

## Proyecto

- Landing estática sin compilación (HTML + CSS + ScrollKit).
- Diseño en Figma: https://www.figma.com/design/cT53PBxZRYSFmXaFfmWtWC/Landing-Vision?node-id=6-279
- `assets/hero-video/` (vídeo original, proyecto de Premiere y clips en bruto) está en `.gitignore`. La web usa `assets/video/hero.mp4` (1280×720, 1,4 Mbps) y `assets/video/hero-mobile.mp4` (960×540, 0,75 Mbps), oscurecidos −0,6 EV, y el póster `assets/img/hero-poster.jpg`. Si cambia el vídeo original, regenerarlos igual (no hay ffmpeg: usar AVFoundation con Swift).
- Las librerías de ScrollKit se cargan de jsDelivr con `integrity` (SRI). Si cambia su versión o el script inline del `<head>`, recalcular los hashes y actualizar la CSP.
- Aplicar la skill `seguridad-aplicaciones` y entregar el informe de cumplimiento tras cada cambio de código.

## Animaciones y efectos de scroll

- Usar exclusivamente ScrollKit (skill `scrollkit`). Archivos del kit: `scroll-kit/css/scroll-kit.css` y `scroll-kit/js/scroll-kit.js`.
- Catálogo de efectos con códigos E01–E31, snippets y recetas: `.claude/skills/scrollkit/EFECTOS.md`. Leerlo antes de añadir cualquier animación.
- Cuando se pida un efecto por código (p. ej. "E16 en la galería"), aplicar el snippet exacto de su ficha.
- No modificar los archivos del kit salvo petición expresa. El diseño va en el CSS del proyecto.
- Toda página HTML nueva parte de `.claude/skills/scrollkit/plantilla.html`.

## Idioma

- Hablar siempre en español con el usuario.
