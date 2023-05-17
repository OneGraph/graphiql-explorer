'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.defaultValue = defaultValue;

var _react = require('react');

var React = _interopRequireWildcard(_react);

var _graphql = require('graphql');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// TODO: 1. Add default fields recursively
// TODO: 2. Add default fields for all selections (not just fragments)
// TODO: 3. Add stylesheet and remove inline styles
// TODO: 4. Indication of when query in explorer diverges from query in editor pane
// TODO: 5. Separate section for deprecated args, with support for 'beta' fields
// TODO: 6. Custom default arg fields

// Note: Attempted 1. and 2., but they were more annoying than helpful

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Names match class names in graphiql app.css
// https://github.com/graphql/graphiql/blob/master/packages/graphiql/css/app.css
var defaultColors = {
  keyword: '#B11A04',
  // OperationName, FragmentName
  def: '#D2054E',
  // FieldName
  property: '#1F61A0',
  // FieldAlias
  qualifier: '#1C92A9',
  // ArgumentName and ObjectFieldName
  attribute: '#8B2BB9',
  number: '#2882F9',
  string: '#D64292',
  // Boolean
  builtin: '#D47509',
  // Enum
  string2: '#0B7FC7',
  variable: '#397D13',
  // Type
  atom: '#CA9800'
};

var defaultArrowOpen = React.createElement(
  'svg',
  { width: '12', height: '9' },
  React.createElement('path', { fill: '#666', d: 'M 0 2 L 9 2 L 4.5 7.5 z' })
);

var defaultArrowClosed = React.createElement(
  'svg',
  { width: '12', height: '9' },
  React.createElement('path', { fill: '#666', d: 'M 0 0 L 0 9 L 5.5 4.5 z' })
);

var defaultCheckboxChecked = React.createElement(
  'svg',
  {
    style: { marginRight: '3px', marginLeft: '-3px' },
    width: '12',
    height: '12',
    viewBox: '0 0 18 18',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg' },
  React.createElement('path', {
    d: 'M16 0H2C0.9 0 0 0.9 0 2V16C0 17.1 0.9 18 2 18H16C17.1 18 18 17.1 18 16V2C18 0.9 17.1 0 16 0ZM16 16H2V2H16V16ZM14.99 6L13.58 4.58L6.99 11.17L4.41 8.6L2.99 10.01L6.99 14L14.99 6Z',
    fill: '#666'
  })
);

var defaultCheckboxUnchecked = React.createElement(
  'svg',
  {
    style: { marginRight: '3px', marginLeft: '-3px' },
    width: '12',
    height: '12',
    viewBox: '0 0 18 18',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg' },
  React.createElement('path', {
    d: 'M16 2V16H2V2H16ZM16 0H2C0.9 0 0 0.9 0 2V16C0 17.1 0.9 18 2 18H16C17.1 18 18 17.1 18 16V2C18 0.9 17.1 0 16 0Z',
    fill: '#CCC'
  })
);

function Checkbox(props) {
  return props.checked ? props.styleConfig.checkboxChecked : props.styleConfig.checkboxUnchecked;
}

function defaultGetDefaultFieldNames(type) {
  var fields = type.getFields();

  // Is there an `id` field?
  if (fields['id']) {
    var res = ['id'];
    if (fields['email']) {
      res.push('email');
    } else if (fields['name']) {
      res.push('name');
    }
    return res;
  }

  // Is there an `edges` field?
  if (fields['edges']) {
    return ['edges'];
  }

  // Is there an `node` field?
  if (fields['node']) {
    return ['node'];
  }

  if (fields['nodes']) {
    return ['nodes'];
  }

  // Include all leaf-type fields.
  var leafFieldNames = [];
  Object.keys(fields).forEach(function (fieldName) {
    if ((0, _graphql.isLeafType)(fields[fieldName].type)) {
      leafFieldNames.push(fieldName);
    }
  });

  if (!leafFieldNames.length) {
    // No leaf fields, add typename so that the query stays valid
    return ['__typename'];
  }
  return leafFieldNames.slice(0, 2); // Prevent too many fields from being added
}

function isRequiredArgument(arg) {
  return (0, _graphql.isNonNullType)(arg.type) && arg.defaultValue === undefined;
}

function unwrapOutputType(outputType) {
  var unwrappedType = outputType;
  while ((0, _graphql.isWrappingType)(unwrappedType)) {
    unwrappedType = unwrappedType.ofType;
  }
  return unwrappedType;
}

function unwrapInputType(inputType) {
  var unwrappedType = inputType;
  while ((0, _graphql.isWrappingType)(unwrappedType)) {
    unwrappedType = unwrappedType.ofType;
  }
  return unwrappedType;
}

function coerceArgValue(argType, value) {
  // Handle the case where we're setting a variable as the value
  if (typeof value !== 'string' && value.kind === 'VariableDefinition') {
    return value.variable;
  } else if ((0, _graphql.isScalarType)(argType)) {
    try {
      switch (argType.name) {
        case 'String':
          return {
            kind: 'StringValue',
            value: String(argType.parseValue(value))
          };
        case 'Float':
          return {
            kind: 'FloatValue',
            value: String(argType.parseValue(parseFloat(value)))
          };
        case 'Int':
          return {
            kind: 'IntValue',
            value: String(argType.parseValue(parseInt(value, 10)))
          };
        case 'Boolean':
          try {
            var parsed = JSON.parse(value);
            if (typeof parsed === 'boolean') {
              return { kind: 'BooleanValue', value: parsed };
            } else {
              return { kind: 'BooleanValue', value: false };
            }
          } catch (e) {
            return {
              kind: 'BooleanValue',
              value: false
            };
          }
        default:
          return {
            kind: 'StringValue',
            value: String(argType.parseValue(value))
          };
      }
    } catch (e) {
      console.error('error coercing arg value', e, value);
      return { kind: 'StringValue', value: value };
    }
  } else {
    try {
      var parsedValue = argType.parseValue(value);
      if (parsedValue) {
        return { kind: 'EnumValue', value: String(parsedValue) };
      } else {
        return { kind: 'EnumValue', value: argType.getValues()[0].name };
      }
    } catch (e) {
      return { kind: 'EnumValue', value: argType.getValues()[0].name };
    }
  }
}

var InputArgView = function (_React$PureComponent) {
  _inherits(InputArgView, _React$PureComponent);

  function InputArgView() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, InputArgView);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = InputArgView.__proto__ || Object.getPrototypeOf(InputArgView)).call.apply(_ref, [this].concat(args))), _this), _this._getArgSelection = function () {
      return _this.props.selection.fields.find(function (field) {
        return field.name.value === _this.props.arg.name;
      });
    }, _this._removeArg = function () {
      var selection = _this.props.selection;

      var argSelection = _this._getArgSelection();
      _this._previousArgSelection = argSelection;
      _this.props.modifyFields(selection.fields.filter(function (field) {
        return field !== argSelection;
      }), true);
    }, _this._addArg = function () {
      var _this$props = _this.props,
          selection = _this$props.selection,
          arg = _this$props.arg,
          getDefaultScalarArgValue = _this$props.getDefaultScalarArgValue,
          parentField = _this$props.parentField,
          makeDefaultArg = _this$props.makeDefaultArg;

      var argType = unwrapInputType(arg.type);

      var argSelection = null;
      if (_this._previousArgSelection) {
        argSelection = _this._previousArgSelection;
      } else if ((0, _graphql.isInputObjectType)(argType)) {
        var _fields = argType.getFields();
        argSelection = {
          kind: 'ObjectField',
          name: { kind: 'Name', value: arg.name },
          value: {
            kind: 'ObjectValue',
            fields: defaultInputObjectFields(getDefaultScalarArgValue, makeDefaultArg, parentField, Object.keys(_fields).map(function (k) {
              return _fields[k];
            }))
          }
        };
      } else if ((0, _graphql.isLeafType)(argType)) {
        argSelection = {
          kind: 'ObjectField',
          name: { kind: 'Name', value: arg.name },
          value: getDefaultScalarArgValue(parentField, arg, argType)
        };
      }

      if (!argSelection) {
        console.error('Unable to add arg for argType', argType);
      } else {
        return _this.props.modifyFields([].concat(_toConsumableArray(selection.fields || []), [argSelection]), true);
      }
    }, _this._setArgValue = function (event, options) {
      var settingToNull = false;
      var settingToVariable = false;
      var settingToLiteralValue = false;
      try {
        if (event.kind === 'VariableDefinition') {
          settingToVariable = true;
        } else if (event === null || typeof event === 'undefined') {
          settingToNull = true;
        } else if (typeof event.kind === 'string') {
          settingToLiteralValue = true;
        }
      } catch (e) {}

      var selection = _this.props.selection;


      var argSelection = _this._getArgSelection();

      if (!argSelection) {
        console.error('missing arg selection when setting arg value');
        return;
      }
      var argType = unwrapInputType(_this.props.arg.type);

      var handleable = (0, _graphql.isLeafType)(argType) || settingToVariable || settingToNull || settingToLiteralValue;

      if (!handleable) {
        console.warn('Unable to handle non leaf types in InputArgView.setArgValue', event);
        return;
      }
      var targetValue = void 0;
      var value = void 0;

      if (event === null || typeof event === 'undefined') {
        value = null;
      } else if (!event.target && !!event.kind && event.kind === 'VariableDefinition') {
        targetValue = event;
        value = targetValue.variable;
      } else if (typeof event.kind === 'string') {
        value = event;
      } else if (event.target && typeof event.target.value === 'string') {
        targetValue = event.target.value;
        value = coerceArgValue(argType, targetValue);
      }

      var newDoc = _this.props.modifyFields((selection.fields || []).map(function (field) {
        var isTarget = field === argSelection;
        var newField = isTarget ? _extends({}, field, {
          value: value
        }) : field;

        return newField;
      }), options);

      return newDoc;
    }, _this._modifyChildFields = function (fields) {
      return _this.props.modifyFields(_this.props.selection.fields.map(function (field) {
        return field.name.value === _this.props.arg.name ? _extends({}, field, {
          value: {
            kind: 'ObjectValue',
            fields: fields
          }
        }) : field;
      }), true);
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(InputArgView, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          arg = _props.arg,
          parentField = _props.parentField;

      var argSelection = this._getArgSelection();

      return React.createElement(AbstractArgView, {
        argValue: argSelection ? argSelection.value : null,
        arg: arg,
        parentField: parentField,
        addArg: this._addArg,
        removeArg: this._removeArg,
        setArgFields: this._modifyChildFields,
        setArgValue: this._setArgValue,
        getDefaultScalarArgValue: this.props.getDefaultScalarArgValue,
        makeDefaultArg: this.props.makeDefaultArg,
        onRunOperation: this.props.onRunOperation,
        styleConfig: this.props.styleConfig,
        onCommit: this.props.onCommit,
        definition: this.props.definition
      });
    }
  }]);

  return InputArgView;
}(React.PureComponent);

