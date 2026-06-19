import { useState, useEffect } from 'react'
import { GlassPanel, Icon, Skeleton, ChromaButton } from './chroma'

export default function BlogPost({ slug, onBack }) {
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/blog/${slug}.json`)
      .then(r => {
        if (!r.ok) throw new Error('Post not found')
        return r.json()
      })
      .then(data => {
        setPost(data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [slug])

  // SEO: update document title, meta tags, and JSON-LD structured data when a post is loaded
  useEffect(() => {
    if (!post) return
    const prevTitle = document.title
    const prevDesc = document.querySelector('meta[name="description"]')?.getAttribute('content') || ''
    const prevOgTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content') || ''
    const prevOgDesc = document.querySelector('meta[property="og:description"]')?.getAttribute('content') || ''

    document.title = `${post.title} — Heteronym Blog`
    const descMeta = document.querySelector('meta[name="description"]')
    if (descMeta) descMeta.setAttribute('content', post.description)
    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) ogTitle.setAttribute('content', post.title)
    const ogDesc = document.querySelector('meta[property="og:description"]')
    if (ogDesc) ogDesc.setAttribute('content', post.description)

    // JSON-LD structured data (Article schema)
    let ldScript = document.getElementById('ld-article')
    if (!ldScript) {
      ldScript = document.createElement('script')
      ldScript.id = 'ld-article'
      ldScript.type = 'application/ld+json'
      document.head.appendChild(ldScript)
    }
    ldScript.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      author: {
        '@type': 'Person',
        name: 'Dylan Demolder',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Heteronym',
        url: 'https://heteronym.online',
      },
      url: `https://heteronym.online/blog/${post.slug}`,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://heteronym.online/blog/${post.slug}`,
      },
    })

    return () => {
      document.title = prevTitle
      const dm = document.querySelector('meta[name="description"]')
      if (dm) dm.setAttribute('content', prevDesc)
      const ot = document.querySelector('meta[property="og:title"]')
      if (ot) ot.setAttribute('content', prevOgTitle)
      const od = document.querySelector('meta[property="og:description"]')
      if (od) od.setAttribute('content', prevOgDesc)
      // Remove JSON-LD on unmount
      const s = document.getElementById('ld-article')
      if (s) s.remove()
    }
  }, [post])

  if (loading) {
    return (
      <div className="chroma-w-full chroma-max-w-md chroma-mx-auto">
        <Skeleton width="100%" height={200} radius="var(--r-lg)" />
      </div>
    )
  }

  if (!post) {
    return (
      <GlassPanel padding={24} className="chroma-w-full chroma-max-w-md chroma-text-center">
        <Icon name="error" size={24} color="var(--red)" />
        <p className="chroma-text-sm chroma-text-secondary chroma-mt-2">Post not found.</p>
        <ChromaButton variant="ghost" size="sm" icon="arrow_back" onClick={onBack} className="chroma-mt-3">
          Back to blog
        </ChromaButton>
      </GlassPanel>
    )
  }

  return (
    <div className="chroma-w-full chroma-max-w-md chroma-mx-auto">
      <GlassPanel padding={24} className="chroma-w-full chroma-mb-2">
        <ChromaButton variant="ghost" size="sm" icon="arrow_back" onClick={onBack}>
          Back to blog
        </ChromaButton>
      </GlassPanel>

      <GlassPanel padding={24} className="chroma-w-full">
        <h1 className="chroma-text-xl chroma-font-bold chroma-text-primary chroma-mb-2">
          {post.title}
        </h1>
        <p className="chroma-text-xs chroma-text-tertiary chroma-mb-4">
          {post.date} · {post.tags?.join(', ')}
        </p>

        {post.content?.map((block, i) => renderBlock(block, i))}

      </GlassPanel>
    </div>
  )
}

function renderBlock(block, i) {
  switch (block.type) {
    case 'paragraph':
      return (
        <p key={i} className="chroma-text-sm chroma-text-secondary chroma-mb-3 chroma-leading-relaxed">
          {block.text}
        </p>
      )
    case 'heading':
      return (
        <h2 key={i} className="chroma-text-lg chroma-font-semibold chroma-text-primary chroma-mt-5 chroma-mb-3">
          {block.text}
        </h2>
      )
    case 'list':
      return (
        <div key={i} className="chroma-mb-3 chroma-space-y-2">
          {block.items.map((item, j) => (
            <div key={j} className="chroma-text-sm chroma-text-secondary chroma-bg-hover chroma-rounded-lg chroma-p-2">
              <strong className="chroma-text-primary">{item.term}</strong>: {item.definition}
            </div>
          ))}
        </div>
      )
    case 'table':
      return (
        <div key={i} className="chroma-overflow-x-auto chroma-mb-3">
          <table className="chroma-w-full chroma-text-xs chroma-text-secondary chroma-border-collapse">
            <thead>
              <tr className="chroma-bg-hover">
                {block.headers.map((h, j) => (
                  <th key={j} className="chroma-p-2 chroma-text-left chroma-font-semibold chroma-text-primary">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, j) => (
                <tr key={j} className="chroma-bg-hover">
                  {row.map((cell, k) => (
                    <td key={k} className="chroma-p-2 chroma-whitespace-nowrap">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    case 'cta':
      return (
        <div key={i} className="chroma-mt-4 chroma-mb-4 chroma-text-center">
          <a
            href={block.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ChromaButton variant="primary" icon="arrow_forward" fullWidth>
              {block.text}
            </ChromaButton>
          </a>
        </div>
      )
    default:
      return null
  }
}
