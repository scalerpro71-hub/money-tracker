import { test, expect } from 'playwright/test';
import { mockBackend } from './mock';

test('login page renders for signed-out visitors', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'PaisaCoach' })).toBeVisible();
  await expect(page.locator('form .btn-primary')).toHaveText('Sign in');
});

test('un-onboarded users are sent to the onboarding wizard', async ({ page }) => {
  await mockBackend(page, { onboarded: false });
  await page.goto('/');
  await expect(page).toHaveURL(/\/onboarding/);
  await expect(page.getByText('Welcome to PaisaCoach')).toBeVisible();
});

test('home shows the safe-to-spend hero, runway and journey nudge', async ({ page }) => {
  await mockBackend(page);
  await page.goto('/');
  await expect(page.getByText('Safe to spend today')).toBeVisible();
  await expect(page.getByText('If your income stopped today')).toBeVisible();
  await expect(page.getByText(/Level 1 · Know Your Money/i)).toBeVisible();
});

test('home lists milestones with the first one earned', async ({ page }) => {
  await mockBackend(page);
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Milestones' })).toBeVisible();
  await expect(page.getByText('First expense logged')).toBeVisible();
});

test('add-entry sheet opens from the shell', async ({ page }) => {
  await mockBackend(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Add' }).click();
  await expect(page.getByText('Add Entry')).toBeVisible();
  await expect(page.locator('.sheet-amt')).toHaveText('₹0');
});

test('journey map lists all seven levels with locks', async ({ page }) => {
  await mockBackend(page);
  await page.goto('/learn');
  await expect(page.locator('.jm-row')).toHaveCount(7);
  await expect(page.locator('.jm-title').first()).toHaveText('Know Your Money');
  await expect(page.locator('.jm-title').last()).toHaveText('Stay the Course');
  await expect(page.getByText('Complete Level 2 to unlock')).toBeVisible();
});

test('invest lands on the starter plan with no gate', async ({ page }) => {
  await mockBackend(page);
  await page.goto('/invest');
  await expect(page.getByText('Your starter plan')).toBeVisible();
  await expect(page.getByText('Investing unlocks at Level 5')).not.toBeVisible();
  // fixture user has the cushion funded past 1 month, so the SIP step is current
  await expect(page.getByText('Step 2 of 5: Start a small index-fund SIP')).toBeVisible();
  await expect(page.getByText('you are here')).toBeVisible();
});

test('plan step opens the log-investment modal preset to SIP', async ({ page }) => {
  await mockBackend(page);
  await page.goto('/invest?tab=plan');
  await page.getByRole('button', { name: 'Log my first SIP' }).click();
  await expect(page.getByText('Log an investment')).toBeVisible();
  await expect(page.getByText('Monthly SIP amount')).toBeVisible();
});

test('explore lists all nine options and opens a detail page', async ({ page }) => {
  await mockBackend(page);
  await page.goto('/invest?tab=explore');
  await expect(page.locator('a[href^="/invest/options/"]')).toHaveCount(9);
  await page.getByText('Index fund SIP', { exact: true }).click();
  await expect(page).toHaveURL(/\/invest\/options\/index-sip/);
  await expect(page.getByText('The fear, measured')).toBeVisible();
  await expect(page.getByText('How to start (in India)')).toBeVisible();
});

test('ask coach prefills the chat input from an option page', async ({ page }) => {
  await mockBackend(page);
  await page.goto('/invest/options/index-sip');
  await page.getByRole('button', { name: 'Ask coach about this' }).click();
  await expect(page).toHaveURL(/\/coach/);
  await expect(page.locator('.chat-input')).toHaveValue(/index fund SIP/);
});

test('wishlist item past 30 days asks for a decision', async ({ page }) => {
  await mockBackend(page);
  await page.goto('/money');
  await page.getByRole('button', { name: 'Wishlist' }).click();
  await expect(page.getByText('Saved by waiting')).toBeVisible();
  await expect(page.getByText('Noise-cancelling headphones')).toBeVisible();
  await expect(page.getByText('30 days up — still want it?')).toBeVisible();
  await expect(page.getByRole('button', { name: /Let it go/ })).toBeVisible();
});

test('tax tab tracks 80C against the 1.5L cap', async ({ page }) => {
  await mockBackend(page);
  await page.goto('/money');
  await page.getByRole('button', { name: 'Tax', exact: true }).click();
  await expect(page.getByText(/Section 80C · FY/)).toBeVisible();
  await expect(page.getByText('PPF deposit')).toBeVisible();
  await expect(page.getByText(/of room left/)).toBeVisible();
});

test('active EMI offers the prepay-or-invest calculator', async ({ page }) => {
  await mockBackend(page);
  await page.goto('/money');
  await page.getByRole('button', { name: 'Commitments' }).click();
  await expect(page.getByText('Bike loan')).toBeVisible();
  await page.getByRole('button', { name: 'Prepay or invest? →' }).click();
  await expect(page.getByText('Prepay Bike loan or invest?')).toBeVisible();
  // 12% expected vs 11% loan rate: within 1% margin, prepay wins
  await expect(page.getByText('Prepaying wins here')).toBeVisible();
});

test('steady page keeps its head when markets fall', async ({ page }) => {
  await mockBackend(page);
  await page.goto('/invest/steady');
  await expect(page.getByText("Markets fall. Plans don't have to.")).toBeVisible();
  await expect(page.getByText('2020 COVID crash')).toBeVisible();
  await expect(page.getByText("Don't sell")).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ask the coach' })).toBeVisible();
});

test('plan opens with the protection check', async ({ page }) => {
  await mockBackend(page);
  await page.goto('/invest?tab=plan');
  await expect(page.getByText('Before the plan: protection check')).toBeVisible();
  await expect(page.getByText('Add cover in Settings →')).toBeVisible();
});

test('guide page renders from the settings link', async ({ page }) => {
  await mockBackend(page);
  await page.goto('/settings');
  await page.getByRole('link', { name: 'How to use PaisaCoach' }).click();
  await expect(page).toHaveURL(/\/guide/);
  await expect(page.getByText('Your first 15 minutes')).toBeVisible();
  await expect(page.getByText('Easy to miss')).toBeVisible();
});

test('lesson player runs a quiz to completion', async ({ page }) => {
  await mockBackend(page);
  await page.goto('/learn/l1/l1-01');
  await expect(page.getByText('The invisible leak')).toBeVisible();
  await page.getByRole('button', { name: /Take the quick check/ }).click();
  for (let i = 0; i < 3; i++) {
    await page.locator('.lp-quiz-opt').first().click();
    await page.getByRole('button', { name: /Next question|Finish lesson/ }).click();
  }
  await expect(page.getByText('Lesson complete')).toBeVisible();
});