function defaultValue(argType) {
  if ((0, _graphql.isEnumType)(argType)) {
    return { kind: 'EnumValue', value: argType.getValues()[0].name };
  } else {
    switch (argType.name) {
      case 'String':
        return { kind: 'StringValue', value: '' };
      case 'Float':
        return { kind: 'FloatValue', value: '1.5' };
      case 'Int':
        return { kind: 'IntValue', value: '10' };
      case 'Boolean':
        return { kind: 'BooleanValue', value: false };
      default:
        return { kind: 'StringValue', value: '' };
    }
  }
}

function defaultGetDefaultScalarArgValue(parentField, arg, argType) {
  return defaultValue(argType);
}

var ArgView = function (_React$PureComponent2) {
  _inherits(ArgView, _React$PureComponent2);

  function ArgView() {
    var _ref2;

    var _temp2, _this2, _ret2;

    _classCallCheck(this, ArgView);

    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return _ret2 = (_temp2 = (_this2 = _possibleConstructorReturn(this, (_ref2 = ArgView.__proto__ || Object.getPrototypeOf(ArgView)).call.apply(_ref2, [this].concat(args))), _this2), _this2._getArgSelection = function () {
      var selection = _this2.props.selection;


      return (selection.arguments || []).find(function (arg) {
        return arg.name.value === _this2.props.arg.name;
      });
    }, _this2._removeArg = function (commit) {
      var selection = _this2.props.selection;

      var argSelection = _this2._getArgSelection();
      _this2._previousArgSelection = argSelection;
      return _this2.props.modifyArguments((selection.arguments || []).filter(function (arg) {
        return arg !== argSelection;
      }), commit);
    }, _this2._addArg = function (commit) {
      var _this2$props = _this2.props,
          selection = _this2$props.selection,
          getDefaultScalarArgValue = _this2$props.getDefaultScalarArgValue,
          makeDefaultArg = _this2$props.makeDefaultArg,
          parentField = _this2$props.parentField,
          arg = _this2$props.arg;

      var argType = unwrapInputType(arg.type);

      var argSelection = null;
      if (_this2._previousArgSelection) {
        argSelection = _this2._previousArgSelection;
      } else if ((0, _graphql.isInputObjectType)(argType)) {
        var _fields2 = argType.getFields();
        argSelection = {
          kind: 'Argument',
          name: { kind: 'Name', value: arg.name },
          value: {
            kind: 'ObjectValue',
            fields: defaultInputObjectFields(getDefaultScalarArgValue, makeDefaultArg, parentField, Object.keys(_fields2).map(function (k) {
              return _fields2[k];
            }))
          }
        };
      } else if ((0, _graphql.isLeafType)(argType)) {
        argSelection = {
          kind: 'Argument',
          name: { kind: 'Name', value: arg.name },
          value: getDefaultScalarArgValue(parentField, arg, argType)
        };
      }

      if (!argSelection) {
        console.error('Unable to add arg for argType', argType);
        return null;
      } else {
        return _this2.props.modifyArguments([].concat(_toConsumableArray(selection.arguments || []), [argSelection]), commit);
      }
    }, _this2._setArgValue = function (event, options) {
      var settingToNull = false;
      var settingToVariable = false;
      var settingToLiteralValue = false;
      try {
        if (event.kind === 'VariableDefinition') {
          settingToVariable = true;
        } else if (event === null || typeof event === 'undefined') {
          settingToNull = true;
        } else if (typeof event.kind === 'string') {
          settingToLiteralValue = true;
        }
      } catch (e) {}
      var selection = _this2.props.selection;

      var argSelection = _this2._getArgSelection();
      if (!argSelection && !settingToVariable) {
        console.error('missing arg selection when setting arg value');
        return;
      }
      var argType = unwrapInputType(_this2.props.arg.type);

      var handleable = (0, _graphql.isLeafType)(argType) || settingToVariable || settingToNull || settingToLiteralValue;

      if (!handleable) {
        console.warn('Unable to handle non leaf types in ArgView._setArgValue');
        return;
      }

      var targetValue = void 0;
      var value = void 0;

      if (event === null || typeof event === 'undefined') {
        value = null;
      } else if (event.target && typeof event.target.value === 'string') {
        targetValue = event.target.value;
        value = coerceArgValue(argType, targetValue);
      } else if (!event.target && event.kind === 'VariableDefinition') {
        targetValue = event;
        value = targetValue.variable;
      } else if (typeof event.kind === 'string') {
        value = event;
      }

      return _this2.props.modifyArguments((selection.arguments || []).map(function (a) {
        return a === argSelection ? _extends({}, a, {
          value: value
        }) : a;
      }), options);
    }, _this2._setArgFields = function (fields, commit) {
      var selection = _this2.props.selection;

      var argSelection = _this2._getArgSelection();
      if (!argSelection) {
        console.error('missing arg selection when setting arg value');
        return;
      }

      return _this2.props.modifyArguments((selection.arguments || []).map(function (a) {
        return a === argSelection ? _extends({}, a, {
          value: {
            kind: 'ObjectValue',
            fields: fields
          }
        }) : a;
      }), commit);
    }, _temp2), _possibleConstructorReturn(_this2, _ret2);
  }

  _createClass(ArgView, [{
    key: 'render',
    value: function render() {
      var _props2 = this.props,
          arg = _props2.arg,
          parentField = _props2.parentField;

      var argSelection = this._getArgSelection();

      return React.createElement(AbstractArgView, {
        argValue: argSelection ? argSelection.value : null,
        arg: arg,
        parentField: parentField,
        addArg: this._addArg,
        removeArg: this._removeArg,
        setArgFields: this._setArgFields,
        setArgValue: this._setArgValue,
        getDefaultScalarArgValue: this.props.getDefaultScalarArgValue,
        makeDefaultArg: this.props.makeDefaultArg,
        onRunOperation: this.props.onRunOperation,
        styleConfig: this.props.styleConfig,
        onCommit: this.props.onCommit,
        definition: this.props.definition
      });
    }
  }]);

  return ArgView;
}(React.PureComponent);

function isRunShortcut(event) {
  return event.ctrlKey && event.key === 'Enter';
}

function canRunOperation(operationName) {
  // it does not make sense to try to execute a fragment
  return operationName !== 'FragmentDefinition';
}

var ScalarInput = function (_React$PureComponent3) {
  _inherits(ScalarInput, _React$PureComponent3);

  function ScalarInput() {
    var _ref3;

    var _temp3, _this3, _ret3;

    _classCallCheck(this, ScalarInput);

    for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    return _ret3 = (_temp3 = (_this3 = _possibleConstructorReturn(this, (_ref3 = ScalarInput.__proto__ || Object.getPrototypeOf(ScalarInput)).call.apply(_ref3, [this].concat(args))), _this3), _this3._handleChange = function (event) {
      _this3.props.setArgValue(event, true);
    }, _temp3), _possibleConstructorReturn(_this3, _ret3);
  }

  _createClass(ScalarInput, [{
    key: 'render',
    value: function render() {
      var _this4 = this;

      var _props3 = this.props,
          arg = _props3.arg,
          argValue = _props3.argValue,
          styleConfig = _props3.styleConfig;

      var argType = unwrapInputType(arg.type);
      var value = typeof argValue.value === 'string' ? argValue.value : '';
      var color = this.props.argValue.kind === 'StringValue' ? styleConfig.colors.string : styleConfig.colors.number;
      return React.createElement(
        'span',
        { style: { color: color } },
        argType.name === 'String' ? '"' : '',
        React.createElement('input', {
          style: {
            border: 'none',
            borderBottom: '1px solid #888',
            outline: 'none',
            width: Math.max(1, Math.min(15, value.length)) + 'ch',
            color: color
          },
          ref: function ref(_ref4) {
            _this4._ref = _ref4;
          },
          type: 'text',
          onChange: this._handleChange,
          value: value
        }),
        argType.name === 'String' ? '"' : ''
      );
    }
  }]);

  return ScalarInput;
}(React.PureComponent);

