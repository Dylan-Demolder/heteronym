export default function Tabs({
  tabs,
  activeId,
  onChange,
  className = '',
}) {
  return (
    <div className={`chroma-tabs-bar ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`chroma-tab ${activeId === tab.id ? 'chroma-tab-active' : ''}`}
          disabled={tab.disabled}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
