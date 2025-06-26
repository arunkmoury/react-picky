import * as React from 'react';

const debounce = (fn, delay) => {
  let timeoutID;
  return function(...args) {
    if (timeoutID) {
      clearTimeout(timeoutID);
    }
    //@ts-ignore
    const that = this;
    timeoutID = setTimeout(() => {
      fn.apply(that, args);
    }, delay);
  };
};

/**
 * Check if a string contains a value
 */
function includes(str, term, caseSensitive = false) {
  if (!caseSensitive) {
    return (
      String(str)
        .toLowerCase()
        .indexOf(String(term).toLowerCase()) > -1
    );
  } else {
    return String(str).indexOf(String(term)) > -1;
  }
}

const isDataObject = (obj, valueKey, labelKey) => {
  if (typeof labelKey === 'undefined' || typeof valueKey === 'undefined') {
    return false;
  }
  return (
    typeof obj === 'object' &&
    obj.hasOwnProperty(valueKey) &&
    obj.hasOwnProperty(labelKey)
  );
};
const hasItem = (all, item, valueKey, labelKey, returnIndex = false) => {
  if (!all || !item) return false;
  if (Array.isArray(all)) {
    if (isDataObject(item, valueKey, labelKey)) {
      const find = all.findIndex(opt => opt[valueKey] === item[valueKey]);
      if (returnIndex) {
        return find;
      }
      return find > -1;
    } else {
      const indexOfItem = all.indexOf(item);
      if (returnIndex) {
        return indexOfItem;
      }
      return indexOfItem > -1;
    }
  } else {
    if (isDataObject(item, valueKey, labelKey)) {
      return all[valueKey] === item[valueKey];
    }
    return all === item;
  }
};
const hasItemIndex = (all, item, valueKey, labelKey) =>
  hasItem(all, item, valueKey, labelKey, true);
const keyExtractor = (item, valueKey, labelKey) =>
  isDataObject(item, valueKey, labelKey) ? item[valueKey] : item;
function sortCollection(array, valueKey) {
  if (valueKey) {
    return array.sort((a, b) => (a[valueKey] < b[valueKey] ? -1 : 1));
  } else {
    return array.sort((a, b) => (a < b ? -1 : 1));
  }
}
function arraysEqual(left, right) {
  if (left.length !== right.length) return false;
  const leftLen = left.length;
  let i = leftLen;
  while (i) {
    if (left[i] !== right[i]) return false;
    i--;
  }
  return true;
}
const asArray = obj => obj || [];

function split(str) {
  let a = 1;
  let res = '';
  const parts = (str || '').split('%');
  const len = parts.length;
  if (len > 0) {
    res += parts[0];
  }
  for (let i = 1; i < len; i++) {
    if (parts[i][0] === 's' || parts[i][0] === 'd') {
      let value = arguments[a++];
      res += parts[i][0] === 'd' ? Math.floor(value) : value;
    } else if (parts[i][0]) {
      res += '%' + parts[i][0];
    } else {
      i++;
      res += '%' + parts[i][0];
    }
    res += parts[i].substring(1);
  }
  return res;
}
const regex = /%[sdj]/;
function format(message, ...args) {
  if (regex.test(message)) {
    return split.apply(null, arguments);
  }
  return Array.from(args).join(' ');
}

const isEmptyValue = value =>
  value === null ||
  value === undefined ||
  (Array.isArray(value) && !value.length);
