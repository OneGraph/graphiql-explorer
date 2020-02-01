# GraphQL Scalar Input Plugins

These allow custom handling of custom GraphQL scalars

# Definition

A GraphQL Scalar Input pluging implements the following function signatures:
```js
function canProcess(arg): boolean

function render(arg, styleConfig, onChangeHandler): void

export default {
  canProcess,
  render,
  name: "InputHandlerName"
}
```

# Examples

See the bundled `DateInput` plugin.

When instantiating the GraphiQL Explorer, pass the list of desired plugins as the prop `graphqlCustomScalarPlugins`.