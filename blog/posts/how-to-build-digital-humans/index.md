---
title: How to Build Digital Humans?
---

If you want a single place to track work on controllable 3D human avatar creation (priors, representations, and animation), this post acts like a living reading list.

The paper list below is rendered client-side by fetching a JSON file (so you can “import” new papers just by editing `papers.json` and refreshing the page).

<div id="paper-explorer"></div>

## How to add new papers

Edit `./papers.json` in this folder. Each entry can include:

- `id` (string, unique)
- `title`
- `authors` (array of strings)
- `year` (number)
- `venue` (optional string)
- `type` (`preprint`, `conference`, or `journal`; optional)
- `tags` (array of strings, used for filtering)
- `links` (optional object: `pdf`, `project`, `doi`)
- `abstract` (optional string)
- `bibtex` (optional string; enables the BibTeX modal)

