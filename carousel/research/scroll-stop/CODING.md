# Coding scheme for covers — fixed before the first sheet was read

Coded blind: sheets show an opaque code only (`analyze/blind-sheets.mjs`).
One JSON line per cover in `coded.jsonl`.

| field | values | rule |
|---|---|---|
| `text` | string | the overlay text exactly as printed, lines joined with " / "; spelling kept; "" if none |
| `lang` | he · en · other · none | language of the overlay text |
| `person` | 0 · 1 | any human visible, including from behind or small |
| `face` | 0 · 1 | a human face visible enough to read an expression |
| `eye` | 0 · 1 | that face looks at the camera |
| `scene` | sea · city · landmark · nature · food · interior · collage · plain · screenshot · other | what dominates the frame. `collage` = 2+ photos tiled. `plain` = a flat or blurred field behind text. `landmark` = a specific named monument is the subject |
| `textpos` | top · mid · bottom · none | where the CENTRE of the main text block sits (thirds of the frame) |
| `big` | 0 · 1 | the headline is large: legible at grid-thumbnail size |
| `emoji` | integer | emoji drawn on the frame |

Everything about wording — question, number, destination named, warning,
superlative, curiosity, money, first person, "you", word count — is derived
from `text` by code, not judged by eye, so the same rule applies to every
cover (`analyze/copy-features.mjs`).
