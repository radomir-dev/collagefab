import * as React from 'react';
import { ClickAwayListener } from '@mui/material';
import { styled, useThemeProps } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';
import { useControlled, useForkRef } from '@mui/material/utils';
import type { CreateSlotsAndSlotProps, SlotProps } from '@mui/material/utils';
import useSlotProps from '@mui/utils/useSlotProps';
import composeClasses from '@mui/utils/composeClasses';
import generateUtilityClass from '@mui/utils/generateUtilityClass';
import { COLLAGE_FAB_DEFAULTS } from './collageFabDefaults';

/**
 * The axis the buttons fan out on, starting from the anchor child.
 */
export type CollageFabDirection = 'left' | 'right' | 'up' | 'down';

/**
 * How the group reacts to pointers.
 */
export type CollageFabTrigger = 'hover' | 'click' | 'manual';

/**
 * Diameter of every button. Named sizes resolve to small 40px, medium 48px and
 * large 56px; numeric values are used verbatim.
 */
export type CollageFabSize = 'small' | 'medium' | 'large' | number;

/**
 * The shape of every button: a circle, a rounded square or a sharp-cornered
 * square.
 */
export type CollageFabVariant = 'circular' | 'rounded' | 'square';

const SIZE_MAP: Record<'small' | 'medium' | 'large', number> = {
  small: 40,
  medium: 48,
  large: 56,
};

// `'rounded'` scales with the button so its corner reads the same at every size;
// 25% stays a rounded square, where a circle would need 50%.
const CORNER_RADIUS: Record<CollageFabVariant, number | string> = {
  circular: '50%',
  rounded: '25%',
  square: 0,
};

const FOCUSABLE_DESCENDANT_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Class names the component applies, and the accepted keys for `classes`.
 */
export interface CollageFabClasses {
  /** The animated container that holds every slice. */
  root: string;
  /** One masked wrapper per child. */
  item: string;
  /** Applied to the root while the group is expanded. */
  expanded: string;
  /** Applied to the root while the group is collapsed. */
  collapsed: string;
}

/**
 * Every key accepted by `classes`.
 */
export type CollageFabClassKey = keyof CollageFabClasses;

/**
 * Slot props accepted by a custom `root` slot component.
 */
export interface CollageFabRootSlotPropsOverrides {}

/**
 * Slot props accepted by a custom `item` slot component.
 */
export interface CollageFabItemSlotPropsOverrides {}

/**
 * State shared by the root slot and the item slots while styling.
 */
export interface CollageFabOwnerState {
  /** Whether the group is currently expanded. */
  open: boolean;
  /** The resolved fan-out direction. */
  direction: CollageFabDirection;
  /** The resolved pointer trigger mode. */
  trigger: CollageFabTrigger;
  /** The button diameter in pixels, after resolving the named size. */
  size: number;
  /** The resolved shape of every button. */
  variant: CollageFabVariant;
  /** The corner radius resolved from `variant`, inherited by every child. */
  cornerRadius: number | string;
  /** The main-axis gap in pixels. */
  gap: number;
  /** The fade width in pixels. */
  fadeWidth: number;
  /** The number of valid children currently rendered. */
  count: number;
  /** The morph duration in milliseconds. */
  transitionDuration: number;
  /** The morph easing. */
  transitionEasing: string;
}

/**
 * The per-slice CSS computed for one child.
 */
export interface CollageFabItemGeometry {
  /** The translate that moves the slice along the main axis. */
  translate: string;
  /** The gradient that cuts the slice out of the container. */
  maskImage: string;
  /** The size of that gradient, wide enough to cover the expanded row. */
  maskSize: string;
  /** The offset that pins the cut line in container space. */
  maskPosition: string;
}

/**
 * State handed to the item slot. It extends the shared state with the position
 * of the child, so an item can be styled individually.
 */
export interface CollageFabItemOwnerState extends CollageFabOwnerState {
  /** The position of the child in the stack. 0 is the anchor. */
  index: number;
  /** True for the anchor child (index 0). */
  isAnchor: boolean;
  /** The computed translate, mask image, mask size and mask position for this slice. */
  geometry: CollageFabItemGeometry;
}

