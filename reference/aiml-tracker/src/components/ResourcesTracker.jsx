import { RESOURCES, SKILL_LEVELS } from "../data/curriculum";

const TYPE_ICONS = { Course: "🎓", Book: "📚", Paper: "📄", Video: "🎬", Tool: "🛠️" };
const TYPE_COLORS = { Course: "#6366f1", Book: "#0ea5e9", Paper: "#f59e0b", Video: "#f43f5e", Tool: "#10b981" };

const STATUS_CYCLE = ["not-started", "in-progress", "completed"];

function nextStatus(current) {
  const idx = STATUS_CYCLE.indexOf(current || "not-started");
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
}

export function ResourcesTracker({ resourceStatus, setResourceStatus }) {
  const byType = RESOURCES.reduce((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push(r);
    return acc;
  }, {});

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Learning Resources</h2>
      {Object.entries(byType).map(([type, items]) => (
        <div key={type} style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: TYPE_COLORS[type] || "#374151", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <span>{TYPE_ICONS[type] || "📌"}</span> {type}s
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {items.map((r) => {
              const status = resourceStatus[r.id] || "not-started";
              const level = SKILL_LEVELS[status] || SKILL_LEVELS["not-started"];
              return (
                <div key={r.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{r.title}</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 5, flexWrap: "wrap" }}>
                      {r.tags.map((tag) => (
                        <span key={tag} style={{ fontSize: 11, background: "#f3f4f6", color: "#374151", padding: "1px 7px", borderRadius: 99 }}>{tag}</span>
                      ))}
                      {r.free && <span style={{ fontSize: 11, background: "#d1fae5", color: "#059669", padding: "1px 7px", borderRadius: 99, fontWeight: 600 }}>Free</span>}
                    </div>
                  </div>
                  <button onClick={() => setResourceStatus(r.id, nextStatus(status))}
                    style={{ padding: "4px 12px", borderRadius: 99, border: "none", background: level.bg, color: level.color, cursor: "pointer", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>
                    {level.label}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div style={{ marginTop: 16, fontSize: 13, color: "#9ca3af", fontStyle: "italic" }}>
        Tip: Click the status button to cycle through Not Started → In Progress → Completed.
      </div>
    </div>
  );
}