var AbstractArgView = function (_React$PureComponent4) {
  _inherits(AbstractArgView, _React$PureComponent4);

  function AbstractArgView() {
    var _ref5;

    var _temp4, _this5, _ret4;

    _classCallCheck(this, AbstractArgView);

    for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }

    return _ret4 = (_temp4 = (_this5 = _possibleConstructorReturn(this, (_ref5 = AbstractArgView.__proto__ || Object.getPrototypeOf(AbstractArgView)).call.apply(_ref5, [this].concat(args))), _this5), _this5.state = { displayArgActions: false }, _temp4), _possibleConstructorReturn(_this5, _ret4);
  }

  _createClass(AbstractArgView, [{
    key: 'render',
    value: function render() {
      var _this6 = this;

      var _props4 = this.props,
          argValue = _props4.argValue,
          arg = _props4.arg,
          styleConfig = _props4.styleConfig;
      /* TODO: handle List types*/

      var argType = unwrapInputType(arg.type);

      var input = null;
      if (argValue) {
        if (argValue.kind === 'Variable') {
          input = React.createElement(
            'span',
            { style: { color: styleConfig.colors.variable } },
            '$',
            argValue.name.value
          );
        } else if ((0, _graphql.isScalarType)(argType)) {
          if (argType.name === 'Boolean') {
            input = React.createElement(
              'select',
              {
                style: {
                  color: styleConfig.colors.builtin
                },
                onChange: this.props.setArgValue,
                value: argValue.kind === 'BooleanValue' ? argValue.value : undefined },
              React.createElement(
                'option',
                { key: 'true', value: 'true' },
                'true'
              ),
              React.createElement(
                'option',
                { key: 'false', value: 'false' },
                'false'
              )
            );
          } else {
            input = React.createElement(ScalarInput, {
              setArgValue: this.props.setArgValue,
              arg: arg,
              argValue: argValue,
              onRunOperation: this.props.onRunOperation,
              styleConfig: this.props.styleConfig
            });
          }
        } else if ((0, _graphql.isEnumType)(argType)) {
          if (argValue.kind === 'EnumValue') {
            input = React.createElement(
              'select',
              {
                style: {
                  backgroundColor: 'white',
                  color: styleConfig.colors.string2
                },
                onChange: this.props.setArgValue,
                value: argValue.value },
              argType.getValues().map(function (value) {
                return React.createElement(
                  'option',
                  { key: value.name, value: value.name },
                  value.name
                );
              })
            );
          } else {
            console.error('arg mismatch between arg and selection', argType, argValue);
          }
        } else if ((0, _graphql.isInputObjectType)(argType)) {
          if (argValue.kind === 'ObjectValue') {
            var _fields3 = argType.getFields();
            input = React.createElement(
              'div',
              { style: { marginLeft: 16 } },
              Object.keys(_fields3).sort().map(function (fieldName) {
                return React.createElement(InputArgView, {
                  key: fieldName,
                  arg: _fields3[fieldName],
                  parentField: _this6.props.parentField,
                  selection: argValue,
                  modifyFields: _this6.props.setArgFields,
                  getDefaultScalarArgValue: _this6.props.getDefaultScalarArgValue,
                  makeDefaultArg: _this6.props.makeDefaultArg,
                  onRunOperation: _this6.props.onRunOperation,
                  styleConfig: _this6.props.styleConfig,
                  onCommit: _this6.props.onCommit,
                  definition: _this6.props.definition
                });
              })
            );
          } else {
            console.error('arg mismatch between arg and selection', argType, argValue);
          }
        }
      }

      var variablize = function variablize() {
        /**
        1. Find current operation variables
        2. Find current arg value
        3. Create a new variable
        4. Replace current arg value with variable
        5. Add variable to operation
        */

        var baseVariableName = arg.name;
        var conflictingNameCount = (_this6.props.definition.variableDefinitions || []).filter(function (varDef) {
          return varDef.variable.name.value.startsWith(baseVariableName);
        }).length;

        var variableName = void 0;
        if (conflictingNameCount > 0) {
          variableName = '' + baseVariableName + conflictingNameCount;
        } else {
          variableName = baseVariableName;
        }
        // To get an AST definition of our variable from the instantiated arg,
        // we print it to a string, then parseType to get our AST.
        var argPrintedType = arg.type.toString();
        var argType = (0, _graphql.parseType)(argPrintedType);

        var base = {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: {
              kind: 'Name',
              value: variableName
            }
          },
          type: argType,
          directives: []
        };

        var variableDefinitionByName = function variableDefinitionByName(name) {
          return (_this6.props.definition.variableDefinitions || []).find(function (varDef) {
            return varDef.variable.name.value === name;
          });
        };

        var variable = void 0;

        var subVariableUsageCountByName = {};

        if (typeof argValue !== 'undefined' && argValue !== null) {
          /** In the process of devariabilizing descendent selections,
           * we may have caused their variable definitions to become unused.
           * Keep track and remove any variable definitions with 1 or fewer usages.
           * */
          var cleanedDefaultValue = (0, _graphql.visit)(argValue, {
            Variable: function Variable(node) {
              var varName = node.name.value;
              var varDef = variableDefinitionByName(varName);

              subVariableUsageCountByName[varName] = subVariableUsageCountByName[varName] + 1 || 1;

              if (!varDef) {
                return;
              }

              return varDef.defaultValue;
            }
          });

          var isNonNullable = base.type.kind === 'NonNullType';

          // We're going to give the variable definition a default value, so we must make its type nullable
          var unwrappedBase = isNonNullable ? _extends({}, base, { type: base.type.type }) : base;

          variable = _extends({}, unwrappedBase, { defaultValue: cleanedDefaultValue });
        } else {
          variable = base;
        }

        var newlyUnusedVariables = Object.entries(subVariableUsageCountByName)
        // $FlowFixMe: Can't get Object.entries to realize usageCount *must* be a number
        .filter(function (_ref6) {
          var _ref7 = _slicedToArray(_ref6, 2),
              _ = _ref7[0],
              usageCount = _ref7[1];

          return usageCount < 2;
        }).map(function (_ref8) {
          var _ref9 = _slicedToArray(_ref8, 2),
              varName = _ref9[0],
              _ = _ref9[1];

          return varName;
        });

        if (variable) {
          var _newDoc = _this6.props.setArgValue(variable, false);

          if (_newDoc) {
            var targetOperation = _newDoc.definitions.find(function (definition) {
              if (!!definition.operation && !!definition.name && !!definition.name.value &&
              //
              !!_this6.props.definition.name && !!_this6.props.definition.name.value) {
                return definition.name.value === _this6.props.definition.name.value;
              } else {
                return false;
              }
            });

            var newVariableDefinitions = [].concat(_toConsumableArray(targetOperation.variableDefinitions || []), [variable]).filter(function (varDef) {
              return newlyUnusedVariables.indexOf(varDef.variable.name.value) === -1;
            });

            var newOperation = _extends({}, targetOperation, {
              variableDefinitions: newVariableDefinitions
            });

            var existingDefs = _newDoc.definitions;

            var newDefinitions = existingDefs.map(function (existingOperation) {
              if (targetOperation === existingOperation) {
                return newOperation;
              } else {
                return existingOperation;
              }
            });

            var finalDoc = _extends({}, _newDoc, {
              definitions: newDefinitions
            });

            _this6.props.onCommit(finalDoc);
          }
        }
      };

      var devariablize = function devariablize() {
        /**
         * 1. Find the current variable definition in the operation def
         * 2. Extract its value
         * 3. Replace the current arg value
         * 4. Visit the resulting operation to see if there are any other usages of the variable
         * 5. If not, remove the variableDefinition
         */
        if (!argValue || !argValue.name || !argValue.name.value) {
          return;
        }

        var variableName = argValue.name.value;
        var variableDefinition = (_this6.props.definition.variableDefinitions || []).find(function (varDef) {
          return varDef.variable.name.value === variableName;
        });

        if (!variableDefinition) {
          return;
        }

        var defaultValue = variableDefinition.defaultValue;

        var newDoc = _this6.props.setArgValue(defaultValue, {
          commit: false
        });

        if (newDoc) {
          var targetOperation = newDoc.definitions.find(function (definition) {
            return definition.name.value === _this6.props.definition.name.value;
          });

          if (!targetOperation) {
            return;
          }

          // After de-variabilizing, see if the variable is still in use. If not, remove it.
          var variableUseCount = 0;

          (0, _graphql.visit)(targetOperation, {
            Variable: function Variable(node) {
              if (node.name.value === variableName) {
                variableUseCount = variableUseCount + 1;
              }
            }
          });

          var newVariableDefinitions = targetOperation.variableDefinitions || [];

          // A variable is in use if it shows up at least twice (once in the definition, once in the selection)
          if (variableUseCount < 2) {
            newVariableDefinitions = newVariableDefinitions.filter(function (varDef) {
              return varDef.variable.name.value !== variableName;
            });
          }

          var newOperation = _extends({}, targetOperation, {
            variableDefinitions: newVariableDefinitions
          });

          var existingDefs = newDoc.definitions;

          var newDefinitions = existingDefs.map(function (existingOperation) {
            if (targetOperation === existingOperation) {
              return newOperation;
            } else {
              return existingOperation;
            }
          });

          var finalDoc = _extends({}, newDoc, {
            definitions: newDefinitions
          });

          _this6.props.onCommit(finalDoc);
        }
      };

      var isArgValueVariable = argValue && argValue.kind === 'Variable';

      var variablizeActionButton = !this.state.displayArgActions ? null : React.createElement(
        'button',
        {
          type: 'submit',
          className: 'toolbar-button',
          title: isArgValueVariable ? 'Remove the variable' : 'Extract the current value into a GraphQL variable',
          onClick: function onClick(event) {
            event.preventDefault();
            event.stopPropagation();

            if (isArgValueVariable) {
              devariablize();
            } else {
              variablize();
            }
          },
          style: styleConfig.styles.actionButtonStyle },
        React.createElement(
          'span',
          { style: { color: styleConfig.colors.variable } },
          '$'
        )
      );

      return React.createElement(
        'div',
        {
          style: {
            cursor: 'pointer',
            minHeight: '16px',
            WebkitUserSelect: 'none',
            userSelect: 'none'
          },
          'data-arg-name': arg.name,
          'data-arg-type': argType.name,
          className: 'graphiql-explorer-' + arg.name },
        React.createElement(
          'span',
          {
            style: { cursor: 'pointer' },
            onClick: function onClick(event) {
              var shouldAdd = !argValue;
              if (shouldAdd) {
                _this6.props.addArg(true);
              } else {
                _this6.props.removeArg(true);
              }
              _this6.setState({ displayArgActions: shouldAdd });
            } },
          (0, _graphql.isInputObjectType)(argType) ? React.createElement(
            'span',
            null,
            !!argValue ? this.props.styleConfig.arrowOpen : this.props.styleConfig.arrowClosed
          ) : React.createElement(Checkbox, {
            checked: !!argValue,
            styleConfig: this.props.styleConfig
          }),
          React.createElement(
            'span',
            {
              style: { color: styleConfig.colors.attribute },
              title: arg.description,
              onMouseEnter: function onMouseEnter() {
                // Make implementation a bit easier and only show 'variablize' action if arg is already added
                if (argValue !== null && typeof argValue !== 'undefined') {
                  _this6.setState({ displayArgActions: true });
                }
              },
              onMouseLeave: function onMouseLeave() {
                return _this6.setState({ displayArgActions: false });
              } },
            arg.name,
            isRequiredArgument(arg) ? '*' : '',
            ': ',
            variablizeActionButton,
            ' '
          ),
          ' '
        ),
        input || React.createElement('span', null),
        ' '
      );
    }
  }]);

  return AbstractArgView;
}(React.PureComponent);

