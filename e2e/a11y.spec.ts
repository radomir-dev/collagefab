import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

for (const route of [
  { name: 'demo', path: './' },
  { name: 'components api', path: './#/docs' },
  { name: 'playground', path: './#/playground' },
]) {
  test(`${route.name} has no serious accessibility violations`, async ({ page }) => {
    await page.goto(route.path);
    await page.locator('.MuiToolbar-root').waitFor();

    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const serious = violations.filter(
      (violation) => violation.impact === 'serious' || violation.impact === 'critical',
    );

    const summary = serious.map(
      (violation) =>
        `${violation.id} (${violation.impact}): ${violation.nodes
          .slice(0, 3)
          .map((node) => node.target.join(' '))
          .join(' | ')}`,
    );

    expect(summary).toEqual([]);
  });
}
