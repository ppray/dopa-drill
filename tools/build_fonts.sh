#!/usr/bin/env bash
# Rebuild the subset WOFF2 fonts used by the game from the Google Fonts (OFL) sources.
#   - Dela Gothic One / Zen Maru Gothic: Latin digits and math symbols only
#   - ZCOOL QingKe HuangYou (chunky) and Noto Sans SC 700/900 (round body): all Chinese text
# Requires: curl, uv. Usage: bash tools/build_fonts.sh
# Re-run whenever you add or change on-screen text.
set -euo pipefail
GAME="$(cd "$(dirname "$0")/../app" && pwd)"
WORK="$(mktemp -d)"
BASE=https://raw.githubusercontent.com/google/fonts/main/ofl
curl -sSfo "$WORK/dela.ttf" "$BASE/delagothicone/DelaGothicOne-Regular.ttf"
curl -sSfo "$WORK/zen-bold.ttf" "$BASE/zenmarugothic/ZenMaruGothic-Bold.ttf"
curl -sSfo "$WORK/zen-black.ttf" "$BASE/zenmarugothic/ZenMaruGothic-Black.ttf"
curl -sSfo "$WORK/qingke.ttf" "$BASE/zcoolqingkehuangyou/ZCOOLQingKeHuangYou-Regular.ttf"
curl -sSfo "$WORK/noto.ttf" "$BASE/notosanssc/NotoSansSC%5Bwght%5D.ttf"
uv run --no-project --with fonttools --with brotli python3 - "$GAME" "$WORK" <<'PY'
import sys, pathlib
from fontTools.ttLib import TTFont
from fontTools.subset import Subsetter, Options
from fontTools.varLib import instancer

game, work = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
ascii_chars = {chr(c) for c in range(0x20, 0x7f)} | set('０１２３４５６７８９＋−×÷＝‹›⌫♪▶☆★→')
chars = set(ascii_chars)
for f in [*game.glob('*.html'), *game.glob('*.css'), *game.glob('js/*.js')]:
    chars |= set(f.read_text(encoding='utf-8'))
chars |= set('，。、！？：；（）「」“”…—～·')
chars = {c for c in chars if ord(c) >= 0x20}

def subset(font, keep, out):
    opt = Options(); opt.flavor = 'woff2'; opt.layout_features = ['*']; opt.notdef_outline = True
    s = Subsetter(opt); s.populate(text=''.join(sorted(keep))); s.subset(font)
    font.flavor = 'woff2'; font.save(str(game / 'fonts' / out))

for src, out in [('dela', 'dela-gothic-one'), ('zen-bold', 'zen-maru-gothic-bold'), ('zen-black', 'zen-maru-gothic-black')]:
    subset(TTFont(work / f'{src}.ttf'), ascii_chars, f'{out}.woff2')
subset(TTFont(work / 'qingke.ttf'), chars, 'qingke-huangyou.woff2')
for w in (700, 900):
    f = instancer.instantiateVariableFont(TTFont(work / 'noto.ttf'), {'wght': w})
    subset(f, chars, f'noto-sans-sc-{w}.woff2')
PY
rm -rf "$WORK"
echo "fonts rebuilt in $GAME/fonts"
