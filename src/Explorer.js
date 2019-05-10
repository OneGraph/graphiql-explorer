// @flow

// TODO: 1. Add default fields recursively
// TODO: 2. Add default fields for all selections (not just fragments)
// TODO: 3. Add stylesheet and remove inline styles
// TODO: 4. Indication of when query in explorer diverges from query in editor pane
// TODO: 5. Separate section for deprecated args, with support for 'beta' fields
// TODO: 6. Custom default arg fields

// Note: Attempted 1. and 2., but they were more annoying than helpful

import React from 'react';

import {
  getNamedType,
  GraphQLObjectType,
  isEnumType,
  isInputObjectType,
  isInterfaceType,
  isLeafType,
  isNonNullType,
  isObjectType,
  isRequiredInputField,
  isScalarType,
  isUnionType,
  isWrappingType,
  parse,
  print,
} from 'graphql';

import type {
  ArgumentNode,
  DocumentNode,
  FieldNode,
  GraphQLArgument,
  GraphQLEnumType,
  GraphQLField,
  GraphQLFieldMap,
  GraphQLInputField,
  GraphQLInputType,
  GraphQLOutputType,
  GraphQLScalarType,
  GraphQLSchema,
  InlineFragmentNode,
  FragmentDefinitionNode,
  OperationDefinitionNode,
  ObjectFieldNode,
  ObjectValueNode,
  SelectionNode,
  SelectionSetNode,
  ValueNode,
} from 'graphql';

type Field = GraphQLField<any, any>;

type GetDefaultScalarArgValue = (
  parentField: Field,
  arg: GraphQLArgument | GraphQLInputField,
  underlyingArgType: GraphQLEnumType | GraphQLScalarType,
) => ValueNode;

type MakeDefaultArg = (
  parentField: Field,
  arg: GraphQLArgument | GraphQLInputField,
) => boolean;

type Props = {
  query: string,
  width?: number,
  schema?: ?GraphQLSchema,
  onEdit: string => void,
  getDefaultFieldNames?: ?(type: GraphQLObjectType) => Array<string>,
  getDefaultScalarArgValue?: ?GetDefaultScalarArgValue,
  makeDefaultArg?: ?MakeDefaultArg,
  onToggleExplorer: () => void,
  explorerIsOpen: boolean,
};

type State = {|
  operation: OperationDefinitionNode,
|};

type Selections = $ReadOnlyArray<SelectionNode>;

