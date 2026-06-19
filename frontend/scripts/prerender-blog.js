/**
 * Pre-render blog posts as static HTML files for SEO.
 * Runs after vite build — reads JSON posts from public/blog/,
 * renders them to <dist>/blog/<slug>/index.html with full content,
 * OG tags, JSON-LD, and inlined CHROMA-inspired styles.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PUBLIC = join(__dirname, '..', 'public', 'blog')
const DIST = join(__dirname, '..', 'dist', 'blog')

const SITE = 'https://heteronym.online'

// ── Minimal CHROMA-inspired styles (inlined, no external deps) ──
const STYLES = `
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  background: #f5f5f7;
  color: #1a1a2e;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
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
  color: #7C5CFC;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
}
.chroma-header a:hover { text-decoration: underline; }
.chroma-card {
  background: rgba(255,255,255,0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(124,92,252,0.12);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 16px;
}
.chroma-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 8px;
  line-height: 1.3;
}
.chroma-meta {
  font-size: 13px;
  color: #888;
  margin-bottom: 24px;
}
.chroma-h2 {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a2e;
  margin-top: 32px;
  margin-bottom: 12px;
}
.chroma-p {
  font-size: 15px;
  color: #444;
  margin-bottom: 16px;
}
.chroma-list-item {
  background: rgba(124,92,252,0.04);
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #444;
}
.chroma-list-item strong {
  color: #1a1a2e;
}
.chroma-table-wrap {
  overflow-x: auto;
  margin-bottom: 16px;
}
.chroma-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  color: #444;
}
.chroma-table th {
  background: rgba(124,92,252,0.08);
  color: #1a1a2e;
  font-weight: 600;
  text-align: left;
  padding: 10px 12px;
}
.chroma-table td {
  padding: 8px 12px;
  border-bottom: 1px solid #eee;
}
.chroma-cta {
  display: block;
  text-align: center;
  margin: 24px 0;
}
.chroma-cta a {
  display: inline-block;
  background: #7C5CFC;
  color: white;
  text-decoration: none;
  padding: 12px 28px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  transition: background 0.2s;
}
.chroma-cta a:hover { background: #6a4de0; }
.chroma-footer {
  text-align: center;
  padding: 24px 0;
  color: #888;
  font-size: 13px;
}
.chroma-footer a { color: #7C5CFC; text-decoration: none; }
.chroma-footer a:hover { text-decoration: underline; }
@media (prefers-color-scheme: dark) {
  body { background: #0f0f1a; color: #e8e8f0; }
  .chroma-card { background: rgba(20,20,35,0.9); border-color: rgba(124,92,252,0.2); }
  .chroma-title { color: #e8e8f0; }
  .chroma-p { color: #b0b0c0; }
  .chroma-list-item { background: rgba(124,92,252,0.08); color: #b0b0c0; }
  .chroma-list-item strong { color: #e8e8f0; }
  .chroma-table td { border-color: #2a2a3e; color: #b0b0c0; }
  .chroma-table th { background: rgba(124,92,252,0.12); color: #e8e8f0; }
  .chroma-meta { color: #888; }
  .chroma-footer { color: #666; }
}
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
  <link rel="canonical" href="${url}">
  <script type="application/ld+json">${ld}</script>
  <style>${STYLES}</style>
</head>
<body>
  <div class="chroma-page">
    <header class="chroma-header">
      <a href="/">← Play Heteronym</a>
      <a href="/blog">Blog</a>
    </header>
    <main>
      <article class="chroma-card">
        <h1 class="chroma-title">${post.title}</h1>
        <p class="chroma-meta">${post.date}${readTime ? ' · ' + readTime : ''}${tags ? ' · ' + tags : ''}</p>
        <div class="chroma-content">
          ${body}
        </div>
      </article>
      <div class="chroma-cta">
        <a href="/">Play Today's Heteronym Puzzle →</a>
      </div>
    </main>
    <footer class="chroma-footer">
      <p><a href="/">Heteronym</a> — Two clues, one hidden word. A new puzzle every day.</p>
      <p style="margin-top:8px"><a href="/blog">Blog</a> · <a href="/?page=about">About</a> · <a href="/?page=archive">Archive</a></p>
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
      console.warn(`  ⚠  Missing: ${slug}.json — skipping`)
      continue
    }

    const post = JSON.parse(readFileSync(jsonPath, 'utf-8'))
    const html = buildPage(post)

    const outDir = join(DIST, slug)
    mkdirSync(outDir, { recursive: true })
    writeFileSync(join(outDir, 'index.html'), html, 'utf-8')
    console.log(`  ✓  ${slug}/index.html`)
  }

  // Also generate an index page at /blog/index.html
  const indexHtml = buildBlogIndex(index)
  mkdirSync(join(DIST, '..', 'blog'), { recursive: true })
  writeFileSync(join(DIST, '..', 'blog', 'index.html'), indexHtml, 'utf-8')
  console.log('  ✓  blog/index.html')
}

function buildBlogIndex(posts) {
  const cards = posts.map(p => `
    <a href="/blog/${p.slug}" class="chroma-card-link">
      <article class="chroma-card">
        <h2 class="chroma-card-title">${p.title}</h2>
        <p class="chroma-meta">${p.date}${p.readTime ? ' · ' + p.readTime : ''}</p>
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
  <link rel="canonical" href="${SITE}/blog">
  <script type="application/ld+json">${ld}</script>
  <style>${STYLES}
.chroma-card-link { text-decoration: none; display: block; margin-bottom: 16px; }
.chroma-card-link:hover .chroma-card { border-color: rgba(124,92,252,0.3); }
.chroma-card-title { font-size: 18px; font-weight: 600; color: #1a1a2e; margin-bottom: 4px; }
@media (prefers-color-scheme: dark) {
  .chroma-card-title { color: #e8e8f0; }
}
  </style>
</head>
<body>
  <div class="chroma-page">
    <header class="chroma-header">
      <a href="/">← Play Heteronym</a>
      <span style="font-size:14px;font-weight:600;color:#1a1a2e">Blog</span>
    </header>
    <main>
      <h1 style="font-size:24px;font-weight:700;margin-bottom:8px">Heteronym Blog</h1>
      <p style="color:#888;font-size:14px;margin-bottom:24px">Puzzles, word curiosities, and behind-the-scenes from the world of heteronyms.</p>
      ${cards}
    </main>
    <footer class="chroma-footer">
      <p><a href="/">Heteronym</a> — Two clues, one hidden word. A new puzzle every day.</p>
    </footer>
  </div>
</body>
</html>`
}

main()
