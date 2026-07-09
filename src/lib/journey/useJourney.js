import { useEffect, useMemo, useRef, useState } from 'react';
import { JOURNEY, XP_PER_LESSON, XP_PER_LEVEL } from '../../content/journey';
import { evaluateCriteria } from './criteria';
import { useSnapshot } from './useSnapshot';
import { useJourneyState, useLessonProgress, useUpdateJourneyState } from '../queries';

/**
 * The journey engine. Combines static content, the finance snapshot and
 * lesson progress into per-level state, and keeps user_journey_state in
 * sync. Levels unlock because real numbers moved - never because of a flag.
 */
export function useJourney() {
  const { snapshot, loading: snapLoading } = useSnapshot();
  const journeyState = useJourneyState();
  const lessonProgress = useLessonProgress();
  const updateState = useUpdateJourneyState();
  const [celebrating, setCelebrating] = useState(null); // level object just completed
  const syncedSig = useRef('');

  const loading = snapLoading || journeyState.isLoading || lessonProgress.isLoading;

  const derived = useMemo(() => {
    const progressRows = lessonProgress.data ?? [];
    const doneLessonIds = new Set(progressRows.filter(r => r.status === 'completed').map(r => r.lesson_id));

    const levels = [];
    let previousComplete = true; // level 1 has no predecessor

    for (const level of JOURNEY.levels) {
      const lessonsDone = level.lessons.filter(l => doneLessonIds.has(l.id)).length;
      const allLessonsDone = lessonsDone === level.lessons.length;

      const unlockCheck = level.unlockCriteria
        ? evaluateCriteria(level.unlockCriteria, snapshot, { lessonsDone: allLessonsDone })
        : { met: true, progress: 1, label: '' };
      const unlocked = previousComplete && unlockCheck.met;

      const completeCheck = level.completeCriteria
        ? evaluateCriteria(level.completeCriteria, snapshot, { lessonsDone: allLessonsDone })
        : { met: false, progress: allLessonsDone ? 1 : lessonsDone / level.lessons.length, label: level.completeHint };
      const complete = !level.ongoing && allLessonsDone && completeCheck.met;

      levels.push({
        ...level,
        lessonsDone,
        lessonCount: level.lessons.length,
        allLessonsDone,
        unlocked,
        complete,
        unlockCheck,
        completeCheck,
        doneLessonIds,
        progress: level.ongoing
          ? lessonsDone / level.lessons.length
          : (lessonsDone / level.lessons.length) * 0.5 + completeCheck.progress * 0.5,
      });

      previousComplete = complete;
    }

    const current = levels.find(l => l.unlocked && !l.complete) || levels[levels.length - 1];
    const completedIds = levels.filter(l => l.complete).map(l => l.id);
    const unlockedIds = levels.filter(l => l.unlocked).map(l => l.id);
    const xp = doneLessonIds.size * XP_PER_LESSON + completedIds.length * XP_PER_LEVEL;

    /* the next concrete thing the user should do - powers Home + Coach */
    let nextStep = null;
    if (current) {
      const nextLesson = current.lessons.find(l => !doneLessonIds.has(l.id));
      if (nextLesson) {
        nextStep = { kind: 'lesson', levelId: current.id, lesson: nextLesson, label: `Next lesson: ${nextLesson.title}` };
      } else if (!current.complete && current.completeCheck.label) {
        nextStep = { kind: 'criteria', levelId: current.id, label: current.completeCheck.label };
      }
    }

    return { levels, current, completedIds, unlockedIds, xp, doneLessonCount: doneLessonIds.size, nextStep };
  }, [snapshot, lessonProgress.data]);

  /* persist unlock/complete/xp when they change; celebrate level-ups */
  useEffect(() => {
    if (loading || !journeyState.data) return;
    const stored = journeyState.data;
    const sig = JSON.stringify([derived.completedIds, derived.unlockedIds, derived.xp, derived.current?.id]);
    if (sig === syncedSig.current) return;

    const storedCompleted = stored.completed_level_ids ?? [];
    const newlyCompleted = derived.completedIds.filter(id => !storedCompleted.includes(id));
    if (newlyCompleted.length && storedCompleted.length + derived.completedIds.length > 0 && syncedSig.current !== '') {
      const level = JOURNEY.levels.find(l => l.id === newlyCompleted[newlyCompleted.length - 1]);
      if (level) setCelebrating(level);
    }

    const changed =
      stored.current_level_id !== derived.current?.id ||
      stored.xp !== derived.xp ||
      JSON.stringify(stored.completed_level_ids) !== JSON.stringify(derived.completedIds) ||
      JSON.stringify(stored.unlocked_level_ids) !== JSON.stringify(derived.unlockedIds);

    syncedSig.current = sig;
    if (changed) {
      updateState.mutate({
        content_version: JOURNEY.version,
        current_level_id: derived.current?.id ?? 'l1',
        unlocked_level_ids: derived.unlockedIds,
        completed_level_ids: derived.completedIds,
        xp: derived.xp,
        criteria_snapshot: {
          savingsRate: snapshot.currentSavingsRate,
          efMonthsCovered: Number(snapshot.efMonthsCovered.toFixed(2)),
          entryCount: snapshot.entryCount,
          budgetCount: snapshot.budgetCount,
          investmentTypes: snapshot.investmentTypes,
          loggingStreak: snapshot.loggingStreak,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, derived, journeyState.data]);

  return {
    ...derived,
    snapshot,
    loading,
    celebrating,
    clearCelebration: () => setCelebrating(null),
  };
}
