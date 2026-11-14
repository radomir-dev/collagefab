import type {
  CollageFabDirection,
  CollageFabSize,
  CollageFabTrigger,
  CollageFabVariant,
} from './CollageFab';

/**
 * Documented defaults for every optional prop. The component destructures from
 * this object and the API page reads the same object, so a published default
 * cannot drift from the runtime one.
 */
export const COLLAGE_FAB_DEFAULTS = {
  direction: 'left',
  size: 'large',
  variant: 'circular',
  gap: 16,
  fadeWidth: 12,
  trigger: 'hover',
  defaultOpen: false,
  disableClickAway: false,
  transitionDuration: 400,
  transitionEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const satisfies {
  direction: CollageFabDirection;
  size: CollageFabSize;
  variant: CollageFabVariant;
  gap: number;
  fadeWidth: number;
  trigger: CollageFabTrigger;
  defaultOpen: boolean;
  disableClickAway: boolean;
  transitionDuration: number;
  transitionEasing: string;
};
