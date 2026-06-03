export function AiResponseRenderer({ text }) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];
  let key = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      elements.push(<br key={key++} />);
    } else if (trimmed.startsWith('## ')) {
      elements.push(<h3 key={key++} className="ai-h2">{trimmed.slice(3)}</h3>);
    } else if (trimmed.startsWith('# ')) {
      elements.push(<h2 key={key++} className="ai-h1">{trimmed.slice(2)}</h2>);
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      elements.push(
        <div key={key++} className="ai-bullet">
          <span className="ai-bullet-dot">•</span>
          <span>{formatInline(trimmed.slice(2))}</span>
        </div>
      );
    } else if (/^\d+\.\s/.test(trimmed)) {
      elements.push(
        <div key={key++} className="ai-bullet">
          <span className="ai-bullet-dot">{trimmed.match(/^\d+/)[0]}.</span>
          <span>{formatInline(trimmed.replace(/^\d+\.\s/, ''))}</span>
        </div>
      );
    } else {
      elements.push(
        <p key={key++} className="ai-para">{formatInline(trimmed)}</p>
      );
    }
  }

  return <div className="ai-response">{elements}</div>;
}

function formatInline(text) {
  const parts = [];
  const pattern = /(\*\*([^*]+)\*\*|`([^`]+)`|\*([^*]+)\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    if (match[2]) parts.push(<strong key={parts.length}>{match[2]}</strong>);
    else if (match[3]) parts.push(<code key={parts.length}>{match[3]}</code>);
    else if (match[4]) parts.push(<em key={parts.length}>{match[4]}</em>);
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}