const Placeholder = React.memo(
  ({
    placeholder,
    value,
    numberDisplayed,
    multiple,
    valueKey,
    labelKey,
    manySelectedPlaceholder,
    allSelectedPlaceholder,
    singleSelectPlaceholder,
    allSelected,
  }) => {
    let message = '';
    if (isEmptyValue(value)) {
      message = placeholder || '';
    } else {
      if (Array.isArray(value) && multiple) {
        // If type is array and values length less than number displayed
        // join the values
        if (value.length <= numberDisplayed) {
          message = value
            .map(opt => {
              if (isDataObject(opt, valueKey, labelKey)) {
                return opt[labelKey];
              }
              return opt;
            })
            .join(', ');
        } else {
          // if many selected and not all selected then use the placeholder
          if (manySelectedPlaceholder && allSelected !== 'all') {
            // if it doesn't include the sprintf token then just use the placeholder
            message = includes(manySelectedPlaceholder, '%s')
              ? format(manySelectedPlaceholder, value.length)
              : manySelectedPlaceholder;
            //If all selected and there is an allselectedplaceholder use that
          } else if (allSelected && allSelectedPlaceholder) {
            // if it doesn't include the sprintf token then just use the placeholder
            message = includes(allSelectedPlaceholder, '%s')
              ? format(allSelectedPlaceholder, value.length)
              : allSelectedPlaceholder;
          }
        }
      } else {
        let tempValue = Array.isArray(value) ? value[0] : value;
        if (typeof singleSelectPlaceholder === 'function') {
          message = singleSelectPlaceholder(tempValue);
        } else if (isDataObject(tempValue, valueKey, labelKey)) {
          message = tempValue[labelKey];
        } else {
          message = String(tempValue);
        }
      }
    }
    return React.createElement(
      'span',
      {
        className: isEmptyValue(value) ? 'picky__placeholder' : undefined,
        'data-testid': 'picky_placeholder',
      },
      message
    );
  },
  areEqual$1
);
Placeholder.defaultProps = {
  placeholder: 'None selected',
  allSelectedPlaceholder: '%s selected',
  manySelectedPlaceholder: '%s selected',
};
Placeholder.displayName = 'Picky(Placeholder)';
function areEqual$1(prevProps, nextProps) {
  return (
    prevProps.multiple === nextProps.multiple &&
    prevProps.value === nextProps.value &&
    prevProps.numberDisplayed === nextProps.numberDisplayed &&
    prevProps.allSelected === nextProps.allSelected &&
    prevProps.allSelectedPlaceholder === nextProps.allSelectedPlaceholder
  );
}

const Filter = React.forwardRef(
  ({ placeholder, tabIndex, onFilterChange }, ref) => {
    return React.createElement(
      'div',
      { className: 'picky__filter' },
      React.createElement('input', {
        ref: ref,
        type: 'text',
        className: 'picky__filter__input',
        'data-testid': 'picky__filter__input',
        placeholder: placeholder,
        tabIndex: tabIndex,
        'aria-label': 'filter options',
        onChange: e => onFilterChange(e.target.value),
      })
    );
  }
);
Filter.defaultProps = {
  placeholder: 'Filter...',
};
Filter.displayName = 'Picky(Filter)';

const Option = React.memo(
  ({
    id,
    item,
    isSelected,
    labelKey,
    valueKey,
    selectValue,
    style,
    multiple,
    tabIndex,
    disabled,
  }) => {
    const cssClass = isSelected ? 'option selected' : 'option';
    const body = isDataObject(item, labelKey, valueKey) ? item[labelKey] : item;
    const inputType = multiple ? 'checkbox' : 'radio';
    const select = () => !disabled && selectValue(item);
    return React.createElement(
      'div',
      {
        tabIndex: tabIndex,
        id: id,
        role: 'option',
        style: style,
        'data-testid': 'option',
        'data-selected': isSelected ? 'selected' : '',
        'aria-selected': isSelected,
        className: cssClass,
        onClick: select,
        onKeyPress: e => {
          e.preventDefault();
          if (!disabled) {
            selectValue(item);
          }
        },
      },
      React.createElement('input', {
        type: inputType,
        readOnly: true,
        tabIndex: -1,
        disabled: disabled,
        checked: isSelected,
        'aria-label': body,
        'data-testid': 'option-checkbox',
      }),
      body
    );
  },
  areEqual
);
Option.displayName = 'Picky(Option)';
function areEqual(prevProps, nextProps) {
  return (
    prevProps.multiple === nextProps.multiple &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.id === nextProps.id &&
    prevProps.item === nextProps.item &&
    prevProps.tabIndex === nextProps.tabIndex &&
    prevProps.disabled === nextProps.disabled
  );
}

