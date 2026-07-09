import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { getLevel, getLesson } from '../../content/journey';
import { actionDone } from '../../lib/journey/criteria';
import { useSnapshot } from '../../lib/journey/useSnapshot';
import { useLessonProgress, useUpsertLessonProgress, useGoalMutations } from '../../lib/queries';
import { useOpenAdd } from '../../app/shell/AppShell';
import { useToast } from '../../components/layout/Toast';
import { Icon } from '../../components/layout/Icon';
import { Block } from './blocks';

function ActionCard({ action }) {
  const { snapshot } = useSnapshot();
  const openAdd = useOpenAdd();
  const { add: addGoal } = useGoalMutations();
  const toast = useToast();
  const navigate = useNavigate();
  const done = actionDone(action, snapshot);

  async function handleGo() {
    switch (action.type) {
      case 'log_expense':
      case 'log_days':
        openAdd('expense');
        break;
      case 'set_income':
        navigate('/settings');
        break;
      case 'set_budgets':
      case 'add_commitment':
        navigate('/money');
        break;
      case 'create_ef_goal': {
        const target = Math.max(10000, Math.round((snapshot.monthlyExpenseBaseline * 3) / 1000) * 1000);
        try {
          await addGoal.mutateAsync({ name: 'Emergency Fund', kind: 'emergency_fund', target_amount: target, current_amount: 0 });
          toast('Emergency Fund goal created 🛡️');
        } catch (err) { toast(err.message, 'error'); }
        break;
      }
      case 'log_investment':
      case 'diversify':
        navigate('/invest');
        break;
      default:
        break;
    }
  }

  return (
    <div className={`lp-action${done ? ' done' : ''}`}>
      <div className="lp-action-ico">{done ? <Icon name="check" size={18} /> : <Icon name="target" size={18} />}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="lp-action-cap">{done ? 'Done — nice work' : 'Real-world move'}</div>
        <div className="lp-action-label">{action.label}</div>
      </div>
      {!done && (
        <button className="btn-accent" style={{ padding: '9px 14px', fontSize: 13, flexShrink: 0 }} onClick={handleGo}>
          Do it
        </button>
      )}
    </div>
  );
}

function Quiz({ quiz, onFinished }) {
  const [qIndex, setQIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const q = quiz[qIndex];
  const answered = picked != null;
  const isLast = qIndex === quiz.length - 1;

  function pick(i) {
    if (answered) return;
    setPicked(i);
    if (i === q.answer) setScore(s => s + 1);
  }

  function next() {
    if (isLast) {
      onFinished(score);
    } else {
      setQIndex(i => i + 1);
      setPicked(null);
    }
  }

  return (
    <div className="lp-quiz">
      <div className="lp-quiz-head">
        <span className="eyebrow">Quick check</span>
        <span className="lp-quiz-count num">{qIndex + 1}/{quiz.length}</span>
      </div>
      <div className="lp-quiz-q">{q.q}</div>
      <div className="lp-quiz-options">
        {q.options.map((opt, i) => {
          let cls = 'lp-quiz-opt';
          if (answered && i === q.answer) cls += ' correct';
          else if (answered && i === picked) cls += ' wrong';
          return (
            <button key={i} className={cls} onClick={() => pick(i)} disabled={answered}>
              {opt}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className={`lp-quiz-explain anim-fadeUp${picked === q.answer ? ' good' : ''}`}>
          <strong>{picked === q.answer ? 'Correct. ' : 'Not quite. '}</strong>{q.explain}
        </div>
      )}
      {answered && (
        <button className="btn-accent" style={{ width: '100%', justifyContent: 'center', marginTop: 14 }} onClick={next}>
          {isLast ? 'Finish lesson' : 'Next question'}
        </button>
      )}
    </div>
  );
}

export function LessonPage() {
  const { levelId, lessonId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const level = getLevel(levelId);
  const lesson = getLesson(levelId, lessonId);
  const { data: progressRows = [] } = useLessonProgress();
  const upsert = useUpsertLessonProgress();
  const [phase, setPhase] = useState('read'); // read | quiz | done

  if (!level || !lesson) {
    return (
      <div className="empty-state">
        <span className="empty-icon">🤔</span>
        <p>Lesson not found</p>
        <Link to="/learn" className="more-link">Back to the journey</Link>
      </div>
    );
  }

  const alreadyDone = progressRows.some(r => r.lesson_id === lesson.id && r.status === 'completed');
  const lessonIndex = level.lessons.findIndex(l => l.id === lesson.id);
  const nextLesson = level.lessons[lessonIndex + 1];

  async function finishQuiz(score) {
    setPhase('done');
    if (!alreadyDone) {
      try {
        await upsert.mutateAsync({
          lessonId: lesson.id,
          status: 'completed',
          quiz_score: score,
          completed_at: new Date().toISOString(),
        });
        toast(`Lesson complete · +50 XP${score === lesson.quiz.length ? ' · perfect score! 🎯' : ''}`);
      } catch (err) {
        toast(err.message, 'error');
      }
    }
  }

  return (
    <div className="lp-page">
      <div className="lp-top">
        <button className="icon-btn" onClick={() => navigate('/learn')} aria-label="Back to journey">
          <Icon name="chevL" size={18} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="lp-crumb">Level {level.order} · {level.title}</div>
          <div className="lp-title">{lesson.title}</div>
        </div>
        <span className="chip">{lesson.minutes} min</span>
      </div>

      <div className="card lp-body">
        {lesson.blocks.map((block, i) => <Block key={i} block={block} />)}
        {lesson.action && <ActionCard action={lesson.action} />}

        {phase === 'read' && !alreadyDone && (
          <button className="btn-accent lp-cta" onClick={() => setPhase('quiz')}>
            Take the quick check <Icon name="arrowR" size={16} />
          </button>
        )}
        {alreadyDone && phase === 'read' && (
          <div className="lp-doneline">
            <Icon name="check" size={15} /> Completed
            {nextLesson
              ? <Link to={`/learn/${level.id}/${nextLesson.id}`} className="more-link" style={{ marginLeft: 'auto' }}>Next: {nextLesson.title} →</Link>
              : <Link to="/learn" className="more-link" style={{ marginLeft: 'auto' }}>Back to journey →</Link>}
          </div>
        )}

        {phase === 'quiz' && <Quiz quiz={lesson.quiz} onFinished={finishQuiz} />}

        {phase === 'done' && (
          <div className="lp-finish anim-riseIn">
            <div style={{ fontSize: 40 }}>🎉</div>
            <div className="lp-finish-title">Lesson complete</div>
            {nextLesson ? (
              <button className="btn-accent" onClick={() => { navigate(`/learn/${level.id}/${nextLesson.id}`); setPhase('read'); window.scrollTo(0, 0); }}>
                Next: {nextLesson.title} <Icon name="arrowR" size={15} />
              </button>
            ) : (
              <button className="btn-accent" onClick={() => navigate('/learn')}>
                Back to the journey <Icon name="arrowR" size={15} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
