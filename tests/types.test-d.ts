import { describe, expectTypeOf, it } from 'vitest';
import type { CollageFabProps } from '../src/components/CollageFab';

describe('CollageFab public types', () => {
  it('keeps the documented unions', () => {
    expectTypeOf<NonNullable<CollageFabProps['direction']>>().toEqualTypeOf<
      'left' | 'right' | 'up' | 'down'
    >();
    expectTypeOf<NonNullable<CollageFabProps['trigger']>>().toEqualTypeOf<
      'hover' | 'click' | 'manual'
    >();
    expectTypeOf<NonNullable<CollageFabProps['variant']>>().toEqualTypeOf<
      'circular' | 'rounded' | 'square'
    >();
  });

  it('accepts a diameter as a number or a named size', () => {
    expectTypeOf<CollageFabProps['size']>().toEqualTypeOf<
      'small' | 'medium' | 'large' | number | undefined
    >();
  });

  it('exposes slot overrides keyed by slot name', () => {
    expectTypeOf<NonNullable<CollageFabProps['slotProps']>>().toMatchTypeOf<{ item?: unknown }>();
    expectTypeOf<NonNullable<CollageFabProps['slots']>>().toMatchTypeOf<{ item?: unknown }>();
  });

  it('rejects an unknown direction and an unknown trigger', () => {
    // @ts-expect-error `sideways` is not a direction
    const direction: CollageFabProps = { direction: 'sideways' };
    // @ts-expect-error `pinch` is not a trigger
    const trigger: CollageFabProps = { trigger: 'pinch' };
    void direction;
    void trigger;
  });
});
