import React from 'react';
import GraphiQL from 'graphiql';
import 'graphiql/graphiql.css';

function windowParams() {
  const parameters = {};
  window.location.search.substr(1).split('&').forEach(function(entry) {
    const eq = entry.indexOf('=');
    if (eq >= 0) {
      parameters[decodeURIComponent(entry.slice(0, eq))] = decodeURIComponent(
        entry.slice(eq + 1),
      );
    }
  });
  return parameters;
}

// Produce a Location query string from a parameter object.
function locationQuery(params) {
  return (
    '?' +
    Object.keys(params)
      .map(
        key => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]),
      )
      .join('&')
  );
}

// const fetchURL = 'https://serve.onegraph.io/graphql';
const fetchURL = 'https://serve.onegraph.io';
// Defines a GraphQL fetcher using the fetch API.
function graphQLFetcher(graphQLParams) {
  return fetch(fetchURL, {
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(graphQLParams),
    credentials: 'include',
  })
    .then(function(response) {
      return response.text();
    })
    .then(function(responseBody) {
      try {
        return JSON.parse(responseBody);
      } catch (error) {
        return responseBody;
      }
    });
}

function updateURL(params) {
  window.history.replaceState(null, null, locationQuery(params));
}

// var href = window.location.href.split('?')[1];
// var params =
//   href &&
//   href
//     .split('&')
//     .map(function(paramPair) {
//       return paramPair.split('=');
//     })
//     .reduce(function(run, paramPairs) {
//       run[paramPairs[0]] = paramPairs[1];
//       return run;
//     }, {});

class App extends React.PureComponent {
  state: {query: string, params: object};
  constructor(props) {
    super(props);
    const params = windowParams();
    this.state = {
      query: params ? decodeURIComponent(params.query) || '' : '',
      params,
    };
    this._params = params;
  }
  setParam = (param, value) => {
    this._params[param] = value;
    updateURL(this._params);
  }
  onEditQuery = newQuery => {
    console.log('oneditquery');
    this.setState({
      query: newQuery,
    });
    this.setParam('query', newQuery);
  };
  onEditVariables = newVariables => {
    console.log('onEditVariables');
    this.setParam('variables', newVariables);
  };
  onEditOperationName = newOperationName => {
    console.log('onEditOperationName');
    this.setParam('operationName', newOperationName);
  };
  render() {
    return (
      <div style={{height: '100vh'}}>
        <GraphiQL
          fetcher={graphQLFetcher}
          onEditQuery={this.onEditQuery}
          onEditVariables={this.onEditVariables}
          onEditOperationName={this.onEditOperationName}
          query={this.state.query || ''}
          response={null}
          variables={null}
          operationName={null}
        />
      </div>
    );
  }
}

export default App;
