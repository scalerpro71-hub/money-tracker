import { useState } from "react";

const PROJECT_STATUS = ["planned", "in-progress", "completed", "paused"];
const STATUS_COLORS = {
  planned: { bg: "#f3f4f6", color: "#374151" },
  "in-progress": { bg: "#fef3c7", color: "#d97706" },
  completed: { bg: "#d1fae5", color: "#059669" },
  paused: { bg: "#fee2e2", color: "#dc2626" },
};

const EMPTY_FORM = { title: "", description: "", category: "", status: "planned", githubUrl: "", tags: "" };

export function ProjectsTracker({ projects, addProject, updateProject, deleteProject }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean) };
    if (editingId) {
      updateProject(editingId, payload);
      setEditingId(null);
    } else {
      addProject(payload);
    }
    setForm(EMPTY_FORM);
    setShowForm(false);
  };

  const startEdit = (proj) => {
    setForm({ ...proj, tags: (proj.tags || []).join(", ") });
    setEditingId(proj.id);
    setShowForm(true);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Projects</h2>
        <button onClick={() => { setShowForm(true); setForm(EMPTY_FORM); setEditingId(null); }}
          style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: "#6366f1", color: "#fff", cursor: "pointer", fontWeight: 600 }}>
          + New Project
        </button>
      </div>

      {projects.length === 0 && !showForm && (
        <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🚀</div>
          <div style={{ fontSize: 15 }}>No projects yet. Add your first AI/ML project!</div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16, marginBottom: 24 }}>
        {projects.map((proj) => {
          const sc = STATUS_COLORS[proj.status] || STATUS_COLORS.planned;
          return (
            <div key={proj.id} style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{proj.title}</div>
                <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 99, background: sc.bg, color: sc.color, fontWeight: 600, whiteSpace: "nowrap" }}>
                  {proj.status}
                </span>
              </div>
              {proj.category && <div style={{ fontSize: 12, color: "#6366f1", fontWeight: 500, marginBottom: 6 }}>{proj.category}</div>}
              {proj.description && <div style={{ fontSize: 13, color: "#4b5563", marginBottom: 10, lineHeight: 1.5 }}>{proj.description}</div>}
              {(proj.tags || []).length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
                  {proj.tags.map((tag) => (
                    <span key={tag} style={{ fontSize: 11, background: "#f3f4f6", color: "#374151", padding: "2px 8px", borderRadius: 99 }}>{tag}</span>
                  ))}
                </div>
              )}
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {proj.githubUrl && (
                  <a href={proj.githubUrl} target="_blank" rel="noreferrer"
                    style={{ fontSize: 12, color: "#6366f1", textDecoration: "none" }}>GitHub →</a>
                )}
                <div style={{ flex: 1 }} />
                <button onClick={() => startEdit(proj)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", fontSize: 13 }}>Edit</button>
                <button onClick={() => deleteProject(proj.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: 13 }}>Delete</button>
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: 28, width: 500, maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 17, fontWeight: 700 }}>{editingId ? "Edit Project" : "New Project"}</h3>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Field label="Title *" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required placeholder="e.g. Sentiment Analyzer" />
              <Field label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} placeholder="e.g. NLP, Computer Vision" />
              <div>
                <label style={labelStyle}>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={inputStyle}>
                  {PROJECT_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3} placeholder="What does this project do?" style={{ ...inputStyle, resize: "vertical" }} />
              </div>
              <Field label="GitHub URL" value={form.githubUrl} onChange={(v) => setForm({ ...form, githubUrl: v })} placeholder="https://github.com/..." />
              <Field label="Tags (comma separated)" value={form.tags} onChange={(v) => setForm({ ...form, tags: v })} placeholder="pytorch, classification, nlp" />
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
                <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }}
                  style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: "#6366f1", color: "#fff", cursor: "pointer", fontWeight: 600 }}>
                  {editingId ? "Save Changes" : "Add Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle = { fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 };
const inputStyle = { width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", fontSize: 14, fontFamily: "inherit", boxSizing: "border-box", outline: "none" };

function Field({ label, value, onChange, placeholder, required }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        required={required} style={inputStyle} />
    </div>
  );
}
