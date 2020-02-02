import * as React from 'react';

function canProcess(arg) {
  return arg && arg.type && arg.type.name ===  'Date';
}

function render(props) {
  return (
    <input
      type="date"
      value={props.arg.defaultValue}
      onChange={props.setArgValue}
    />
  );
}


const DatePlugin = {
  canProcess,
  render,
  name: 'DateInput'
};

export default DatePlugin;
