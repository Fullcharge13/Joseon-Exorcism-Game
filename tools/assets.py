"""조선퇴마록 에셋 도감 도구 (v20.8)

게임의 그리기 함수로 그림을 뽑아 도감(docs/assets/)과 README 그림(docs/img/)을 만든다.
  python3 tools/assets.py           # 만들기(같은 입력이면 같은 파일)
  python3 tools/assets.py --check   # 쓰지 않고 지금 docs/img가 게임과 같은지만 보고(바뀐·새·같은·도구가 만들지 않는 그림)
  python3 tools/assets.py --check --diff 경로.png   # 바뀐 그림을 옛·새 나란히 한 장으로
그릴 목록과 그리는 법은 tools/assets_list.js(게임 위에 얹어 실행). 게임 파일은 빌드된 index.html.
"""
import sys, io, json, base64, pathlib, subprocess, re, hashlib
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw, ImageFont

ROOT = pathlib.Path(__file__).resolve().parent.parent
GAME = ROOT / 'index.html'
LIST = ROOT / 'tools' / 'assets_list.js'
OUT = ROOT / 'docs' / 'assets'
README_IMG = ROOT / 'docs' / 'img'
args = sys.argv[1:]
CHECK = '--check' in args
DIFF = args[args.index('--diff') + 1] if '--diff' in args else None


def png_bytes(im):
    """같은 그림 → 같은 바이트(시각·메타 없음)"""
    b = io.BytesIO()
    im.save(b, 'PNG', optimize=False, compress_level=9)
    return b.getvalue()


def from_data_url(u):
    return Image.open(io.BytesIO(base64.b64decode(u.split(',', 1)[1]))).convert('RGBA')


def same(a, b):
    return a.size == b.size and a.tobytes() == b.tobytes()


def scale(im, k):
    return im if k == 1 else im.resize((im.width * k, im.height * k), Image.NEAREST)


def render():
    """브라우저에서 모든 그림을 뽑아 [(항목, {'raw': Image, 'ref': Image|None})]"""
    out = []
    with sync_playwright() as p:
        br = p.chromium.launch()
        ctx = br.new_context(viewport={'width': 900, 'height': 900}, device_scale_factor=1)
        ctx.route('**/fonts.g*/**', lambda r: r.abort())  # 시험과 같은 글꼴(바깥 글꼴 없이)
        pg = ctx.new_page()
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(GAME.as_uri())
        pg.wait_for_timeout(600)
        pg.add_script_tag(content=LIST.read_text(encoding='utf-8'))
        KIND_NAMES[:] = pg.evaluate('()=>ASSET_KINDS.map(k=>[k[0],k[1]])')
        META['version'] = pg.evaluate('()=>GAME_VER')
        items = pg.evaluate("""()=>{
          const toURL=c=>{if(!c)return null;const o=document.createElement('canvas');o.width=c.width;o.height=c.height;o.getContext('2d').drawImage(c,0,0);return o.toDataURL();};
          return assetList().map(a=>{
            const r={...a};
            if(a.draw.t==='url') r.rawURL=assetURL(a);
            else {r.rawURL=toURL(assetCanvas(a,false)); if(a.refine) r.refURL=toURL(assetCanvas(a,true));}
            return r;});
        }""")
        br.close()
        if errs:
            print('화면 오류:', errs[:5])
            sys.exit(2)
    for a in items:
        raw = from_data_url(a['rawURL']) if a.get('rawURL') else None
        ref = from_data_url(a['refURL']) if a.get('refURL') else None
        for k in ('rawURL', 'refURL'):
            a.pop(k, None)
        out.append((a, {'raw': raw, 'ref': ref}))
    return out


def fit_scale(raw, name, default, folder=None):
    """옛 README 파일이 있고 새 도트를 정수배 하면 딱 그 크기가 되면 그 배율(크기만 다른 그림을 바꾸지 않음), 아니면 기본 배율"""
    f = (folder or README_IMG) / f'{name}.png'
    if f.exists():
        w, h = Image.open(f).size
        if w % raw.width == 0 and w // raw.width >= 1 and h == raw.height * (w // raw.width):
            return w // raw.width
    return default


def readme_images(a, ims, folder=None):
    """README 이름 → 그림(지금 docs/img의 배율 규칙)"""
    raw = ims['raw']
    if raw is None or not a.get('readme'):
        return {}
    res = {a['readme']: scale(raw, fit_scale(raw, a['readme'], a.get('scale') or 1, folder))}
    if a['kind'] == 'char' and '_' not in a['id']:
        n = f"charS_{a['id']}"
        res[n] = scale(raw, fit_scale(raw, n, 2, folder))
    return res


def frame_same(old, new):
    """도장 그림의 바탕색·금 테·검은 테가 같은지(두 글자 도장은 획이 테에 닿을 수 있어 테는 네 귀퉁이만)"""
    if old.size != new.size or old.size != (32, 32):
        return False
    o, n = old.load(), new.load()
    pts = [(5, 5), (26, 5), (5, 26), (26, 26), (0, 0), (31, 31), (2, 2), (29, 2), (2, 29), (29, 29)]
    return all(o[p] == n[p] for p in pts)


