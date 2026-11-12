## Publicación (obligatorio)

- La web se publica con GitHub Pages desde la rama `main`: https://oscarnieto.github.io/vision-landing/
- Después de cada cambio, sin esperar a que se pida: `git add -A`, commit con un mensaje breve en español y `git push origin main`. No dejar cambios sin subir al terminar un turno.
- Trabajar siempre directamente sobre `main`, sin ramas ni pull requests.
- Si `git push` o `curl` fallan con «SSL certificate … unable to get local issuer certificate», es la red corporativa (inspección HTTPS de Versa Networks): usar `/usr/bin/git` y `/usr/bin/curl` del sistema, que confían en los certificados del llavero de macOS. No desactivar la verificación SSL.
- **Cada vez que se haga un cambio**, terminar la respuesta con el enlace de GitHub Pages para verlo, con `?v=<hash corto del commit>` al final para evitar la caché (p. ej. `https://oscarnieto.github.io/vision-landing/?v=a1b2c3d`).
- Antes de dar el enlace, esperar a que el despliegue termine: consultar `https://api.github.com/repos/oscarnieto/vision-landing/actions/runs?per_page=1` hasta que `head_sha` coincida con el commit subido y `status` sea `completed` (si `conclusion` no es `success`, avisar).

## Proyecto

- Landing estática sin dependencias ni compilación (HTML + CSS).
- El vídeo del hero es `assets/hero-video/hero-video.mp4`. El proyecto de Premiere y los clips en bruto están en `.gitignore` y no se suben.
- Aplicar la skill `seguridad-aplicaciones` y entregar el informe de cumplimiento tras cada cambio de código.
