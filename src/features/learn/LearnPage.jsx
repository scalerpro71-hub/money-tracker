import { Link } from 'react-router';
import { useJourney } from '../../lib/journey/useJourney';
import { Icon } from '../../components/layout/Icon';
import { Spinner } from '../../components/layout/Spinner';
import { Confetti } from '../../components/layout/Confetti';

function LevelNode({ level, isCurrent }) {
  const state = level.complete ? 'done' : level.unlocked ? (isCurrent ? 'current' : 'open') : 'locked';

  return (
    <div className={`jm-row ${state}`}>
      <div className="jm-spine">
        <div className="jm-connector top" />
        <div className="jm-node">
          {state === 'done' ? <Icon name="check" size={22} /> : state === 'locked' ? <Icon name="lock" size={18} /> : <span className="jm-emoji">{level.emoji}</span>}
          {state === 'current' && <span className="jm-pulse" />}
        </div>
        <div className="jm-connector bottom" />
      </div>

      <div className={`jm-card card${state === 'current' ? ' jm-card-current' : ''}`}>
        <div className="jm-card-head">
          <div>
            <div className="jm-level-label">Level {level.order}{level.ongoing ? ' · ongoing' : ''}</div>
            <div className="jm-title">{level.title}</div>
            <div className="jm-tagline">{level.tagline}</div>
          </div>
          {state === 'done' && <span className="chip pos">Done</span>}
        </div>

        {state !== 'locked' && (
          <>
            <div className="jm-bar">
              <div className="jm-bar-fill" style={{ width: `${Math.round(level.progress * 100)}%` }} />
            </div>
            <div className="jm-lessons">
              {level.lessons.map(lesson => {
                const done = level.doneLessonIds.has(lesson.id);
                return (
                  <Link key={lesson.id} to={`/learn/${level.id}/${lesson.id}`} className={`jm-lesson${done ? ' done' : ''}`}>
                    <span className="jm-lesson-dot">{done ? <Icon name="check" size={12} /> : <Icon name="play" size={10} />}</span>
                    <span className="jm-lesson-title">{lesson.title}</span>
                    <span className="jm-lesson-min">{lesson.minutes} min</span>
                  </Link>
                );
              })}
            </div>
            {!level.complete && level.allLessonsDone && level.completeCheck.label && (
              <div className="jm-criteria">
                <Icon name="target" size={14} />
                <span>{level.completeCheck.label}</span>
              </div>
            )}
          </>
        )}

        {state === 'locked' && (
          <div className="jm-locked-hint">
            <Icon name="lock" size={13} />
            <span>{level.unlockHint || `Complete Level ${level.order - 1} to unlock`}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function LearnPage() {
  const journey = useJourney();

  if (journey.loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><Spinner size={36} /></div>;
  }

  const { levels, current, xp, doneLessonCount, celebrating, clearCelebration } = journey;
  const totalLessons = levels.reduce((a, l) => a + l.lessonCount, 0);

  return (
    <div className="jm-page">
      <Confetti trigger={celebrating} onDone={clearCelebration} />
      {celebrating && (
        <div className="jm-levelup anim-dropIn">
          🎉 <strong>Level {celebrating.order} complete — {celebrating.title}!</strong>
        </div>
      )}

      <div className="jm-header card pad">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="eyebrow">Your journey</div>
          <div className="jm-header-title">
            {current ? `Level ${current.order}: ${current.title}` : 'Journey complete'}
          </div>
          <div className="jm-header-sub">{doneLessonCount}/{totalLessons} lessons · money moves unlock levels</div>
        </div>
        <div className="jm-xp">
          <div className="jm-xp-num num">{xp}</div>
          <div className="jm-xp-cap">XP</div>
        </div>
      </div>

      <div className="jm-map">
        {levels.map(level => (
          <LevelNode key={level.id} level={level} isCurrent={current?.id === level.id} />
        ))}
      </div>

      <div className="jm-foot">
        Levels complete through <strong>real actions</strong> — logging, budgeting, saving, investing — not just reading.
      </div>
    </div>
  );
}
