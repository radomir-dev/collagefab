import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { getItemGeometry } from '../src/components/collageFabGeometry';
import type { CollageFabDirection, CollageFabOwnerState } from '../src/components/CollageFab';

const DIRECTIONS: CollageFabDirection[] = ['left', 'right', 'up', 'down'];

const params = fc.record({
  direction: fc.constantFrom(...DIRECTIONS),
  size: fc.integer({ min: 24, max: 96 }),
  gap: fc.integer({ min: 0, max: 40 }),
  fadeWidth: fc.integer({ min: 0, max: 40 }),
  count: fc.integer({ min: 1, max: 8 }),
});

function ownerState(
  {
    direction,
    size,
    gap,
    fadeWidth,
    count,
  }: {
    direction: CollageFabDirection;
    size: number;
    gap: number;
    fadeWidth: number;
    count: number;
  },
  open: boolean,
): CollageFabOwnerState {
  return {
    open,
    direction,
    trigger: 'hover',
    size,
    variant: 'circular',
    cornerRadius: '50%',
    gap,
    fadeWidth,
    count,
    transitionDuration: 400,
    transitionEasing: 'linear',
  };
}

const numbers = (value: string) => (value.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);

describe('getItemGeometry properties', () => {
  it('translates exactly one pitch per slice when open and not at all when closed', () => {
    fc.assert(
      fc.property(
        params.chain((p) =>
          fc.record({ params: fc.constant(p), index: fc.integer({ min: 0, max: p.count - 1 }) }),
        ),
        ({ params: p, index }) => {
          const closed = getItemGeometry(index, ownerState(p, false));
          const opened = getItemGeometry(index, ownerState(p, true));
          const horizontal = p.direction === 'left' || p.direction === 'right';

          expect(Math.abs(numbers(closed.translate)[0])).toBe(0);
          expect(Math.abs(numbers(opened.translate)[0])).toBe(index * (p.size + p.gap));
          expect(opened.translate.startsWith(horizontal ? 'translateX(' : 'translateY(')).toBe(
            true,
          );
        },
      ),
    );
  });

  it('keeps the cut line pinned in container space for every input', () => {
    fc.assert(
      fc.property(
        params.chain((p) =>
          fc.record({ params: fc.constant(p), index: fc.integer({ min: 0, max: p.count - 1 }) }),
        ),
        ({ params: p, index }) => {
          const horizontal = p.direction === 'left' || p.direction === 'right';
          const axis = horizontal ? 0 : 1;
          const closed = getItemGeometry(index, ownerState(p, false));
          const opened = getItemGeometry(index, ownerState(p, true));

          const pinned = (geometry: typeof closed) =>
            numbers(geometry.maskPosition)[axis] + numbers(geometry.translate)[0];

          expect(pinned(opened)).toBeCloseTo(pinned(closed), 6);
        },
      ),
    );
  });

  it('sizes the mask window to cover the whole fan', () => {
    fc.assert(
      fc.property(params, (p) => {
        const spread = (p.count - 1) * (p.size + p.gap) + p.size + p.fadeWidth;
        const geometry = getItemGeometry(0, ownerState(p, true));
        const horizontal = p.direction === 'left' || p.direction === 'right';
        const maskExtent = numbers(geometry.maskSize)[horizontal ? 0 : 1];

        expect(maskExtent).toBe(2 * spread);
        expect(geometry.maskImage === 'none').toBe(p.count === 1);
      }),
    );
  });
});
