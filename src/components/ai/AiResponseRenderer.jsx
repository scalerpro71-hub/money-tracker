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
          <span dangerouslySetInnerHTML={{ __html: formatInline(trimmed.slice(2)) }} />
        </div>
      );
    } else if (/^\d+\.\s/.test(trimmed)) {
      elements.push(
        <div key={key++} className="ai-bullet">
          <span className="ai-bullet-dot">{trimmed.match(/^\d+/)[0]}.</span>
          <span dangerouslySetInnerHTML={{ __html: formatInline(trimmed.replace(/^\d+\.\s/, '')) }} />
        </div>
      );
    } else {
      elements.push(
        <p key={key++} className="ai-para" dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }} />
      );
    }
  }

  return <div className="ai-response">{elements}</div>;
}

function formatInline(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>');
}
