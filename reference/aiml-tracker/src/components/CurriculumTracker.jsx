import { useState } from "react";
import { AIML_CURRICULUM, SKILL_LEVELS, STATUS_OPTIONS } from "../data/curriculum";

const STATUS_CYCLE = STATUS_OPTIONS;

function nextStatus(current) {
  const idx = STATUS_CYCLE.indexOf(current);
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
}

export function CurriculumTracker({ topicStatus, subtopicStatus, notes, setTopicStatus, setSubtopicStatus, setNote }) {
  const [expandedTopics, setExpandedTopics] = useState({});
  const [editingNote, setEditingNote] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const categories = ["All", ...new Set(AIML_CURRICULUM.map((s) => s.category))];
  const filtered = filterCategory === "All" ? AIML_CURRICULUM : AIML_CURRICULUM.filter((s) => s.category === filterCategory);

  const toggleExpand = (id) => setExpandedTopics((prev) => ({ ...prev, [id]: !prev[id] }));

  const openNote = (topicId) => {
    setEditingNote(topicId);
    setNoteText(notes[topicId] || "");
  };

  const saveNote = () => {
    setNote(editingNote, noteText);
    setEditingNote(null);
  };

  const subtopicDone = (topicId) => {
    const topic = AIML_CURRICULUM.flatMap((s) => s.topics).find((t) => t.id === topicId);
    if (!topic) return 0;
    return topic.subtopics.filter((s) => subtopicStatus[`${topicId}__${s}`] === "completed").length;
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Curriculum Tracker</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {categories.map((cat) => (
            <button key={cat} onClick={() => setFilterCategory(cat)}
              style={{ padding: "5px 14px", borderRadius: 99, border: "1px solid #e5e7eb", background: filterCategory === cat ? "#6366f1" : "#fff", color: filterCategory === cat ? "#fff" : "#374151", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filtered.map((section) => (
        <div key={section.id} style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#1f2937", marginBottom: 12, borderBottom: "2px solid #e5e7eb", paddingBottom: 8 }}>
            {section.title}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {section.topics.map((topic) => {
              const status = topicStatus[topic.id] || "not-started";
              const level = SKILL_LEVELS[status];
              const expanded = expandedTopics[topic.id];
              const done = subtopicDone(topic.id);
              const total = topic.subtopics.length;

              return (
                <div key={topic.id} style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden", background: "#fff" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px" }}>
                    <button onClick={() => toggleExpand(topic.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#6b7280", width: 20 }}>
                      {expanded ? "▾" : "▸"}
                    </button>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{topic.name}</div>
                      <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{done}/{total} subtopics done</div>
                    </div>
                    <button onClick={() => setTopicStatus(topic.id, nextStatus(status))}
                      style={{ padding: "4px 12px", borderRadius: 99, border: "none", background: level.bg, color: level.color, cursor: "pointer", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>
                      {level.label}
                    </button>
                    <button onClick={() => openNote(topic.id)}
                      style={{ background: notes[topic.id] ? "#ede9fe" : "#f3f4f6", border: "none", borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontSize: 13, color: notes[topic.id] ? "#7c3aed" : "#6b7280" }}
                      title="Add note">
                      📝
                    </button>
                  </div>

                  {/* Progress bar */}
                  <div style={{ height: 3, background: "#f3f4f6" }}>
                    <div style={{ height: "100%", width: `${total ? (done / total) * 100 : 0}%`, background: level.color, transition: "width 0.4s" }} />
                  </div>

                  {/* Subtopics */}
                  {expanded && (
                    <div style={{ padding: "12px 16px", borderTop: "1px solid #f3f4f6", display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {topic.subtopics.map((sub) => {
                        const subKey = `${topic.id}__${sub}`;
                        const subStatus = subtopicStatus[subKey] || "not-started";
                        const subLevel = SKILL_LEVELS[subStatus];
                        return (
                          <button key={sub} onClick={() => setSubtopicStatus(topic.id, sub, nextStatus(subStatus))}
                            style={{ padding: "4px 10px", borderRadius: 99, border: `1px solid ${subLevel.color}`, background: subLevel.bg, color: subLevel.color, cursor: "pointer", fontSize: 12, fontWeight: 500 }}>
                            {sub}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Note modal */}
      {editingNote && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: 28, width: 480, maxWidth: "95vw" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>Notes</h3>
            <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)}
              rows={6} placeholder="Add study notes, resources, or reminders..."
              style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: 12, fontSize: 14, resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: 10, marginTop: 14, justifyContent: "flex-end" }}>
              <button onClick={() => setEditingNote(null)} style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer" }}>Cancel</button>
              <button onClick={saveNote} style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: "#6366f1", color: "#fff", cursor: "pointer", fontWeight: 600 }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
