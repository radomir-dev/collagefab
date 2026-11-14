import type { CollageFabItemGeometry, CollageFabOwnerState, CollageFabSize } from './CollageFab';

const SIZE_MAP: Record<'small' | 'medium' | 'large', number> = {
  small: 40,
  medium: 48,
  large: 56,
};

export function resolveSize(size: CollageFabSize): number {
  return typeof size === 'number' ? size : SIZE_MAP[size];
}

/**
 * Every mask is an absolutely positioned window that is slid against the item's
 * own translation, which pins the visible cut line to a fixed position in the
 * container while the button morphs. `spread` is the distance the mask image has
 * to cover to reach across the whole expanded row, so it scales with `gap`.
 */
export function getItemGeometry(
  index: number,
  ownerState: CollageFabOwnerState,
): CollageFabItemGeometry {
  const { count, size, gap, fadeWidth, open, direction } = ownerState;
  const pitch = size + gap;
  const spread = (count - 1) * pitch + size + fadeWidth;
  const offset = index * pitch;
  const leading = direction === 'left' || direction === 'up';
  const horizontal = direction === 'left' || direction === 'right';

  // Slice boundaries. The anchor is pushed a whole `spread` past the opaque window
  // so its cut line never crosses the button: it is never clipped.
  const boundary = index === 0 ? spread : (count - index) * (size / count);
  const anchorBoundary = index === 0 ? -fadeWidth / 2 : index * (size / count);
  // Collapsed, every slice sits on the anchor; the mask stays put and only the cut
  // lines separate them.
  const shift = open ? offset : 0;

  const ramp = leading
    ? boundary - spread - fadeWidth / 2 + shift
    : anchorBoundary - spread - fadeWidth / 2 - shift;

  // The gradient axis stays fixed per orientation; only the stop order flips.
  const stops = leading
    ? `#000 0px, #000 ${spread}px, transparent ${spread + fadeWidth}px, transparent ${2 * spread}px`
    : `transparent 0px, transparent ${spread}px, #000 ${spread + fadeWidth}px, #000 ${2 * spread}px`;

  const translate = `${leading ? '-' : ''}${shift}`;

  return {
    translate: horizontal ? `translateX(${translate}px)` : `translateY(${translate}px)`,
    maskImage:
      count > 1 ? `linear-gradient(${horizontal ? 'to right' : 'to bottom'}, ${stops})` : 'none',
    maskSize: horizontal ? `${2 * spread}px 100%` : `100% ${2 * spread}px`,
    maskPosition: horizontal ? `${ramp}px 0px` : `0px ${ramp}px`,
  };
}
