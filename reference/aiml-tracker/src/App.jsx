import { useState } from "react";
import { useTracker } from "./hooks/useTracker";
import { Dashboard } from "./components/Dashboard";
import { CurriculumTracker } from "./components/CurriculumTracker";
import { ProjectsTracker } from "./components/ProjectsTracker";
import { ResourcesTracker } from "./components/ResourcesTracker";

const TABS = [
  { id: "dashboard", label: "📊 Dashboard" },
  { id: "curriculum", label: "📚 Curriculum" },
  { id: "projects", label: "🚀 Projects" },
  { id: "resources", label: "🎓 Resources" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const tracker = useTracker();

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", color: "#fff", padding: "20px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>🤖 AI/ML Learning Tracker</div>
            <div style={{ fontSize: 13, opacity: 0.8, marginTop: 3 }}>Track your journey from zero to AI/ML expert</div>
          </div>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 800 }}>{tracker.stats.overallProgress}%</div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>Overall</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 800 }}>{tracker.stats.completedTopics}</div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>Topics Done</div>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 0 }}>
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "14px 22px", border: "none", background: "none", cursor: "pointer", fontSize: 14, fontWeight: 600,
                color: activeTab === tab.id ? "#4f46e5" : "#6b7280",
                borderBottom: activeTab === tab.id ? "2px solid #4f46e5" : "2px solid transparent",
                transition: "all 0.15s",
              }}>
              {tab.label}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button onClick={() => { if (confirm("Reset all progress? This cannot be undone.")) tracker.resetAll(); }}
            style={{ padding: "14px 16px", border: "none", background: "none", cursor: "pointer", fontSize: 13, color: "#dc2626" }}>
            Reset
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>
        {activeTab === "dashboard" && (
          <Dashboard stats={tracker.stats} topicStatus={tracker.topicStatus} subtopicStatus={tracker.subtopicStatus} />
        )}
        {activeTab === "curriculum" && (
          <CurriculumTracker
            topicStatus={tracker.topicStatus}
            subtopicStatus={tracker.subtopicStatus}
            notes={tracker.notes}
            setTopicStatus={tracker.setTopicStatus}
            setSubtopicStatus={tracker.setSubtopicStatus}
            setNote={tracker.setNote}
          />
        )}
        {activeTab === "projects" && (
          <ProjectsTracker
            projects={tracker.projects}
            addProject={tracker.addProject}
            updateProject={tracker.updateProject}
            deleteProject={tracker.deleteProject}
          />
        )}
        {activeTab === "resources" && (
          <ResourcesTracker resourceStatus={tracker.resourceStatus} setResourceStatus={tracker.setResourceStatus} />
        )}
      </div>
    </div>
  );
}
