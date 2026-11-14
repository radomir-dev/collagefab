import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CollageFab } from '../src/components/CollageFab';

function renderFab(props: Partial<React.ComponentProps<typeof CollageFab>> = {}) {
  const utils = render(
    <CollageFab {...props}>
      <button type="button">one</button>
      <button type="button">two</button>
      <button type="button">three</button>
    </CollageFab>,
  );

  const group = () => utils.getByRole('group');
  const slices = () => Array.from(utils.container.querySelectorAll('.MuiCollageFab-item'));
  const buttons = () => Array.from(utils.container.querySelectorAll('button'));

  return { ...utils, group, slices, buttons };
}

const pointerEnter = (element: Element) =>
  fireEvent.pointerOver(element, { pointerType: 'mouse', relatedTarget: null });
const pointerLeave = (element: Element) =>
  fireEvent.pointerOut(element, { pointerType: 'mouse', relatedTarget: null });

describe('CollageFab collapsed state', () => {
  it('hides the collapsed slices from assistive technology and the tab order', () => {
    const { group, slices } = renderFab();

    expect(group()).toHaveClass('MuiCollageFab-collapsed');
    expect(group()).toHaveAttribute('tabindex', '0');
    expect(slices()).toHaveLength(3);
    for (const slice of slices()) {
      expect(slice).toHaveAttribute('aria-hidden', 'true');
    }
  });

  it('renders nothing without children', () => {
    const { container } = render(<CollageFab />);

    expect(container).toBeEmptyDOMElement();
  });
});

describe('CollageFab triggers', () => {
  it('opens on pointer enter and collapses on pointer leave for the hover trigger', () => {
    const { group } = renderFab({ trigger: 'hover' });

    pointerEnter(group());
    expect(group()).toHaveClass('Mui-expanded');

    pointerLeave(group());
    expect(group()).toHaveClass('MuiCollageFab-collapsed');
  });

  it('ignores pointer enter when the trigger is manual', () => {
    const { group, slices } = renderFab({ trigger: 'manual' });

    pointerEnter(group());

    expect(group()).toHaveClass('MuiCollageFab-collapsed');
    expect(group()).toHaveAttribute('tabindex', '-1');
    for (const slice of slices()) {
      expect(slice).not.toHaveAttribute('aria-hidden');
    }
  });

  it('toggles on click for the click trigger', async () => {
    const user = userEvent.setup();
    const { group } = renderFab({ trigger: 'click' });

    await user.click(group());
    expect(group()).toHaveClass('Mui-expanded');

    await user.click(group());
    expect(group()).toHaveClass('MuiCollageFab-collapsed');
  });

  it('opens on the first tap of a touch pointer', () => {
    const { group } = renderFab({ trigger: 'hover' });

    fireEvent.pointerDown(group(), { pointerType: 'touch' });

    expect(group()).toHaveClass('Mui-expanded');
  });
});

describe('CollageFab keyboard', () => {
  it('opens with Enter, moves focus into the group, and closes on Escape', async () => {
    const user = userEvent.setup();
    const { group, buttons } = renderFab();

    group().focus();
    await user.keyboard('{Enter}');

    expect(group()).toHaveClass('Mui-expanded');
    expect(buttons()[0]).toHaveFocus();

    await user.keyboard('{Escape}');

    expect(group()).toHaveClass('MuiCollageFab-collapsed');
    expect(group()).toHaveFocus();
  });

  it('opens with Space', async () => {
    const user = userEvent.setup();
    const { group } = renderFab();

    group().focus();
    await user.keyboard(' ');

    expect(group()).toHaveClass('Mui-expanded');
  });
});

describe('CollageFab state ownership', () => {
  it('reports transitions once per change', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    const onClose = vi.fn();
    const { group } = renderFab({ trigger: 'click', onOpen, onClose });

    await user.click(group());
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();

    await user.click(group());
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('starts open with defaultOpen', () => {
    const { group } = renderFab({ defaultOpen: true });

    expect(group()).toHaveClass('Mui-expanded');
    expect(group()).toHaveAttribute('tabindex', '-1');
  });

  it('leaves the state to the owner when open is controlled', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    const { group } = renderFab({ trigger: 'click', open: false, onOpen });

    await user.click(group());

    expect(group()).toHaveClass('MuiCollageFab-collapsed');
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('collapses on an outside click unless click-away is disabled', async () => {
    const user = userEvent.setup();
    const first = renderFab({ defaultOpen: true });

    await user.click(document.body);
    expect(first.group()).toHaveClass('MuiCollageFab-collapsed');

    first.unmount();
    const second = renderFab({ defaultOpen: true, disableClickAway: true });

    await user.click(document.body);
    expect(second.group()).toHaveClass('Mui-expanded');
  });
});
