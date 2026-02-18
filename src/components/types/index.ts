import type {
  Disable,
  Langs,
  RecursivePartial,
  Shortcuts,
  Styles,
} from '../utils/modules/types';

export type {
  Obj,
  StrOrRegex,
  FixedSizeArray,
  RecursivePartial,
  Calendar,
  Dir,
  Units,
  TypePart,
  CalendarPart,
  Attrs,
  MonthDays,
  Months,
  DefaultDate,
  Formats,
  Shortcuts,
  Langs,
  Styles,
  PickerPlace,
  Inputs,
  Disable,
} from '../utils/modules/types';

export type PickerType = 'date' | 'time' | 'datetime';
export type ClickOn = 'all' | 'input' | 'icon' | 'none';
export type Mode = 'single' | 'range';
export type Color =
  | 'blue'
  | 'red'
  | 'pink'
  | 'orange'
  | 'green'
  | 'purple'
  | 'gray';

export type ColumnProp = number | Record<number, number>;

export interface DatePickerProps {
  /**
   * v-model value (was read from $attrs in Options API)
   */
  modelValue?: string | string[] | null;

  format?: string;
  inputFormat?: string;
  displayFormat?: string;

  type: PickerType;

  from?: string;
  to?: string;

  show: boolean;

  clickOn: ClickOn;
  modal: boolean;

  label?: string;

  column: ColumnProp;

  autoSubmit: boolean;
  mode: Mode;

  locale: string;

  clearable: boolean;

  disable?: Disable;

  localeConfig?: RecursivePartial<Langs>;
  styles?: Styles;

  color?: Color;

  dualInput: boolean;
  iconInside: boolean;

  shortcut: boolean | Shortcuts;
}
