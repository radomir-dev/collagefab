import { describe, expect, it } from 'vitest';
import { getItemGeometry, resolveSize } from '../src/components/collageFabGeometry';
import type { CollageFabDirection, CollageFabOwnerState } from '../src/components/CollageFab';

const DIRECTIONS: CollageFabDirection[] = ['left', 'right', 'up', 'down'];

function state(overrides: Partial<CollageFabOwnerState> = {}): CollageFabOwnerState {
  return {
    open: false,
    direction: 'left',
    trigger: 'hover',
    size: 56,
    variant: 'circular',
    cornerRadius: '50%',
    gap: 16,
    fadeWidth: 12,
    count: 3,
    transitionDuration: 400,
    transitionEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    ...overrides,
  };
}

const numbers = (value: string) => (value.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);

const translateOf = (geometry: ReturnType<typeof getItemGeometry>) => numbers(geometry.translate)[0];
const maskPositionOf = (geometry: ReturnType<typeof getItemGeometry>, axis: 'x' | 'y') => {
  const [x = 0, y = 0] = numbers(geometry.maskPosition);
  return axis === 'x' ? x : y;
};
const maskSizeOf = (geometry: ReturnType<typeof getItemGeometry>) => numbers(geometry.maskSize)[0];

describe('resolveSize', () => {
  it('passes numeric sizes through untouched', () => {
    expect(resolveSize(37)).toBe(37);
  });

  it('maps every named size onto a larger diameter', () => {
    expect(resolveSize('medium')).toBeGreaterThan(resolveSize('small'));
    expect(resolveSize('large')).toBeGreaterThan(resolveSize('medium'));
  });
});

describe('getItemGeometry', () => {
  it('translates each slice by a whole pitch once expanded, and not at all while collapsed', () => {
    for (const direction of DIRECTIONS) {
      for (const index of [0, 1, 2]) {
        const closed = getItemGeometry(index, state({ direction }));
        const opened = getItemGeometry(index, state({ direction, open: true }));

        expect(Math.abs(translateOf(closed))).toBe(0);
        expect(Math.abs(translateOf(opened))).toBe(index * (56 + 16));
      }
    }
  });

  it('sends the fan along the axis of the direction', () => {
    for (const direction of DIRECTIONS) {
      const geometry = getItemGeometry(1, state({ direction, open: true }));
      const horizontal = direction === 'left' || direction === 'right';

      expect(geometry.translate.startsWith(horizontal ? 'translateX(' : 'translateY(')).toBe(true);
      expect(geometry.maskPosition).toMatch(horizontal ? /^-?\d+(\.\d+)?px 0px$/ : /^0px -?\d+(\.\d+)?px$/);
      expect(geometry.maskSize).toMatch(horizontal ? /^\d+px 100%$/ : /^100% \d+px$/);
    }
  });

  it('keeps the cut line pinned in container space while the slice travels', () => {
    for (const direction of DIRECTIONS) {
      for (const index of [0, 1, 2, 3]) {
        const axis = direction === 'left' || direction === 'right' ? 'x' : 'y';
        const closed = getItemGeometry(index, state({ direction, count: 4 }));
        const opened = getItemGeometry(index, state({ direction, count: 4, open: true }));

        expect(maskPositionOf(opened, axis) + translateOf(opened)).toBeCloseTo(
          maskPositionOf(closed, axis) + translateOf(closed),
          6,
        );
      }
    }
  });

  it('drops the mask for a single child', () => {
    expect(getItemGeometry(0, state({ count: 1 })).maskImage).toBe('none');
    expect(getItemGeometry(0, state({ count: 2 })).maskImage).not.toBe('none');
  });

  it('flips the gradient stop order with the leading edge', () => {
    expect(getItemGeometry(1, state({ direction: 'right' })).maskImage).toContain(
      'linear-gradient(to right, transparent 0px',
    );
    expect(getItemGeometry(1, state({ direction: 'left' })).maskImage).toContain(
      'linear-gradient(to right, #000 0px',
    );
    expect(getItemGeometry(1, state({ direction: 'up' })).maskImage).toContain(
      'linear-gradient(to bottom, #000 0px',
    );
    expect(getItemGeometry(1, state({ direction: 'down' })).maskImage).toContain(
      'linear-gradient(to bottom, transparent 0px',
    );
  });

  it('scales the mask window with the expanded extent', () => {
    const [size, gap, fadeWidth, count] = [56, 16, 12, 3];
    const spread = (count - 1) * (size + gap) + size + fadeWidth;

    expect(maskSizeOf(getItemGeometry(1, state({ size, gap, fadeWidth, count })))).toBe(2 * spread);
  });
});
