
# GraphQL Scalar Input Plugins

These allow custom handling of custom GraphQL scalars.

# Definition

A GraphQL Scalar Input plugin implements the following function signatures:
```js
function canProcess(arg): boolean

function render(arg, styleConfig, onChangeHandler): void

export default {
  canProcess,
  render,
  name: "InputHandlerName"
}
```

## Examples

See the bundled `DateInput` plugin.

When instantiating the GraphiQL Explorer, pass the list of desired plugins as the prop `graphqlCustomScalarPlugins`.

# Usage 

## Enabling bundled plugins

By default, these plugins are disabled. To enable the bundled plugins, instantiate the explorer with the prop `enableBundledPlugins` set to `true`.

## Example adding custom plugins

Any number of plugins can be added, and can override existing bundled plugins.

Plugins are checked in the order they are given in the `graphqlCustomScalarPlugins` list. The first plugin with a `canProcess` value that returns `true` will be used. Bundled plugins are always checked last, after all customised plugins.

```js
// Note this is just an example using a third-party plugin. This is for illustrative purposes only
const anotherThirdPartyHandler = require('<graphiql-explorer-example-custom-scalar-plugin>')

const customISODateTypeHandler = {
  render: (arg, styleConfig, onChangeHandler) => (
    <input
      type="date"
      value={arg.defaultValue}
      onChange={event => {
        // Set the date placed into the query to be an ISO dateTime string
        const isoDate = new Date(event.target.value).toISOString();
        event.target = { value: isoDate };
        return onChangeHandler(event);
      }}
    />
  ),
  canProcess: (arg) => arg && arg.type && arg.type.name ===  'Date',
  name: 'customDate',
}

const configuredPlugins = [anotherThirdPartyHandler, customISODateTypeHandler]
```
Then later, in your render method where you create the explorer...
```
<GraphiQLExplorer
  schema={schema}
  query={query}
  onEdit={this._handleEditQuery}
  onRunOperation={operationName =>
    this._graphiql.handleRunQuery(operationName)
  }
  explorerIsOpen={this.state.explorerIsOpen}
  onToggleExplorer={this._handleToggleExplorer}
  getDefaultScalarArgValue={getDefaultScalarArgValue}
  makeDefaultArg={makeDefaultArg}
  enableBundledPlugins={true}
  graphqlCustomScalarPlugins={configuredPlugins}
/>
```
> To see examples of instantiating the explorer, see the [example repo](https://github.com/OneGraph/graphiql-explorer-example).
