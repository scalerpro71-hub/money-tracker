import { Spinner } from '../layout/Spinner';
import { AiResponseRenderer } from './AiResponseRenderer';

export function AiFeatureCard({ title, icon, description, suggestion, loading, error, onGenerate }) {
  return (
    <div className="ai-card">
      <div className="ai-card-header">
        <div className="ai-card-title">
          <span className="ai-icon">{icon}</span>
          <h3>{title}</h3>
        </div>
        <button className="btn-secondary btn-sm" onClick={onGenerate} disabled={loading}>
          {loading ? <Spinner size={16} /> : suggestion ? '🔄 Refresh' : '✨ Generate'}
        </button>
      </div>
      {!suggestion && !loading && !error && (
        <div className="ai-empty">
          <p>{description}</p>
          <button className="btn-primary" onClick={onGenerate}>Generate Insights</button>
        </div>
      )}
      {loading && (
        <div className="ai-loading">
          <Spinner size={32} />
          <p>Analyzing your spending...</p>
        </div>
      )}
      {error && (
        <div className="ai-error">
          <p>⚠️ {error}</p>
          <button className="btn-secondary btn-sm" onClick={onGenerate}>Try Again</button>
        </div>
      )}
      {suggestion && !loading && <AiResponseRenderer text={suggestion} />}
    </div>
  );
}
