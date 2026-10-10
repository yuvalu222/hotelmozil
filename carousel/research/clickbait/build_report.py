# Assembles 03-cover-census.md from prose (this file) + generated tables (census-tables.md)
# + web findings (web-findings.md). Strips every bidi control character before writing.
import os, re

HERE = os.path.dirname(os.path.abspath(__file__))
tab = open(os.path.join(HERE, 'census-tables.md'), encoding='utf-8').read()
web = open(os.path.join(HERE, 'web-findings.tmpl'), encoding='utf-8').read()


def sec(name):
    m = re.search(r'## ' + re.escape(name) + r'\n(.*?)(?=\n## [A-Z0-9-]+\n|\Z)', tab, re.S)
    return m.group(1).strip()


prose = open(os.path.join(HERE, 'report-prose.tmpl'), encoding='utf-8').read()
out = re.sub(r'\{\{([A-Z0-9-]+)\}\}', lambda m: web.strip() if m.group(1) == 'WEB' else sec(m.group(1)), prose)
BIDI = ''.join(chr(c) for c in [0x200E, 0x200F, 0x061C, 0x202A, 0x202B, 0x202C, 0x202D, 0x202E,
                                0x2066, 0x2067, 0x2068, 0x2069])
out = re.sub('[' + re.escape(BIDI) + ']', '', out)
open(os.path.join(HERE, '03-cover-census.md'), 'w', encoding='utf-8').write(out)
left = [c for c in out if c in BIDI]
print('written', len(out), 'chars; bidi chars left:', len(left))
