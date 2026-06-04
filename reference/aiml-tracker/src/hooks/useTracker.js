import { useState, useCallback } from "react";
import { AIML_CURRICULUM } from "../data/curriculum";

const STORAGE_KEY = "aiml_tracker_state";

function buildInitialState() {
  const topicStatus = {};
  const subtopicStatus = {};
  AIML_CURRICULUM.forEach((section) => {
    section.topics.forEach((topic) => {
      topicStatus[topic.id] = "not-started";
      topic.subtopics.forEach((sub) => {
        subtopicStatus[`${topic.id}__${sub}`] = "not-started";
      });
    });
  });
  return { topicStatus, subtopicStatus, notes: {}, projects: [], resourceStatus: {} };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      const initial = buildInitialState();
      return {
        topicStatus: { ...initial.topicStatus, ...saved.topicStatus },
        subtopicStatus: { ...initial.subtopicStatus, ...saved.subtopicStatus },
        notes: saved.notes || {},
        projects: saved.projects || [],
        resourceStatus: saved.resourceStatus || {},
      };
    }
  } catch {}
  return buildInitialState();
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function useTracker() {
  const [state, setState] = useState(loadState);

  const update = useCallback((updater) => {
    setState((prev) => {
      const next = updater(prev);
      saveState(next);
      return next;
    });
  }, []);

  const setTopicStatus = useCallback((topicId, status) => {
    update((prev) => ({
      ...prev,
      topicStatus: { ...prev.topicStatus, [topicId]: status },
    }));
  }, [update]);

  const setSubtopicStatus = useCallback((topicId, subtopic, status) => {
    update((prev) => ({
      ...prev,
      subtopicStatus: { ...prev.subtopicStatus, [`${topicId}__${subtopic}`]: status },
    }));
  }, [update]);

  const setNote = useCallback((topicId, note) => {
    update((prev) => ({
      ...prev,
      notes: { ...prev.notes, [topicId]: note },
    }));
  }, [update]);

  const addProject = useCallback((project) => {
    update((prev) => ({
      ...prev,
      projects: [...prev.projects, { ...project, id: Date.now().toString(), createdAt: new Date().toISOString() }],
    }));
  }, [update]);

  const updateProject = useCallback((id, changes) => {
    update((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? { ...p, ...changes } : p)),
    }));
  }, [update]);

  const deleteProject = useCallback((id) => {
    update((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
    }));
  }, [update]);

  const setResourceStatus = useCallback((resourceId, status) => {
    update((prev) => ({
      ...prev,
      resourceStatus: { ...prev.resourceStatus, [resourceId]: status },
    }));
  }, [update]);

  const resetAll = useCallback(() => {
    const fresh = buildInitialState();
    saveState(fresh);
    setState(fresh);
  }, []);

  // Derived stats
  const stats = (() => {
    const topicValues = Object.values(state.topicStatus);
    const subtopicValues = Object.values(state.subtopicStatus);
    const totalTopics = topicValues.length;
    const completedTopics = topicValues.filter((s) => s === "completed").length;
    const inProgressTopics = topicValues.filter((s) => s === "in-progress").length;
    const totalSubtopics = subtopicValues.length;
    const completedSubtopics = subtopicValues.filter((s) => s === "completed").length;
    const overallProgress = totalSubtopics > 0 ? Math.round((completedSubtopics / totalSubtopics) * 100) : 0;
    return { totalTopics, completedTopics, inProgressTopics, totalSubtopics, completedSubtopics, overallProgress };
  })();

  return {
    ...state,
    stats,
    setTopicStatus,
    setSubtopicStatus,
    setNote,
    addProject,
    updateProject,
    deleteProject,
    setResourceStatus,
    resetAll,
  };
}
