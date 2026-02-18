<script setup lang="ts">
  /**
   * TODO: use scoped slots
   * TODO: add time config
   * TODO: add tip for days
   * TODO: test the project with attention and test in nuxt
   * TODO: refactor and write comment --> pay a high attention
   */

  import {
    computed,
    nextTick,
    onBeforeMount,
    onMounted,
    onUnmounted,
    reactive,
    ref,
    watch,
    watchEffect,
    useAttrs,
  } from 'vue';

  // ************************ Core ************************
  import { PersianDate, Core } from './utils/modules/core';

  // ************************ Types ************************
  import type {
    Obj,
    Attrs,
    Langs,
    RecursivePartial,
    Styles,
    Inputs,
    PickerPlace,
    TypePart,
    CalendarPart,
    Disable,
    Formats,
    MonthDays,
    Months,
    Shortcuts,
    DefaultDate,
    DatePickerProps,
    Mode,
    Color,
    PickerType,
  } from './types';

  // ************************ Components ************************
  import PDPArrow from './utils/components/PDPArrow.vue';
  import PDPIcon from './utils/components/PDPIcon.vue';
  import PDPAlt from './utils/components/PDPAlt.vue';

  defineOptions({
    name: 'ZahiriniyaRangePicker',
    inheritAttrs: false,
  });

  const props = withDefaults(defineProps<DatePickerProps>(), {
    type: 'date',
    show: false,
    clickOn: 'all',
    modal: false,
    column: () => ({ 576: 1 }),
    autoSubmit: true,
    mode: 'range',
    locale: 'fa',
    clearable: false,
    dualInput: false,
    iconInside: false,
    shortcut: false,
  });

  const emit = defineEmits<{
    (e: 'open'): void;
    (e: 'close'): void;
    (e: 'select', date: PersianDate): void;
    (e: 'submit', date: PersianDate | PersianDate[]): void;
    (e: 'clear'): void;
    (
      e: 'update:modelValue',
      value:
        | string
        | string[]
        | null
        | (string | null)[]
        | PersianDate
        | PersianDate[],
    ): void;
  }>();

  const isClient: boolean = typeof window !== 'undefined';
  const rawAttrs = useAttrs() as Record<string, unknown>;

  // -------------------- template refs --------------------
  const root = ref<HTMLElement | null>(null);
  const inputsRef = ref<HTMLInputElement[]>([]);
  const pdpPicker = ref<HTMLElement | null>(null);
  const pdpSelectYear = ref<HTMLElement | null>(null);
  const pdpMain = ref<HTMLElement | null>(null);

  // -------------------- state --------------------
  const core = ref<PersianDate>(new PersianDate());
  const onDisplay = ref<PersianDate | undefined>(undefined);
  const fromDate = ref<PersianDate | undefined>(undefined);
  const toDate = ref<PersianDate | undefined>(undefined);

  const selectedDates = ref<PersianDate[]>([]);
  const selectedTimes = ref<PersianDate[]>([]);

  const showDatePicker = ref<boolean>(false);
  const showYearSelect = ref<boolean>(false);
  const showMonthSelect = ref<boolean>(false);
  // const showTopOfInput = ref<boolean>(false);

  const displayValue = ref<string[]>([]);
  const inputName = ref<Inputs>('firstInput');

  const pickerPlace = reactive<PickerPlace>({
    top: false,
    left: false,
    right: false,
  });

  const documentWidth = ref<number>(
    isClient ? window.innerWidth : Number.POSITIVE_INFINITY,
  );

  const langs = ref<Langs>(Core.langs as Langs);
  const currentLocale = ref<string>(props.locale.split(',')[0]);

  const interval = ref<ReturnType<typeof setInterval> | null>(null);
  const submitedValue = ref<PersianDate[]>([]);

  // -------------------- derived defaults --------------------
  const effectiveFrom = computed<string>(() => {
    if (typeof props.from === 'string') return props.from;
    return props.type === 'time' ? '' : '1300';
  });

  const effectiveTo = computed<string>(() => {
    if (typeof props.to === 'string') return props.to;
    return props.type === 'time' ? '23:59' : '1499';
  });

  // -------------------- computed --------------------
  const lang = computed<Langs[string]>(() => langs.value[currentLocale.value]);

  const attrs = computed<Attrs>(() => {
    const a: Attrs = {
      div: { class: 'pdp-group' },
      label: { class: 'pdp-label' },
      alt: {},
      picker: { class: 'pdp-picker' },
      firstInput: { class: 'pdp-input' },
      secondInput: { class: 'pdp-input' },
    };

    for (const key in rawAttrs) {
      try {
        const match = key.match(
          /(div|label|alt|picker|firstInput|secondInput)-(.*)/,
        ) as RegExpMatchArray | null;

        if (!match) throw new Error('no match');

        const group = match[1] as keyof Attrs;
        const attr = match[2] as string;

        // Vue attrs are unknown here; we forward them as-is.
        (a[group] as Record<string, unknown>)[attr] = rawAttrs[key];
      } catch {
        (a.firstInput as Record<string, unknown>)[key] = rawAttrs[key];
      }
    }

    a.picker.class = [
      a.picker.class,
      {
        'pdp-top': !!pickerPlace.top,
        'pdp-left': !!pickerPlace.left,
        'pdp-right': !!pickerPlace.right,
      },
      lang.value.dir.picker,
    ];

    if (props.mode === 'single' && props.dualInput) {
      (a.secondInput as Record<string, unknown>).disabled = 'disabled';
    }

    if (showDatePicker.value) {
      a[inputName.value].class = `${a[inputName.value].class} pdp-focus`;
    }

    return a;
  });

  const years = computed<number[]>(() => {
    if (!fromDate.value || !toDate.value) return [];
    let start: number = fromDate.value.year();
    const end: number = toDate.value.year();
    return Array(end - start + 1)
      .fill(null)
      .map(() => start++);
  });

  const columnCount = computed<number>(() => {
    let col = 2;

    if (Core.isNumber(props.column)) {
      col = props.column as number;
    } else {
      const bp = Object.keys(props.column)
        .sort((a, b) => +a - +b)
        .find((k) => documentWidth.value <= +k);

      if (bp) col = (props.column as Record<number, number>)[+bp] as number;
    }

    return col;
  });

  // side-effect: time scale css var
  watchEffect(() => {
    if (!root.value) return;
    if (!props.type.includes('time')) return;

    const scale = columnCount.value / (props.mode === 'single' ? 1 : 2);
    root.value.style.setProperty('--time-scale', String(scale > 1 ? scale : 1));
  });

  const monthDays = computed<MonthDays[][][]>(() => {
    if (!onDisplay.value) return [];

    const monthsArr: MonthDays[][][] = [];

    for (let i = 0; i < columnCount.value; i++) {
      const selectedYear = onDisplay.value.clone().addMonth(i).year();
      const selectedMonth = onDisplay.value.clone().addMonth(i).month();

      let emptyCells = +onDisplay.value
        .clone()
        .parse(selectedYear, selectedMonth, 1)
        .toString('?d');

      let daysOfMonthNumber = onDisplay.value.getDaysInMonth(
        selectedYear,
        selectedMonth,
      );
      const numberOfWeek = Math.ceil((daysOfMonthNumber + emptyCells) / 7);

      const month: MonthDays[][] = [];
      let showDay = 1;

      for (let week = 0; week < numberOfWeek; week++) {
        month[week] = [];

        for (let day = 0; day < 7; day++) {
          if (emptyCells) {
            month[week][day] = { empty: true };
            emptyCells--;
            continue;
          }

          if (daysOfMonthNumber) {
            const raw = onDisplay.value.clone().addMonth(i).date(showDay);
            const inRange =
              selectedDates.value.length === 2 &&
              core.value
                .clone()
                .parse(selectedYear, selectedMonth, showDay)
                .isBetween(
                  ...(selectedDates.value.map((d) => d.toString()) as [
                    string,
                    string,
                  ]),
                );

            month[week][day] = {
              friday: day === 6,
              raw,
              startRange:
                !!selectedDates.value[0] &&
                selectedDates.value[0].isSame(
                  selectedYear,
                  selectedMonth,
                  showDay,
                ),
              endRange:
                !!selectedDates.value[1] &&
                selectedDates.value[1].isSame(
                  selectedYear,
                  selectedMonth,
                  showDay,
                ),
              inRange,
              disabled: !checkDate(raw, 'date') || isInDisable(raw),
              today: core.value
                .clone()
                .isSame(selectedYear, selectedMonth, showDay),
              val: showDay++,
            };

            daysOfMonthNumber--;
          } else {
            month[week][day] = { empty: true };
          }
        }
      }

      monthsArr.push(month);
    }

    return monthsArr;
  });

  const months = computed<Months>(() => {
    if (!onDisplay.value) return {} as Months;

    const m: Months = {} as Months;
    for (let i = 1; i <= 12; i++) {
      m[i] = {
        label: lang.value.months[i - 1],
        selected: onDisplay.value.month() === i,
        disabled: !checkDate(onDisplay.value.clone().month(i), 'month'),
      };
    }
    return m;
  });

  const nextLocale = computed<string>(() => {
    const locales = props.locale.split(',');
    const index = locales.indexOf(currentLocale.value);
    const locale = locales[index + 1] || locales[0];
    return langs.value[locale].translations.label;
  });

  const formats = computed<Formats>(() => {
    const displayFormatMap: Obj<string, TypePart | 'datetime'> = {
      date: '?D ?MMMM',
      datetime: '?D ?MMMM HH:mm',
      time: 'HH:mm',
    };
    const modelFormatMap: Obj<string, TypePart | 'datetime'> = {
      date: 'YYYY-MM-DD',
      datetime: 'YYYY-MM-DD HH:mm',
      time: 'HH:mm',
    };

    return {
      model: props.format || modelFormatMap[props.type],
      input: props.inputFormat || lang.value.inputFormat || props.type,
      display:
        props.displayFormat ||
        lang.value.displayFormat ||
        displayFormatMap[props.type],
      alt:
        (attrs.value.alt.format as string) ||
        props.format ||
        modelFormatMap[props.type],
    };
  });

  const defaultDate = computed<DefaultDate>(() => {
    const prefix =
      props.type === 'time' ? `${core.value.toString('jYYYY/jMM/jDD')} ` : '';

    return {
      from: prefix + effectiveFrom.value,
      to: prefix + effectiveTo.value,
    };
  });

  const inputs = computed<Inputs[]>(() =>
    !props.dualInput ? ['firstInput'] : ['firstInput', 'secondInput'],
  );

  const tabIndex = computed<number | undefined>(() => {
    const t = Number(
      (attrs.value.secondInput.tabindex || attrs.value.firstInput.tabindex) ??
        NaN,
    );
    return Number.isFinite(t) ? t + 1 : undefined;
  });

  const shortcuts = computed<Shortcuts | false>(() => {
    if (!props.shortcut) return false;
    if (!fromDate.value || !toDate.value) return false;

    const out: Shortcuts = {};
    const part: 'date' | 'time' = props.type.includes('date') ? 'date' : 'time';

    let d: PersianDate = core.value.clone().now();
    if (part === 'time' && !validate(d, part)) {
      d = toDate.value.clone().subDay().now();
    }

    const checkDates = (dates: PersianDate[]): boolean => {
      return props.mode === 'single'
        ? validate(dates[0], part)
        : dates.some((x) => validate(x, part)) &&
            !isDisableBetween(dates[0], dates[1]);
    };

    const setShortcut = (obj: Shortcuts, fromProps = false): void => {
      for (const phrase in obj) {
        const dates = fromProps
          ? obj[phrase].map((date: PersianDate) =>
              part === 'date'
                ? d.clone().fromJalali(date)
                : d.clone().time(date),
            )
          : obj[phrase];

        if (checkDates(dates)) {
          out[phrase] =
            props.type === 'date' ? dates.map((x) => x.startOf('date')) : dates;
        }
      }
    };

    if (props.shortcut === true) {
      const s = Core.getShortcuts(
        d,
        `${part}-${props.mode}`,
        lang.value.translations,
      );
      if (s) setShortcut(s);
    } else {
      setShortcut(props.shortcut, true);
    }

    return out;
  });

  // -------------------- watchers --------------------
  watch(
    () => props.show,
    (val: boolean) => {
      showDatePicker.value = val;
    },
  );

  watch(
    () => showDatePicker.value,
    (val: boolean) => {
      if (val) {
        emit('open');
      } else {
        if (!props.modal) document.removeEventListener('scroll', locate);
        emit('close');
      }
    },
  );

  watch(
    () => effectiveFrom.value,
    (val: string) => {
      if (fromDate.value) fromDate.value.fromJalali(val);
    },
  );

  watch(
    () => effectiveTo.value,
    (val: string) => {
      if (toDate.value) toDate.value.fromJalali(val);
    },
  );

  watch(
    () => props.mode,
    (val: Mode) => {
      if (val === 'single' && selectedDates.value.length === 2)
        selectedDates.value.pop();
    },
  );

  watch(
    () => props.locale,
    (val: string, oldVal: string) => {
      const index = oldVal.split(',').indexOf(currentLocale.value);
      currentLocale.value = val.split(',')[index] || val.split(',')[0];
    },
  );

  watch(
    () => props.localeConfig,
    (val: RecursivePartial<Langs> | undefined) => {
      if (!val) return;
      langs.value = Core.mergeObject(langs.value, val) as Langs;
    },
    { deep: true },
  );

  watch(
    () => props.styles,
    (val: Styles | undefined) => {
      if (!val || !root.value) return;
      Core.setStyles(val, root.value);
    },
    { deep: true },
  );

  watch(
    () => props.color,
    (val: Color | undefined) => {
      if (!root.value) return;
      Core.setColor(val, root.value);
    },
  );

  // -------------------- lifecycle --------------------
  onBeforeMount(() => {
    langs.value = Core.mergeObject(langs.value, props.localeConfig) as Langs;
  });

  const onResize = (): void => {
    documentWidth.value = window.innerWidth;
  };

  onMounted(() => {
    if (root.value) {
      Core.setColor(props.color, root.value);
      Core.setStyles(props.styles, root.value);
    }

    const calendar = lang.value.calendar;

    fromDate.value = core.value
      .clone()
      .parse(defaultDate.value.from)
      .calendar(calendar);

    toDate.value = core.value
      .clone()
      .parse(defaultDate.value.to)
      .endOf(Core.getLastUnit(effectiveTo.value, props.type))
      .calendar(calendar);

    core.value.calendar(calendar);

    // initial modelValue
    const val = props.modelValue;
    if (val) {
      setDate(val);
    } else {
      const today = core.value.clone();
      if (props.type === 'date') today.startOf('date');

      if (checkDate(today, 'date')) {
        onDisplay.value = today;
      } else {
        onDisplay.value = nearestDate(today).startOf('date');
      }
    }

    if (isClient) {
      window.addEventListener('resize', onResize);
    }

    if (props.type !== 'date' && onDisplay.value) {
      onDisplay.value.time(core.value as PersianDate);
    }

    showDatePicker.value = props.show;
  });

  onUnmounted(() => {
    if (isClient) window.removeEventListener('resize', onResize);
    document.removeEventListener('scroll', locate);
    stopChangeTime();
  });

  // -------------------- functions (methods) --------------------
  function showPart(part: CalendarPart): void {
    if (part === 'year') {
      showMonthSelect.value = false;
      showYearSelect.value = !showYearSelect.value;

      if (showYearSelect.value) {
        void nextTick(() => {
          const container = pdpSelectYear.value;
          if (!container) return;

          const selected = container.querySelector(
            'li.selected',
          ) as HTMLLIElement | null;
          if (!selected) return;

          container.scroll({
            top: selected.offsetTop,
            behavior: 'smooth',
          });
        });
      }
    } else if (part === 'month') {
      showYearSelect.value = false;
      showMonthSelect.value = !showMonthSelect.value;
    }
  }

  function changeSelectedMonth(month: 'add' | 'sub' | number): void {
    if (!onDisplay.value) return;

    const clone = onDisplay.value.clone();

    if (month === 'add') onDisplay.value.addMonth();
    else if (month === 'sub') onDisplay.value.subMonth();
    else onDisplay.value.month(month);

    if (checkDate(onDisplay.value, 'month')) showMonthSelect.value = false;
    else onDisplay.value = clone;
  }

  function changeSelectedYear(year: number): void {
    if (!onDisplay.value) return;

    onDisplay.value.year(year);
    if (!checkDate(onDisplay.value, 'date'))
      onDisplay.value = nearestDate(onDisplay.value);
    showYearSelect.value = false;
  }

  function validate(date: PersianDate, part: TypePart): boolean {
    if (!checkDate(date, part) || isInDisable(date)) return false;
    return true;
  }

  function isDisableBetween(first: PersianDate, second: PersianDate): boolean {
    if (!props.disable) return false;
    if (!fromDate.value || !toDate.value) return false;

    if (props.type !== 'datetime' && Core.isString(props.disable)) {
      const d =
        props.type === 'time'
          ? second.clone().time(props.disable as string)
          : (props.disable as string);
      return core.value
        .clone()
        .parse(d as PersianDate | string)
        .isBetween(first.toString(), second.toString());
    }

    if (
      props.type !== 'datetime' &&
      Array.isArray(props.disable) &&
      props.disable.some((x) => Core.isString(x))
    ) {
      return props.disable.some((x) => {
        let v = x;
        if (props.type === 'time') {
          v = second
            .clone()
            .time(v as string)
            .toString();
        }
        return core.value
          .clone()
          .parse(v as string)
          .isBetween(first, second);
      });
    }

    if (props.type !== 'time') {
      const inRangeDate = second.clone().startOf('date').subDay();
      while (!inRangeDate.isSameOrBefore(first)) {
        if (isInDisable(inRangeDate)) return true;
        inRangeDate.subDay();
      }
    }

    return false;
  }

  function selectDate(date: PersianDate, part: TypePart): number {
    let isValid = validate(date, part);
    if (!isValid) return -1;

    if (props.mode === 'range' && selectedDates.value.length === 1) {
      isValid = !isDisableBetween(selectedDates.value[0] as PersianDate, date);
      if (!isValid) return -2;
    }

    if (props.type === 'date') date.startOf('date');

    if (props.mode === 'single') {
      selectedDates.value = [date];
    } else {
      // range
      pdpMain.value?.addEventListener('mouseover', (e) =>
        selectInRangeDate({ target: e.target }),
      );

      if (selectedDates.value.length === 0) {
        selectedDates.value[0] = date;
        inputName.value = 'secondInput';
      } else if (inputName.value === 'secondInput') {
        inputName.value = 'firstInput';

        if (!date.isBefore(selectedDates.value[0] as PersianDate)) {
          selectedDates.value[1] = date;
        } else {
          if (selectedDates.value.length === 1)
            selectedDates.value.unshift(date);
          else {
            selectedDates.value = [date];
            inputName.value = 'secondInput';
          }
        }
      } else {
        selectedDates.value = [date];
        inputName.value = 'secondInput';
      }

      if (selectedDates.value.length === 2) {
        pdpMain.value?.removeEventListener('mouseover', (e) =>
          selectInRangeDate({ target: e.target }),
        );
      }
    }

    if (props.type === 'datetime') {
      selectedDates.value = selectedDates.value.map((d, i) => {
        if (selectedTimes.value[i])
          d.time(selectedTimes.value[i] as PersianDate);
        selectedTimes.value[i] = d;
        return d;
      });
    }

    emit('select', date);

    if (
      props.autoSubmit &&
      (props.mode !== 'range' ||
        (props.mode === 'range' && selectedDates.value.length === 2))
    ) {
      submitDate();
      return 1;
    }

    return 0;
  }

  function setModel(
    date?:
      | PersianDate
      | PersianDate[]
      | string
      | string[]
      | null
      | (string | null)[],
  ): void {
    if (date === undefined) {
      const d = selectedDates.value.map((el) =>
        el.toString(formats.value.model),
      );
      date = props.mode === 'single' ? d[0] : d;
    }
    emit('update:modelValue', date);
  }

  function goToToday(): void {
    showMonthSelect.value = false;
    showYearSelect.value = false;

    onDisplay.value = core.value.now().clone();

    if (
      props.type.includes('time') &&
      selectedDates.value.length &&
      onDisplay.value
    ) {
      const lastIndex = selectedDates.value.length - 1;
      const time = selectedDates.value[lastIndex];
      time.time(onDisplay.value as PersianDate);

      if (selectedTimes.value[lastIndex])
        selectedTimes.value[lastIndex] = time.clone();

      if (props.autoSubmit && checkDate(time, 'time') && !isInDisable(time)) {
        submitDate(false);
      }
    }

    if (props.type.includes('date')) {
      void nextTick(() => {
        const el = document.querySelector(
          '.pdp-day.today',
        ) as HTMLElement | null;
        if (!el) return;
        el.classList.add('tada');
        setTimeout(() => el.classList.remove('tada'), 1000);
      });
    }
  }

  function checkDate(date: unknown, part: CalendarPart | TypePart): boolean {
    if (!fromDate.value || !toDate.value) return false;

    let d: PersianDate;
    if (!Core.isPersianDate(date)) {
      d = core.value.clone().parse(date as PersianDate);
    } else {
      d = date as PersianDate;
    }

    let from: string;
    let to: string;

    switch (part) {
      case 'year':
        from = fromDate.value.toString('?YYYY');
        to = toDate.value.toString('?YYYY');
        break;
      case 'month':
        from = fromDate.value.toString('?YYYY/?MM');
        to = toDate.value.toString('?YYYY/?MM');
        break;
      case 'date':
        from = fromDate.value.toString();
        to = toDate.value.toString();
        break;
      case 'time':
        from = fromDate.value.toString(
          props.type.includes('time') ? 'datetime' : 'date',
        );
        to = toDate.value.toString(
          props.type.includes('time') ? 'datetime' : 'date',
        );
        break;
    }

    return d.isBetween(from, to, '[]');
  }

  function isInDisable(date: PersianDate, disable?: Disable): boolean {
    if (!props.disable) return false;

    const dis: Disable = disable ?? props.disable;

    const d = Core.isPersianDate(date)
      ? date.clone()
      : core.value.clone().parse(date);

    if (Core.isString(dis)) {
      const s = props.type === 'time' ? `${d.toString()} ${dis}` : dis;
      return d.calendar('jalali').isSame(s as string);
    }

    if (dis instanceof RegExp) {
      const f: Record<PickerType, string> = {
        date: 'jYYYY/jM/jD',
        datetime: 'jYYYY/jM/jD H:m',
        time: 'H:m',
      };
      return dis.test(d.toString(f[props.type]));
    }

    if (Core.isFunction(dis)) {
      return (dis as (x: PersianDate) => boolean)(d);
    }

    if (Array.isArray(dis)) {
      return dis.some((val) => {
        if (Core.isString(val)) {
          const s = props.type === 'time' ? `${d.toString()} ${val}` : val;
          return d.calendar('jalali').isSame(s as string);
        }
        if (val instanceof RegExp) {
          const f: Record<PickerType, string> = {
            date: 'jYYYY/jM/jD',
            datetime: 'jYYYY/jM/jD H:m',
            time: 'H:m',
          };
          return val.test(d.toString(f[props.type]));
        }
        return false;
      });
    }

    return false;
  }

  function showPicker(el: 'icon' | 'input', index: 0 | 1): void {
    if (props.clickOn !== 'all' && props.clickOn !== el) return;

    const name = inputs.value[index];
    if (props.dualInput) inputName.value = name;

    const inputEl = inputsRef.value[index];
    inputEl?.focus();

    showDatePicker.value = true;

    if (!props.modal) {
      void nextTick(() => locate());
      document.addEventListener('scroll', locate);
    }
  }

  async function selectWithArrow(e: KeyboardEvent): Promise<void> {
    if (!onDisplay.value) return;

    if (['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'].includes(e.key)) {
      const arrow: Record<
        'ArrowLeft' | 'ArrowUp' | 'ArrowRight' | 'ArrowDown',
        number
      > = {
        ArrowLeft: 1,
        ArrowUp: -7,
        ArrowRight: -1,
        ArrowDown: 7,
      };

      let numberOfDay = arrow[e.key as keyof typeof arrow];

      if (
        lang.value.dir.picker === 'ltr' &&
        (e.key === 'ArrowLeft' || e.key === 'ArrowRight')
      ) {
        numberOfDay = -numberOfDay;
      }

      let focusedList = document.querySelectorAll<HTMLElement>(
        '.pdp .pdp-day.hover',
      );
      if (!focusedList.length) {
        focusedList = document.querySelectorAll<HTMLElement>(
          '.pdp .pdp-day.start-range,.pdp .pdp-day.end-range',
        );
      }

      let focusedDay: HTMLElement | null = focusedList.length
        ? focusedList[focusedList.length - 1]
        : null;

      if (focusedDay) {
        let column = Number(getColumn(focusedDay));
        focusedDay.classList.remove('hover');

        const firstColumnMonth = onDisplay.value.toString();
        const focusedMonth = onDisplay.value.clone().addMonth(column);

        let nextValue: PersianDate | number = focusedMonth
          .date(focusedDay.innerText)
          .addDay(numberOfDay);

        if (!checkDate(nextValue, 'date')) {
          focusedDay.classList.add('hover');
          return;
        }

        nextValue = (nextValue as PersianDate).date();
        column = focusedMonth.diff(firstColumnMonth, 'month');

        if (column < 0) {
          onDisplay.value.subMonth(columnCount.value);
          column = columnCount.value - 1;
        } else if (column >= columnCount.value) {
          onDisplay.value.addMonth(columnCount.value);
          column = 0;
        }

        await nextTick();

        focusedDay = document.querySelector<HTMLElement>(
          `.pdp .pdp-main .pdp-column[data-column='${column}'] .pdp-day[value='${nextValue}']`,
        );

        focusedDay?.classList.add('hover');
      } else {
        focusedDay = document.querySelector<HTMLElement>(
          '.pdp .pdp-day:not(.empty):not(.disabled)',
        );
        if (focusedDay) focusedDay.classList.add('hover');
        else {
          const fallback = document.querySelector<HTMLElement>(
            `.pdp .pdp-main .pdp-column[data-column="0"] .pdp-day[value="${fromDate.value?.date()}"]`,
          );
          fallback?.classList.add('hover');
        }
      }

      if (props.mode === 'range' && selectedDates.value.length === 1) {
        const target = document.querySelector<HTMLElement>(
          '.pdp .pdp-day.hover',
        );
        if (target) selectInRangeDate({ target });
      }

      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();

      const focusedDay = document.querySelector<HTMLElement>(
        '.pdp .pdp-day.hover',
      );
      if (focusedDay) {
        selectDate(
          onDisplay.value
            .clone()
            .addMonth(Number(getColumn(focusedDay) || 0))
            .date(focusedDay.innerText),
          'date',
        );
        return;
      }

      // fallback: parse typed input(s)
      let localOnDisplay: PersianDate | undefined;

      displayValue.value.forEach((value, index) => {
        if (!value) return;

        if (props.type === 'time') {
          const time = value.split(/[/ -.,:\\]/);
          localOnDisplay = checkDate(core.value.clone(), 'time')
            ? core.value.clone()
            : fromDate.value?.clone();
          if (!localOnDisplay) return;
          localOnDisplay.time(time as [string]);
        } else {
          localOnDisplay = core.value.clone().parse(value);
        }

        if (localOnDisplay && selectDate(localOnDisplay, 'time') === 0) {
          const diff = localOnDisplay.diff(
            onDisplay.value as PersianDate,
            'month',
          );
          if (diff < 0 || diff >= columnCount.value)
            onDisplay.value = localOnDisplay.clone();
          displayValue.value[index] = '';
        }
      });
    }
  }

  function selectInRangeDate(e: { target: HTMLElement }): void {
    if (!onDisplay.value || selectedDates.value.length === 0) return;

    const target = e.target;
    if (!target.classList.contains('pdp-day')) return;

    document.querySelectorAll<HTMLElement>('.pdp .pdp-day').forEach((el) => {
      el.classList.remove('in-range');
    });

    let column = Number(getColumn(target));
    const hoveredDate = onDisplay.value
      .clone()
      .startOf('date')
      .addMonth(column)
      .date(target.innerText);

    const selectedDate = selectedDates.value[0].clone().startOf('date');
    const number = hoveredDate.isAfter(selectedDate) ? 1 : -1;

    const selectedDateDOM = document.querySelector<HTMLElement>(
      '.pdp-day.start-range,.pdp-day.end-range',
    );

    if (selectedDateDOM) {
      column = Number(getColumn(selectedDateDOM));
      const pair = hoveredDate.isBefore(selectedDate)
        ? (['start-range', 'end-range'] as const)
        : (['end-range', 'start-range'] as const);
      selectedDateDOM.classList.replace(pair[0], pair[1]);
    } else {
      selectedDate.parse(onDisplay.value);

      if (number === 1) {
        selectedDate.startOf('month').subDay();
        column = -1;
      } else {
        selectedDate
          .addMonth(columnCount.value - 1)
          .endOf('month')
          .addDay()
          .startOf('date');
        column = columnCount.value;
      }
    }

    while (!hoveredDate.isSame(selectedDate)) {
      const oldMonth = selectedDate.month();
      selectedDate.addDay(number);
      if (oldMonth !== selectedDate.month()) column += number;

      if (checkDate(selectedDate, 'date') && !isInDisable(selectedDate)) {
        const el = document.querySelector<HTMLElement>(
          `.pdp-column[data-column='${column}'] .pdp-day[value='${selectedDate.date()}']`,
        );
        el?.classList.add('in-range');
      } else {
        break;
      }
    }
  }

  function submitDate(close = true): void {
    const displayDate = selectedDates.value.map((el) =>
      el.toString(formats.value.input),
    );

    if (props.dualInput) displayValue.value = displayDate;
    else displayValue.value[0] = displayDate.join(' - ');

    submitedValue.value = selectedDates.value.slice();

    setModel();
    emit(
      'submit',
      props.mode === 'range' ? selectedDates.value : selectedDates.value[0],
    );

    if (close) showDatePicker.value = false;
  }

  function getColumn(el: HTMLElement): number | string {
    const col = (el.parentNode?.parentNode?.parentNode as HTMLElement | null)
      ?.dataset.column;
    return col ?? 0;
  }

  function nearestDate(date: PersianDate): PersianDate {
    if (!fromDate.value || !toDate.value) return date;
    return Math.abs(date.diff(fromDate.value)) <=
      Math.abs(date.diff(toDate.value))
      ? fromDate.value.clone()
      : toDate.value.clone();
  }

  function locate(): void {
    pickerPlace.top = false;
    pickerPlace.left = false;
    pickerPlace.right = false;

    void nextTick(() => {
      const input = inputsRef.value[0];
      const picker = pdpPicker.value;

      if (!input || !picker) return;

      const inputOffset =
        input.offsetHeight + input.getBoundingClientRect().top;
      const pickerHeight = picker.offsetHeight + 10;
      const pickerRect = picker.getBoundingClientRect();

      pickerPlace.top =
        inputOffset >= pickerHeight &&
        window.innerHeight - (inputOffset + pickerHeight) < 0;

      pickerPlace.left = pickerRect.left <= 0;
      pickerPlace.right =
        window.innerWidth - (pickerRect.left + pickerRect.width) <= 0;
    });
  }

  function changeLocale(): void {
    if (!fromDate.value || !toDate.value || !onDisplay.value) return;

    const locales = props.locale.split(',');
    const index = locales.indexOf(currentLocale.value);

    currentLocale.value = locales[index + 1] || locales[0];

    const calendar = lang.value.calendar;

    core.value.calendar(calendar);
    fromDate.value.calendar(calendar);
    toDate.value.calendar(calendar);
    onDisplay.value.calendar(calendar);

    for (const d of selectedDates.value) d.calendar(calendar);

    submitDate(false);
  }

  function clear(input: Inputs): void {
    const inputIndex: number = input === 'firstInput' ? 0 : 1;
    displayValue.value[inputIndex] = '';
    emit('clear');

    // keep original behavior
    if (props.dualInput) {
      const v = props.modelValue;
      if (Array.isArray(v)) {
        const next = v.map((val, i) => (i === inputIndex ? null : val));
        setModel(next);
        return;
      }
    }

    setModel('');
  }

  function startChangeTime(
    timeIndex: number,
    unit: 'minute' | 'hour',
    operator: 'add' | 'sub',
  ): void {
    if (!fromDate.value || !toDate.value) return;

    let time = selectedTimes.value[timeIndex];

    if (!time) {
      time = core.value.clone();

      if (!checkDate(time, 'time')) {
        time = toDate.value
          .clone()
          .subDay()
          .time(core.value as PersianDate);
      }

      if (timeIndex === 1 && !selectedTimes.value.length)
        selectedTimes.value.push(time.clone());
      selectedTimes.value.push(time);
    }

    stopChangeTime();

    const maxAmount = unit === 'hour' ? 23 : 59;
    let currentAmount = time[unit]();

    const changeTime = (): void => {
      if (operator === 'add') {
        currentAmount++;
        if (currentAmount > maxAmount) currentAmount = 0;
      } else {
        currentAmount--;
        if (currentAmount < 0) currentAmount = maxAmount;
      }

      if (!checkDate(time[unit](currentAmount), 'time')) {
        time.parse(
          time.isSameOrAfter(toDate.value!.clone())
            ? toDate.value!.clone()
            : fromDate.value!.clone(),
        );
      } else if (
        selectedTimes.value.length === 2 &&
        selectedTimes.value[0].isAfter(selectedTimes.value[1] as PersianDate)
      ) {
        time.parse(
          (timeIndex === 0
            ? selectedTimes.value[1]
            : selectedTimes.value[0]) as PersianDate,
        );
      }

      if (!isInDisable(time)) {
        if (props.type === 'time') {
          selectedDates.value[timeIndex] = time;
        } else if (selectedDates.value[timeIndex]) {
          selectedDates.value[timeIndex].time(time);
        }

        emit('select', time);

        if (
          props.autoSubmit &&
          !selectedTimes.value.some((s) => isInDisable(s as PersianDate))
        ) {
          submitDate(false);
        }
      }
    };

    changeTime();
    interval.value = setInterval(changeTime, 100);
  }

  function stopChangeTime(): void {
    if (interval.value) {
      clearInterval(interval.value);
      interval.value = null;
    }
  }

  function selectShorcut(dates: PersianDate[]): void {
    selectedDates.value = dates.map((d, i) => {
      if (i === 0) onDisplay.value = d.clone();
      emit('select', d);
      return d.clone();
    });

    if (props.autoSubmit) submitDate();
  }

  function setDate(dates: string | string[] | null): void {
    if (!dates) return;

    let arr: string[] = [];
    if (props.mode === 'single' && typeof dates === 'string') arr = [dates];
    else if (Array.isArray(dates)) arr = dates;
    else arr = [dates];

    selectedDates.value = [];
    selectedTimes.value = [];

    for (let i = 0; i < arr.length; i++) {
      const d = arr[i];
      const date = core.value
        .clone()
        .fromGregorian(
          (props.type === 'time'
            ? `${core.value.toString('YYYY-MM-DD')} `
            : '') + d,
        );

      if (Core.isPersianDate(date)) {
        selectedDates.value.push(date.clone());
        selectedTimes.value.push(date.clone());
        if (i === 0) onDisplay.value = date.clone();
      } else {
        selectedDates.value = [];
        selectedTimes.value = [];
        break;
      }
    }

    if (selectedDates.value.length) submitDate();
  }
