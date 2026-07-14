/**
 * Pre-render blog posts as static HTML files for SEO.
 * Runs after vite build — reads JSON posts from public/blog/,
 * renders them to <dist>/blog/<slug>/index.html with full content,
 * OG tags, JSON-LD, and inlined CHROMA styles.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PUBLIC = join(__dirname, '..', 'public', 'blog')
const DIST = join(__dirname, '..', 'dist', 'blog')

const SITE = 'https://heteronym.online'

// ── CHROMA Design System styles (inlined, no external deps) ──
const STYLES = `
/* ═══════════════════════════════════════════════════
   CHROMA Design System — Blog pages
   Palette: Violet, Coral, Teal, Amber
   ═══════════════════════════════════════════════════ */

/* ── CSS Custom Properties (Design Tokens) ──────── */
:root {
  --violet: #7C5CFC;
  --violet-light: #8B6FF7;
  --violet-lighter: #A78BFA;
  --violet-dim: #6A4EE0;
  --coral: #FF6B6B;
  --coral-light: #FF8A8A;
  --coral-dim: #E55A5A;
  --teal: #14B8A6;
  --teal-light: #2DD4BF;
  --teal-dim: #0D9488;
  --amber: #F59E0B;
  --amber-light: #FBBF24;
  --amber-dim: #D97706;
  --bg-page: #f5f5f7;
  --bg-content: #ffffff;
  --bg-glass: rgba(255, 255, 255, 0.7);
  --bg-glass-l2: rgba(255, 255, 255, 0.5);
  --bg-glass-l3: rgba(255, 255, 255, 0.9);
  --bg-hover: rgba(0, 0, 0, 0.04);
  --text-primary: #1d1d1f;
  --text-secondary: #6e6e73;
  --text-tertiary: #86868b;
  --border-glass: rgba(0, 0, 0, 0.08);
  --border-strong: rgba(0, 0, 0, 0.16);
  --green: #30d158;
  --red: #ef4444;
  --orange: #ff9f0a;
  --r-sm: 6px;
  --r-md: 8px;
  --r-lg: 10px;
  --r-xl: 14px;
  --r-full: 9999px;
  --font-display: 'Space Grotesk', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg-page: #1c1c1e;
    --bg-content: #2c2c2e;
    --bg-glass: rgba(44, 44, 46, 0.8);
    --bg-glass-l2: rgba(44, 44, 46, 0.6);
    --bg-glass-l3: rgba(60, 60, 62, 0.9);
    --bg-hover: rgba(255, 255, 255, 0.08);
    --text-primary: #f5f5f7;
    --text-secondary: #a1a1a6;
    --text-tertiary: #8e8e93;
    --border-glass: rgba(255, 255, 255, 0.15);
    --border-strong: rgba(255, 255, 255, 0.2);
    --violet: #A78BFA;
    --violet-light: #B99CFF;
    --coral: #FF8A8A;
    --teal: #2DD4BF;
    --amber: #FBBF24;
  }
}
* { margin: 0; padding: 0; box-sizing: border-box; }
html {
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
body {
  font-family: var(--font-body);
  background:
    radial-gradient(ellipse 80% 60% at 0% 20%, rgba(124, 92, 252, 0.06) 0%, transparent 60%),
    radial-gradient(ellipse 60% 50% at 100% 10%, rgba(255, 107, 107, 0.05) 0%, transparent 50%),
    radial-gradient(ellipse 50% 40% at 50% 100%, rgba(20, 184, 166, 0.04) 0%, transparent 50%),
    var(--bg-page);
  color: var(--text-primary);
  line-height: 1.6;
  min-height: 100vh;
}
@media (prefers-color-scheme: dark) {
  body {
    background:
      radial-gradient(ellipse 80% 60% at 0% 20%, rgba(124, 92, 252, 0.12) 0%, transparent 60%),
      radial-gradient(ellipse 60% 50% at 100% 10%, rgba(255, 107, 107, 0.08) 0%, transparent 50%),
      radial-gradient(ellipse 50% 40% at 50% 100%, rgba(20, 184, 166, 0.06) 0%, transparent 50%),
      var(--bg-page);
  }
}
.chroma-page {
  max-width: 680px;
  margin: 0 auto;
  padding: 24px 16px;
}
.chroma-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}
.chroma-header a {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--violet);
  text-decoration: none;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  transition: color 0.15s;
}
.chroma-header a:hover { color: var(--violet-light); text-decoration: underline; }
.chroma-header-brand {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}
.chroma-card {
  background: var(--bg-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 0.5px solid var(--border-glass);
  border-radius: var(--r-lg);
  box-shadow: 0 0 0 0.5px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.04);
  padding: 32px;
  margin-bottom: 16px;
  transition: box-shadow 0.2s ease, background 0.3s ease;
}
.chroma-card-link { text-decoration: none; display: block; margin-bottom: 16px; }
.chroma-card-link:hover .chroma-card {
  box-shadow: 0 0 0 0.5px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.06);
  transform: translateY(-1px);
}
.chroma-card-title {
  font-size: 18px;
  font-weight: 600;
  font-family: var(--font-display);
  color: var(--text-primary);
  margin-bottom: 4px;
}
.chroma-title {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
  line-height: 1.3;
}
.chroma-meta {
  font-size: 13px;
  color: var(--text-tertiary);
  margin-bottom: 24px;
}
.chroma-h2 {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-top: 32px;
  margin-bottom: 12px;
}
.chroma-p {
  font-size: 15px;
  color: var(--text-secondary);
  margin-bottom: 16px;
}
.chroma-list-item {
  background: rgba(124,92,252,0.04);
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--text-secondary);
}
.chroma-list-item strong {
  color: var(--text-primary);
}
.chroma-table-wrap {
  overflow-x: auto;
  margin-bottom: 16px;
}
.chroma-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  color: var(--text-secondary);
}
.chroma-table th {
  background: rgba(124,92,252,0.08);
  color: var(--text-primary);
  font-weight: 600;
  text-align: left;
  padding: 10px 12px;
}
.chroma-table td {
  padding: 8px 12px;
  border-bottom: 0.5px solid var(--border-glass);
}
.chroma-cta {
  display: block;
  text-align: center;
  margin: 24px 0;
}
.chroma-cta a {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, var(--violet), var(--violet-dim));
  color: #fff;
  text-decoration: none;
  padding: 12px 28px;
  border-radius: var(--r-sm);
  font-size: 15px;
  font-weight: 600;
  font-family: var(--font-body);
  box-shadow: 0 1px 3px rgba(124, 92, 252, 0.25);
  transition: box-shadow 0.2s, transform 0.15s, background 0.2s;
}
.chroma-cta a:hover {
  box-shadow: 0 2px 8px rgba(124, 92, 252, 0.35);
  transform: translateY(-0.5px);
}
.chroma-footer {
  text-align: center;
  padding: 24px 0;
  color: var(--text-tertiary);
  font-size: 13px;
}
.chroma-footer a { color: var(--violet); text-decoration: none; }
.chroma-footer a:hover { text-decoration: underline; }
`

// ── Content block renderers ──

function renderBlock(block) {
  switch (block.type) {
    case 'paragraph':
      return `<p class="chroma-p">${block.text}</p>`
    case 'heading':
      return `<h2 class="chroma-h2">${block.text}</h2>`
    case 'list':
      const items = block.items.map(item =>
        `<div class="chroma-list-item"><strong>${item.term}</strong>: ${item.definition}</div>`
      ).join('\n')
      return `<div class="chroma-list">${items}</div>`
    case 'table':
      const thead = block.headers
        ? `<thead><tr>${block.headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>`
        : ''
      const tbody = block.rows
        ? `<tbody>${block.rows.map(row =>
            `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
          ).join('')}</tbody>`
        : ''
      return `<div class="chroma-table-wrap"><table class="chroma-table">${thead}${tbody}</table></div>`
    case 'cta':
      return `<div class="chroma-cta"><a href="${block.url}" target="_blank" rel="noopener">${block.text}</a></div>`
    default:
      return ''
  }
}

function renderContent(blocks) {
  return blocks.map(renderBlock).join('\n')
}

const FONT_LINKS = `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">`

// ── Build HTML page ──

function buildPage(post) {
  const slug = post.slug
  const title = `${post.title} — Heteronym Blog`
  const url = `${SITE}/blog/${slug}`
  const image = `${SITE}/og-image.png`
  const body = renderContent(post.content || [])

  const ld = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { '@type': 'Person', name: 'Dylan Demolder' },
    publisher: { '@type': 'Organization', name: 'Heteronym', url: SITE },
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  })

  const tags = (post.tags || []).join(', ')
  const readTime = post.readTime || ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${post.description}">
  <meta property="og:title" content="${post.title}">
  <meta property="og:description" content="${post.description}">
  <meta property="og:image" content="${image}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${url}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="canonical" href="${url}">${FONT_LINKS}
  <script type="application/ld+json">${ld}</script>
  <style>${STYLES}</style>
