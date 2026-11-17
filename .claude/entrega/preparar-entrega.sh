#!/bin/bash
# Genera la carpeta limpia para Azure DevOps / servidor corporativo en ../vision-landing-devops
# Uso (desde la raíz del proyecto):  bash .claude/entrega/preparar-entrega.sh
set -euo pipefail

SRC="$(cd "$(dirname "$0")/../.." && pwd)"
DST="$(cd "$SRC/.." && pwd)/vision-landing-devops"
TPL="$SRC/.claude/entrega"

mkdir -p "$DST"
# Vaciar la entrega (conservando su historial git) y copiar solo lo que usa la web
find "$DST" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +

cd "$SRC"
mkdir -p "$DST/assets/img" "$DST/assets/video"
cp index.html "$DST/"
cp -R assets/css assets/js assets/figma "$DST/assets/"
cp assets/img/hero-poster.jpg assets/img/poster-*.jpg "$DST/assets/img/"
cp -R assets/img/ediciones "$DST/assets/img/"
cp assets/video/hero*.mp4 "$DST/assets/video/"
cp -R assets/video/ciudades "$DST/assets/video/"
mkdir -p "$DST/scroll-kit"
cp -R scroll-kit/css scroll-kit/js "$DST/scroll-kit/"

# Guía y ejemplos de servidor para IT
cp "$TPL/LEEME-IT.md" "$DST/README.md"
cp -R "$TPL/servidor" "$DST/"
printf '.DS_Store\nThumbs.db\n' > "$DST/.gitignore"
find "$DST" -name .DS_Store -delete

# Comprobación: todo recurso local referenciado existe en la entrega, y nada sobra
cd "$DST"
missing=0
refs=$( { grep -ohE '(src|href|srcset|data-src|data-poster|poster)="[^"#:]+"' index.html | sed -E 's/^[a-z-]+="//; s/"$//'
          grep -ohE 'url\("?[^")]+' assets/css/*.css | sed -E 's/url\("?//' | { grep -v '^data:' || true; } | sed 's|^|assets/css/|'; } | sort -u )
for r in $refs; do
  [ -e "$r" ] || { echo "FALTA: $r"; missing=1; }
done
unused=0
while IFS= read -r f; do
  b=$(basename "$f")
  grep -rqF "$b" index.html assets/css assets/js scroll-kit 2>/dev/null || { echo "SIN USO: $f"; unused=1; }
done < <(find assets scroll-kit -type f)
if [ $missing -eq 0 ]; then echo "Referencias: todas presentes"; else echo "ERROR: faltan archivos"; fi
if [ $unused -eq 0 ]; then echo "Archivos sin uso: ninguno"; fi
echo "Entrega en: $DST ($(du -sh "$DST" | cut -f1))"