var AbstractView = function (_React$PureComponent5) {
  _inherits(AbstractView, _React$PureComponent5);

  function AbstractView() {
    var _ref10;

    var _temp5, _this7, _ret5;

    _classCallCheck(this, AbstractView);

    for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
      args[_key5] = arguments[_key5];
    }

    return _ret5 = (_temp5 = (_this7 = _possibleConstructorReturn(this, (_ref10 = AbstractView.__proto__ || Object.getPrototypeOf(AbstractView)).call.apply(_ref10, [this].concat(args))), _this7), _this7._addFragment = function () {
      _this7.props.modifySelections([].concat(_toConsumableArray(_this7.props.selections), [_this7._previousSelection || {
        kind: 'InlineFragment',
        typeCondition: {
          kind: 'NamedType',
          name: { kind: 'Name', value: _this7.props.implementingType.name }
        },
        selectionSet: {
          kind: 'SelectionSet',
          selections: _this7.props.getDefaultFieldNames(_this7.props.implementingType).map(function (fieldName) {
            return {
              kind: 'Field',
              name: { kind: 'Name', value: fieldName }
            };
          })
        }
      }]));
    }, _this7._removeFragment = function () {
      var thisSelection = _this7._getSelection();
      _this7._previousSelection = thisSelection;
      _this7.props.modifySelections(_this7.props.selections.filter(function (s) {
        return s !== thisSelection;
      }));
    }, _this7._getSelection = function () {
      var selection = _this7.props.selections.find(function (selection) {
        return selection.kind === 'InlineFragment' && selection.typeCondition && _this7.props.implementingType.name === selection.typeCondition.name.value;
      });
      if (!selection) {
        return null;
      }
      if (selection.kind === 'InlineFragment') {
        return selection;
      }
    }, _this7._modifyChildSelections = function (selections, options) {
      var thisSelection = _this7._getSelection();
      return _this7.props.modifySelections(_this7.props.selections.map(function (selection) {
        if (selection === thisSelection) {
          return {
            directives: selection.directives,
            kind: 'InlineFragment',
            typeCondition: {
              kind: 'NamedType',
              name: { kind: 'Name', value: _this7.props.implementingType.name }
            },
            selectionSet: {
              kind: 'SelectionSet',
              selections: selections
            }
          };
        }
        return selection;
      }), options);
    }, _temp5), _possibleConstructorReturn(_this7, _ret5);
  }

  _createClass(AbstractView, [{
    key: 'render',
    value: function render() {
      var _this8 = this;

      var _props5 = this.props,
          implementingType = _props5.implementingType,
          schema = _props5.schema,
          getDefaultFieldNames = _props5.getDefaultFieldNames,
          styleConfig = _props5.styleConfig;

      var selection = this._getSelection();
      var fields = implementingType.getFields();
      var childSelections = selection ? selection.selectionSet ? selection.selectionSet.selections : [] : [];

      return React.createElement(
        'div',
        { className: 'graphiql-explorer-' + implementingType.name },
        React.createElement(
          'span',
          {
            style: { cursor: 'pointer' },
            onClick: selection ? this._removeFragment : this._addFragment },
          React.createElement(Checkbox, {
            checked: !!selection,
            styleConfig: this.props.styleConfig
          }),
          React.createElement(
            'span',
            { style: { color: styleConfig.colors.atom } },
            this.props.implementingType.name
          )
        ),
        selection ? React.createElement(
          'div',
          { style: { marginLeft: 16 } },
          Object.keys(fields).sort().map(function (fieldName) {
            return React.createElement(FieldView, {
              key: fieldName,
              field: fields[fieldName],
              selections: childSelections,
              modifySelections: _this8._modifyChildSelections,
              schema: schema,
              getDefaultFieldNames: getDefaultFieldNames,
              getDefaultScalarArgValue: _this8.props.getDefaultScalarArgValue,
              makeDefaultArg: _this8.props.makeDefaultArg,
              onRunOperation: _this8.props.onRunOperation,
              onCommit: _this8.props.onCommit,
              styleConfig: _this8.props.styleConfig,
              definition: _this8.props.definition,
              availableFragments: _this8.props.availableFragments
            });
          })
        ) : null
      );
    }
  }]);

  return AbstractView;
}(React.PureComponent);

var FragmentView = function (_React$PureComponent6) {
  _inherits(FragmentView, _React$PureComponent6);

  function FragmentView() {
    var _ref11;

    var _temp6, _this9, _ret6;

    _classCallCheck(this, FragmentView);

    for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
      args[_key6] = arguments[_key6];
    }

    return _ret6 = (_temp6 = (_this9 = _possibleConstructorReturn(this, (_ref11 = FragmentView.__proto__ || Object.getPrototypeOf(FragmentView)).call.apply(_ref11, [this].concat(args))), _this9), _this9._addFragment = function () {
      _this9.props.modifySelections([].concat(_toConsumableArray(_this9.props.selections), [_this9._previousSelection || {
        kind: 'FragmentSpread',
        name: _this9.props.fragment.name
      }]));
    }, _this9._removeFragment = function () {
      var thisSelection = _this9._getSelection();
      _this9._previousSelection = thisSelection;
      _this9.props.modifySelections(_this9.props.selections.filter(function (s) {
        var isTargetSelection = s.kind === 'FragmentSpread' && s.name.value === _this9.props.fragment.name.value;

        return !isTargetSelection;
      }));
    }, _this9._getSelection = function () {
      var selection = _this9.props.selections.find(function (selection) {
        return selection.kind === 'FragmentSpread' && selection.name.value === _this9.props.fragment.name.value;
      });

      return selection;
    }, _temp6), _possibleConstructorReturn(_this9, _ret6);
  }

  _createClass(FragmentView, [{
    key: 'render',
    value: function render() {
      var styleConfig = this.props.styleConfig;

      var selection = this._getSelection();
      return React.createElement(
        'div',
        { className: 'graphiql-explorer-' + this.props.fragment.name.value },
        React.createElement(
          'span',
          {
            style: { cursor: 'pointer' },
            onClick: selection ? this._removeFragment : this._addFragment },
          React.createElement(Checkbox, {
            checked: !!selection,
            styleConfig: this.props.styleConfig
          }),
          React.createElement(
            'span',
            {
              style: { color: styleConfig.colors.def },
              className: 'graphiql-explorer-' + this.props.fragment.name.value },
            this.props.fragment.name.value
          )
        )
      );
    }
  }]);

  return FragmentView;
}(React.PureComponent);

