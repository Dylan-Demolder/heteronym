import { useState, useEffect } from 'react'
import { GlassPanel, ChromaButton, Icon, Skeleton, Badge } from './chroma'

export default function BlogIndex({ onSelectPost }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/blog/index.json')
      .then(r => {
        if (!r.ok) throw new Error('No blog posts yet')
        return r.json()
      })
      .then(data => {
        setPosts(data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="chroma-w-full chroma-max-w-md chroma-mx-auto">
        <Skeleton width="100%" height={80} radius="var(--r-lg)" className="chroma-mb-2" />
        <Skeleton width="100%" height={80} radius="var(--r-lg)" />
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <GlassPanel padding={24} className="chroma-w-full chroma-max-w-md chroma-text-center">
        <Icon name="article" size={24} color="var(--violet)" />
        <p className="chroma-text-sm chroma-text-secondary chroma-mt-2">No blog posts yet. Check back soon!</p>
      </GlassPanel>
    )
  }

  return (
    <div className="chroma-w-full chroma-max-w-md chroma-mx-auto chroma-space-y-3">
      {posts.map((post) => (
        <GlassPanel key={post.slug} padding={16} className="chroma-w-full">
          <h3 className="chroma-text-base chroma-font-semibold chroma-text-primary chroma-mb-1">
            {post.title}
          </h3>
          <p className="chroma-text-xs chroma-text-tertiary chroma-mb-2">
            {post.date} · {post.readTime}
          </p>
          <p className="chroma-text-sm chroma-text-secondary chroma-mb-3">
            {post.description}
          </p>
          <div className="chroma-flex chroma-items-center chroma-justify-between">
            <div className="chroma-flex chroma-gap-1">
              {post.tags?.map(tag => (
                <Badge key={tag} variant="accent">{tag}</Badge>
              ))}
            </div>
            <ChromaButton variant="ghost" size="sm" icon="arrow_forward" onClick={() => onSelectPost(post.slug)}>
              Read
            </ChromaButton>
          </div>
        </GlassPanel>
      ))}
    </div>
  )
}
