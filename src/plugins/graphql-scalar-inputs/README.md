
# GraphQL Scalar Input Plugins

These allow custom handling of custom GraphQL scalars.

# Definition

A GraphQL Scalar Input plugin must implement the following:
```js
function canProcess(arg): Boolean!
function render(prop): React.Element!

const name: String!
```

# Usage

## Enabling bundled plugins

By default, these plugins are disabled. To enable the bundled plugins, instantiate the explorer with the prop `enableBundledPlugins` set to `true`.

## Examples

### Date Input

See the bundled `DateInput` plugin, which demonstrates a simple implementation for a single GraphQL Scalar.

When instantiating the GraphiQL Explorer, pass the list of desired plugins as the prop `graphqlCustomScalarPlugins`.

### Complex Numbers

This examples shows a plugin that can be used for more complicated input types which should form objects.

For this example, consider the following schema:
```
type ComplexNumber {
  real: Float!
  imaginary: Float!
}

input ComplexNumberInput {
  real: Float!
  imaginary: Float!
}

type Query {
  complexCalculations(z: ComplexNumberInput): ComplexResponse!
}

type ComplexResponse {
  real: Float!
  imaginary: Float!
  length: Float!
  complexConjugate: ComplexNumber!
}
```

The custom object type can be handled with a custom plugin. The file `ComplexNumberHandler.js` shows an example implementation for the `ComplexNumberInput`.

```js
import * as React from "react";

class ComplexNumberHandler extends React.Component {
  static canProcess = (arg) => arg && arg.type && arg.type.name === 'ComplexNumberInput';

  updateComponent(arg, value, targetName) {
    const updatedFields = arg.value.fields.map(childArg => {
      if (childArg.name.value !== targetName) {
        return childArg;
      }
      const updatedChild = { ...childArg };
      updatedChild.value.value = value;
      return updatedChild;
    });

    const mappedArg = { ...arg };
    mappedArg.value.fields = updatedFields;
    return mappedArg;
  }

  handleChangeEvent(event, complexComponent) {
    const { arg, selection, modifyArguments, argValue } = this.props;
    return modifyArguments(selection.arguments.map(originalArg => {
      if (originalArg.name.value !== arg.name) {
        return originalArg;
      }

      return this.updateComponent(originalArg, event.target.value, complexComponent);
    }));
  }

  getValue(complexArg, complexComponent) {
    const childNode = complexArg && complexArg.value.fields.find(childArg => childArg.name.value === complexComponent)

    if (complexArg && childNode) {
      return childNode.value.value;
    }

    return '';
  }

  render() {
    const { selection, arg } = this.props;
    const selectedComplexArg = (selection.arguments || []).find(a => a.name.value === arg.name);
    const rePart = this.getValue(selectedComplexArg, 'real');
    const imPart = this.getValue(selectedComplexArg, 'imaginary');
    return (
      <span>
        <input
          type="number"
          value={rePart}
          onChange={e => this.handleChangeEvent(e, 'real')}
          style={{ maxWidth: '50px', margin: '5px' }}
          step='any'
          disabled={!selectedComplexArg}
        />
        +
        <input
          type="number"
          defaultValue={imPart}
          onChange={e => this.handleChangeEvent(e, 'imaginary')}
          style={{ maxWidth: '50px', margin: '5px' }}
          step='any'
          disabled={!selectedComplexArg}
        /> i
    </span>);
  }
}

export default {
  canProcess: ComplexNumberHandler.canProcess,
  name: 'Complex Number',
  render: props => (
    <ComplexNumberHandler
          {...props}
    />),
}
```
To add the custom plugin, pass it to the GraphiQLExplorer on instantiation.
```js
import ComplexNumberHandler from './ComplexNumberHandler';
const configuredPlugins = [ComplexNumberHandler];

// Then later, in your render method where you create the explorer...
<GraphiQLExplorer
  ...
  graphqlCustomScalarPlugins={configuredPlugins}
/>
```
> To see examples of instantiating the explorer, see the [example repo](https://github.com/OneGraph/graphiql-explorer-example).

Any number of plugins can be added, and can override existing bundled plugins.

Plugins are checked in the order they are given in the `graphqlCustomScalarPlugins` list. The first plugin with a `canProcess` value that returns `true` will be used. Bundled plugins are always checked last, after all customised plugins.
