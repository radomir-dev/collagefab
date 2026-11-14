import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { CollageFab } from '../src/components/CollageFab';

expect.extend(toHaveNoViolations);

function renderFab(props: Partial<React.ComponentProps<typeof CollageFab>> = {}) {
  return render(
    <CollageFab {...props}>
      <button type="button" aria-label="Settings" />
      <button type="button" aria-label="Debugger" />
      <button type="button" aria-label="Console" />
    </CollageFab>,
  );
}

describe('CollageFab accessibility', () => {
  it('has no violations while collapsed', async () => {
    const { container } = renderFab();

    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations while expanded', async () => {
    const { container } = renderFab({ defaultOpen: true });

    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations when interaction is manual', async () => {
    const { container } = renderFab({ trigger: 'manual' });

    expect(await axe(container)).toHaveNoViolations();
  });
});
