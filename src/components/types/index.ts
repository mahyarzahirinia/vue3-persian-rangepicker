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
  PersianDate,
  LocaleDate,
  SubmitPayload,
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

  type?: PickerType;

  from?: string;
  to?: string;

  show?: boolean;

  clickOn?: ClickOn;
  modal?: boolean;

  label?: string;

  column?: ColumnProp;

  autoSubmit?: boolean;
  mode?: Mode;

  locale?: 'fa' | 'en';

  clearable?: boolean;

  disable?: Disable;

  localeConfig?: RecursivePartial<Langs>;
  styles?: Styles;

  color?: Color;

  dualInput?: boolean;
  iconInside?: boolean;

  shortcut?: boolean | Shortcuts;

  // used as a forwarded attribute (alt-name) in the template
  altName?: string;
}

/**
 * Props that are always present because DatePicker.vue supplies them via
 * `withDefaults`. The composable receives the already-defaulted props object,
 * so these can be treated as required here.
 */
type DefaultedProps =
  | 'type'
  | 'show'
  | 'clickOn'
  | 'modal'
  | 'column'
  | 'autoSubmit'
  | 'mode'
  | 'locale'
  | 'clearable'
  | 'dualInput'
  | 'iconInside'
  | 'shortcut';

export type DatePickerPropsWithDefaults = Omit<
  DatePickerProps,
  DefaultedProps
> &
  Required<Pick<DatePickerProps, DefaultedProps>>;
