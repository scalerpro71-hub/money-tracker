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

test('home shows the spendable hero and journey nudge', async ({ page }) => {
  await mockBackend(page);
  await page.goto('/');
  await expect(page.getByText('Left to spend this month')).toBeVisible();
  await expect(page.getByText(/Level 1 · Know Your Money/i)).toBeVisible();
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

test('invest tab is gated before Level 5', async ({ page }) => {
  await mockBackend(page);
  await page.goto('/invest');
  await expect(page.getByText('Investing unlocks at Level 5')).toBeVisible();
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
