import Icon from './chroma/Icon'
import ChromaButton from './chroma/ChromaButton'
import BlogIndex from './BlogIndex'
import BlogPost from './BlogPost'

/**
 * BlogPage — standalone page for the Heteronym blog.
 *
 * Replaces the puzzle view entirely when navigating to ?page=blog
 * or ?page=blog&slug=<post-slug>. Slug state is managed by the parent
 * (App.jsx) which syncs it to the URL for browser back/forward support.
 */
export default function BlogPage({ slug, onSelectPost, onClose }) {

  return (
    <div className="chroma-w-full chroma-max-w-md chroma-mx-auto chroma-py-6 chroma-px-4">
      {/* Page header */}
      <div className="chroma-flex chroma-items-center chroma-justify-between chroma-mb-5">
        <div className="chroma-flex chroma-items-center chroma-gap-2">
          {slug ? (
            <ChromaButton variant="ghost" size="sm" icon="arrow_back" onClick={() => onSelectPost(null)}>
              All posts
            </ChromaButton>
          ) : (
            <>
              <Icon name="article" size={22} color="var(--violet)" filled />
              <h1 className="chroma-text-xl chroma-font-bold chroma-text-primary">Blog</h1>
            </>
          )}
        </div>
        <ChromaButton variant="ghost" size="sm" icon="close" onClick={onClose}>
          Back to Game
        </ChromaButton>
      </div>

      {/* Subtitle shown only on index */}
      {!slug && (
        <p className="chroma-text-sm chroma-text-secondary chroma-mb-5 chroma-text-balance">
          Puzzles, word curiosities, and behind-the-scenes from the world of heteronyms.
        </p>
      )}

      {/* Content */}
      {slug ? (
        <BlogPost slug={slug} onBack={() => onSelectPost(null)} />
      ) : (
        <BlogIndex onSelectPost={onSelectPost} />
      )}
    </div>
  )
}
