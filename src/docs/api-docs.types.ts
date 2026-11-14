import type {
  CollageFabDirection,
  CollageFabTrigger,
  CollageFabVariant,
} from '../components/CollageFab';

/**
 * One row of the props table, derived from `CollageFabProps`.
 */
export interface ApiPropDoc {
  name: string;
  type: string;
  default: string;
  description: string;
}

/**
 * One row of an ownerState or geometry table.
 */
export interface ApiFieldDoc {
  name: string;
  type: string;
  description: string;
}

/**
 * One row of the slots table.
 */
export interface ApiSlotDoc {
  name: string;
  description: string;
}

/**
 * Everything `ApiPage` renders that can be derived from the component source.
 */
export interface ApiDocs {
  summary: string;
  props: ApiPropDoc[];
  restProps: string;
  slots: ApiSlotDoc[];
  ownerState: ApiFieldDoc[];
  itemOwnerState: ApiFieldDoc[];
  geometry: ApiFieldDoc[];
  unions: {
    direction: CollageFabDirection[];
    trigger: CollageFabTrigger[];
    variant: CollageFabVariant[];
  };
}
