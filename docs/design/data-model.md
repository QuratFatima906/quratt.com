# Content model

Lifted verbatim from the design's `SEED` and `SCHEMA` objects in
`Portfolio-with-Admin.dc.html`. This is the contract for P2 — do not invent fields.

Nine collections. Two are single-record (`about`, `contact`); the rest are ordered lists.
`sort_order` is explicit because the design's editor lets you reorder rows by hand.

| Collection | Window | Shape | Flags |
|---|---|---|---|
| `about` | `about.md` | single | — |
| `contact` | `say-hi.eml` | single | — |
| `now` | `now.txt` | list + `nowUpdated` stamp | — |
| `projects` | `projects/` | list | `draft`, `pinned` |
| `posts` | `writes.md` | list | `draft`, `pinned` |
| `talks` | `talks.md` | list | `draft`, `pinned` |
| `shelf` | `reads.md` | list | — |
| `uses` | `uses.txt` | list | — |
| `cv` | `cv.pdf` | list | — |

## Fields

The third value in the design's field tuples means "this input spans the full row" in the
editor. It is a UI hint, kept here because P9 will need it.

```
about     name · role · meta · bio1¹ · bio2¹
contact   email · subject · note¹
now       line¹                                  (+ nowUpdated on the collection)
projects  name · year · lang · tag · desc¹       + draft, pinned
posts     title¹ · blurb¹ · date · mins          + draft, pinned
talks     title¹ · venue · year · links          + draft, pinned
shelf     title · state · note¹
uses      label · value¹
cv        period · role¹ · note¹

¹ full-width field in the editor
```

## Enumerations

- `projects.tag` — `systems` · `tools` · `silly`. Drives the filter chips and the dot colour
  (`--tag-systems` lime, `--tag-tools` violet, `--tag-silly` amber). New tags appear in the
  filter automatically; the design derives chips from the data.
- `shelf.state` — `now` · `done` · `soon` · `gave up`. Anything unrecognised falls back to
  the danger colour, which is how the design renders `gave up`.

## Derived views

These are computed, never stored:

- **featured projects** — `pinned && !draft`, first 4, shown in the small `projects/` window
- **recent posts** — first 4 visible posts
- **recent shelf** — first 4 books
- **counts** — `projects/ — {n} items`, `all {n} posts`, `shelf/ — {n} books`. All count
  *visible* rows, so a draft must not inflate them.
- **`dateOrState`** — a draft post shows `draft` in place of its date, in amber. Only ever
  visible to an admin; visitors never receive draft rows at all.

## Visibility

Drafts are filtered in the query layer, not in the component. A visitor's response must not
contain draft rows in any form — not hidden, not in a payload, not in a count. `visible()`
in `lib/content/queries.ts` is the single place this is decided, and the single place admin
auth will later relax it.
