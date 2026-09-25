# samuel-malec.github.io

Personal site of Samuel Malec — compiler engineering, programming languages and
static analysis. Built with [Docusaurus](https://docusaurus.io/) and deployed to
GitHub Pages by `.github/workflows/deploy.yml` on every push to `master`.

## Layout

| Route                 | Source                                      |
| --------------------- | ------------------------------------------- |
| `/`                   | `src/pages/index.tsx`                       |
| `/projects`           | `src/pages/projects/index.tsx`              |
| `/projects/<project>` | `src/pages/projects/<project>.mdx`          |
| `/about`              | `src/pages/about.mdx`                       |
| `/reading`            | `src/pages/reading.mdx`                     |
| `/blog/...`           | `blog/<YYYY-MM-DD>-<slug>/<name>.mdx`       |

`src/data/projects.ts` is the single source of truth for the project list: the
home page, `/projects` and each project page's header all read from it.
`src/data/posts.ts` controls which posts the home page links to.

Blog post URLs are derived from the dated directory name, so renaming a post
directory changes its URL.

## Development

```bash
npm install
npm run start      # dev server with hot reload
npm run build      # static build into build/
npm run serve      # serve the build at http://localhost:3000
npm run typecheck  # tsc --noEmit
```

`npm run build` fails on broken internal links, so a successful build means
every internal link resolves.

## Open TODOs

- `static/cv.pdf` does not exist; `/about` shows a placeholder instead of a
  download link. The markup to swap in is in a comment in `src/pages/about.mdx`.
- No Open Graph card image; see the TODO in `docusaurus.config.ts`.
