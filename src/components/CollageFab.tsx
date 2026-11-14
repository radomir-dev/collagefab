import * as React from 'react';
import { ClickAwayListener } from '@mui/material';
import { styled, useThemeProps } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';
import { useControlled, useForkRef } from '@mui/material/utils';
import type { CreateSlotsAndSlotProps, SlotProps } from '@mui/material/utils';
import useSlotProps from '@mui/utils/useSlotProps';
import composeClasses from '@mui/utils/composeClasses';
import generateUtilityClass from '@mui/utils/generateUtilityClass';
import { getItemGeometry, resolveSize } from './collageFabGeometry';

export type CollageFabDirection = 'left' | 'right' | 'up' | 'down';

export type CollageFabTrigger = 'hover' | 'click' | 'manual';

export type CollageFabSize = 'small' | 'medium' | 'large' | number;

export type CollageFabVariant = 'circular' | 'rounded' | 'square';

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

export interface CollageFabClasses {
  root: string;
  item: string;
  expanded: string;
  collapsed: string;
}

export type CollageFabClassKey = keyof CollageFabClasses;

export interface CollageFabRootSlotPropsOverrides {}
export interface CollageFabItemSlotPropsOverrides {}

export interface CollageFabOwnerState {
  open: boolean;
  direction: CollageFabDirection;
  trigger: CollageFabTrigger;
  size: number;
  variant: CollageFabVariant;
  cornerRadius: number | string;
  gap: number;
  fadeWidth: number;
  count: number;
  transitionDuration: number;
  transitionEasing: string;
}

export interface CollageFabItemGeometry {
  translate: string;
  maskImage: string;
  maskSize: string;
  maskPosition: string;
}

export interface CollageFabItemOwnerState extends CollageFabOwnerState {
  index: number;
  isAnchor: boolean;
  geometry: CollageFabItemGeometry;
}

export interface CollageFabSlots {
  root?: React.ElementType;
  item?: React.ElementType;
}

export type CollageFabSlotsAndSlotProps = CreateSlotsAndSlotProps<
  CollageFabSlots,
  {
    root: SlotProps<'div', CollageFabRootSlotPropsOverrides, CollageFabOwnerState>;
    item: SlotProps<'div', CollageFabItemSlotPropsOverrides, CollageFabItemOwnerState>;
  }
>;

export interface CollageFabProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>, CollageFabSlotsAndSlotProps {
  /**
   * The buttons to stack. Order matters: index 0 is the anchor, the remaining
   * children fan out along `direction`.
   */
  children?: React.ReactNode;
  /**
   * The axis the buttons fan out on, starting from the anchor child.
   * @default 'left'
   */
  direction?: CollageFabDirection;
  /**
   * Diameter of every button, in pixels. Numeric values are used verbatim.
   * @default 'large'
   */
  size?: CollageFabSize;
  /**
   * The shape of every button. `'circular'` clips each slice to a circle,
   * `'rounded'` to a rounded square and `'square'` to a sharp-cornered square.
   * The mask still slices the silhouette along the main axis, so the stack reads
   * as one shape when collapsed and as separate shapes when expanded.
   * @default 'circular'
   */
  variant?: CollageFabVariant;
  /**
   * Main axis gap between two buttons when expanded, in pixels.
   * @default 16
   */
  gap?: number;
  /**
   * Width of the soft cut line between two slices, in pixels.
   * @default 12
   */
  fadeWidth?: number;
  /**
   * How the group reacts to pointers. `'hover'` opens on mouse enter, closes on
   * mouse leave and toggles on touch/pen tap. `'click'` toggles on any click.
   * `'manual'` disables all built-in pointer interaction.
   * @default 'hover'
   */
  trigger?: CollageFabTrigger;
  /**
   * If `true`, the group is expanded. Use it to control the component.
   */
  open?: boolean;
  /**
   * If `true`, the group is expanded by default.
   * @default false
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
   * @default false
   */
  disableClickAway?: boolean;
  /**
   * Duration of the morph, in milliseconds.
   * @default 400
   */
  transitionDuration?: number;
  /**
   * Easing of the morph.
   * @default 'cubic-bezier(0.4, 0, 0.2, 1)'
   */
  transitionEasing?: string;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps<Theme>;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<CollageFabClasses>;
}

function getTransitionTiming(duration: number, easing: string): string {
  return `${duration}ms ${easing}`;
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

export const CollageFab = React.forwardRef<HTMLDivElement, CollageFabProps>(
  function CollageFab(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiCollageFab' });

    const {
      children,
      direction = 'left',
      size = 'large',
      variant = 'circular',
      gap = 16,
      fadeWidth = 12,
      trigger = 'hover',
      open: openProp,
      defaultOpen = false,
      onOpen,
      onClose,
      disableClickAway = false,
      transitionDuration = 400,
      transitionEasing = 'cubic-bezier(0.4, 0, 0.2, 1)',
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
