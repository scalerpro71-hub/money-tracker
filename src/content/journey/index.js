import level1 from './level1';
import level2 from './level2';
import level3 from './level3';
import level4 from './level4';
import level5 from './level5';
import level6 from './level6';
import level7 from './level7';

/** Versioned journey content. Bump version when level/lesson ids change shape. */
export const JOURNEY = {
  version: 1,
  levels: [level1, level2, level3, level4, level5, level6, level7],
};

export const XP_PER_LESSON = 50;
export const XP_PER_LEVEL = 100;

export function getLevel(levelId) {
  return JOURNEY.levels.find(l => l.id === levelId) || null;
}

export function getLesson(levelId, lessonId) {
  const level = getLevel(levelId);
  return level?.lessons.find(l => l.id === lessonId) || null;
}