def keep_seal(old, new, prev, cur):
    """도장 글자 README 그림을 그대로 둘지. 글자 획은 글꼴·그림자에 따라 그리는 곳마다 달라 점으로 견주지 않고,
    그림의 바탕·테가 같고 + 지난번 assets.json에 기록한 도장 재료(글자·바탕·글자 색)가 지금 게임과 같을 때만 둔다.
    처음(기록 없음)은 바탕·테만 봄 — 이때 글자가 이미 바뀌어 있었다면 놓칠 수 있음(LOG 남은 문제)"""
    return frame_same(old, new) and (prev is None or prev == cur)


def seal_src(a):
    d = a['draw']
    return {'g': d['g'], 'bg': d['bg'], 'color': d.get('color')} if d['t'] == 'seal' else None


def prev_rows():
    f = OUT / 'assets.json'
    try:
        return {(r['kind'], r['id']): r for r in json.loads(f.read_text(encoding='utf-8'))['assets']}
    except Exception:
        return {}


def check(items):
    have = {p.stem for p in README_IMG.glob('*.png')}
    made = {}
    for a, ims in items:
        made.update(readme_images(a, ims))
    prev = prev_rows()
    seal_of = {}  # README 이름 → (지난 기록, 지금 재료)
    for a, ims in items:
        if a['draw']['t'] == 'seal':
            for k in readme_images(a, ims):
                seal_of[k] = (prev.get((a['kind'], a['id']), {}).get('seal'), seal_src(a))
    same_n, changed, new, font = [], [], [], []
    for name, im in sorted(made.items()):
        if name not in have:
            new.append(name)
            continue
        old = Image.open(README_IMG / f'{name}.png').convert('RGBA')
        if same(old, im):
            same_n.append(name)
        elif name in seal_of and keep_seal(old, im, *seal_of[name]):
            font.append(name)
        else:
            changed.append(name)
    manual = sorted(have - set(made))
    print(f'README 그림 {len(have)}장 · 도구가 그리는 것 {len(made)}장')
    print(f'  같음 {len(same_n)} · 도장 글꼴·그림자만 다름(그대로 둠) {len(font)} · 바뀜 {len(changed)} · 새 그림 {len(new)} · 도구가 만들지 않는 그림 {len(manual)}')
    if font:
        print('  도장 글꼴·그림자만 다름(그대로 둠):', ' '.join(font))
    if changed:
        print('  바뀜:', ' '.join(changed))
    if new:
        print('  새 그림:', ' '.join(new))
    if manual:
        print('  도구가 만들지 않는 그림:', ' '.join(manual))
    if DIFF and changed:
        cells = []
        for n in changed:
            old = Image.open(README_IMG / f'{n}.png').convert('RGBA')
            cells.append((n, old, made[n]))
        cw = max(max(o.width, m.width) for _, o, m in cells) * 2 + 30
        ch = max(max(o.height, m.height) for _, o, m in cells) + 18
        cols = max(1, 1400 // cw)
        sh = Image.new('RGBA', (cols * cw, ((len(cells) + cols - 1) // cols) * ch), (40, 40, 48, 255))
        d = ImageDraw.Draw(sh)
        for i, (n, o, m) in enumerate(cells):
            x, y = (i % cols) * cw, (i // cols) * ch
            sh.paste(o, (x + 4, y + 2), o)
            sh.paste(m, (x + 14 + o.width, y + 2), m)
            d.text((x + 4, y + ch - 14), n, fill=(255, 255, 255, 255))
        sh.save(DIFF)
        print('  옛·새 나란히:', DIFF)
    return {'same': same_n, 'font': font, 'changed': changed, 'new': new, 'manual': manual}


KEY_RE = {}


def since_id(a):
    """처음 보인 판을 찾을 열쇠: 전직 차림·막 바닥·방패 단계는 표 열쇠가 아니라 찾지 않음(빌려 쓰지 않음)"""
    if a['kind'] in ('ground', 'shield') or (a['kind'] == 'char' and '_' in a['id']):
        return None
    return a['id']


def since_map(items):
    """그 id가 게임 코드에 표 열쇠(id: · 'id',)로 처음 나온 커밋의 판 번호. 첫 기록(v9)에 이미 있으면 'v9 이전', 못 찾으면 없음"""
    try:
        log = subprocess.run(['git', '-C', str(ROOT), 'log', '--reverse', '--format=%H %s'], capture_output=True, text=True, check=True).stdout.splitlines()
    except Exception:
        return {}
    ids = {since_id(a) for a, _ in items} - {None}
    pats = {i: re.compile(r"[\s{,(]['\"]?" + re.escape(i) + r"['\"]?\s*[:,]") for i in ids}
    found, ver, first = {}, None, True
    for line in log:
        h, _, subj = line.partition(' ')
        m = re.match(r'v(\d+(?:\.\d+)*)', subj.strip())
        if m:
            ver = 'v' + m.group(1)
        files = subprocess.run(['git', '-C', str(ROOT), 'ls-tree', '-r', '--name-only', h], capture_output=True, text=True).stdout.split()
        code = [f for f in files if f == 'index.html' or (f.startswith('src/js/') and f.endswith('.js'))]
        if not code:
            continue
        text = ''.join(subprocess.run(['git', '-C', str(ROOT), 'show', f'{h}:{f}'], capture_output=True, text=True, errors='replace').stdout for f in code)
        for i in list(ids - set(found)):
            if pats[i].search(text):
                found[i] = 'v9 이전' if first else (ver or '')
        first = False
    return found


def sheet(kind, rows):
    """종류 하나의 대표 시트: 그림(×2, 큰 것은 그대로) + 이름 밑글"""
    try:
        font = ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc', 11)
    except Exception:
        font = ImageFont.load_default()
    ims = []
    for a, im in rows:
        k = 1 if im.width >= 64 else 2 if im.width >= 24 else 4
        ims.append((a, im.resize((im.width * k, im.height * k), Image.NEAREST)))
    cw = max(96, max(i.width for _, i in ims) + 12)
    chh = max(i.height for _, i in ims) + 26
    cols = max(1, min(len(ims), 1600 // cw))
    sh = Image.new('RGBA', (cols * cw, ((len(ims) + cols - 1) // cols) * chh), (26, 20, 24, 255))
    d = ImageDraw.Draw(sh)
    for n, (a, im) in enumerate(ims):
        x, y = (n % cols) * cw, (n // cols) * chh
        sh.paste(im, (x + (cw - im.width) // 2, y + 4), im)
        t = a['name'] if len(a['name']) <= 9 else a['name'][:8] + '…'
        d.text((x + cw // 2, y + chh - 12), t, fill=(239, 230, 210, 255), font=font, anchor='mm')
    return sh


def write(items):
    rep = check(items)
    keep = set(rep['same']) | set(rep['font'])
    (OUT / 'img').mkdir(parents=True, exist_ok=True)
    (OUT / 'sheets').mkdir(exist_ok=True)
    since = since_map(items)
    rows, by_kind, wrote = [], {}, {'doc': 0, 'readme': 0, 'sheet': 0}

    def put(path, im):
        b = png_bytes(im)
        if path.exists() and path.read_bytes() == b:
            return False
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(b)
        return True

    kinds = pg_kinds = None
    for a, ims in items:
        raw, ref = ims['raw'], ims['ref']
        if raw is None:
            continue
        base = f"img/{a['kind']}/{a['id']}"
        wrote['doc'] += put(OUT / f'{base}.png', raw)
        row = {k: a.get(k) for k in ('kind', 'id', 'name', 'used') if a.get(k)}
        row.update({'file': f'{base}.png', 'w': raw.width, 'h': raw.height})
        if seal_src(a):
            row['seal'] = seal_src(a)
        if ref is not None:
            wrote['doc'] += put(OUT / f'{base}@r.png', ref)
            row['fileR'] = f'{base}@r.png'
        rd = readme_images(a, ims)
        if rd:
            row['readme'] = [f'docs/img/{n}.png' for n in rd]
            for n, im in rd.items():
                if n not in keep:
                    wrote['readme'] += put(README_IMG / f'{n}.png', im)
        sid = since_id(a)
        if sid and since.get(sid):
            row['since'] = since[sid]
        rows.append(row)
        by_kind.setdefault(a['kind'], []).append((a, raw))
    for k, rs in by_kind.items():
        wrote['sheet'] += put(OUT / 'sheets' / f'{k}.png', sheet(k, rs))
    kinds = [{'kind': k, 'name': n, 'count': len(by_kind.get(k, []))} for k, n in KIND_NAMES]
    data = {'game': 'joseon-exorcism', 'version': META.get('version', ''), 'kinds': kinds, 'assets': rows}
    txt = json.dumps(data, ensure_ascii=False, indent=1)
    for path, body in ((OUT / 'assets.json', txt + '\n'), (OUT / 'assets.js', '/* 도감 목록 — tools/assets.py가 만듦(손으로 고치지 마세요) */\nwindow.ASSETS = ' + txt + ';\n')):
        if not path.exists() or path.read_text(encoding='utf-8') != body:
            path.write_text(body, encoding='utf-8')
            wrote['doc'] += 1
    print(f"도감 {len(rows)}장 · 종류 {len(by_kind)} · 새로 쓴 파일: 도감 {wrote['doc']} · README {wrote['readme']} · 시트 {wrote['sheet']}")


KIND_NAMES = []
META = {}


def main():
    items = render()
    if CHECK:
        check(items)
        return
    write(items)


if __name__ == '__main__':
    main()
