import { AIML_CURRICULUM } from "../data/curriculum";
import { SKILL_LEVELS } from "../data/curriculum";
import { ProgressRing } from "./ProgressRing";

export function Dashboard({ stats, topicStatus, subtopicStatus }) {
  const sectionStats = AIML_CURRICULUM.map((section) => {
    const subs = section.topics.flatMap((t) =>
      t.subtopics.map((s) => subtopicStatus[`${t.id}__${s}`] || "not-started")
    );
    const total = subs.length;
    const done = subs.filter((s) => s === "completed").length;
    return { ...section, total, done, pct: total ? Math.round((done / total) * 100) : 0 };
  });

  const categoryColors = {
    "Foundations": "#6366f1",
    "Classical ML": "#0ea5e9",
    "Deep Learning": "#f59e0b",
    "NLP": "#10b981",
    "Computer Vision": "#f43f5e",
    "MLOps": "#8b5cf6",
    "Advanced": "#ef4444",
  };

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Dashboard</h2>

      {/* Overall stats */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 32 }}>
        <StatCard label="Overall Progress" value={`${stats.overallProgress}%`} sub={`${stats.completedSubtopics}/${stats.totalSubtopics} subtopics`} color="#6366f1" />
        <StatCard label="Topics Completed" value={stats.completedTopics} sub={`of ${stats.totalTopics} topics`} color="#10b981" />
        <StatCard label="In Progress" value={stats.inProgressTopics} sub="topics active" color="#f59e0b" />
        <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e5e7eb", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
          <ProgressRing percent={stats.overallProgress} size={90} color="#6366f1" />
          <span style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>Curriculum</span>
        </div>
      </div>

      {/* Section breakdown */}
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Section Progress</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
        {sectionStats.map((sec) => {
          const color = categoryColors[sec.category] || "#6366f1";
          return (
            <div key={sec.id} style={{ background: "#fff", borderRadius: 12, padding: 18, border: "1px solid #e5e7eb" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 600, color, background: color + "22", padding: "2px 8px", borderRadius: 99 }}>{sec.category}</span>
                  <div style={{ fontSize: 14, fontWeight: 600, marginTop: 6 }}>{sec.title}</div>
                </div>
                <span style={{ fontSize: 20, fontWeight: 700, color }}>{sec.pct}%</span>
              </div>
              <div style={{ background: "#f3f4f6", borderRadius: 99, height: 6, overflow: "hidden" }}>
                <div style={{ width: `${sec.pct}%`, background: color, height: "100%", transition: "width 0.5s ease", borderRadius: 99 }} />
              </div>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>{sec.done}/{sec.total} subtopics</div>
            </div>
          );
        })}
      </div>

      {/* Status legend */}
      <h3 style={{ fontSize: 16, fontWeight: 600, margin: "32px 0 12px" }}>Status Legend</h3>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {Object.entries(SKILL_LEVELS).map(([key, val]) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 6, background: val.bg, color: val.color, padding: "4px 12px", borderRadius: 99, fontSize: 13, fontWeight: 500 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: val.color, display: "inline-block" }} />
            {val.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e5e7eb", minWidth: 140 }}>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{label}</div>
      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{sub}</div>
    </div>
  );
}