class SelectAll extends React.PureComponent {
  static displayName = 'Picky(SelectAll)';
  checkboxRef = React.createRef();
  componentDidUpdate(prevProps) {
    if (prevProps.allSelected !== this.props.allSelected) {
      if (this.checkboxRef && this.checkboxRef.current) {
        this.checkboxRef.current.indeterminate =
          this.props.allSelected === 'partial';
      }
    }
  }
  render() {
    const {
      tabIndex,
      disabled,
      allSelected,
      id,
      selectAllText,
      toggleSelectAll,
      visible,
    } = this.props;
    if (!visible) return null;
    return React.createElement(
      'div',
      {
        tabIndex: tabIndex,
        role: 'option',
        'data-testid': 'selectall',
        id: `${id}-option-selectall`,
        'data-selectall': 'true',
        'aria-selected': allSelected === 'all',
        className: allSelected === 'all' ? 'option selected' : 'option',
        onClick: toggleSelectAll,
        onKeyPress: toggleSelectAll,
      },
      React.createElement('input', {
        type: 'checkbox',
        ref: this.checkboxRef,
        readOnly: true,
        'data-testid': 'selectall-checkbox',
        tabIndex: -1,
        checked: allSelected === 'all',
        'aria-label': 'select all',
        disabled: disabled,
      }),
      React.createElement(
        'span',
        { 'data-testid': 'select-all-text' },
        selectAllText
      )
    );
  }
}

const Button = ({ id, disabled, onClick, children, className, ...rest }) => {
  const buttonId = `${id}__button`;
  const classes = [
    'picky__input',
    disabled ? 'picky__input--disabled' : '',
    className,
  ].join(' ');
  return React.createElement(
    'button',
    {
      id: buttonId,
      type: 'button',
      className: classes,
      onClick: onClick,
      'data-testid': 'picky-input',
      disabled: disabled,
      ...rest,
    },
    children
  );
};
Button.displayName = 'Picky(Button)';