function defaultInputObjectFields(getDefaultScalarArgValue, makeDefaultArg, parentField, fields) {
  var nodes = [];
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = fields[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _field = _step.value;

      if ((0, _graphql.isRequiredInputField)(_field) || makeDefaultArg && makeDefaultArg(parentField, _field)) {
        var fieldType = unwrapInputType(_field.type);
        if ((0, _graphql.isInputObjectType)(fieldType)) {
          (function () {
            var fields = fieldType.getFields();
            nodes.push({
              kind: 'ObjectField',
              name: { kind: 'Name', value: _field.name },
              value: {
                kind: 'ObjectValue',
                fields: defaultInputObjectFields(getDefaultScalarArgValue, makeDefaultArg, parentField, Object.keys(fields).map(function (k) {
                  return fields[k];
                }))
              }
            });
          })();
        } else if ((0, _graphql.isLeafType)(fieldType)) {
          nodes.push({
            kind: 'ObjectField',
            name: { kind: 'Name', value: _field.name },
            value: getDefaultScalarArgValue(parentField, _field, fieldType)
          });
        }
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return nodes;
}

function defaultArgs(getDefaultScalarArgValue, makeDefaultArg, field) {
  var args = [];
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = field.args[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var _arg = _step2.value;

      if (isRequiredArgument(_arg) || makeDefaultArg && makeDefaultArg(field, _arg)) {
        var argType = unwrapInputType(_arg.type);
        if ((0, _graphql.isInputObjectType)(argType)) {
          (function () {
            var fields = argType.getFields();
            args.push({
              kind: 'Argument',
              name: { kind: 'Name', value: _arg.name },
              value: {
                kind: 'ObjectValue',
                fields: defaultInputObjectFields(getDefaultScalarArgValue, makeDefaultArg, field, Object.keys(fields).map(function (k) {
                  return fields[k];
                }))
              }
            });
          })();
        } else if ((0, _graphql.isLeafType)(argType)) {
          args.push({
            kind: 'Argument',
            name: { kind: 'Name', value: _arg.name },
            value: getDefaultScalarArgValue(field, _arg, argType)
          });
        }
      }
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  return args;
}

var FieldView = function (_React$PureComponent7) {
  _inherits(FieldView, _React$PureComponent7);

  function FieldView() {
    var _ref12;

    var _temp7, _this10, _ret9;

    _classCallCheck(this, FieldView);

    for (var _len7 = arguments.length, args = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
      args[_key7] = arguments[_key7];
    }

    return _ret9 = (_temp7 = (_this10 = _possibleConstructorReturn(this, (_ref12 = FieldView.__proto__ || Object.getPrototypeOf(FieldView)).call.apply(_ref12, [this].concat(args))), _this10), _this10.state = { displayFieldActions: false }, _this10._addAllFieldsToSelections = function (rawSubfields) {
      var subFields = !!rawSubfields ? Object.keys(rawSubfields).map(function (fieldName) {
        return {
          kind: 'Field',
          name: { kind: 'Name', value: fieldName },
          arguments: []
        };
      }) : [];

      var subSelectionSet = {
        kind: 'SelectionSet',
        selections: subFields
      };

      var nextSelections = [].concat(_toConsumableArray(_this10.props.selections.filter(function (selection) {
        if (selection.kind === 'InlineFragment') {
          return true;
        } else {
          // Remove the current selection set for the target field
          return selection.name.value !== _this10.props.field.name;
        }
      })), [{
        kind: 'Field',
        name: { kind: 'Name', value: _this10.props.field.name },
        arguments: defaultArgs(_this10.props.getDefaultScalarArgValue, _this10.props.makeDefaultArg, _this10.props.field),
        selectionSet: subSelectionSet
      }]);

      _this10.props.modifySelections(nextSelections);
    }, _this10._addFieldToSelections = function (rawSubfields) {
      var nextSelections = [].concat(_toConsumableArray(_this10.props.selections), [_this10._previousSelection || {
        kind: 'Field',
        name: { kind: 'Name', value: _this10.props.field.name },
        arguments: defaultArgs(_this10.props.getDefaultScalarArgValue, _this10.props.makeDefaultArg, _this10.props.field)
      }]);

      _this10.props.modifySelections(nextSelections);
    }, _this10._handleUpdateSelections = function (event) {
      var selection = _this10._getSelection();
      if (selection && !event.altKey) {
        _this10._removeFieldFromSelections();
      } else {
        var fieldType = (0, _graphql.getNamedType)(_this10.props.field.type);
        var rawSubfields = (0, _graphql.isObjectType)(fieldType) && fieldType.getFields();

        var shouldSelectAllSubfields = !!rawSubfields && event.altKey;

        shouldSelectAllSubfields ? _this10._addAllFieldsToSelections(rawSubfields) : _this10._addFieldToSelections(rawSubfields);
      }
    }, _this10._removeFieldFromSelections = function () {
      var previousSelection = _this10._getSelection();
      _this10._previousSelection = previousSelection;
      _this10.props.modifySelections(_this10.props.selections.filter(function (selection) {
        return selection !== previousSelection;
      }));
    }, _this10._getSelection = function () {
      var selection = _this10.props.selections.find(function (selection) {
        return selection.kind === 'Field' && _this10.props.field.name === selection.name.value;
      });
      if (!selection) {
        return null;
      }
      if (selection.kind === 'Field') {
        return selection;
      }
    }, _this10._setArguments = function (argumentNodes, options) {
      var selection = _this10._getSelection();
      if (!selection) {
        console.error('Missing selection when setting arguments', argumentNodes);
        return;
      }
      return _this10.props.modifySelections(_this10.props.selections.map(function (s) {
        return s === selection ? {
          alias: selection.alias,
          arguments: argumentNodes,
          directives: selection.directives,
          kind: 'Field',
          name: selection.name,
          selectionSet: selection.selectionSet
        } : s;
      }), options);
    }, _this10._modifyChildSelections = function (selections, options) {
      return _this10.props.modifySelections(_this10.props.selections.map(function (selection) {
        if (selection.kind === 'Field' && _this10.props.field.name === selection.name.value) {
          if (selection.kind !== 'Field') {
            throw new Error('invalid selection');
          }
          return {
            alias: selection.alias,
            arguments: selection.arguments,
            directives: selection.directives,
            kind: 'Field',
            name: selection.name,
            selectionSet: {
              kind: 'SelectionSet',
              selections: selections
            }
          };
        }
        return selection;
      }), options);
    }, _temp7), _possibleConstructorReturn(_this10, _ret9);
  }

  _createClass(FieldView, [{
    key: 'render',
    value: function render() {
      var _this11 = this;

      var _props6 = this.props,
          field = _props6.field,
          schema = _props6.schema,
          getDefaultFieldNames = _props6.getDefaultFieldNames,
          styleConfig = _props6.styleConfig;

      var selection = this._getSelection();
      var type = unwrapOutputType(field.type);
      var args = field.args.sort(function (a, b) {
        return a.name.localeCompare(b.name);
      });
      var className = 'graphiql-explorer-node graphiql-explorer-' + field.name;

      if (field.isDeprecated) {
        className += ' graphiql-explorer-deprecated';
      }

      var applicableFragments = (0, _graphql.isObjectType)(type) || (0, _graphql.isInterfaceType)(type) || (0, _graphql.isUnionType)(type) ? this.props.availableFragments && this.props.availableFragments[type.name] : null;

      var node = React.createElement(
        'div',
        { className: className },
        React.createElement(
          'span',
          {
            title: field.description,
            style: {
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              minHeight: '16px',
              WebkitUserSelect: 'none',
              userSelect: 'none'
            },
            'data-field-name': field.name,
            'data-field-type': type.name,
            onClick: this._handleUpdateSelections,
            onMouseEnter: function onMouseEnter() {
              var containsMeaningfulSubselection = (0, _graphql.isObjectType)(type) && selection && selection.selectionSet && selection.selectionSet.selections.filter(function (selection) {
                return selection.kind !== 'FragmentSpread';
              }).length > 0;

              if (containsMeaningfulSubselection) {
                _this11.setState({ displayFieldActions: true });
              }
            },
            onMouseLeave: function onMouseLeave() {
              return _this11.setState({ displayFieldActions: false });
            } },
          (0, _graphql.isObjectType)(type) ? React.createElement(
            'span',
            null,
            !!selection ? this.props.styleConfig.arrowOpen : this.props.styleConfig.arrowClosed
          ) : null,
          (0, _graphql.isObjectType)(type) ? null : React.createElement(Checkbox, {
            checked: !!selection,
            styleConfig: this.props.styleConfig
          }),
          React.createElement(
            'span',
            {
              style: { color: styleConfig.colors.property },
              className: 'graphiql-explorer-field-view' },
            field.name
          ),
          !this.state.displayFieldActions ? null : React.createElement(
            'button',
            {
              type: 'submit',
              className: 'toolbar-button',
              title: 'Extract selections into a new reusable fragment',
              onClick: function onClick(event) {
                event.preventDefault();
                event.stopPropagation();
                // 1. Create a fragment spread node
                // 2. Copy selections from this object to fragment
                // 3. Replace selections in this object with fragment spread
                // 4. Add fragment to document
                var typeName = type.name;
                var newFragmentName = typeName + 'Fragment';

                var conflictingNameCount = (applicableFragments || []).filter(function (fragment) {
                  return fragment.name.value.startsWith(newFragmentName);
                }).length;

                if (conflictingNameCount > 0) {
                  newFragmentName = '' + newFragmentName + conflictingNameCount;
                }

                var childSelections = selection ? selection.selectionSet ? selection.selectionSet.selections : [] : [];

                var nextSelections = [{
                  kind: 'FragmentSpread',
                  name: {
                    kind: 'Name',
                    value: newFragmentName
                  },
                  directives: []
                }];

                var newFragmentDefinition = {
                  kind: 'FragmentDefinition',
                  name: {
                    kind: 'Name',
                    value: newFragmentName
                  },
                  typeCondition: {
                    kind: 'NamedType',
                    name: {
                      kind: 'Name',
                      value: type.name
                    }
                  },
                  directives: [],
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: childSelections
                  }
                };

                var newDoc = _this11._modifyChildSelections(nextSelections, false);

                if (newDoc) {
                  var newDocWithFragment = _extends({}, newDoc, {
                    definitions: [].concat(_toConsumableArray(newDoc.definitions), [newFragmentDefinition])
                  });

                  _this11.props.onCommit(newDocWithFragment);
                } else {
                  console.warn('Unable to complete extractFragment operation');
                }
              },
              style: _extends({}, styleConfig.styles.actionButtonStyle) },
            React.createElement(
              'span',
              null,
              '…'
            )
          )
        ),
        selection && args.length ? React.createElement(
          'div',
          {
            style: { marginLeft: 16 },
            className: 'graphiql-explorer-graphql-arguments' },
          args.map(function (arg) {
            return React.createElement(ArgView, {
              key: arg.name,
              parentField: field,
              arg: arg,
              selection: selection,
              modifyArguments: _this11._setArguments,
              getDefaultScalarArgValue: _this11.props.getDefaultScalarArgValue,
              makeDefaultArg: _this11.props.makeDefaultArg,
              onRunOperation: _this11.props.onRunOperation,
              styleConfig: _this11.props.styleConfig,
              onCommit: _this11.props.onCommit,
              definition: _this11.props.definition
            });
          })
        ) : null
      );

      if (selection && ((0, _graphql.isObjectType)(type) || (0, _graphql.isInterfaceType)(type) || (0, _graphql.isUnionType)(type))) {
        var _fields4 = (0, _graphql.isUnionType)(type) ? {} : type.getFields();
        var childSelections = selection ? selection.selectionSet ? selection.selectionSet.selections : [] : [];
        return React.createElement(
          'div',
          { className: 'graphiql-explorer-' + field.name },
          node,
          React.createElement(
            'div',
            { style: { marginLeft: 16 } },
            !!applicableFragments ? applicableFragments.map(function (fragment) {
              var type = schema.getType(fragment.typeCondition.name.value);
              var fragmentName = fragment.name.value;
              return !type ? null : React.createElement(FragmentView, {
                key: fragmentName,
                fragment: fragment,
                selections: childSelections,
                modifySelections: _this11._modifyChildSelections,
                schema: schema,
                styleConfig: _this11.props.styleConfig,
                onCommit: _this11.props.onCommit
              });
            }) : null,
            Object.keys(_fields4).sort().map(function (fieldName) {
              return React.createElement(FieldView, {
                key: fieldName,
                field: _fields4[fieldName],
                selections: childSelections,
                modifySelections: _this11._modifyChildSelections,
                schema: schema,
                getDefaultFieldNames: getDefaultFieldNames,
                getDefaultScalarArgValue: _this11.props.getDefaultScalarArgValue,
                makeDefaultArg: _this11.props.makeDefaultArg,
                onRunOperation: _this11.props.onRunOperation,
                styleConfig: _this11.props.styleConfig,
                onCommit: _this11.props.onCommit,
                definition: _this11.props.definition,
                availableFragments: _this11.props.availableFragments
              });
            }),
            (0, _graphql.isInterfaceType)(type) || (0, _graphql.isUnionType)(type) ? schema.getPossibleTypes(type).map(function (type) {
              return React.createElement(AbstractView, {
                key: type.name,
                implementingType: type,
                selections: childSelections,
                modifySelections: _this11._modifyChildSelections,
                schema: schema,
                getDefaultFieldNames: getDefaultFieldNames,
                getDefaultScalarArgValue: _this11.props.getDefaultScalarArgValue,
                makeDefaultArg: _this11.props.makeDefaultArg,
                onRunOperation: _this11.props.onRunOperation,
                styleConfig: _this11.props.styleConfig,
                onCommit: _this11.props.onCommit,
                definition: _this11.props.definition
              });
            }) : null
          )
        );
      }
      return node;
    }
  }]);

  return FieldView;
}(React.PureComponent);

function parseQuery(text) {
  try {
    if (!text.trim()) {
      return null;
    }
    return (0, _graphql.parse)(text,
    // Tell graphql to not bother track locations when parsing, we don't need
    // it and it's a tiny bit more expensive.
    { noLocation: true });
  } catch (e) {
    return new Error(e);
  }
}

var DEFAULT_OPERATION = {
  kind: 'OperationDefinition',
  operation: 'query',
  variableDefinitions: [],
  name: { kind: 'Name', value: 'MyQuery' },
  directives: [],
  selectionSet: {
    kind: 'SelectionSet',
    selections: []
  }
};
var DEFAULT_DOCUMENT = {
  kind: 'Document',
  definitions: [DEFAULT_OPERATION]
};
var parseQueryMemoize = null;
function memoizeParseQuery(query) {
  if (parseQueryMemoize && parseQueryMemoize[0] === query) {
    return parseQueryMemoize[1];
  } else {
    var result = parseQuery(query);
    if (!result) {
      return DEFAULT_DOCUMENT;
    } else if (result instanceof Error) {
      if (parseQueryMemoize) {
        // Most likely a temporarily invalid query while they type
        return parseQueryMemoize[1];
      } else {
        return DEFAULT_DOCUMENT;
      }
    } else {
      parseQueryMemoize = [query, result];
      return result;
    }
  }
}

var defaultStyles = {
  buttonStyle: {
    fontSize: '1.2em',
    padding: '0px',
    backgroundColor: 'white',
    border: 'none',
    margin: '5px 0px',
    height: '40px',
    width: '100%',
    display: 'block',
    maxWidth: 'none'
  },

  actionButtonStyle: {
    padding: '0px',
    backgroundColor: 'white',
    border: 'none',
    margin: '0px',
    maxWidth: 'none',
    height: '15px',
    width: '15px',
    display: 'inline-block',
    fontSize: 'smaller'
  },

  explorerActionsStyle: {
    margin: '4px -8px -8px',
    paddingLeft: '8px',
    bottom: '0px',
    width: '100%',
    textAlign: 'center',
    background: 'none',
    borderTop: 'none',
    borderBottom: 'none'
  }
};

var RootView = function (_React$PureComponent8) {
  _inherits(RootView, _React$PureComponent8);

  function RootView() {
    var _ref13;

    var _temp8, _this12, _ret10;

    _classCallCheck(this, RootView);

    for (var _len8 = arguments.length, args = Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
      args[_key8] = arguments[_key8];
    }

    return _ret10 = (_temp8 = (_this12 = _possibleConstructorReturn(this, (_ref13 = RootView.__proto__ || Object.getPrototypeOf(RootView)).call.apply(_ref13, [this].concat(args))), _this12), _this12.state = {
      newOperationType: 'query',
      displayTitleActions: false,
      groupOpenList: []
    }, _this12._modifySelections = function (selections, options) {
      var operationDef = _this12.props.definition;

      if (operationDef.selectionSet.selections.length === 0 && _this12._previousOperationDef) {
        operationDef = _this12._previousOperationDef;
      }

      var newOperationDef = void 0;

      if (operationDef.kind === 'FragmentDefinition') {
        newOperationDef = _extends({}, operationDef, {
          selectionSet: _extends({}, operationDef.selectionSet, {
            selections: selections
          })
        });
      } else if (operationDef.kind === 'OperationDefinition') {
        var cleanedSelections = selections.filter(function (selection) {
          return !(selection.kind === 'Field' && selection.name.value === '__typename');
        });

        if (cleanedSelections.length === 0) {
          cleanedSelections = [{
            kind: 'Field',
            name: {
              kind: 'Name',
              value: '__typename ## Placeholder value'
            }
          }];
        }

        newOperationDef = _extends({}, operationDef, {
          selectionSet: _extends({}, operationDef.selectionSet, {
            selections: cleanedSelections
          })
        });
      }

      return _this12.props.onEdit(newOperationDef, options);
    }, _this12._onOperationRename = function (event) {
      return _this12.props.onOperationRename(event.target.value);
    }, _this12._handlePotentialRun = function (event) {
      if (isRunShortcut(event) && canRunOperation(_this12.props.definition.kind)) {
        _this12.props.onRunOperation(_this12.props.name);
      }
    }, _this12._rootViewElId = function () {
      var _this12$props = _this12.props,
          operationType = _this12$props.operationType,
          name = _this12$props.name;

      var rootViewElId = operationType + '-' + (name || 'unknown');
      return rootViewElId;
    }, _temp8), _possibleConstructorReturn(_this12, _ret10);
  }

  _createClass(RootView, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var rootViewElId = this._rootViewElId();

      this.props.onMount(rootViewElId);
    }
  }, {
    key: 'render',
    value: function render() {
      var _this13 = this;

      var _props7 = this.props,
          operationType = _props7.operationType,
          definition = _props7.definition,
          schema = _props7.schema,
          getDefaultFieldNames = _props7.getDefaultFieldNames,
          _props7$groups = _props7.groups,
          groups = _props7$groups === undefined ? {} : _props7$groups,
          styleConfig = _props7.styleConfig;

      var rootViewElId = this._rootViewElId();

      var fields = this.props.fields || {};
      var operationDef = definition;
      var selections = operationDef.selectionSet.selections;

      var selectionNameList = selections.map(function (s) {
        return s.name.value;
      });
      var operationDisplayName = this.props.name || capitalize(operationType) + ' Name';

      var hasGroups = !!Object.keys(groups).length && operationType in groups;

      var used_names = [];
      var groupList = {};
      var others = {};
      var orderedGroupList = {};

      if (hasGroups) {
        Object.entries(groups[operationType]).forEach(function (_ref14) {
          var _ref15 = _slicedToArray(_ref14, 2),
              key = _ref15[0],
              values = _ref15[1];

          groupList[key] = {};

          values.forEach(function (mutationName) {
            if (mutationName in fields) {
              used_names.push(mutationName);
              groupList[key] = _extends({}, groupList[key], _defineProperty({}, mutationName, fields[mutationName]));
            }
          });
        });

        orderedGroupList = Object.keys(groupList).sort(function (a, b) {
          return a.toLowerCase().localeCompare(b.toLowerCase());
        }).reduce(function (acc, key) {
          acc[key] = groupList[key];
          return acc;
        }, {});

        Object.entries(fields).filter(function (_ref16) {
          var _ref17 = _slicedToArray(_ref16, 1),
              key = _ref17[0];

          return !used_names.includes(key);
        }).forEach(function (_ref18) {
          var _ref19 = _slicedToArray(_ref18, 2),
              key = _ref19[0],
              value = _ref19[1];

          others[key] = value;
        });

        if (Object.keys(others).length) {
          orderedGroupList['Others'] = others;
        }
      }

      return React.createElement(
        'div',
        {
          id: rootViewElId,
          tabIndex: '0',
          onKeyDown: this._handlePotentialRun,
          style: {
            // The actions bar has its own top border
            borderBottom: this.props.isLast ? 'none' : '1px solid #d6d6d6',
            marginBottom: '0em',
            paddingBottom: '1em'
          } },
        React.createElement(
          'div',
          {
            style: { color: styleConfig.colors.keyword, paddingBottom: 4 },
            className: 'graphiql-operation-title-bar',
            onMouseEnter: function onMouseEnter() {
              return _this13.setState({ displayTitleActions: true });
            },
            onMouseLeave: function onMouseLeave() {
              return _this13.setState({ displayTitleActions: false });
            } },
          operationType,
          ' ',
          React.createElement(
            'span',
            { style: { color: styleConfig.colors.def } },
            React.createElement('input', {
              style: {
                color: styleConfig.colors.def,
                border: 'none',
                borderBottom: '1px solid #888',
                outline: 'none',
                width: Math.max(4, operationDisplayName.length) + 'ch'
              },
              autoComplete: 'false',
              placeholder: capitalize(operationType) + ' Name',
              value: this.props.name,
              onKeyDown: this._handlePotentialRun,
              onChange: this._onOperationRename
            })
          ),
          !!this.props.onTypeName && React.createElement(
            'span',
            null,
            React.createElement('br', null),
            'on ' + this.props.onTypeName
          ),
          !!this.state.displayTitleActions && React.createElement(
            'button',
            {
              type: 'submit',
              className: 'toolbar-button',
              onClick: function onClick() {
                return _this13.props.onOperationDestroy();
              },
              style: _extends({}, styleConfig.styles.actionButtonStyle) },
            React.createElement(
              'span',
              null,
              '\u2715'
            )
          )
        ),
        operationType === 'mutation' && hasGroups ? Object.entries(orderedGroupList).map(function (_ref20, index) {
          var _ref21 = _slicedToArray(_ref20, 2),
              groupName = _ref21[0],
              groupFields = _ref21[1];

          var hasSelection = Object.keys(groupFields).some(function (f) {
            return selectionNameList.includes(f);
          });
          var isOpen = _this13.state.groupOpenList.includes(groupName) || hasSelection;

          return React.createElement(
            'div',
            {
              className: 'graphiql-explorer-node',
              key: groupName + '-' + index },
            React.createElement(
              'span',
              {
                style: {
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  minHeight: '16px',
                  WebkitUserSelect: 'none',
                  userSelect: 'none'
                },
                onClick: function onClick() {
                  var groupOpenList = _this13.state.groupOpenList;

                  _this13.setState({
                    groupOpenList: isOpen ? groupOpenList.filter(function (name) {
                      return name !== groupName;
                    }) : [].concat(_toConsumableArray(groupOpenList), [groupName])
                  });
                } },
              React.createElement(
                'span',
                null,
                isOpen ? _this13.props.styleConfig.arrowOpen : _this13.props.styleConfig.arrowClosed
              ),
              groupName
            ),
            isOpen && React.createElement(
              'div',
              {
                style: { marginLeft: 16, marginBottom: 8 },
                className: 'graphiql-explorer-graphql-arguments' },
              Object.keys(groupFields).sort().map(function (fieldName) {
                return React.createElement(FieldView, {
                  key: fieldName,
                  field: groupFields[fieldName],
                  selections: selections,
                  modifySelections: _this13._modifySelections,
                  schema: schema,
                  getDefaultFieldNames: getDefaultFieldNames,
                  getDefaultScalarArgValue: _this13.props.getDefaultScalarArgValue,
                  makeDefaultArg: _this13.props.makeDefaultArg,
                  onRunOperation: _this13.props.onRunOperation,
                  styleConfig: _this13.props.styleConfig,
                  onCommit: _this13.props.onCommit,
                  definition: _this13.props.definition,
                  availableFragments: _this13.props.availableFragments
                });
              })
            )
          );
        }) : Object.keys(fields).sort().map(function (fieldName) {
          return React.createElement(FieldView, {
            key: fieldName,
            field: fields[fieldName],
            selections: selections,
            modifySelections: _this13._modifySelections,
            schema: schema,
            getDefaultFieldNames: getDefaultFieldNames,
            getDefaultScalarArgValue: _this13.props.getDefaultScalarArgValue,
            makeDefaultArg: _this13.props.makeDefaultArg,
            onRunOperation: _this13.props.onRunOperation,
            styleConfig: _this13.props.styleConfig,
            onCommit: _this13.props.onCommit,
            definition: _this13.props.definition,
            availableFragments: _this13.props.availableFragments
          });
        })
      );
    }
  }]);

  return RootView;
}(React.PureComponent);

