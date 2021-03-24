Interactive explorer plugin for GraphiQL.

Try it live at [https://www.onegraph.com/graphiql](https://www.onegraph.com/graphiql).

[OneGraph](https://www.onegraph.com) provides easy, consistent access to the APIs that underlie your business--all through the power of GraphQL.

Sign up at [https://www.onegraph.com](http://www.onegraph.com).

[![npm version](http://img.shields.io/npm/v/graphiql-explorer.svg?style=flat)](https://npmjs.org/package/graphiql-explorer "View this project on npm")


## Example usage

See the [example repo](https://github.com/OneGraph/graphiql-explorer-example) for how to use OneGraph's GraphiQL Explorer in your own GraphiQL instance.

![Preview](https://user-images.githubusercontent.com/476818/51567716-c00dfa00-1e4c-11e9-88f7-6d78b244d534.gif)

[Read the rationale on the OneGraph blog](https://www.onegraph.com/blog/2019/01/24/How_OneGraph_onboards_users_new_to_GraphQL.html).


## Customizing styles

The default styling matches for the Explorer matches the default styling for GraphiQL. If you've customized your GraphiQL styling, you can customize the Explorer's styling to match.

### Customizing colors

The Explorer accepts a `colors` prop as a map of the class names in GraphiQL's css to hex colors. If you've edited the GraphiQL class names that control colors (e.g. `cm-def`, `cm-variable`, `cm-string`, etc.) use those same colors in the colors map. The naming of the keys in the colors map tries to align closely with the names of the class names in GraphiQL's css (note that the Explorer can't just apply the classes because of conflicts with how the css file styles inputs).

Example style map:

```javascript
<Explorer colors={{
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
  atom: '#CA9800',
}} />
```

### Customizing arrows and checkboxes

The explorer accepts props for setting custom checkboxes (for leaf fields) and arrows (for object fields).

The props are `arrowOpen`, `arrowClosed`, `checkboxChecked`, and `checkboxUnchecked`. You can pass any react node for those props.

The defaults are

arrowOpen
```javascript
  <svg width="12" height="9">
    <path fill="#666" d="M 0 2 L 9 2 L 4.5 7.5 z" />
  </svg>
```

arrowClosed
```javascript
  <svg width="12" height="9">
    <path fill="#666" d="M 0 0 L 0 9 L 5.5 4.5 z" />
  </svg>
```

checkboxChecked
```
  <svg
    style={{marginRight: '3px', marginLeft: '-3px'}}
    width="12"
    height="12"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <path
      d="M16 0H2C0.9 0 0 0.9 0 2V16C0 17.1 0.9 18 2 18H16C17.1 18 18 17.1 18 16V2C18 0.9 17.1 0 16 0ZM16 16H2V2H16V16ZM14.99 6L13.58 4.58L6.99 11.17L4.41 8.6L2.99 10.01L6.99 14L14.99 6Z"
      fill="#666"
    />
  </svg>
  ```

checkboxUnchecked
```
  <svg
    style={{marginRight: '3px', marginLeft: '-3px'}}
    width="12"
    height="12"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <path
      d="M16 2V16H2V2H16ZM16 0H2C0.9 0 0 0.9 0 2V16C0 17.1 0.9 18 2 18H16C17.1 18 18 17.1 18 16V2C18 0.9 17.1 0 16 0Z"
      fill="#CCC"
    />
  </svg>
```

### Customizing the buttons to create new operations

You can modify the styles for the buttons that allow you to create new operations.

Pass the `styles` prop when you create the component. It's an object with two keys, `explorerActionsStyle` and `buttonStyle`.

Example styles map:
```javascript
<Explorer
  styles={{
    buttonStyle: {
      fontSize: '1.2em',
      padding: '0px',
      backgroundColor: 'white',
      border: 'none',
      margin: '5px 0px',
      height: '40px',
      width: '100%',
      display: 'block',
      maxWidth: 'none',
    },

    explorerActionsStyle: {
      margin: '4px -8px -8px',
      paddingLeft: '8px',
      bottom: '0px',
      width: '100%',
      textAlign: 'center',
      background: 'none',
      borderTop: 'none',
      borderBottom: 'none',
    },
  }}
/>
```


# Handling Custom GraphQL Scalars

Custom GraphQL Scalars can be supported by using the [GraphQL Scalar Input Plugins](./src/plugins/graphql-scalar-inputs/README.md).

## Plugin Definition

A GraphQL Scalar Input plugin must implement the following:
```js
function canProcess(arg): Boolean!
function render(prop): React.Element!

const name: String!
```

> Please note this interface is not currently finalised. Perhaps it is preferred to use typescript to define an abstract base class. External plugins would then extend this, making the interface concrete.

## Usage

### Enabling bundled plugins

By default, these plugins are disabled to avoid breaking changes to existing users. To enable the bundled plugins, instantiate the explorer with the prop `enableBundledPlugins` set to `true`.

## Example Plugins

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
  enableBundledPlugins={true}
  graphqlCustomScalarPlugins={configuredPlugins}
/>
```
> To see examples of instantiating the explorer, see the [example repo](https://github.com/OneGraph/graphiql-explorer-example).

Any number of plugins can be added, and can override existing bundled plugins.

Plugins are checked in the order they are given in the `graphqlCustomScalarPlugins` list. The first plugin with a `canProcess` value that returns `true` will be used. Bundled plugins are always checked last, after all customised plugins.