function defaultGetDefaultFieldNames(type: GraphQLObjectType): Array<string> {
  const fields = type.getFields();

  // Is there an `id` field?
  if (fields['id']) {
    const res = ['id'];
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
  const leafFieldNames = [];
  Object.keys(fields).forEach(fieldName => {
    if (isLeafType(fields[fieldName].type)) {
      leafFieldNames.push(fieldName);
    }
  });
  return leafFieldNames.slice(0, 2); // Prevent too many fields from being added
}

function isRequiredArgument(arg: GraphQLArgument): boolean %checks {
  return isNonNullType(arg.type) && arg.defaultValue === undefined;
}

function unwrapOutputType(outputType: GraphQLOutputType): * {
  let unwrappedType = outputType;
  while (isWrappingType(unwrappedType)) {
    unwrappedType = unwrappedType.ofType;
  }
  return unwrappedType;
}

function unwrapInputType(inputType: GraphQLInputType): * {
  let unwrappedType = inputType;
  while (isWrappingType(unwrappedType)) {
    unwrappedType = unwrappedType.ofType;
  }
  return unwrappedType;
}

function coerceArgValue(
  argType: GraphQLScalarType | GraphQLEnumType,
  value: string,
): ValueNode {
  if (isScalarType(argType)) {
    try {
      switch (argType.name) {
        case 'String':
          return {
            kind: 'StringValue',
            value: String(argType.parseValue(value)),
          };
        case 'Float':
          return {
            kind: 'FloatValue',
            value: String(argType.parseValue(parseFloat(value))),
          };
        case 'Int':
          return {
            kind: 'IntValue',
            value: String(argType.parseValue(parseInt(value, 10))),
          };
        case 'Boolean':
          try {
            const parsed = JSON.parse(value);
            if (typeof parsed === 'boolean') {
              return {kind: 'BooleanValue', value: parsed};
            } else {
              return {kind: 'BooleanValue', value: false};
            }
          } catch (e) {
            return {
              kind: 'BooleanValue',
              value: false,
            };
          }
        default:
          return {
            kind: 'StringValue',
            value: String(argType.parseValue(value)),
          };
      }
    } catch (e) {
      console.error('error coercing arg value', e, value);
      return {kind: 'StringValue', value: value};
    }
  } else {
    try {
      const parsedValue = argType.parseValue(value);
      if (parsedValue) {
        return {kind: 'EnumValue', value: String(parsedValue)};
      } else {
        return {kind: 'EnumValue', value: argType.getValues()[0].name};
      }
    } catch (e) {
      return {kind: 'EnumValue', value: argType.getValues()[0].name};
    }
  }
}

type InputArgViewProps = {|
  arg: GraphQLArgument,
  selection: ObjectValueNode,
  parentField: Field,
  modifyFields: (fields: $ReadOnlyArray<ObjectFieldNode>) => void,
  getDefaultScalarArgValue: GetDefaultScalarArgValue,
  makeDefaultArg: ?MakeDefaultArg,
|};

class InputArgView extends React.PureComponent<InputArgViewProps, {}> {
  _previousArgSelection: ?ObjectFieldNode;
  _getArgSelection = () => {
    return this.props.selection.fields.find(
      field => field.name.value === this.props.arg.name,
    );
  };

  _removeArg = () => {
    const {selection} = this.props;
    const argSelection = this._getArgSelection();
    this._previousArgSelection = argSelection;
    this.props.modifyFields(
      selection.fields.filter(field => field !== argSelection),
    );
  };

  _addArg = () => {
    const {
      selection,
      arg,
      getDefaultScalarArgValue,
      parentField,
      makeDefaultArg,
    } = this.props;
    const argType = unwrapInputType(arg.type);

    let argSelection = null;
    if (this._previousArgSelection) {
      argSelection = this._previousArgSelection;
    } else if (isInputObjectType(argType)) {
      const fields = argType.getFields();
      argSelection = {
        kind: 'ObjectField',
        name: {kind: 'Name', value: arg.name},
        value: {
          kind: 'ObjectValue',
          fields: defaultInputObjectFields(
            getDefaultScalarArgValue,
            makeDefaultArg,
            parentField,
            Object.keys(fields).map(k => fields[k]),
          ),
        },
      };
    } else if (isLeafType(argType)) {
      argSelection = {
        kind: 'ObjectField',
        name: {kind: 'Name', value: arg.name},
        value: getDefaultScalarArgValue(parentField, arg, argType),
      };
    }

    if (!argSelection) {
      console.error('Unable to add arg for argType', argType);
    } else {
      this.props.modifyFields([...(selection.fields || []), argSelection]);
    }
  };

  _setArgValue = event => {
    const {selection} = this.props;
    const argSelection = this._getArgSelection();
    if (!argSelection) {
      console.error('missing arg selection when setting arg value');
      return;
    }
    const argType = unwrapInputType(this.props.arg.type);
    if (!isLeafType(argType)) {
      console.warn('Unable to handle non leaf types in setArgValue');
      return;
    }
    const targetValue = event.target.value;

    this.props.modifyFields(
      (selection.fields || []).map(field =>
        field === argSelection
          ? {
              ...field,
              value: coerceArgValue(argType, targetValue),
            }
          : field,
      ),
    );
  };

  _modifyChildFields = fields => {
    this.props.modifyFields(
      this.props.selection.fields.map(field =>
        field.name.value === this.props.arg.name
          ? {
              ...field,
              value: {
                kind: 'ObjectValue',
                fields: fields,
              },
            }
          : field,
      ),
    );
  };

  render() {
    const {arg, parentField} = this.props;
    const argSelection = this._getArgSelection();

    return (
      <AbstractArgView
        argValue={argSelection ? argSelection.value : null}
        arg={arg}
        parentField={parentField}
        addArg={this._addArg}
        removeArg={this._removeArg}
        setArgFields={this._modifyChildFields}
        setArgValue={this._setArgValue}
        getDefaultScalarArgValue={this.props.getDefaultScalarArgValue}
        makeDefaultArg={this.props.makeDefaultArg}
      />
    );
  }
}

type ArgViewProps = {|
  parentField: Field,
  arg: GraphQLArgument,
  selection: FieldNode,
  modifyArguments: (argumentNodes: $ReadOnlyArray<ArgumentNode>) => void,
  getDefaultScalarArgValue: GetDefaultScalarArgValue,
  makeDefaultArg: ?MakeDefaultArg,
|};

type ArgViewState = {||};

export function defaultValue(
  argType: GraphQLEnumType | GraphQLScalarType,
): ValueNode {
  if (isEnumType(argType)) {
    return {kind: 'EnumValue', value: argType.getValues()[0].name};
  } else {
    switch (argType.name) {
      case 'String':
        return {kind: 'StringValue', value: ''};
      case 'Float':
        return {kind: 'FloatValue', value: '1.5'};
      case 'Int':
        return {kind: 'IntValue', value: '10'};
      case 'Boolean':
        return {kind: 'BooleanValue', value: false};
      default:
        return {kind: 'StringValue', value: ''};
    }
  }
}

function defaultGetDefaultScalarArgValue(
  parentField: Field,
  arg: GraphQLArgument | GraphQLInputField,
  argType: GraphQLEnumType | GraphQLScalarType,
): ValueNode {
  return defaultValue(argType);
}

class ArgView extends React.PureComponent<ArgViewProps, ArgViewState> {
  _previousArgSelection: ?ArgumentNode;
  _getArgSelection = () => {
    const {selection} = this.props;

    return (selection.arguments || []).find(
      arg => arg.name.value === this.props.arg.name,
    );
  };
  _removeArg = () => {
    const {selection} = this.props;
    const argSelection = this._getArgSelection();
    this._previousArgSelection = argSelection;
    this.props.modifyArguments(
      (selection.arguments || []).filter(arg => arg !== argSelection),
    );
  };
  _addArg = () => {
    const {
      selection,
      getDefaultScalarArgValue,
      makeDefaultArg,
      parentField,
      arg,
    } = this.props;
    const argType = unwrapInputType(arg.type);

    let argSelection = null;
    if (this._previousArgSelection) {
      argSelection = this._previousArgSelection;
    } else if (isInputObjectType(argType)) {
      const fields = argType.getFields();
      argSelection = {
        kind: 'Argument',
        name: {kind: 'Name', value: arg.name},
        value: {
          kind: 'ObjectValue',
          fields: defaultInputObjectFields(
            getDefaultScalarArgValue,
            makeDefaultArg,
            parentField,
            Object.keys(fields).map(k => fields[k]),
          ),
        },
      };
    } else if (isLeafType(argType)) {
      argSelection = {
        kind: 'Argument',
        name: {kind: 'Name', value: arg.name},
        value: getDefaultScalarArgValue(parentField, arg, argType),
      };
    }

    if (!argSelection) {
      console.error('Unable to add arg for argType', argType);
    } else {
      this.props.modifyArguments([
        ...(selection.arguments || []),
        argSelection,
      ]);
    }
  };
  _setArgValue = event => {
    const {selection} = this.props;
    const argSelection = this._getArgSelection();
    if (!argSelection) {
      console.error('missing arg selection when setting arg value');
      return;
    }
    const argType = unwrapInputType(this.props.arg.type);
    if (!isLeafType(argType)) {
      console.warn('Unable to handle non leaf types in setArgValue');
      return;
    }

    const targetValue = event.target.value;

    this.props.modifyArguments(
      (selection.arguments || []).map(a =>
        a === argSelection
          ? {
              ...a,
              value: coerceArgValue(argType, targetValue),
            }
          : a,
      ),
    );
  };

  _setArgFields = fields => {
    const {selection} = this.props;
    const argSelection = this._getArgSelection();
    if (!argSelection) {
      console.error('missing arg selection when setting arg value');
      return;
    }

    this.props.modifyArguments(
      (selection.arguments || []).map(a =>
        a === argSelection
          ? {
              ...a,
              value: {
                kind: 'ObjectValue',
                fields,
              },
            }
          : a,
      ),
    );
  };

  render() {
    const {arg, parentField} = this.props;
    const argSelection = this._getArgSelection();

    return (
      <AbstractArgView
        argValue={argSelection ? argSelection.value : null}
        arg={arg}
        parentField={parentField}
        addArg={this._addArg}
        removeArg={this._removeArg}
        setArgFields={this._setArgFields}
        setArgValue={this._setArgValue}
        getDefaultScalarArgValue={this.props.getDefaultScalarArgValue}
        makeDefaultArg={this.props.makeDefaultArg}
      />
    );
  }
}

type AbstractArgViewProps = {|
  argValue: ?ValueNode,
  arg: GraphQLArgument,
  parentField: Field,
  setArgValue: (event: SyntheticInputEvent<*>) => void,
  setArgFields: (fields: $ReadOnlyArray<ObjectFieldNode>) => void,
  addArg: () => void,
  removeArg: () => void,
  getDefaultScalarArgValue: GetDefaultScalarArgValue,
  makeDefaultArg: ?MakeDefaultArg,
|};

type ScalarInputProps = {|
  arg: GraphQLArgument,
  argValue: ValueNode,
  setArgValue: (event: SyntheticInputEvent<*>) => void,
|};

class ScalarInput extends React.PureComponent<ScalarInputProps, {}> {
  _ref: ?any;
  _handleChange = event => {
    this.props.setArgValue(event);
  };

  componentDidMount() {
    const input = this._ref;
    const activeElement = document.activeElement;
    if (
      input &&
      activeElement &&
      !(activeElement instanceof HTMLTextAreaElement)
    ) {
      input.focus();
      input.setSelectionRange(0, input.value.length);
    }
  }
  render() {
    const {arg, argValue} = this.props;
    const argType = unwrapInputType(arg.type);
    const color =
      this.props.argValue.kind === 'StringValue' ? '#D64292' : '#2882F9';
    const value = typeof argValue.value === 'string' ? argValue.value : '';
    return (
      <span style={{color}}>
        {argType.name === 'String' ? '"' : ''}
        <input
          style={{
            border: 'none',
            borderBottom: '1px solid #888',
            outline: 'none',
            color,
            width: `${Math.max(1, value.length)}ch`,
          }}
          ref={ref => {
            this._ref = ref;
          }}
          type="text"
          onChange={this._handleChange}
          value={value}
        />
        {argType.name === 'String' ? '"' : ''}
      </span>
    );
  }
}

class AbstractArgView extends React.PureComponent<AbstractArgViewProps, {}> {
  render() {
    const {argValue, arg} = this.props;
    /* TODO: handle List types*/
    const argType = unwrapInputType(arg.type);

    let input = null;
    if (argValue) {
      if (argValue.kind === 'Variable') {
        input = <span style={{color: '#397D13'}}>${argValue.name.value}</span>;
      } else if (isScalarType(argType)) {
        if (argType.name === 'Boolean') {
          input = (
            <select
              style={{backgroundColor: 'white', color: '#D47509'}}
              onChange={this.props.setArgValue}
              value={
                argValue.kind === 'BooleanValue' ? argValue.value : undefined
              }>
              <option key="true" value="true">
                true
              </option>
              <option key="false" value="false">
                false
              </option>
            </select>
          );
        } else {
          input = (
            <ScalarInput
              setArgValue={this.props.setArgValue}
              arg={arg}
              argValue={argValue}
            />
          );
        }
      } else if (isEnumType(argType)) {
        if (argValue.kind === 'EnumValue') {
          input = (
            <select
              style={{backgroundColor: 'white', color: '#0B7FC7'}}
              onChange={this.props.setArgValue}
              value={argValue.value}>
              {argType.getValues().map(value => (
                <option key={value.name} value={value.name}>
                  {value.name}
                </option>
              ))}
            </select>
          );
        } else {
          console.error(
            'arg mismatch between arg and selection',
            argType,
            argValue,
          );
        }
      } else if (isInputObjectType(argType)) {
        if (argValue.kind === 'ObjectValue') {
          const fields = argType.getFields();
          input = (
            <div style={{marginLeft: 16}}>
              {Object.keys(fields).map(fieldName => (
                <InputArgView
                  key={fieldName}
                  arg={fields[fieldName]}
                  parentField={this.props.parentField}
                  selection={argValue}
                  modifyFields={this.props.setArgFields}
                  getDefaultScalarArgValue={this.props.getDefaultScalarArgValue}
                  makeDefaultArg={this.props.makeDefaultArg}
                />
              ))}
            </div>
          );
        } else {
          console.error(
            'arg mismatch between arg and selection',
            argType,
            argValue,
          );
        }
      }
    }

    return (
      <div data-arg-name={arg.name} data-arg-type={argType.name}>
        <span
          style={{cursor: 'pointer'}}
          onClick={argValue ? this.props.removeArg : this.props.addArg}>
          <input readOnly type="checkbox" checked={!!argValue} />
          <span title={arg.description} style={{color: '#8B2BB9'}}>
            {arg.name}
            {isRequiredArgument(arg) ? '*' : ''}:
          </span>
        </span>{' '}
        {input}
      </div>
    );
  }
}

type AbstractViewProps = {|
  implementingType: GraphQLObjectType,
  selections: Selections,
  modifySelections: (selections: Selections) => void,
  schema: GraphQLSchema,
  getDefaultFieldNames: (type: GraphQLObjectType) => Array<string>,
  getDefaultScalarArgValue: GetDefaultScalarArgValue,
  makeDefaultArg: ?MakeDefaultArg,
|};

class AbstractView extends React.PureComponent<AbstractViewProps, {}> {
  _previousSelection: ?InlineFragmentNode;
  _addFragment = () => {
    this.props.modifySelections([
      ...this.props.selections,
      this._previousSelection || {
        kind: 'InlineFragment',
        typeCondition: {
          kind: 'NamedType',
          name: {kind: 'Name', value: this.props.implementingType.name},
        },
        selectionSet: {
          kind: 'SelectionSet',
          selections: this.props
            .getDefaultFieldNames(this.props.implementingType)
            .map(fieldName => ({
              kind: 'Field',
              name: {kind: 'Name', value: fieldName},
            })),
        },
      },
    ]);
  };
  _removeFragment = () => {
    const thisSelection = this._getSelection();
    this._previousSelection = thisSelection;
    this.props.modifySelections(
      this.props.selections.filter(s => s !== thisSelection),
    );
  };
  _getSelection = (): ?InlineFragmentNode => {
    const selection = this.props.selections.find(
      selection =>
        selection.kind === 'InlineFragment' &&
        selection.typeCondition &&
        this.props.implementingType.name === selection.typeCondition.name.value,
    );
    if (!selection) {
      return null;
    }
    if (selection.kind === 'InlineFragment') {
      return selection;
    }
  };

  _modifyChildSelections = (selections: Selections) => {
    const thisSelection = this._getSelection();
    this.props.modifySelections(
      this.props.selections.map(selection => {
        if (selection === thisSelection) {
          return {
            directives: selection.directives,
            kind: 'InlineFragment',
            typeCondition: {
              kind: 'NamedType',
              name: {kind: 'Name', value: this.props.implementingType.name},
            },
            selectionSet: {
              kind: 'SelectionSet',
              selections,
            },
          };
        }
        return selection;
      }),
    );
  };

  render() {
    const {implementingType, schema, getDefaultFieldNames} = this.props;
    const selection = this._getSelection();
    const fields = implementingType.getFields();
    const childSelections = selection
      ? selection.selectionSet
        ? selection.selectionSet.selections
        : []
      : [];
    return (
      <div>
        <span
          style={{cursor: 'pointer'}}
          onClick={selection ? this._removeFragment : this._addFragment}>
          <input readOnly type="checkbox" checked={!!selection} />
          <span style={{color: '#CA9800'}}>
            {this.props.implementingType.name}
          </span>
        </span>
        {selection ? (
          <div style={{marginLeft: 16}}>
            {Object.keys(fields)
              .sort()
              .map(fieldName => (
                <FieldView
                  key={fieldName}
                  field={fields[fieldName]}
                  selections={childSelections}
                  modifySelections={this._modifyChildSelections}
                  schema={schema}
                  getDefaultFieldNames={getDefaultFieldNames}
                  getDefaultScalarArgValue={this.props.getDefaultScalarArgValue}
                  makeDefaultArg={this.props.makeDefaultArg}
                />
              ))}
          </div>
        ) : null}
      </div>
    );
  }
}

type FieldViewProps = {|
  field: Field,
  selections: Selections,
  modifySelections: (selections: Selections) => void,
  schema: GraphQLSchema,
  getDefaultFieldNames: (type: GraphQLObjectType) => Array<string>,
  getDefaultScalarArgValue: GetDefaultScalarArgValue,
  makeDefaultArg: ?MakeDefaultArg,
|};

function defaultInputObjectFields(
  getDefaultScalarArgValue: GetDefaultScalarArgValue,
  makeDefaultArg: ?MakeDefaultArg,
  parentField: Field,
  fields: Array<GraphQLInputField>,
): Array<ObjectFieldNode> {
  const nodes = [];
  for (const field of fields) {
    if (
      isRequiredInputField(field) ||
      (makeDefaultArg && makeDefaultArg(parentField, field))
    ) {
      const fieldType = unwrapInputType(field.type);
      if (isInputObjectType(fieldType)) {
        const fields = fieldType.getFields();
        nodes.push({
          kind: 'ObjectField',
          name: {kind: 'Name', value: field.name},
          value: {
            kind: 'ObjectValue',
            fields: defaultInputObjectFields(
              getDefaultScalarArgValue,
              makeDefaultArg,
              parentField,
              Object.keys(fields).map(k => fields[k]),
            ),
          },
        });
      } else if (isLeafType(fieldType)) {
        nodes.push({
          kind: 'ObjectField',
          name: {kind: 'Name', value: field.name},
          value: getDefaultScalarArgValue(parentField, field, fieldType),
        });
      }
    }
  }
  return nodes;
}

function defaultArgs(
  getDefaultScalarArgValue: GetDefaultScalarArgValue,
  makeDefaultArg: ?MakeDefaultArg,
  field: Field,
): Array<ArgumentNode> {
  const args = [];
  for (const arg of field.args) {
    if (
      isRequiredArgument(arg) ||
      (makeDefaultArg && makeDefaultArg(field, arg))
    ) {
      const argType = unwrapInputType(arg.type);
      if (isInputObjectType(argType)) {
        const fields = argType.getFields();
        args.push({
          kind: 'Argument',
          name: {kind: 'Name', value: arg.name},
          value: {
            kind: 'ObjectValue',
            fields: defaultInputObjectFields(
              getDefaultScalarArgValue,
              makeDefaultArg,
              field,
              Object.keys(fields).map(k => fields[k]),
            ),
          },
        });
      } else if (isLeafType(argType)) {
        args.push({
          kind: 'Argument',
          name: {kind: 'Name', value: arg.name},
          value: getDefaultScalarArgValue(field, arg, argType),
        });
      }
    }
  }
  return args;
}

class FieldView extends React.PureComponent<FieldViewProps, {}> {
  _previousSelection: ?SelectionNode;
  _addFieldToSelections = event => {
    const fieldType = getNamedType(this.props.field.type);
    const rawSubfields = isObjectType(fieldType) && fieldType.getFields();

    const shouldSelectAllSubfields = !!rawSubfields && event.altKey;

    const subFields: Array<FieldNode> = !!rawSubfields
      ? Object.keys(rawSubfields).map(fieldName => {
          return {
            kind: 'Field',
            name: {kind: 'Name', value: fieldName},
            arguments: [],
          };
        })
      : [];

    const subSelectionSet: SelectionSetNode = {
      kind: 'SelectionSet',
      selections: subFields || [],
    };

    const nextSelections = shouldSelectAllSubfields
      ? [
          ...this.props.selections.filter(selection => {
            if (selection.kind === 'InlineFragment') {
              return true;
            } else {
              // Remove the current selection set for the target field
              return selection.name.value !== this.props.field.name;
            }
          }),
          {
            kind: 'Field',
            name: {kind: 'Name', value: this.props.field.name},
            arguments: defaultArgs(
              this.props.getDefaultScalarArgValue,
              this.props.makeDefaultArg,
              this.props.field,
            ),
            selectionSet: subSelectionSet,
          },
        ]
      : [
          ...this.props.selections,
          this._previousSelection || {
            kind: 'Field',
            name: {kind: 'Name', value: this.props.field.name},
            arguments: defaultArgs(
              this.props.getDefaultScalarArgValue,
              this.props.makeDefaultArg,
              this.props.field,
            ),
          },
        ];

    this.props.modifySelections(nextSelections);
  };

  _removeFieldFromSelections = () => {
    const previousSelection = this._getSelection();
    this._previousSelection = previousSelection;
    this.props.modifySelections(
      this.props.selections.filter(
        selection => selection !== previousSelection,
      ),
    );
  };
  _getSelection = (): ?FieldNode => {
    const selection = this.props.selections.find(
      selection =>
        selection.kind === 'Field' &&
        this.props.field.name === selection.name.value,
    );
    if (!selection) {
      return null;
    }
    if (selection.kind === 'Field') {
      return selection;
    }
  };

  _setArguments = (argumentNodes: $ReadOnlyArray<ArgumentNode>) => {
    const selection = this._getSelection();
    if (!selection) {
      console.error('Missing selection when setting arguments', argumentNodes);
      return;
    }
    this.props.modifySelections(
      this.props.selections.map(s =>
        s === selection
          ? {
              alias: selection.alias,
              arguments: argumentNodes,
              directives: selection.directives,
              kind: 'Field',
              name: selection.name,
              selectionSet: selection.selectionSet,
            }
          : s,
      ),
    );
  };

  _modifyChildSelections = (selections: Selections) => {
    this.props.modifySelections(
      this.props.selections.map(selection => {
        if (
          selection.kind === 'Field' &&
          this.props.field.name === selection.name.value
        ) {
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
              selections,
            },
          };
        }
        return selection;
      }),
    );
  };

  render() {
    const {field, schema, getDefaultFieldNames} = this.props;
    const selection = this._getSelection();
    const type = unwrapOutputType(field.type);
    const args = field.args;
    const node = (
      <div className="graphiql-explorer-node">
        <span
          title={field.description}
          style={{cursor: 'pointer'}}
          data-field-name={field.name}
          data-field-type={type.name}
          onClick={event => {
            return selection && !event.altKey
              ? this._removeFieldFromSelections()
              : this._addFieldToSelections(event);
          }}>
          <input readOnly type="checkbox" checked={!!selection} />
          <span style={{color: 'rgb(31, 97, 160)'}}>{field.name}</span>
        </span>
        {selection && args.length ? (
          <div style={{marginLeft: 16}}>
            {args.map(arg => (
              <ArgView
                key={arg.name}
                parentField={field}
                arg={arg}
                selection={selection}
                modifyArguments={this._setArguments}
                getDefaultScalarArgValue={this.props.getDefaultScalarArgValue}
                makeDefaultArg={this.props.makeDefaultArg}
              />
            ))}
          </div>
        ) : null}
      </div>
    );

    if (
      selection &&
      (isObjectType(type) || isInterfaceType(type) || isUnionType(type))
    ) {
      const fields = isUnionType(type) ? {} : type.getFields();
      const childSelections = selection
        ? selection.selectionSet
          ? selection.selectionSet.selections
          : []
        : [];
      return (
        <div>
          {node}
          <div style={{marginLeft: 16}}>
            {Object.keys(fields)
              .sort()
              .map(fieldName => (
                <FieldView
                  key={fieldName}
                  field={fields[fieldName]}
                  selections={childSelections}
                  modifySelections={this._modifyChildSelections}
                  schema={schema}
                  getDefaultFieldNames={getDefaultFieldNames}
                  getDefaultScalarArgValue={this.props.getDefaultScalarArgValue}
                  makeDefaultArg={this.props.makeDefaultArg}
                />
              ))}
            {isInterfaceType(type) || isUnionType(type)
              ? schema
                  .getPossibleTypes(type)
                  .map(type => (
                    <AbstractView
                      key={type.name}
                      implementingType={type}
                      selections={childSelections}
                      modifySelections={this._modifyChildSelections}
                      schema={schema}
                      getDefaultFieldNames={getDefaultFieldNames}
                      getDefaultScalarArgValue={
                        this.props.getDefaultScalarArgValue
                      }
                      makeDefaultArg={this.props.makeDefaultArg}
                    />
                  ))
              : null}
          </div>
        </div>
      );
    }
    return node;
  }
}