</script>

<script lang="ts">
  export { PersianDate } from './utils/modules/core';
</script>

<template>
  <div
    ref="root"
    :class="[
      'pdp',
      { 'pdp-range': mode === 'range' },
      { 'pdp-modal': modal },
      { 'pdp-dual': dualInput },
      lang.dir.input,
    ]"
  >
    <slot name="before">
      <label v-if="label" :for="attrs.firstInput.id" v-bind="attrs.label">
        {{ label }}
      </label>
    </slot>

    <div v-bind="attrs.div">
      <template v-for="(input, index) in inputs" :key="input">
        <div
          v-if="!$slots.hasOwnProperty('icon') || $slots?.icon?.()?.length"
          :key="`icon-${input}`"
          :class="[
            'pdp-icon',
            { 'pdp-pointer': ['all', 'icon'].includes(clickOn) },
            { 'pdp-inside': iconInside },
          ]"
          @click="showPicker('icon', index as 0 | 1)"
        >
          <slot name="icon">
            <PDPIcon :icon="type" width="23" height="23"></PDPIcon>
          </slot>
        </div>

        <input
          ref="inputsRef"
          v-model="displayValue[index]"
          type="text"
          autocomplete="off"
          v-bind="attrs[input]"
          @focus="showPicker('input', index as 0 | 1)"
          @keydown="selectWithArrow"
        />

        <button
          v-if="clearable"
          :key="`clear-${input}`"
          class="pdp-clear"
          type="button"
          @click="clear(input)"
        >
          <slot name="clear"><PDPIcon icon="clear"></PDPIcon></slot>
        </button>
      </template>
    </div>

    <slot name="after"></slot>

    <PDPAlt
      v-if="attrs.alt.name"
      :name="attrs.alt.name"
      :format="formats.alt"
      :dates="submitedValue"
    />

    <div v-if="showDatePicker">
      <div class="pdp-overlay" @click="showDatePicker = false"></div>

      <div v-bind="attrs.picker" ref="pdpPicker">
        <div class="pdp-auto">
          <div v-if="type.includes('date')">
            <ul v-show="showMonthSelect" class="pdp-select-month">
              <li
                v-for="(month, index) in months"
                :key="index"
                :class="[
                  { selected: month.selected },
                  { disabled: month.disabled },
                ]"
                @click="changeSelectedMonth(index)"
              >
                {{ month.label }}
              </li>
            </ul>

            <ul
              v-show="showYearSelect"
              ref="pdpSelectYear"
              class="pdp-select-year"
            >
              <li
                v-for="(year, index) in years"
                :key="index"
                :class="{ selected: onDisplay?.year() == year }"
                @click="changeSelectedYear(year)"
              >
                {{ year }}
              </li>
            </ul>
          </div>

          <div v-if="type.includes('date')" class="pdp-header">
            <div v-if="locale.includes(',')" class="top">
              <div>{{ lang.translations.text }}</div>
              <button type="button" :tabindex="tabIndex" @click="changeLocale">
                {{ nextLocale }}
              </button>
            </div>

            <div class="bottom">
              <button
                tabindex="-1"
                type="button"
                :class="[
                  'pdp-arrow',
                  {
                    disabled: !checkDate(
                      onDisplay?.clone().subMonth(),
                      'month',
                    ),
                  },
                ]"
                :title="lang.translations.prevMonth"
                @click="changeSelectedMonth('sub')"
              >
                <slot name="right-arrow">
                  <PDPArrow
                    direction="right"
                    width="10"
                    height="10"
                    :inverse="lang.dir.picker == 'ltr'"
                  ></PDPArrow>
                </slot>
              </button>

              <div>
                <div v-for="(item, i) in columnCount" :key="i">
                  <button
                    class="pdp-month"
                    type="button"
                    tabindex="-1"
                    @click="showPart('month')"
                  >
                    {{ months[onDisplay?.clone().addMonth(i).month()]?.label }}
                  </button>

                  <button
                    class="pdp-year"
                    type="button"
                    tabindex="-1"
                    @click="showPart('year')"
                  >
                    {{ onDisplay?.clone().addMonth(i).year() }}
                  </button>
                </div>
              </div>

              <button
                tabindex="-1"
                type="button"
                :class="[
                  'pdp-arrow',
                  {
                    disabled: !checkDate(
                      onDisplay?.clone().addMonth(),
                      'month',
                    ),
                  },
                ]"
                :title="lang.translations.nextMonth"
                @click="changeSelectedMonth('add')"
              >
                <slot name="left-arrow">
                  <PDPArrow
                    direction="left"
                    width="10"
                    height="10"
                    :inverse="lang.dir.picker == 'ltr'"
                  ></PDPArrow>
                </slot>
              </button>
            </div>
          </div>

          <div ref="pdpMain" class="pdp-main">
            <div v-if="type.includes('date')" class="pdp-date">
              <div
                v-for="(item, i) in columnCount"
                :key="i"
                class="pdp-column"
                :data-column="i"
              >
                <div class="pdp-week">
                  <div
                    v-for="(weekday, index) in lang.weekdays"
                    :key="index"
                    class="pdp-weekday"
                  >
                    {{ weekday }}
                  </div>
                </div>

                <div class="pdp-days">
                  <div v-for="(week, wIndex) in monthDays[i]" :key="wIndex">
                    <div
                      v-for="day in week"
                      :key="day.raw ? day.raw.toString() : undefined"
                      :class="[
                        'pdp-day',
                        { empty: day.empty },
                        { friday: day.friday },
                        { today: day.today },
                        { 'start-range': day.startRange },
                        { 'end-range': day.endRange },
                        { disabled: day.disabled },
                        { 'in-range': day.inRange },
                      ]"
                      :value="day.val"
                      @click="day.raw && selectDate(day.raw, 'date')"
                    >
                      {{ day.val }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="type.includes('time')" class="pdp-time inline">
              <div v-if="type == 'time'" class="pdp-column">
                <div v-for="(c, i) in columnCount" :key="i"></div>
              </div>

              <div
                :class="[
                  'pdp-moment',
                  { 'column-direction': mode == 'range' && columnCount == 1 },
                ]"
              >
                <div
                  v-for="(n, i) in mode == 'range' ? 2 : 1"
                  :key="n"
                  :class="[
                    {
                      disabled:
                        selectedTimes[i] &&
                        (!checkDate(selectedTimes[i], 'time') ||
                          isInDisable(selectedTimes[i])),
                    },
                  ]"
                >
                  <div class="hour">
                    <button
                      type="button"
                      @touchstart.prevent="startChangeTime(i, 'hour', 'add')"
                      @mousedown.prevent="startChangeTime(i, 'hour', 'add')"
                      @keydown.enter.prevent="startChangeTime(i, 'hour', 'add')"
                      @touchend.prevent="stopChangeTime"
                      @mouseup.prevent="stopChangeTime"
                      @keyup.enter.prevent="stopChangeTime"
                    >
                      <slot name="up-arrow"><PDPArrow></PDPArrow></slot>
                    </button>

                    {{
                      selectedTimes[i]
                        ? selectedTimes[i].hour('HH')
                        : core.hour('HH')
                    }}

                    <button
                      type="button"
                      @touchstart.prevent="startChangeTime(i, 'hour', 'sub')"
                      @mousedown.prevent="startChangeTime(i, 'hour', 'sub')"
                      @keydown.enter.prevent="startChangeTime(i, 'hour', 'sub')"
                      @touchend.prevent="stopChangeTime"
                      @mouseup.prevent="stopChangeTime"
                      @keyup.enter.prevent="stopChangeTime"
                    >
                      <slot name="down-arrow">
                        <PDPArrow direction="down"></PDPArrow>
                      </slot>
                    </button>
                  </div>

                  :
                  <div class="minute">
                    <button
                      type="button"
                      @touchstart.prevent="startChangeTime(i, 'minute', 'add')"
                      @mousedown.prevent="startChangeTime(i, 'minute', 'add')"
                      @keydown.enter.prevent="
                        startChangeTime(i, 'minute', 'add')
                      "
                      @touchend.prevent="stopChangeTime"
                      @mouseup.prevent="stopChangeTime"
                      @keyup.enter.prevent="stopChangeTime"
                    >
                      <slot name="up-arrow"><PDPArrow></PDPArrow></slot>
                    </button>

                    {{
                      selectedTimes[i]
                        ? selectedTimes[i].minute('mm')
                        : core.minute('mm')
                    }}

                    <button
                      type="button"
                      @touchstart.prevent="startChangeTime(i, 'minute', 'sub')"
                      @mousedown.prevent="startChangeTime(i, 'minute', 'sub')"
                      @keydown.enter.prevent="
                        startChangeTime(i, 'minute', 'sub')
                      "
                      @touchend.prevent="stopChangeTime"
                      @mouseup.prevent="stopChangeTime"
                      @keyup.enter.prevent="stopChangeTime"
                    >
                      <slot name="down-arrow">
                        <PDPArrow direction="down"></PDPArrow>
                      </slot>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="pdp-footer">
            <div>
              <slot name="footer"></slot>
              <small v-if="selectedDates[0]">
                {{ selectedDates[0].toString(formats.display) }}
              </small>
              <small v-if="selectedDates.length == 2">
                - {{ selectedDates[1].toString(formats.display) }}
              </small>
            </div>

            <div>
              <button
                v-if="checkDate(core, 'date')"
                class="pdp-today"
                type="button"
                :tabindex="tabIndex"
                @click="goToToday"
              >
                {{ lang.translations.now }}
              </button>

              <button
                v-if="!autoSubmit && !selectedDates.some((d) => isInDisable(d))"
                class="pdp-submit"
                type="button"
                :tabindex="tabIndex"
                @click="submitDate()"
              >
                {{ lang.translations.submit }}
              </button>
            </div>
          </div>
        </div>

        <ul
          v-if="shortcuts && Object.keys(shortcuts).length > 0"
          class="pdp-shortcut"
        >
          <li
            v-for="(dates, name) in shortcuts"
            :key="name"
            :class="{
              selected: !dates.some(
                (date, i) =>
                  !date.isSame(
                    selectedDates[i] && selectedDates[i].toString('datetime'),
                  ),
              ),
            }"
            @click="selectShorcut(dates)"
          >
            {{ name }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  @use './assets/sass/app.scss';
</style>