</head>
<body>
  <div class="chroma-page">
    <header class="chroma-header">
      <a href="/">\u2190 Play Heteronym</a>
      <span class="chroma-header-brand">Blog</span>
    </header>
    <main>
      <article class="chroma-card">
        <h1 class="chroma-title">${post.title}</h1>
        <p class="chroma-meta">${post.date}${readTime ? ' \u00b7 ' + readTime : ''}${tags ? ' \u00b7 ' + tags : ''}</p>
        <div class="chroma-content">
          ${body}
        </div>
      </article>
      <div class="chroma-cta">
        <a href="/">Play Today's Heteronym Puzzle \u2192</a>
      </div>
    </main>
    <footer class="chroma-footer">
      <p><a href="/">Heteronym</a> \u2014 Two clues, one hidden word. A new puzzle every day.</p>
      <p style="margin-top:8px"><a href="/blog">Blog</a> \u00b7 <a href="/?page=about">About</a> \u00b7 <a href="/?page=archive">Archive</a></p>
    </footer>
  </div>
</body>
</html>`
}

// ── Main ──

function main() {
  const indexFile = join(PUBLIC, 'index.json')
  const index = JSON.parse(readFileSync(indexFile, 'utf-8'))

  for (const entry of index) {
    const slug = entry.slug
    const jsonPath = join(PUBLIC, `${slug}.json`)

    if (!existsSync(jsonPath)) {
      console.warn(`  \u26a0  Missing: ${slug}.json — skipping`)
      continue
    }

    const post = JSON.parse(readFileSync(jsonPath, 'utf-8'))
    const html = buildPage(post)

    const outDir = join(DIST, slug)
    mkdirSync(outDir, { recursive: true })
    writeFileSync(join(outDir, 'index.html'), html, 'utf-8')
    console.log(`  \u2713  ${slug}/index.html`)
  }

  // Also generate an index page at /blog/index.html
  const indexHtml = buildBlogIndex(index)
  mkdirSync(join(DIST, '..', 'blog'), { recursive: true })
  writeFileSync(join(DIST, '..', 'blog', 'index.html'), indexHtml, 'utf-8')
  console.log('  \u2713  blog/index.html')
}

function buildBlogIndex(posts) {
  const cards = posts.map(p => `
    <a href="/blog/${p.slug}" class="chroma-card-link">
      <article class="chroma-card">
        <h2 class="chroma-card-title">${p.title}</h2>
        <p class="chroma-meta">${p.date}${p.readTime ? ' \u00b7 ' + p.readTime : ''}</p>
        <p class="chroma-p" style="margin-bottom:0">${p.description}</p>
      </article>
    </a>
  `).join('\n')

  const ld = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    headline: 'Heteronym Blog',
    description: 'Puzzles, word curiosities, and behind-the-scenes from the world of heteronyms.',
    url: `${SITE}/blog`,
  })

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blog — Heteronym</title>
  <meta name="description" content="Puzzles, word curiosities, and behind-the-scenes from the world of heteronyms.">
  <meta property="og:title" content="Heteronym Blog">
  <meta property="og:description" content="Puzzles, word curiosities, and behind-the-scenes from the world of heteronyms.">
  <meta property="og:image" content="${SITE}/og-image.png">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${SITE}/blog">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="canonical" href="${SITE}/blog">${FONT_LINKS}
  <script type="application/ld+json">${ld}</script>
  <style>${STYLES}</style>
</head>
<body>
  <div class="chroma-page">
    <header class="chroma-header">
      <a href="/">\u2190 Play Heteronym</a>
      <span class="chroma-header-brand">Blog</span>
    </header>
    <main>
      <h1 class="chroma-title" style="margin-bottom:8px">Heteronym Blog</h1>
      <p class="chroma-p">Puzzles, word curiosities, and behind-the-scenes from the world of heteronyms.</p>
      ${cards}
    </main>
    <footer class="chroma-footer">
      <p><a href="/">Heteronym</a> \u2014 Two clues, one hidden word. A new puzzle every day.</p>
    </footer>
  </div>
</body>
</html>`
}

main()