function parseQuery(text: string): ?DocumentNode | Error {
  try {
    if (!text.trim()) {
      return null;
    }
    return parse(
      text,
      //, {noLocation: true}
    );
  } catch (e) {
    return new Error(e);
  }
}

const DEFAULT_DOCUMENT = {
  kind: 'Document',
  definitions: [],
};
let parseQueryMemoize: ?[string, DocumentNode] = null;
function memoizeParseQuery(query: string): DocumentNode {
  if (parseQueryMemoize && parseQueryMemoize[0] === query) {
    return parseQueryMemoize[1];
  } else {
    const result = parseQuery(query);
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

type RootViewProps = {|
  schema: GraphQLSchema,
  fields: ?GraphQLFieldMap<any, any>,
  operation: 'query' | 'mutation' | 'subscription' | 'fragment',
  name: ?string,
  onTypeName: ?string,
  parsedQuery: DocumentNode,
  onEdit: (query: string) => void,
  onOperationRename: (query: string) => void,
  getDefaultFieldNames: (type: GraphQLObjectType) => Array<string>,
  getDefaultScalarArgValue: GetDefaultScalarArgValue,
  makeDefaultArg: ?MakeDefaultArg,
|};

class RootView extends React.PureComponent<RootViewProps, {}> {
  _previousOperationDef: ?OperationDefinitionNode | ?FragmentDefinitionNode;
  _getOperationDef = (
    parsedQuery: DocumentNode,
  ): OperationDefinitionNode | FragmentDefinitionNode => {
    const operation = parsedQuery.definitions.find(definition => {
      const nameMatches =
        definition.kind === 'OperationDefinition' ||
        definition.kind === 'FragmentDefinition'
          ? definition.name == null || definition.name.value === this.props.name
          : false;

      if (!nameMatches) return false;

      if (definition.kind === 'OperationDefinition') {
        const operationMatches = definition.operation === this.props.operation;
        return operationMatches;
      } else if (definition.kind === 'FragmentDefinition') {
        const isFragment = this.props.operation === 'fragment';
        return isFragment;
      }

      return false;
    });

    let defaultOperation = {
      kind: 'OperationDefinition',
      operation:
        this.props.operation !== 'fragment' ? this.props.operation : 'query',
      selectionSet: {
        kind: 'SelectionSet',
        selections: [],
      },
    };

    if (
      !operation ||
      (operation.kind !== 'OperationDefinition' &&
        operation.kind !== 'FragmentDefinition')
    )
      return defaultOperation;

    let result: OperationDefinitionNode | FragmentDefinitionNode = operation;

    return result;
  };

  _modifySelections = (selections: Selections) => {
    const {parsedQuery} = this.props;
    let operationDef = this._getOperationDef(parsedQuery);

    if (
      operationDef.selectionSet.selections.length === 0 &&
      this._previousOperationDef
    ) {
      operationDef = this._previousOperationDef;
    }
    if (selections.length === 0) {
      this._previousOperationDef = operationDef;
      this.props.onEdit(
        print({
          ...parsedQuery,
          definitions: parsedQuery.definitions.filter(
            definition => definition !== operationDef,
          ),
        }),
      );
    } else {
      const newOperationDef = {
        ...operationDef,
        selectionSet: {
          ...operationDef.selectionSet,
          selections,
        },
      };
      let replaced = false;
      const newDefinitions = parsedQuery.definitions.map(op => {
        if (op === operationDef) {
          replaced = true;
          return newOperationDef;
        } else {
          return op;
        }
      });

      this.props.onEdit(
        print({
          ...parsedQuery,
          definitions: replaced
            ? newDefinitions
            : [newOperationDef, ...newDefinitions],
        }),
      );
    }
  };

  render() {
    const {
      fields,
      operation,
      name,
      parsedQuery,
      schema,
      getDefaultFieldNames,
    } = this.props;
    const operationDef = this._getOperationDef(parsedQuery);
    const selections = operationDef.selectionSet.selections;

    const operationDisplayName = this.props.name || `Name your ${operation}`;

    return (
      <div
        id={`${operation}-${name || 'unknown'}`}
        style={{
          borderBottom: operation !== 'subscription' ? '1px solid #d6d6d6' : '',
          marginBottom: '1em',
          paddingBottom: '0.5em',
        }}>
        <div style={{color: '#B11A04', paddingBottom: 4}}>
          {operation}{' '}
          <span style={{color: 'rgb(193, 42,80)'}}>
            <input
              style={{
                border: 'none',
                borderBottom: '1px solid #888',
                outline: 'none',
                color: 'rgb(193, 42,80)',
                width: `${Math.max(4, operationDisplayName.length)}ch`,
              }}
              autoComplete="false"
              placeholder={`Name your ${operation}`}
              value={this.props.name}
              onChange={event =>
                this.props.onOperationRename(event.target.value)
              }
            />
          </span>
          {!!this.props.onTypeName ? (
            <span>
              <br />
              {`on ${this.props.onTypeName}`}
            </span>
          ) : (
            ''
          )}
        </div>

        {Object.keys(fields || {})
          .sort()
          .map(fieldName => (
            <FieldView
              key={fieldName}
              field={(fields || {})[fieldName]}
              selections={selections}
              modifySelections={this._modifySelections}
              schema={schema}
              getDefaultFieldNames={getDefaultFieldNames}
              getDefaultScalarArgValue={this.props.getDefaultScalarArgValue}
              makeDefaultArg={this.props.makeDefaultArg}
            />
          ))}
      </div>
    );
  }
}

class Explorer extends React.PureComponent<Props, State> {
  static defaultProps = {
    getDefaultFieldNames: defaultGetDefaultFieldNames,
    getDefaultScalarArgValue: defaultGetDefaultScalarArgValue,
  };

  _ref: ?any;
  _resetScroll = () => {
    const container = this._ref;
    if (container) {
      container.scrollLeft = 0;
    }
  };
  componentDidMount() {
    this._resetScroll();
  }
  _onEdit = (query: string): void => this.props.onEdit(query);

  render() {
    const {schema, query, makeDefaultArg} = this.props;
    if (!schema) {
      return (
        <div style={{fontFamily: 'sans-serif'}} className="error-container">
          No Schema Available
        </div>
      );
    }
    const queryType = schema.getQueryType();
    const mutationType = schema.getMutationType();
    const subscriptionType = schema.getSubscriptionType();
    if (!queryType && !mutationType && !subscriptionType) {
      return <div>Missing query type</div>;
    }
    const queryFields = queryType && queryType.getFields();
    const mutationFields = mutationType && mutationType.getFields();
    const subscriptionFields = subscriptionType && subscriptionType.getFields();

    const parsedQuery: DocumentNode = memoizeParseQuery(query);
    const getDefaultFieldNames =
      this.props.getDefaultFieldNames || defaultGetDefaultFieldNames;
    const getDefaultScalarArgValue =
      this.props.getDefaultScalarArgValue || defaultGetDefaultScalarArgValue;

    const definitions = parsedQuery.definitions;

    const relevantDefinitions = definitions
      .map(definition => {
        if (definition.kind === 'FragmentDefinition') {
          return definition;
        } else if (definition.kind === 'OperationDefinition') {
          return definition;
        } else {
          return null;
        }
      })
      .filter(Boolean);

    const renameOperation = (targetOperation, name) => {
      const newName =
        name == null || name === ''
          ? null
          : {kind: 'Name', value: name, loc: undefined};
      const newOperation = {...targetOperation, name: newName};

      const existingDefs = parsedQuery.definitions;

      const newDefinitions = existingDefs.map(existingOperation => {
        if (targetOperation === existingOperation) {
          return newOperation;
        } else {
          return existingOperation;
        }
      });

      return {
        ...parsedQuery,
        definitions: newDefinitions,
      };
    };

    const addOperation = (kind: 'query' | 'mutation' | 'subscription') => {
      const fields =
        kind === 'query'
          ? queryFields
          : kind === 'mutation'
          ? mutationFields
          : kind === 'subscription'
          ? subscriptionFields
          : {};

      const existingDefs = parsedQuery.definitions;

      const siblingDefs = existingDefs.filter(def => {
        if (def.kind === 'OperationDefinition') {
          return def.operation === kind;
        } else {
          // Don't support adding fragments from explorer
          return false;
        }
      });

      const capitalize = string => {
        return string.charAt(0).toUpperCase() + string.slice(1);
      };

      const newOperationName = `unnamed${capitalize(kind)}${
        siblingDefs.length === 0 ? '' : siblingDefs.length + 1
      }`;

      const firstFieldName =
        Object.keys(fields || {}).sort()[0] || 'placeholder';

      const selectionSet = {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: {
              kind: 'Name',
              value: firstFieldName,
              loc: null,
            },
            arguments: [],
            directives: [],
            selectionSet: null,
            loc: null,
          },
        ],
        loc: null,
      };

      const newDefinition = {
        kind: 'OperationDefinition',
        operation: kind,
        name: {kind: 'Name', value: newOperationName},
        variableDefinitions: [],
        directives: [],
        selectionSet: selectionSet,
        loc: null,
      };

      const newDefinitions = [...parsedQuery.definitions, newDefinition];

      const newOperationDef = {
        ...parsedQuery,
        definitions: newDefinitions,
      };

      this.props.onEdit(print(newOperationDef));
    };

    return (
      <div
        ref={ref => {
          this._ref = ref;
        }}
        style={{
          fontSize: 12,
          overflow: 'scroll',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          margin: 0,
          padding: 8,
          fontFamily:
            'Consolas, Inconsolata, "Droid Sans Mono", Monaco, monospace',
        }}
        className="graphiql-explorer-root">
        {relevantDefinitions.map((definition, index) => {
          const operation:
            | OperationDefinitionNode
            | FragmentDefinitionNode = definition;
          const operationName =
            operation && operation.name && operation.name.value;

          const operationKind =
            operation.kind === 'FragmentDefinition'
              ? 'fragment'
              : (operation && operation.operation) || 'query';

          const onOperationRename = newName => {
            const newOperationDef = renameOperation(operation, newName);
            this.props.onEdit(print(newOperationDef));
          };

          const fragmentType =
            operation.kind === 'FragmentDefinition' &&
            operation.typeCondition.kind === 'NamedType' &&
            schema.getType(operation.typeCondition.name.value);

          const fragmentFields =
            fragmentType instanceof GraphQLObjectType
              ? fragmentType.getFields()
              : null;

          const fields =
            operationKind === 'query'
              ? queryFields
              : operationKind === 'mutation'
              ? mutationFields
              : operationKind === 'subscription'
              ? subscriptionFields
              : operation.kind === 'FragmentDefinition'
              ? fragmentFields
              : null;

          const fragmentTypeName =
            operation.kind === 'FragmentDefinition'
              ? operation.typeCondition.name.value
              : null;

          return (
            <RootView
              key={index}
              fields={fields}
              operation={operationKind}
              name={operationName}
              parsedQuery={parsedQuery}
              onOperationRename={onOperationRename}
              onTypeName={fragmentTypeName}
              onEdit={this._onEdit}
              schema={schema}
              getDefaultFieldNames={getDefaultFieldNames}
              getDefaultScalarArgValue={getDefaultScalarArgValue}
              makeDefaultArg={makeDefaultArg}
            />
          );
        })}

        <div
          className="variable-editor-title"
          style={{
            margin: '4px -8px -8px',
            paddingLeft: '8px',
            bottom: '0px',
            width: '100%',
            textAlign: 'center',
          }}>
          <button
            style={{width: '100%', display: 'block'}}
            onClick={() => addOperation('query')}>
            + Query
          </button>
          <button
            style={{width: '100%', display: 'block'}}
            onClick={() => addOperation('mutation')}>
            + Mutation
          </button>
          <button
            style={{width: '100%', display: 'block'}}
            onClick={() => addOperation('subscription')}>
            + Subscription
          </button>
        </div>
      </div>
    );
  }
}

