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

/** Map of picker type to its format string (date, time, datetime). */
export type PickerTypeFormatMap = Record<PickerType, string>;
export type ClickOn = 'all' | 'input' | 'icon' | 'none';
export type Mode = 'single' | 'range';
export type UiMode = 'inline' | 'dialog';
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
  /**
   * Format for the emitted `modelValue`.
   *
   * This is passed directly to `PersianDate#toString` from
   * `@alireza-ab/persian-date`. The calendar (Jalali vs Gregorian)
   * is determined purely by the tokens you use:
   *
   * - **Jalali**: use `j`-prefixed tokens, e.g. `jYYYY/jMM/jDD`, `jYY/jM/jD`
   * - **Gregorian**: use non-prefixed tokens, e.g. `YYYY/MM/DD`, `YY/M/D`
   *
   * Examples:
   * - `'jYYYY/jMM/jDD'` → `1399/06/10`
   * - `'YYYY-MM-DD'` → `2020-08-31`
   */
  format?: string;
  /**
   * Format for the text shown in the input(s) after submit.
   *
   * Uses the same token rules as `format`:
   *
   * - **Jalali** (recommended when `locale` contains `'fa'`):
   *   `jYYYY/jMM/jDD`, `jYY/jM/jD`, etc.
   * - **Gregorian**: `YYYY/MM/DD`, `YY/M/D`, etc.
   *
   * This only affects *display* in the text field; internal state is always
   * stored as a `PersianDate` instance.
   */
  inputFormat?: string;
  /**
   * Format for footer / helper display text (e.g. the range text in the footer).
   *
   * Also uses `@alireza-ab/persian-date` tokens with the same Jalali vs
   * Gregorian rules:
   *
   * - Jalali example: `'jD jMMMM jYYYY'`
   * - Gregorian example: `'D MMMM YYYY'`
   */
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

  uiMode?: UiMode;

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
  | 'shortcut'
  | 'uiMode';

export type DatePickerPropsWithDefaults = Omit<
  DatePickerProps,
  DefaultedProps
> &
  Required<Pick<DatePickerProps, DefaultedProps>>;