function Attribution() {
  return React.createElement(
    'div',
    {
      style: {
        fontFamily: 'sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        margin: '1em',
        marginTop: 0,
        flexGrow: 1,
        justifyContent: 'flex-end'
      } },
    React.createElement(
      'div',
      {
        style: {
          borderTop: '1px solid #d6d6d6',
          paddingTop: '1em',
          width: '100%',
          textAlign: 'center'
        } },
      'GraphiQL Explorer by ',
      React.createElement(
        'a',
        { href: 'https://www.onegraph.com' },
        'OneGraph'
      )
    ),
    React.createElement(
      'div',
      null,
      'Contribute on',
      ' ',
      React.createElement(
        'a',
        { href: 'https://github.com/OneGraph/graphiql-explorer' },
        'GitHub'
      )
    )
  );
}

var Explorer = function (_React$PureComponent9) {
  _inherits(Explorer, _React$PureComponent9);

  function Explorer() {
    var _ref22;

    var _temp9, _this14, _ret11;

    _classCallCheck(this, Explorer);

    for (var _len9 = arguments.length, args = Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
      args[_key9] = arguments[_key9];
    }

    return _ret11 = (_temp9 = (_this14 = _possibleConstructorReturn(this, (_ref22 = Explorer.__proto__ || Object.getPrototypeOf(Explorer)).call.apply(_ref22, [this].concat(args))), _this14), _this14.state = {
      newOperationType: 'query',
      operation: null,
      operationToScrollTo: null
    }, _this14._resetScroll = function () {
      var container = _this14._ref;
      if (container) {
        container.scrollLeft = 0;
      }
    }, _this14._onEdit = function (query) {
      return _this14.props.onEdit(query);
    }, _this14._setAddOperationType = function (value) {
      _this14.setState({ newOperationType: value });
    }, _this14._handleRootViewMount = function (rootViewElId) {
      if (!!_this14.state.operationToScrollTo && _this14.state.operationToScrollTo === rootViewElId) {
        var selector = '.graphiql-explorer-root #' + rootViewElId;

        var el = document.querySelector(selector);
        el && el.scrollIntoView();
      }
    }, _temp9), _possibleConstructorReturn(_this14, _ret11);
  }

  _createClass(Explorer, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this._resetScroll();
    }
  }, {
    key: 'render',
    value: function render() {
      var _this15 = this;

      var _props8 = this.props,
          schema = _props8.schema,
          query = _props8.query,
          makeDefaultArg = _props8.makeDefaultArg;


      if (!schema) {
        return React.createElement(
          'div',
          { style: { fontFamily: 'sans-serif' }, className: 'error-container' },
          'No Schema Available'
        );
      }
      var styleConfig = {
        colors: this.props.colors || defaultColors,
        checkboxChecked: this.props.checkboxChecked || defaultCheckboxChecked,
        checkboxUnchecked: this.props.checkboxUnchecked || defaultCheckboxUnchecked,
        arrowClosed: this.props.arrowClosed || defaultArrowClosed,
        arrowOpen: this.props.arrowOpen || defaultArrowOpen,
        styles: this.props.styles ? _extends({}, defaultStyles, this.props.styles) : defaultStyles
      };
      var queryType = schema.getQueryType();
      var mutationType = schema.getMutationType();
      var subscriptionType = schema.getSubscriptionType();
      if (!queryType && !mutationType && !subscriptionType) {
        return React.createElement(
          'div',
          null,
          'Missing query type'
        );
      }
      var queryFields = queryType && queryType.getFields();
      var mutationFields = mutationType && mutationType.getFields();
      var subscriptionFields = subscriptionType && subscriptionType.getFields();

      var parsedQuery = memoizeParseQuery(query);
      var getDefaultFieldNames = this.props.getDefaultFieldNames || defaultGetDefaultFieldNames;
      var getDefaultScalarArgValue = this.props.getDefaultScalarArgValue || defaultGetDefaultScalarArgValue;

      var definitions = parsedQuery.definitions;

      var _relevantOperations = definitions.map(function (definition) {
        if (definition.kind === 'FragmentDefinition') {
          return definition;
        } else if (definition.kind === 'OperationDefinition') {
          return definition;
        } else {
          return null;
        }
      }).filter(Boolean);

      var relevantOperations =
      // If we don't have any relevant definitions from the parsed document,
      // then at least show an expanded Query selection
      _relevantOperations.length === 0 ? DEFAULT_DOCUMENT.definitions : _relevantOperations;

      var renameOperation = function renameOperation(targetOperation, name) {
        var newName = name == null || name === '' ? null : { kind: 'Name', value: name, loc: undefined };
        var newOperation = _extends({}, targetOperation, { name: newName });

        var existingDefs = parsedQuery.definitions;

        var newDefinitions = existingDefs.map(function (existingOperation) {
          if (targetOperation === existingOperation) {
            return newOperation;
          } else {
            return existingOperation;
          }
        });

        return _extends({}, parsedQuery, {
          definitions: newDefinitions
        });
      };

      var cloneOperation = function cloneOperation(targetOperation) {
        var kind = void 0;
        if (targetOperation.kind === 'FragmentDefinition') {
          kind = 'fragment';
        } else {
          kind = targetOperation.operation;
        }

        var newOperationName = (targetOperation.name && targetOperation.name.value || '') + 'Copy';

        var newName = {
          kind: 'Name',
          value: newOperationName,
          loc: undefined
        };

        var newOperation = _extends({}, targetOperation, { name: newName });

        var existingDefs = parsedQuery.definitions;

        var newDefinitions = [].concat(_toConsumableArray(existingDefs), [newOperation]);

        _this15.setState({ operationToScrollTo: kind + '-' + newOperationName });

        return _extends({}, parsedQuery, {
          definitions: newDefinitions
        });
      };

      var destroyOperation = function destroyOperation(targetOperation) {
        var existingDefs = parsedQuery.definitions;

        var newDefinitions = existingDefs.filter(function (existingOperation) {
          if (targetOperation === existingOperation) {
            return false;
          } else {
            return true;
          }
        });

        return _extends({}, parsedQuery, {
          definitions: newDefinitions
        });
      };

      var addOperation = function addOperation(kind) {
        var existingDefs = parsedQuery.definitions;

        var viewingDefaultOperation = parsedQuery.definitions.length === 1 && parsedQuery.definitions[0] === DEFAULT_DOCUMENT.definitions[0];

        var MySiblingDefs = viewingDefaultOperation ? [] : existingDefs.filter(function (def) {
          if (def.kind === 'OperationDefinition') {
            return def.operation === kind;
          } else {
            // Don't support adding fragments from explorer
            return false;
          }
        });

        var newOperationName = 'My' + capitalize(kind) + (MySiblingDefs.length === 0 ? '' : MySiblingDefs.length + 1);

        // Add this as the default field as it guarantees a valid selectionSet
        var firstFieldName = '__typename # Placeholder value';

        var selectionSet = {
          kind: 'SelectionSet',
          selections: [{
            kind: 'Field',
            name: {
              kind: 'Name',
              value: firstFieldName,
              loc: null
            },
            arguments: [],
            directives: [],
            selectionSet: null,
            loc: null
          }],
          loc: null
        };

        var newDefinition = {
          kind: 'OperationDefinition',
          operation: kind,
          name: { kind: 'Name', value: newOperationName },
          variableDefinitions: [],
          directives: [],
          selectionSet: selectionSet,
          loc: null
        };

        var newDefinitions =
        // If we only have our default operation in the document right now, then
        // just replace it with our new definition
        viewingDefaultOperation ? [newDefinition] : [].concat(_toConsumableArray(parsedQuery.definitions), [newDefinition]);

        var newOperationDef = _extends({}, parsedQuery, {
          definitions: newDefinitions
        });

        _this15.setState({ operationToScrollTo: kind + '-' + newOperationName });

        _this15.props.onEdit((0, _graphql.print)(newOperationDef));
      };

      var actionsOptions = [!!queryFields ? React.createElement(
        'option',
        {
          key: 'query',
          className: 'toolbar-button',
          style: styleConfig.styles.buttonStyle,
          type: 'link',
          value: 'query' },
        'Query'
      ) : null, !!mutationFields ? React.createElement(
        'option',
        {
          key: 'mutation',
          className: 'toolbar-button',
          style: styleConfig.styles.buttonStyle,
          type: 'link',
          value: 'mutation' },
        'Mutation'
      ) : null, !!subscriptionFields ? React.createElement(
        'option',
        {
          key: 'subscription',
          className: 'toolbar-button',
          style: styleConfig.styles.buttonStyle,
          type: 'link',
          value: 'subscription' },
        'Subscription'
      ) : null].filter(Boolean);

      var actionsEl = actionsOptions.length === 0 || this.props.hideActions ? null : React.createElement(
        'div',
        {
          style: {
            minHeight: '50px',
            maxHeight: '50px',
            overflow: 'none'
          } },
        React.createElement(
          'form',
          {
            className: 'variable-editor-title graphiql-explorer-actions',
            style: _extends({}, styleConfig.styles.explorerActionsStyle, {
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              borderTop: '1px solid rgb(214, 214, 214)'
            }),
            onSubmit: function onSubmit(event) {
              return event.preventDefault();
            } },
          React.createElement(
            'span',
            {
              style: {
                display: 'inline-block',
                flexGrow: '0',
                textAlign: 'right'
              } },
            'Add new',
            ' '
          ),
          React.createElement(
            'select',
            {
              onChange: function onChange(event) {
                return _this15._setAddOperationType(event.target.value);
              },
              value: this.state.newOperationType,
              style: { flexGrow: '2' } },
            actionsOptions
          ),
          React.createElement(
            'button',
            {
              type: 'submit',
              className: 'toolbar-button',
              onClick: function onClick() {
                return _this15.state.newOperationType ? addOperation(_this15.state.newOperationType) : null;
              },
              style: _extends({}, styleConfig.styles.buttonStyle, {
                height: '22px',
                width: '22px'
              }) },
            React.createElement(
              'span',
              null,
              '+'
            )
          )
        )
      );

      var externalFragments = this.props.externalFragments && this.props.externalFragments.reduce(function (acc, fragment) {
        if (fragment.kind === 'FragmentDefinition') {
          var fragmentTypeName = fragment.typeCondition.name.value;
          var existingFragmentsForType = acc[fragmentTypeName] || [];
          var newFragmentsForType = [].concat(_toConsumableArray(existingFragmentsForType), [fragment]).sort(function (a, b) {
            return a.name.value.localeCompare(b.name.value);
          });
          return _extends({}, acc, _defineProperty({}, fragmentTypeName, newFragmentsForType));
        }

        return acc;
      }, {});

      var documentFragments = relevantOperations.reduce(function (acc, operation) {
        if (operation.kind === 'FragmentDefinition') {
          var fragmentTypeName = operation.typeCondition.name.value;
          var existingFragmentsForType = acc[fragmentTypeName] || [];
          var newFragmentsForType = [].concat(_toConsumableArray(existingFragmentsForType), [operation]).sort(function (a, b) {
            return a.name.value.localeCompare(b.name.value);
          });
          return _extends({}, acc, _defineProperty({}, fragmentTypeName, newFragmentsForType));
        }

        return acc;
      }, {});

      var availableFragments = _extends({}, documentFragments, externalFragments);

      var attribution = this.props.showAttribution ? React.createElement(Attribution, null) : null;

      return React.createElement(
        'div',
        {
          ref: function ref(_ref23) {
            _this15._ref = _ref23;
          },
          style: {
            fontSize: 12,
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            margin: 0,
            padding: 8,
            fontFamily: 'Consolas, Inconsolata, "Droid Sans Mono", Monaco, monospace',
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          },
          className: 'graphiql-explorer-root' },
        React.createElement(
          'div',
          {
            style: {
              flexGrow: '1',
              overflow: 'scroll'
            } },
          relevantOperations.map(function (operation, index) {
            var operationName = operation && operation.name && operation.name.value;

            var operationType = operation.kind === 'FragmentDefinition' ? 'fragment' : operation && operation.operation || 'query';

            var onOperationRename = function onOperationRename(newName) {
              var newOperationDef = renameOperation(operation, newName);
              _this15.props.onEdit((0, _graphql.print)(newOperationDef));
            };

            var onOperationClone = function onOperationClone() {
              var newOperationDef = cloneOperation(operation);
              _this15.props.onEdit((0, _graphql.print)(newOperationDef));
            };

            var onOperationDestroy = function onOperationDestroy() {
              var newOperationDef = destroyOperation(operation);
              _this15.props.onEdit((0, _graphql.print)(newOperationDef));
            };

            var fragmentType = operation.kind === 'FragmentDefinition' && operation.typeCondition.kind === 'NamedType' && schema.getType(operation.typeCondition.name.value);

            var fragmentFields = fragmentType instanceof _graphql.GraphQLObjectType ? fragmentType.getFields() : null;

            var fields = operationType === 'query' ? queryFields : operationType === 'mutation' ? mutationFields : operationType === 'subscription' ? subscriptionFields : operation.kind === 'FragmentDefinition' ? fragmentFields : null;

            var fragmentTypeName = operation.kind === 'FragmentDefinition' ? operation.typeCondition.name.value : null;

            var onCommit = function onCommit(parsedDocument) {
              var textualNewDocument = (0, _graphql.print)(parsedDocument);

              _this15.props.onEdit(textualNewDocument);
            };

            return React.createElement(RootView, {
              key: index,
              isLast: index === relevantOperations.length - 1,
              fields: fields,
              operationType: operationType,
              name: operationName,
              definition: operation,
              onOperationRename: onOperationRename,
              onOperationDestroy: onOperationDestroy,
              onOperationClone: onOperationClone,
              groups: _this15.props.groups,
              onTypeName: fragmentTypeName,
              onMount: _this15._handleRootViewMount,
              onCommit: onCommit,
              onEdit: function onEdit(newDefinition, options) {
                var commit = void 0;
                if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object' && typeof options.commit !== 'undefined') {
                  commit = options.commit;
                } else {
                  commit = true;
                }

                if (!!newDefinition) {
                  var newQuery = _extends({}, parsedQuery, {
                    definitions: parsedQuery.definitions.map(function (existingDefinition) {
                      return existingDefinition === operation ? newDefinition : existingDefinition;
                    })
                  });

                  if (commit) {
                    onCommit(newQuery);
                    return newQuery;
                  } else {
                    return newQuery;
                  }
                } else {
                  return parsedQuery;
                }
              },
              schema: schema,
              getDefaultFieldNames: getDefaultFieldNames,
              getDefaultScalarArgValue: getDefaultScalarArgValue,
              makeDefaultArg: makeDefaultArg,
              onRunOperation: function onRunOperation() {
                if (!!_this15.props.onRunOperation) {
                  _this15.props.onRunOperation(operationName);
                }
              },
              styleConfig: styleConfig,
              availableFragments: availableFragments
            });
          }),
          attribution
        ),
        actionsEl
      );
    }
  }]);

  return Explorer;
}(React.PureComponent);

