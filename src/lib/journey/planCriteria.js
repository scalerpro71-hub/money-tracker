/* Starter-plan criteria - pure functions over the finance snapshot, mirroring
   criteria.js. A step completes because real money moved, never because of a
   checkbox. Each check returns { met, progress (0-1), label, amount, amountCap,
   fear } - the fear line states the concrete worst case in the user's numbers. */

import { PLAN_STEPS } from '../../content/invest/plan';
import { groupOf } from '../../features/invest/investMeta';
import { cur } from '../formatUtils';

const round500 = n => Math.round(n / 500) * 500;

export function monthlySurplus(s) {
  return Math.max(0, s.monthlyIncome - s.monthlyExpenseBaseline);
}

/** 10% of monthly surplus, snapped to ₹500 steps, clamped ₹500-₹2,000. */
export function suggestedSip(s) {
  return Math.min(2000, Math.max(500, round500(monthlySurplus(s) * 0.1)));
}

function monthsSince(dateStr) {
  if (!dateStr) return 0;
  const days = (Date.now() - new Date(dateStr + 'T00:00:00').getTime()) / 86400000;
  return Math.max(0, days / 30.44);
}

const STEP_CHECKS = {
  plan_cushion: (s) => {
    const gap = Math.max(0, s.monthlyExpenseBaseline - s.efCurrent);
    const setAside = Math.max(500, Math.min(gap || 500, Math.max(500, round500(monthlySurplus(s) * 0.5))));
    return {
      met: s.efMonthsCovered >= 1,
      progress: Math.min(1, s.efMonthsCovered),
      label: s.efGoal
        ? `Cushion at ${s.efMonthsCovered.toFixed(1)}/1 month of expenses`
        : 'No Emergency Fund goal yet — create it in one tap below',
      amount: setAside,
      amountCap: 'set aside per month',
      fear: `A surprise ${cur(Math.round(s.monthlyExpenseBaseline))} bill today would land on a ~40% APR credit card — or force selling investments on a bad day. The cushion is what makes every later step safe.`,
    };
  },

  plan_first_sip: (s) => {
    const met = s.investments.some(i => i.type === 'sip');
    const sip = suggestedSip(s);
    return {
      met,
      progress: met ? 1 : 0,
      label: met ? 'First SIP logged 🎉' : `Sized from your surplus: ${cur(sip)}/month is enough`,
      amount: sip,
      amountCap: 'per month to start',
      fear: `Honest worst case: the worst Nifty year on record was about -38%. Six months of ${cur(sip)}/mo = ${cur(sip * 6)} in, showing ~${cur(Math.round(sip * 6 * 0.62))} on the worst possible paper day — while your ${cur(Math.round(s.efCurrent))} cushion sits untouched. A paper dip, not a bill.`,
    };
  },

  plan_automate: (s) => {
    const months = monthsSince(s.firstSipDate);
    const running = !!s.firstSipDate && s.sipMonthly > 0;
    return {
      met: running && months >= 3,
      progress: running ? Math.min(1, months / 3) : 0,
      label: running
        ? `SIP running ${months.toFixed(1)}/3 months at ${cur(s.sipMonthly)}/mo`
        : 'Starts counting once a SIP with a monthly amount is logged',
      amount: Math.max(suggestedSip(s), s.sipMonthly + 500),
      amountCap: 'a good next monthly target',
      fear: "In months 1-3 the danger isn't the market — it's you cancelling the auto-debit after one red statement. Pre-commit: the SIP stops for job loss, never for headlines.",
    };
  },

  // Group-based on purpose - stricter than the journey's l6_complete, so
  // sip + mf (both equity) doesn't count as diversified here.
  plan_diversify: (s) => {
    const groups = new Set(s.investmentTypes.map(groupOf)).size;
    return {
      met: groups >= 2,
      progress: Math.min(1, groups / 2),
      label: `${groups}/2 asset groups in your portfolio`,
      amount: Math.max(500, round500(s.sipMonthly * 0.25)),
      amountCap: 'per month toward gold / PPF / FD',
      fear: `Right now your ${cur(Math.round(s.portfolioValue))} moves as one block. A -30% equity year would read -${cur(Math.round(s.portfolioValue * 0.3))} with nothing pulling the other way.`,
    };
  },

  plan_stocks: (s) => {
    const met = s.investmentTypes.includes('stock');
    return {
      met,
      progress: met ? 1 : 0,
      label: met ? 'First stock logged — keep it capped' : 'Optional — the plan works without this step',
      amount: Math.max(500, round500(s.portfolioValue * 0.1)),
      amountCap: 'cap for any single stock (~10% of portfolio)',
      fear: 'A single stock can go to zero — a broad fund cannot. Your index fund already owns these companies; this step is curiosity money, not the plan.',
    };
  },
};

export function evaluatePlanStep(id, snapshot) {
  const fn = STEP_CHECKS[id];
  if (!fn) return { met: false, progress: 0, label: '', amount: 0, amountCap: '', fear: '' };
  return fn(snapshot);
}

/** All steps with computed checks and a status:
    'done' | 'current' (first unmet core step) | 'upcoming' | 'optional'. */
export function evaluatePlan(snapshot) {
  const steps = PLAN_STEPS.map(step => ({ ...step, ...evaluatePlanStep(step.criteria, snapshot) }));
  const coreDone = steps.filter(st => !st.optional).every(st => st.met);
  let currentAssigned = false;
  return steps.map(step => {
    let status;
    if (step.met) status = 'done';
    else if (step.optional) status = coreDone ? 'current' : 'optional';
    else if (!currentAssigned) { status = 'current'; currentAssigned = true; }
    else status = 'upcoming';
    return { ...step, status };
  });
}
