import { GlassPanel, Icon, ChromaButton } from './chroma'

export default function About() {
  return (
    <div className="chroma-w-full chroma-max-w-md chroma-mx-auto">
      <GlassPanel padding={24} className="chroma-w-full chroma-text-center chroma-mb-4">
        <h2 className="chroma-text-lg chroma-font-bold chroma-text-primary chroma-mb-3">
          About Heteronym
        </h2>
        <p className="chroma-text-sm chroma-text-secondary chroma-mb-4">
          <strong className="chroma-text-primary">Heteronym</strong> is a daily word puzzle where
          two clues point to one hidden word — a <em>heteronym</em> (spelled the same, different
          meanings).
        </p>
        <div className="chroma-text-left chroma-text-sm chroma-text-secondary chroma-mb-4 chroma-space-y-2">
          <p>
            <Icon name="psychology" size={16} className="chroma-align-middle chroma-mr-1" />
            Think of it as a different kind of word game. Instead of guessing letter-by-letter,
            you use lateral thinking to find the word that connects both clues.
          </p>
          <p>
            <Icon name="emoji_events" size={16} className="chroma-align-middle chroma-mr-1" />
            Each day brings a new puzzle, same for everyone. Share your results and
            challenge your friends!
          </p>
        </div>
      </GlassPanel>

      <GlassPanel padding={24} className="chroma-w-full chroma-text-center chroma-mb-4">
        <h3 className="chroma-text-base chroma-font-semibold chroma-text-primary chroma-mb-3">
          <Icon name="construction" size={16} className="chroma-align-middle chroma-mr-1" />
          What's a Heteronym?
        </h3>
        <p className="chroma-text-sm chroma-text-secondary chroma-mb-3">
          A <strong className="chroma-text-primary">heteronym</strong> is a word that's spelled the
          same as another word but has a different meaning (and sometimes a different pronunciation).
        </p>
        <div className="chroma-text-left chroma-text-sm chroma-bg-hover chroma-rounded-lg chroma-p-3 chroma-space-y-2">
          <p><strong className="chroma-text-primary">lead</strong> — to guide / the metal</p>
          <p><strong className="chroma-text-primary">wind</strong> — moving air / to coil</p>
          <p><strong className="chroma-text-primary">tear</strong> — to rip / a drop from your eye</p>
          <p><strong className="chroma-text-primary">bow</strong> — a weapon / to bend forward / a ribbon</p>
          <p><strong className="chroma-text-primary">minute</strong> — 60 seconds / very small</p>
        </div>
      </GlassPanel>

      <GlassPanel padding={24} className="chroma-w-full chroma-text-center chroma-mb-4">
        <h3 className="chroma-text-base chroma-font-semibold chroma-text-primary chroma-mb-3">
          <Icon name="coffee" size={16} className="chroma-align-middle chroma-mr-1" />
          Support
        </h3>
        <p className="chroma-text-sm chroma-text-secondary chroma-mb-3">
          Heteronym is a passion project. If you enjoy the game, consider supporting it!
        </p>
        <a
          href="https://ko-fi.com/dylandemolder"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ChromaButton variant="primary" icon="coffee" fullWidth>
            Support on Ko-fi
          </ChromaButton>
        </a>
      </GlassPanel>

      <p className="chroma-text-xs chroma-text-center chroma-text-tertiary chroma-pb-4">
        Made with <Icon name="favorite" size={12} color="var(--red)" filled /> by Dylan Demolder
      </p>
    </div>
  )
}
