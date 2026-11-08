"""에셋 도구 규칙 시험 (브라우저 없이, v20.8 검토 뒤)
사용: python3 tests/browser/assets_tool.py
 1) README 배율: 옛 파일이 있고 새 도트를 정수배 하면 그 크기가 되면 그 배율을 씀(크기만 다른 그림을 「바뀜」으로 줄이지 않음)
 2) 도장 글자: 그림 바탕·테가 같고 지난번 기록한 글자·바탕·글자 색이 지금과 같을 때만 옛 파일을 그대로 둠(글자가 바뀌면 기록으로 잡음)
 3) 전직 차림의 「처음 보인 판」은 기본 차림 것을 빌려 쓰지 않음
"""
import sys, pathlib, tempfile
ROOT = pathlib.Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT / 'tools'))
sys.argv = [sys.argv[0]]
import assets as A
from PIL import Image, ImageDraw
fails = []
def ok(c, m):
    if not c: fails.append(m)

# 1) 배율
tmp = pathlib.Path(tempfile.mkdtemp())
raw = Image.new('RGBA', (12, 9), (200, 100, 50, 255))
Image.new('RGBA', (48, 36)).save(tmp / 'pet_tiger.png')        # 옛 파일 ×4
Image.new('RGBA', (64, 88)).save(tmp / 'char_seonbi.png')      # 옛 파일이 정수배가 아님(옛 도트) → 기본 배율
a_pet = {'kind': 'pet', 'id': 'tiger', 'readme': 'pet_tiger', 'scale': 3, 'draw': {'t': 'spr'}}
a_ch = {'kind': 'char', 'id': 'seonbi', 'readme': 'char_seonbi', 'scale': 4, 'draw': {'t': 'spr'}}
a_new = {'kind': 'enemy', 'id': 'newone', 'readme': 'e_newone', 'scale': 3, 'draw': {'t': 'spr'}}
r = A.readme_images(a_pet, {'raw': raw}, tmp)
ok(r['pet_tiger'].size == (48, 36), f"옛 파일 크기가 ×4면 ×4 ({r['pet_tiger'].size})")
r = A.readme_images(a_ch, {'raw': Image.new('RGBA', (12, 13))}, tmp)
ok(r['char_seonbi'].size == (48, 52) and r['charS_seonbi'].size == (24, 26), f"정수배가 아니면 기본 배율 ({r['char_seonbi'].size})")
r = A.readme_images(a_new, {'raw': Image.new('RGBA', (10, 11))}, tmp)
ok(r['e_newone'].size == (30, 33), '옛 파일이 없으면 기본 배율')

# 2) 도장 글자를 그대로 둘지: 그림(바탕·테)이 같고, 지난번 기록한 글자·바탕·글자 색이 지금 게임과 같을 때만
def seal(bg=(122, 32, 24, 255), ink=(255, 246, 208, 255), box=(10, 8, 22, 24)):
    im = Image.new('RGBA', (32, 32), (10, 8, 12, 255)); d = ImageDraw.Draw(im)
    d.rectangle((2, 2, 29, 29), fill=(224, 176, 72, 255)); d.rectangle((4, 4, 27, 27), fill=bg)
    d.rectangle(box, fill=ink)
    return im
base = seal()
src = {'g': '火', 'bg': '#7a2018', 'color': None}
ok(A.keep_seal(base, seal(box=(11, 8, 22, 24)), None, src), '첫 기록: 바탕·테가 같으면(글꼴·그림자 차이) 그대로 둠')
ok(not A.keep_seal(base, seal(bg=(47, 107, 90, 255)), None, src), '바탕색이 바뀌면 다시 그림')
ok(A.keep_seal(base, seal(box=(11, 8, 22, 24)), dict(src), src), '지난 기록과 글자·색이 같으면 그대로 둠')
ok(not A.keep_seal(base, seal(box=(11, 8, 22, 24)), {**src, 'g': '炎'}, src), '글자가 바뀌면(지난 기록 火 → 지금 炎) 다시 그림')
ok(not A.keep_seal(base, seal(), {**src, 'color': '#c080ff'}, src), '글자 색이 바뀌면 다시 그림')

# 3) 전직 차림의 처음 보인 판
ok(A.since_id({'kind': 'char', 'id': 'seonbi_06'}) is None and A.since_id({'kind': 'char', 'id': 'seonbi'}) == 'seonbi' and A.since_id({'kind': 'enemy', 'id': 'dokkaebi'}) == 'dokkaebi',
   '전직 차림은 처음 보인 판을 찾지 않음(기본 차림 것을 빌리지 않음)')

if fails:
    print('FAIL assets_tool\n  ' + '\n  '.join(fails)); sys.exit(1)
print('PASS assets_tool (배율 · 도장 그대로 둘지 · 전직 처음 보인 판)')
