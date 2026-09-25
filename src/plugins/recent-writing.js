const fs = require('fs');
const path = require('path');

/**
 * Collects the most recent entries from the blog and notes directories and
 * exposes them as global data, so the home page can list them without anyone
 * maintaining a hand-written list.
 *
 * Permalinks are reconstructed with the same rule the blog plugin uses:
 *   blog/2026-09-03-compiler-dungeon/intro.mdx -> /blog/2026/09/03/compiler-dungeon/intro
 *   notes/2026-09-25-some-note.md              -> /notes/2026/09/25/some-note
 *   a directory whose file is index.md drops the trailing file segment,
 *   and a `slug:` in the front matter replaces the date and slug entirely.
 *
 * If that ever drifts from what the blog plugin generates, the build fails
 * rather than shipping a dead link: onBrokenLinks is set to 'throw'.
 */

const DATED = /^(\d{4})-(\d{2})-(\d{2})-(.+)$/;
const MARKDOWN = /\.mdx?$/;

function parseFrontMatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    return {};
  }
  const fields = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (kv) {
      fields[kv[1]] = kv[2].trim().replace(/^['"]|['"]$/g, '');
    }
  }
  return fields;
}

function firstHeading(raw) {
  const body = raw.replace(/^---\r?\n[\s\S]*?\r?\n---/, '');
  const match = body.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

/** The markdown file that represents a post directory. */
function entryFileOf(dir) {
  const files = fs.readdirSync(dir).filter((f) => MARKDOWN.test(f));
  if (files.length === 0) {
    return null;
  }
  return files.find((f) => /^index\.mdx?$/.test(f)) ?? files[0];
}

function collect(absDir, routeBasePath, source) {
  if (!fs.existsSync(absDir)) {
    return [];
  }

  const entries = [];

  for (const name of fs.readdirSync(absDir)) {
    const abs = path.join(absDir, name);
    const isDir = fs.statSync(abs).isDirectory();

    const dated = DATED.exec(isDir ? name : name.replace(MARKDOWN, ''));
    if (!dated) {
      continue; // authors.yml, tags.yml, undated files
    }
    if (!isDir && !MARKDOWN.test(name)) {
      continue;
    }

    const [, year, month, day, slug] = dated;
    const file = isDir ? entryFileOf(abs) : name;
    if (!file) {
      continue;
    }

    const raw = fs.readFileSync(isDir ? path.join(abs, file) : abs, 'utf8');
    const frontMatter = parseFrontMatter(raw);

    // Drafts are excluded from production builds and unlisted entries are kept
    // out of listings, so neither belongs in a "latest" list. Skipping drafts
    // in dev too keeps this list identical in both.
    if (frontMatter.draft === 'true' || frontMatter.unlisted === 'true') {
      continue;
    }

    let permalink;
    if (frontMatter.slug) {
      const s = frontMatter.slug.startsWith('/')
        ? frontMatter.slug
        : `/${frontMatter.slug}`;
      permalink = `${routeBasePath}${s}`;
    } else {
      const base = file.replace(MARKDOWN, '');
      const tail = !isDir || base === 'index' ? '' : `/${base}`;
      permalink = `${routeBasePath}/${year}/${month}/${day}/${slug}${tail}`;
    }

    entries.push({
      title: frontMatter.title || firstHeading(raw) || slug,
      permalink,
      date: `${year}-${month}-${day}`,
      source,
    });
  }

  return entries;
}

module.exports = function recentWritingPlugin(context, options) {
  const {limit = 5, sources = []} = options ?? {};

  return {
    name: 'recent-writing',

    async loadContent() {
      const all = sources.flatMap(({dir, routeBasePath, label}) =>
        collect(path.resolve(context.siteDir, dir), routeBasePath, label),
      );
      all.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
      return all.slice(0, limit);
    },

    async contentLoaded({content, actions}) {
      actions.setGlobalData({entries: content});
    },
  };
};
