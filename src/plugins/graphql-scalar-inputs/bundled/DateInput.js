import * as React from 'react';

function canProcess(arg) {
  return arg && arg.type && arg.type.name ===  'Date';
}

function render(arg, styleConfig, onChangeHandler) {
  return (
    <input
      type="date"
      value={arg.defaultValue}
      onChange={onChangeHandler}
    />
  );
}


const DatePlugin = {
  canProcess,
  render,
  name: 'DateInput'
};

export default DatePlugin;
