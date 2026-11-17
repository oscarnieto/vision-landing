#!/bin/bash
# Pone ?v=<huella> en los CSS y JS propios que cargan las páginas (huella = 8 primeros caracteres del
# SHA-256 del archivo). Si un archivo cambia, cambia su URL y ningún navegador ni proxy sirve la versión
# antigua de la caché junto al HTML nuevo.
# Uso (desde la raíz del proyecto):  bash .claude/versionar.sh            → actualiza los HTML
#                                    bash .claude/versionar.sh --comprobar → solo avisa si alguno está desfasado
set -euo pipefail
cd "$(dirname "$0")/.."

python3 - "${1:-}" <<'EOF'
import hashlib, pathlib, re, sys

check = sys.argv[1] == '--comprobar'
ref = re.compile(r'((?:src|href)=")((?:assets|scroll-kit)/[^"?#]+\.(?:css|js))(?:\?v=[^"]*)?(")')
stale = []

def huella(path):
    return hashlib.sha256(pathlib.Path(path).read_bytes()).hexdigest()[:8]

for page in sorted(pathlib.Path('.').glob('*.html')):
    html = page.read_text(encoding='utf-8')
    new = ref.sub(lambda m: f'{m.group(1)}{m.group(2)}?v={huella(m.group(2))}{m.group(3)}', html)
    if new != html:
        stale.append(page.name)
        if not check:
            page.write_text(new, encoding='utf-8')

if check and stale:
    print('Versiones desfasadas en: ' + ', '.join(stale) + ' (ejecutar bash .claude/versionar.sh)')
    sys.exit(1)
print(('Versiones actualizadas en: ' + ', '.join(stale)) if stale and not check else 'Versiones de CSS/JS al día')
EOF