Explorer.defaultProps = {
  getDefaultFieldNames: defaultGetDefaultFieldNames,
  getDefaultScalarArgValue: defaultGetDefaultScalarArgValue
};

var ErrorBoundary = function (_React$Component) {
  _inherits(ErrorBoundary, _React$Component);

  function ErrorBoundary() {
    var _ref24;

    var _temp10, _this16, _ret12;

    _classCallCheck(this, ErrorBoundary);

    for (var _len10 = arguments.length, args = Array(_len10), _key10 = 0; _key10 < _len10; _key10++) {
      args[_key10] = arguments[_key10];
    }

    return _ret12 = (_temp10 = (_this16 = _possibleConstructorReturn(this, (_ref24 = ErrorBoundary.__proto__ || Object.getPrototypeOf(ErrorBoundary)).call.apply(_ref24, [this].concat(args))), _this16), _this16.state = { hasError: false, error: null, errorInfo: null }, _temp10), _possibleConstructorReturn(_this16, _ret12);
  }

  _createClass(ErrorBoundary, [{
    key: 'componentDidCatch',
    value: function componentDidCatch(error, errorInfo) {
      this.setState({ hasError: true, error: error, errorInfo: errorInfo });
      console.error('Error in component', error, errorInfo);
    }
  }, {
    key: 'render',
    value: function render() {
      if (this.state.hasError) {
        return React.createElement(
          'div',
          { style: { padding: 18, fontFamily: 'sans-serif' } },
          React.createElement(
            'div',
            null,
            'Something went wrong'
          ),
          React.createElement(
            'details',
            { style: { whiteSpace: 'pre-wrap' } },
            this.state.error ? this.state.error.toString() : null,
            React.createElement('br', null),
            this.state.errorInfo ? this.state.errorInfo.componentStack : null
          )
        );
      }
      return this.props.children;
    }
  }]);

  return ErrorBoundary;
}(React.Component);