/**
 * Replaceable internal components.
 */
export interface CollageFabSlots {
  /** The animated container. A replacement must forward `ref`, which `ClickAwayListener` needs. */
  root?: React.ElementType;
  /** One masked wrapper per child, shaped by `variant`. */
  item?: React.ElementType;
}

/**
 * The `slots` and `slotProps` props, typed per slot.
 */
export type CollageFabSlotsAndSlotProps = CreateSlotsAndSlotProps<
  CollageFabSlots,
  {
    /** Props for the root slot, or a resolver that receives the shared ownerState. */
    root: SlotProps<'div', CollageFabRootSlotPropsOverrides, CollageFabOwnerState>;
    /** Props for the item slot, or a resolver that receives the item ownerState. */
    item: SlotProps<'div', CollageFabItemSlotPropsOverrides, CollageFabItemOwnerState>;
  }
>;

/**
 * Props for the CollageFab component.
 */
export interface CollageFabProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * The buttons to stack. Every valid element is wrapped in a masked slot shaped
   * by `variant`. Order matters: index 0 is the anchor, the rest fan out along
   * `direction`.
   */
  children?: React.ReactNode;
  /**
   * The axis the buttons fan out on, starting from the anchor child. `left`
   * matches the original right-anchored behaviour.
   */
  direction?: CollageFabDirection;
  /**
   * Diameter of every button. Named sizes resolve to small 40px, medium 48px,
   * large 56px; numeric values are used verbatim.
   */
  size?: CollageFabSize;
  /**
   * The shape of every button. `'circular'` clips each slice to a circle,
   * `'rounded'` to a rounded square and `'square'` to a sharp-cornered square.
   * The mask still slices the silhouette along the main axis, so the stack reads
   * as one shape when collapsed and as separate shapes when expanded.
   */
  variant?: CollageFabVariant;
  /**
   * Main-axis gap in pixels between two buttons when expanded.
   */
  gap?: number;
  /**
   * Width in pixels of the soft cut line between two slices.
   */
  fadeWidth?: number;
  /**
   * How the group reacts to pointers. `'hover'` opens on mouse enter, closes on
   * mouse leave and toggles on touch or pen tap; `'click'` toggles on any click;
   * `'manual'` disables all built-in pointer interaction.
   */
  trigger?: CollageFabTrigger;
  /**
   * If `true`, the group is expanded. Use it to control the component.
   */
  open?: boolean;
  /**
   * If `true`, the group is expanded by default (uncontrolled).
   */
  defaultOpen?: boolean;
  /**
   * Callback fired when the group is expanded.
   */
  onOpen?: (event: React.SyntheticEvent) => void;
  /**
   * Callback fired when the group is collapsed.
   */
  onClose?: (event: React.SyntheticEvent) => void;
  /**
   * If `true`, the group does not collapse when the user clicks away from it.
   */
  disableClickAway?: boolean;
  /**
   * Duration of the morph, in milliseconds.
   */
  transitionDuration?: number;
  /**
   * Easing of the morph.
   */
  transitionEasing?: string;
  /**
   * System prop that defines system overrides as well as additional CSS styles.
   */
  sx?: SxProps<Theme>;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<CollageFabClasses>;
  /**
   * Custom components for the `root` and `item` slots.
   */
  slots?: CollageFabSlotsAndSlotProps['slots'];
  /**
   * Props for each slot. `slotProps.item` accepts either a props object or an
   * `(ownerState) => props` callback, which is the per-child escape hatch.
   */
  slotProps?: CollageFabSlotsAndSlotProps['slotProps'];
}

function resolveSize(size: CollageFabSize): number {
  return typeof size === 'number' ? size : SIZE_MAP[size];
}

function getTransitionTiming(duration: number, easing: string): string {
  return `${duration}ms ${easing}`;
}

/**
 * Every mask is an absolutely positioned window that is slid against the item's
 * own translation, which pins the visible cut line to a fixed position in the
 * container while the button morphs. `spread` is the distance the mask image has
 * to cover to reach across the whole expanded row, so it scales with `gap`.
 */