class ErrorBoundary extends React.Component<
  *,
  {hasError: boolean, error: any, errorInfo: any},
> {
  state = {hasError: false, error: null, errorInfo: null};

  componentDidCatch(error, errorInfo) {
    this.setState({hasError: true, error: error, errorInfo: errorInfo});
    console.error('Error in component', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{padding: 18, fontFamily: 'sans-serif'}}>
          <div>Something went wrong</div>
          <details style={{whiteSpace: 'pre-wrap'}}>
            {this.state.error ? this.state.error.toString() : null}
            <br />
            {this.state.errorInfo ? this.state.errorInfo.componentStack : null}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

class ExplorerWrapper extends React.PureComponent<Props, {}> {
  static defaultValue = defaultValue;
  static defaultProps = {
    width: 380,
  };
  render() {
    return (
      <div
        className="historyPaneWrap"
        style={{
          height: '100%',
          width: this.props.width,
          zIndex: 7,
          display: this.props.explorerIsOpen ? 'block' : 'none',
        }}>
        <div className="history-title-bar">
          <div className="history-title">The Explorer</div>
          <div className="doc-explorer-rhs">
            <div
              className="docExplorerHide"
              onClick={this.props.onToggleExplorer}>
              {'\u2715'}
            </div>
          </div>
        </div>
        <div className="history-contents">
          <ErrorBoundary>
            <Explorer {...this.props} />
          </ErrorBoundary>
        </div>
      </div>
    );
  }
}

export default ExplorerWrapper;