var ExplorerWrapper = function (_React$PureComponent10) {
  _inherits(ExplorerWrapper, _React$PureComponent10);

  function ExplorerWrapper() {
    _classCallCheck(this, ExplorerWrapper);

    return _possibleConstructorReturn(this, (ExplorerWrapper.__proto__ || Object.getPrototypeOf(ExplorerWrapper)).apply(this, arguments));
  }

  _createClass(ExplorerWrapper, [{
    key: 'render',
    value: function render() {
      return React.createElement(
        'div',
        {
          className: 'docExplorerWrap',
          style: {
            height: '100%',
            width: this.props.width,
            minWidth: this.props.width,
            zIndex: 7,
            display: this.props.explorerIsOpen ? 'flex' : 'none',
            flexDirection: 'column',
            overflow: 'hidden'
          } },
        React.createElement(
          'div',
          { className: 'doc-explorer-title-bar' },
          React.createElement(
            'div',
            { className: 'doc-explorer-title' },
            this.props.title
          ),
          React.createElement(
            'div',
            { className: 'doc-explorer-rhs' },
            React.createElement(
              'div',
              {
                className: 'docExplorerHide',
                onClick: this.props.onToggleExplorer },
              '\u2715'
            )
          )
        ),
        React.createElement(
          'div',
          {
            className: 'doc-explorer-contents',
            style: {
              padding: '0px',
              /* Unset overflowY since docExplorerWrap sets it and it'll
              cause two scrollbars (one for the container and one for the schema tree) */
              overflowY: 'unset'
            } },
          React.createElement(
            ErrorBoundary,
            null,
            React.createElement(Explorer, this.props)
          )
        )
      );
    }
  }]);

  return ExplorerWrapper;
}(React.PureComponent);

ExplorerWrapper.defaultValue = defaultValue;
ExplorerWrapper.defaultProps = {
  width: 320,
  title: 'Explorer'
};
exports.default = ExplorerWrapper;