function getItemGeometry(index: number, ownerState: CollageFabOwnerState): CollageFabItemGeometry {
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

function getCollageFabUtilityClass(slot: string) {
  return generateUtilityClass('MuiCollageFab', slot);
}

const useUtilityClasses = (open: boolean, classes: Partial<CollageFabClasses> | undefined) => {
  const slots = {
    root: ['root', open ? 'expanded' : 'collapsed'],
    item: ['item'],
  };
  return composeClasses(slots, getCollageFabUtilityClass, classes);
};

const CollageFabRoot = styled('div', {
  name: 'MuiCollageFab',
  slot: 'root',
  overridesResolver: (_props, styles) => styles.root,
})(({ ownerState }: { ownerState: CollageFabOwnerState }) => {
  const { open, direction, size, gap, count, transitionDuration, transitionEasing } = ownerState;
  const horizontal = direction === 'left' || direction === 'right';
  const anchorIsEnd = direction === 'left' || direction === 'up';
  const mainExtent = open ? count * size + Math.max(count - 1, 0) * gap : size;

  return {
    position: 'relative',
    width: horizontal ? mainExtent : size,
    height: horizontal ? size : mainExtent,
    display: 'flex',
    flexDirection: horizontal ? 'row' : 'column',
    justifyContent: anchorIsEnd ? 'flex-end' : 'flex-start',
    transition: `${horizontal ? 'width' : 'height'} ${getTransitionTiming(
      transitionDuration,
      transitionEasing,
    )}`,
    // A filter traces the soft mask edges; a box-shadow would trace the wrapper rectangles.
    filter: 'drop-shadow(0px 6px 12px rgba(0,0,0,0.25))',
    cursor: open ? 'default' : 'pointer',
    WebkitTapHighlightColor: 'transparent',
  };
});

const CollageFabItemRoot = styled('div', {
  name: 'MuiCollageFab',
  slot: 'item',
  overridesResolver: (_props, styles) => styles.item,
})(({ ownerState }: { ownerState: CollageFabItemOwnerState }) => {
  const { direction, size, index, geometry, cornerRadius, transitionDuration, transitionEasing } =
    ownerState;
  const horizontal = direction === 'left' || direction === 'right';
  const anchorEdge =
    direction === 'left'
      ? { right: 0 }
      : direction === 'right'
        ? { left: 0 }
        : direction === 'up'
          ? { bottom: 0 }
          : { top: 0 };
  const timing = getTransitionTiming(transitionDuration, transitionEasing);

  return {
    position: 'absolute',
    ...anchorEdge,
    ...(horizontal ? { top: 0 } : { left: 0 }),
    width: size,
    height: size,
    borderRadius: cornerRadius,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    // The left-most slices have to stack on top of the right-ward ones.
    zIndex: index,
    // Always present, even collapsed: the transform is what makes this wrapper a
    // stacking context, which neutralizes the child's own z-index.
    transform: geometry.translate,
    WebkitMaskImage: geometry.maskImage,
    maskImage: geometry.maskImage,
    WebkitMaskSize: geometry.maskSize,
    maskSize: geometry.maskSize,
    WebkitMaskPosition: geometry.maskPosition,
    maskPosition: geometry.maskPosition,
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    transition: `transform ${timing}, -webkit-mask-position ${timing}, mask-position ${timing}`,
    // Strip arbitrary shadows from the children and make them inherit the wrapper's
    // silhouette, so the root controls the global 3D shape.
    '& > *': {
      boxShadow: 'none !important',
      borderRadius: 'inherit !important',
      width: '100%',
      height: '100%',
      margin: 0,
    },
  };
});

type CollageFabItemSlotProps = NonNullable<CollageFabSlotsAndSlotProps['slotProps']>['item'];

interface CollageFabItemProps {
  index: number;
  ownerState: CollageFabOwnerState;
  geometry: CollageFabItemGeometry;
  className: string;
  component: React.ElementType;
  inert: boolean;
  itemRefs: React.MutableRefObject<Array<HTMLDivElement | null>>;
  slotProps: CollageFabItemSlotProps;
  children?: React.ReactNode;
}

function CollageFabItem(props: CollageFabItemProps) {
  const {
    index,
    ownerState,
    geometry,
    className,
    component,
    inert,
    itemRefs,
    slotProps,
    children,
  } = props;

  const itemOwnerState = React.useMemo<CollageFabItemOwnerState>(
    () => ({ ...ownerState, index, isAnchor: index === 0, geometry }),
    [ownerState, index, geometry],
  );

  const nodeRef = React.useRef<HTMLDivElement>(null);
  const registerItem = React.useCallback(
    (element: HTMLDivElement | null) => {
      itemRefs.current[index] = element;
    },
    [itemRefs, index],
  );
  const handleRef = useForkRef(registerItem, nodeRef);

  React.useEffect(() => {
    const node = nodeRef.current;
    if (!node || !('inert' in HTMLElement.prototype)) {
      return;
    }
    // Collapsed slices are only a few pixels wide but still occupy their full
    // rectangle, so they must leave both the tab order and the accessibility tree.
    node.inert = inert;
  }, [inert]);

  const itemSlotProps = useSlotProps({
    elementType: component,
    externalSlotProps: slotProps,
    ownerState: itemOwnerState,
    additionalProps: {
      ref: handleRef,
      className,
      'aria-hidden': inert || undefined,
      children,
    },
  });

  const ItemComponent = component;
  return <ItemComponent {...itemSlotProps} />;
}

/**
 * A floating action button that stacks several children into a single shape and
 * unfolds them along a configurable direction on interaction. The root animates
 * its own main-axis extent and applies one shared drop shadow, while each child
 * is clipped by a moving gradient mask.
 */
export const CollageFab = React.forwardRef<HTMLDivElement, CollageFabProps>(
  function CollageFab(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiCollageFab' });

    const {
      children,
      direction = COLLAGE_FAB_DEFAULTS.direction,
      size = COLLAGE_FAB_DEFAULTS.size,
      variant = COLLAGE_FAB_DEFAULTS.variant,
      gap = COLLAGE_FAB_DEFAULTS.gap,
      fadeWidth = COLLAGE_FAB_DEFAULTS.fadeWidth,
      trigger = COLLAGE_FAB_DEFAULTS.trigger,
      open: openProp,
      defaultOpen = COLLAGE_FAB_DEFAULTS.defaultOpen,
      onOpen,
      onClose,
      disableClickAway = COLLAGE_FAB_DEFAULTS.disableClickAway,
      transitionDuration = COLLAGE_FAB_DEFAULTS.transitionDuration,
      transitionEasing = COLLAGE_FAB_DEFAULTS.transitionEasing,
      classes: classesProp,
      slots,
      slotProps,
      className,
      ...other
    } = props;

    const [open, setOpen] = useControlled<boolean>({
      controlled: openProp,
      default: defaultOpen,
      name: 'CollageFab',
      state: 'open',
    });

    const childArray = React.useMemo(
      () => React.Children.toArray(children).filter((child) => React.isValidElement(child)),
      [children],
    );
    const count = childArray.length;

    const ownerState: CollageFabOwnerState = {
      open,
      direction,
      trigger,
      size: resolveSize(size),
      variant,
      cornerRadius: CORNER_RADIUS[variant],
      gap,
      fadeWidth,
      count,
      transitionDuration,
      transitionEasing,
    };

    const classes = useUtilityClasses(open, classesProp);

    const rootRef = React.useRef<HTMLDivElement>(null);
    const itemRefs = React.useRef<Array<HTMLDivElement | null>>([]);
    const suppressClickRef = React.useRef(false);
    const lastPointerTypeRef = React.useRef('mouse');
    const focusFirstItemRef = React.useRef(false);
    const handleRootRef = useForkRef(rootRef, ref);

    const setOpenState = React.useCallback(
      (next: boolean, event: React.SyntheticEvent) => {
        if (next === open) {
          return;
        }
        setOpen(next);
        if (next) {
          onOpen?.(event);
        } else {
          onClose?.(event);
        }
      },
      [open, setOpen, onOpen, onClose],
    );

    const handlePointerEnter = (event: React.PointerEvent<HTMLDivElement>) => {
      if (trigger !== 'hover' || event.pointerType !== 'mouse') {
        return;
      }
      setOpenState(true, event);
    };

    const handlePointerLeave = (event: React.PointerEvent<HTMLDivElement>) => {
      if (trigger !== 'hover' || event.pointerType !== 'mouse') {
        return;
      }
      setOpenState(false, event);
    };

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
      if (trigger === 'manual') {
        return;
      }
      lastPointerTypeRef.current = event.pointerType;
      // A fresh gesture invalidates suppression left over from a gesture that never
      // produced a click.
      suppressClickRef.current = false;
      if (event.pointerType === 'mouse' || open) {
        return;
      }
      // The tap that opens the group must not also activate the slice under the finger.
      suppressClickRef.current = true;
      setOpenState(true, event);
    };

    const handleClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
      if (!suppressClickRef.current) {
        return;
      }
      suppressClickRef.current = false;
      event.stopPropagation();
      event.preventDefault();
    };

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if (trigger === 'manual') {
        return;
      }
      if (trigger === 'click') {
        setOpenState(!open, event);
        return;
      }
      // A mouse click keeps the group open (leaving the group collapses it); a tap on
      // a child both activates it and collapses the group.
      if (open && lastPointerTypeRef.current !== 'mouse') {
        setOpenState(false, event);
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (trigger === 'manual') {
        return;
      }
      if (open) {
        if (event.key !== 'Escape') {
          return;
        }
        event.stopPropagation();
        setOpenState(false, event);
        rootRef.current?.focus();
        return;
      }
      if (event.key !== 'Enter' && event.key !== ' ') {
        return;
      }
      event.preventDefault();
      focusFirstItemRef.current = true;
      setOpenState(true, event);
    };

    const handleClickAway = (event: MouseEvent | TouchEvent) => {
      // ClickAwayListener reports the native event while the public contract is a
      // React synthetic event.
      setOpenState(false, event as unknown as React.SyntheticEvent);
    };

    const RootComponent = slots?.root ?? CollageFabRoot;
    const ItemComponent = slots?.item ?? CollageFabItemRoot;

    const rootSlotProps = useSlotProps({
      elementType: RootComponent,
      externalForwardedProps: other,
      externalSlotProps: slotProps?.root,
      ownerState,
      additionalProps: {
        ref: handleRootRef,
        role: 'group',
        tabIndex: !open && trigger !== 'manual' ? 0 : -1,
        onPointerEnter: handlePointerEnter,
        onPointerLeave: handlePointerLeave,
        onPointerDown: handlePointerDown,
        onClick: handleClick,
        onClickCapture: handleClickCapture,
        onKeyDown: handleKeyDown,
      },
      className: [classes.root, className],
    });

    React.useEffect(() => {
      if (!open || !focusFirstItemRef.current) {
        return;
      }
      focusFirstItemRef.current = false;
      const wrapper = itemRefs.current[0];
      if (!wrapper) {
        return;
      }
      const target = wrapper.querySelector<HTMLElement>(FOCUSABLE_DESCENDANT_SELECTOR);
      (target ?? wrapper).focus();
    }, [open]);

    if (count === 0) {
      return null;
    }

    const group = (
      <RootComponent {...rootSlotProps}>
        {childArray.map((child, index) => (
          <CollageFabItem
            key={index}
            index={index}
            ownerState={ownerState}
            geometry={getItemGeometry(index, ownerState)}
            className={classes.item}
            component={ItemComponent}
            inert={!open && trigger !== 'manual'}
            itemRefs={itemRefs}
            slotProps={slotProps?.item}
          >
            {child}
          </CollageFabItem>
        ))}
      </RootComponent>
    );

    if (disableClickAway || trigger === 'manual') {
      return group;
    }

    return <ClickAwayListener onClickAway={handleClickAway}>{group}</ClickAwayListener>;
  },
);