class Picky extends React.PureComponent {
  static defaultProps = {
    id: 'picky',
    numberDisplayed: 3,
    options: [],
    filterDebounce: 150,
    dropdownHeight: 300,
    onChange: () => {},
    tabIndex: 0,
    keepOpen: true,
    selectAllText: 'Select all',
    selectAllMode: 'default',
    filterTermProcessor: term => term,
  };
  node = null;
  filter = null;
  ignoreNextClick = false;
  constructor(props) {
    super(props);
    this.state = {
      selectedValue: props.value || (props.multiple ? [] : null),
      open: props.open,
      filtered: false,
      filteredOptions: [],
      allSelected: 'none',
    };
    this.toggleDropDown = this.toggleDropDown.bind(this);
    this.toggleSelectAll = this.toggleSelectAll.bind(this);
    this.onFilterChange = this.onFilterChange.bind(this);
    this.selectValue = this.selectValue.bind(this);
    this.allSelected = this.allSelected.bind(this);
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
    this.isItemSelected = this.isItemSelected.bind(this);
    this.focusFilterInput = this.focusFilterInput.bind(this);
    this.getValue = this.getValue.bind(this);
  }
  componentDidMount() {
    this.setState({ allSelected: this.allSelected() });
    this.focusFilterInput(!!this.state.open);
    if (!this.props.keepOpen) {
      setTimeout(() => {
        window.requestAnimationFrame(() => {
          document.addEventListener('click', this.handleOutsideClick, false);
        });
      }, 0);
    }
  }
  componentWillUnmount() {
    document.removeEventListener('click', this.handleOutsideClick, false);
  }
  componentDidUpdate(prevProps) {
    if (
      this.props.options !== prevProps.options ||
      this.props.value !== prevProps.value
    ) {
      if (!this.props.multiple) return;
      let valuesEqual = Array.isArray(prevProps.value)
        ? arraysEqual(prevProps.value, this.props.value)
        : prevProps.value === this.props.value;
      let optsEqual = arraysEqual(prevProps.options, this.props.options);
      const currentOptions = this.state.filtered
        ? this.state.filteredOptions
        : this.props.options;
      const currentValues = this.state.filtered
        ? this.state.filteredOptions.filter(value => {
            if (Array.isArray(this.props.value)) {
              return this.props.value.includes(value);
            }
            return true;
          })
        : this.props.value;
      this.setState({
        allSelected: !(valuesEqual && optsEqual)
          ? this.allSelected(currentValues, currentOptions)
          : this.allSelected(),
      });
    }
  }
  selectValue(val) {
    const valueLookup = this.props.value;
    if (this.props.multiple && Array.isArray(valueLookup)) {
      const itemIndex = hasItemIndex(
        valueLookup,
        val,
        this.props.valueKey,
        this.props.labelKey
      );
      let selectedValue = [];
      if (itemIndex > -1) {
        selectedValue = [
          ...valueLookup.slice(0, itemIndex),
          ...valueLookup.slice(itemIndex + 1),
        ];
      } else {
        selectedValue = [...this.props.value, val];
      }
      this.setState(
        {
          allSelected: this.allSelected(selectedValue),
        },
        () => {
          this.props.onChange(selectedValue);
        }
      );
    } else {
      this.props.onChange(val);
    }
  }
  /**
   * Get the value of a given option or value safely
   *
   * @param {*} option
   * @returns
   * @memberof Picky
   */
  getValue(option) {
    return typeof this.props.valueKey !== 'undefined'
      ? option[this.props.valueKey]
      : option;
  }
  /**
   * Determine whether all items are selected
   *
   * @returns {Boolean}
   * @memberof Picky
   */
  allSelected(overrideSelected, overrideOptions) {
    const { value, options } = this.props;
    const selectedValue = overrideSelected || value;
    const selectedOptions = overrideOptions || options;
    // If there are no options we are getting a false positive for all items being selected
    if (selectedOptions && selectedOptions.length === 0) {
      return 'none';
    }
    let copiedOptions = selectedOptions.map(this.getValue);
    let copiedValues = Array.isArray(selectedValue)
      ? selectedValue.map(this.getValue)
      : [];
    const areEqual = arraysEqual(
      sortCollection(copiedValues),
      sortCollection(copiedOptions)
    );
    if (areEqual) {
      return 'all';
    } else if (copiedValues.length > 0) {
      return 'partial';
    } else {
      return 'none';
    }
  }
  /**
   * Toggles select all
   *
   * @memberof Picky
   */
  toggleSelectAll() {
    if (this.props.disabled) return;
    this.setState(
      state => {
        return {
          ...state,
          allSelected: this.state.allSelected === 'all' ? 'none' : 'all',
        };
      },
      () => {
        if (this.state.allSelected !== 'all') {
          if (this.state.filtered) {
            const diff = asArray(this.props.value).filter(
              item => !this.state.filteredOptions.includes(item)
            );
            this.props.onChange(diff);
          } else {
            this.props.onChange([]);
          }
        } else {
          if (this.state.filtered) {
            let newValues = [
              ...this.props.value,
              ...this.state.filteredOptions,
            ];
            this.props.onChange(newValues);
          } else {
            this.props.onChange(this.props.options);
          }
        }
      }
    );
  }
  isItemSelected(item) {
    return hasItem(
      this.props.value,
      item,
      this.props.valueKey,
      this.props.labelKey
    );
  }
  renderOptions() {
    const items = this.state.filtered
      ? this.state.filteredOptions
      : this.props.options;
    const {
      labelKey,
      valueKey,
      multiple,
      render,
      tabIndex,
      renderList,
      disabled,
    } = this.props;
    if (renderList) {
      return renderList({
        items,
        selected: this.props.value,
        multiple,
        tabIndex,
        getIsSelected: this.isItemSelected,
        selectValue: this.selectValue,
        disabled,
      });
    }
    return items.map((item, index) => {
      // Create a key based on the options value
      const key = keyExtractor(item, valueKey, labelKey);
      const isSelected = this.isItemSelected(item);
      // If render prop supplied for items call that.
      if (typeof render === 'function') {
        return render({
          index,
          item,
          isSelected,
          selectValue: this.selectValue,
          labelKey: labelKey,
          valueKey: valueKey,
          multiple: multiple,
          disabled,
        });
      } else {
        // Render a simple option
        return React.createElement(Option, {
          key: key,
          item: item,
          isSelected: isSelected,
          selectValue: this.selectValue,
          labelKey: labelKey,
          valueKey: valueKey,
          multiple: Boolean(multiple),
          tabIndex: tabIndex,
          disabled: Boolean(disabled),
          id: this.props.id + '-option-' + index,
        });
      }
    });
  }
  /**
   * Called when Filter term changes. Sets filteredOptions and filtered state.
   *
   * @param {any} term
   * @returns
   * @memberof Picky
   */
  onFilterChange(term) {
    const processedTerm =
      typeof this.props.filterTermProcessor === 'function'
        ? this.props.filterTermProcessor(term)
        : term;
    /**
     * getFilterValue function will provide the input value of filter to the picky dropdown, so that if we have a larger list of options then we can only supply the matching options based on this value
     */
    if (this.props.getFilterValue) {
      this.props.getFilterValue(processedTerm);
    }
    if (!processedTerm.trim()) {
      return this.setState({
        filtered: false,
        filteredOptions: [],
        allSelected: asArray(this.props.value).length > 0 ? 'partial' : 'none',
      });
    }
    const isObject = isDataObject(
      this.props.options && this.props.options[0],
      this.props.valueKey,
      this.props.labelKey
    );
    const filteredOptions = this.props.options.filter(option => {
      if (isObject) {
        return includes(
          option[this.props.labelKey],
          processedTerm,
          !!this.props.caseSensitiveFilter
        );
      }
      return includes(option, processedTerm, this.props.caseSensitiveFilter);
    });
    this.setState(
      {
        filtered: true,
        filteredOptions,
      },
      () => {
        if (this.props.onFiltered) {
          this.props.onFiltered(filteredOptions);
        }
      }
    );
  }
  /**
   *
   * Called by a click event listener. Used to determine any clicks that occur outside of the component.
   * @param {MouseEvent} e
   * @returns
   * @memberof Picky
   */
  handleOutsideClick(e) {
    const keepOpen = this.props.keepOpen || this.props.multiple;
    requestAnimationFrame(() => {
      if (this.ignoreNextClick) {
        this.ignoreNextClick = false;
        return;
      }
      if (this.node && this.node.contains(e.target) && keepOpen) return;
      if (this.filter && this.filter.contains(e.target)) return;
      this.setState({ open: false }, () => {
        this.props.onClose?.();
      });
    });
  }
  focusFilterInput(isOpen) {
    if (!this.filter) return;
    if (isOpen && this.props.defaultFocusFilter) {
      this.filter.focus();
    }
    if (!isOpen && this.props.clearFilterOnClose === true) {
      this.filter.value = '';
    }
  }
  /**
   * Toggle state of dropdown
   *
   * @memberof Picky
   */
  toggleDropDown() {
    const isOpening = !this.state.open;
    if (isOpening && !this.props.keepOpen) {
      this.ignoreNextClick = true;
      setTimeout(() => {
        window.requestAnimationFrame(() => {
          document.addEventListener('click', this.handleOutsideClick, false);
        });
      }, 0);
    } else {
      document.removeEventListener('click', this.handleOutsideClick, false);
    }
    this.setState(
      state => ({
        ...state,
        open: !state.open,
        filtered: this.props.clearFilterOnClose ? false : state.filtered,
        filteredOptions: this.props.clearFilterOnClose
          ? []
          : state.filteredOptions,
      }),
      () => {
        const isOpen = !!this.state.open;
        this.focusFilterInput(isOpen);
        if (isOpen) {
          this.props.onOpen?.();
        } else {
          this.props.onClose?.();
        }
      }
    );
  }
  get filterDebounce() {
    const { filterDebounce } = this.props;
    const amount = filterDebounce || 0;
    return (amount || 0) > 0
      ? debounce(this.onFilterChange, amount)
      : this.onFilterChange;
  }
  get showSelectAll() {
    const { renderSelectAll, multiple, includeSelectAll } = this.props;
    return Boolean(
      !renderSelectAll &&
        includeSelectAll &&
        multiple &&
        ((this.props.selectAllMode === 'default' && !this.state.filtered) ||
          this.props.selectAllMode === 'filtered')
    );
  }
  render() {
    const {
      className,
      placeholder,
      value,
      multiple,
      numberDisplayed,
      includeFilter,
      valueKey,
      labelKey,
      tabIndex,
      dropdownHeight,
      renderSelectAll,
      filterPlaceholder,
      disabled,
      buttonProps,
    } = this.props;
    const { open } = this.state;
    let ariaOwns = '';
    if (open) {
      ariaOwns += this.props.id + '-list';
    }
    const buttonId = `${this.props.id}__button`;
    const dropdownStyle = {
      maxHeight: dropdownHeight,
      overflowY: 'scroll',
    };
    return React.createElement(
      'div',
      {
        ref: node => {
          this.node = node;
        },
        className: ['picky', className].join(' '),
        id: this.props.id,
        role: 'combobox',
        'aria-controls': buttonId,
        'aria-expanded': open,
        'aria-haspopup': open,
        'aria-owns': ariaOwns,
      },
      React.createElement(
        Button,
        {
          id: `${this.props.id}__button`,
          disabled: disabled,
          onClick: this.toggleDropDown,
          ...buttonProps,
        },
        React.createElement(Placeholder, {
          allSelected: this.state.allSelected,
          placeholder: placeholder,
          manySelectedPlaceholder: this.props.manySelectedPlaceholder,
          allSelectedPlaceholder: this.props.allSelectedPlaceholder,
          singleSelectPlaceholder: this.props.singleSelectPlaceholder,
          value: value,
          multiple: Boolean(multiple),
          numberDisplayed: numberDisplayed,
          valueKey: valueKey,
          labelKey: labelKey,
          'data-testid': 'placeholder-component',
        })
      ),
      React.createElement(
        'div',
        {
          className: 'picky__dropdown',
          id: this.props.id + '-list',
          'aria-hidden': !open,
          hidden: !open,
          style: open ? dropdownStyle : { visibility: 'hidden' },
        },
        includeFilter &&
          React.createElement(Filter, {
            tabIndex: tabIndex,
            ref: filter => (this.filter = filter),
            placeholder: filterPlaceholder,
            onFilterChange: this.filterDebounce,
          }),
        renderSelectAll
          ? renderSelectAll({
              filtered: Boolean(this.state.filtered),
              allSelected: this.state.allSelected,
              toggleSelectAll: this.toggleSelectAll,
              tabIndex,
              multiple: Boolean(multiple),
              disabled: Boolean(disabled),
            })
          : React.createElement(SelectAll, {
              visible: this.showSelectAll,
              tabIndex: tabIndex,
              disabled: !!disabled,
              allSelected: this.state.allSelected,
              id: this.props.id,
              selectAllText: this.props.selectAllText,
              toggleSelectAll: this.toggleSelectAll,
            }),
        open &&
          React.createElement(
            'div',
            { 'data-testid': 'dropdown' },
            this.renderOptions()
          )
      )
    );
  }
}

export { Picky };
//# sourceMappingURL=index.mjs.map
