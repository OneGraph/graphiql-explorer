import React from 'react';
import GraphiQL from 'graphiql';
import 'graphiql/graphiql.css';

const DEV = process.env.NODE_ENV === 'development';

const sandboxId = DEV
  ? '5f05c6e7-5b7a-481f-8980-8358fe47f83d'
  : '0b33e830-7cde-4b90-ad7e-2a39c57c0e11';
const googleAuthScopes = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/youtube.force-ssl',
  'https://www.googleapis.com/auth/userinfo.email',
];

const googleAuthParams = {
  client_id: DEV
    ? '724803268959-1vh888mcdelep2faonp6dmjci8o6gr3q.apps.googleusercontent.com'
    : '724803268959-5grmngkut92velvb3m8f7h7igf5n0cra.apps.googleusercontent.com',
  redirect_uri: DEV
    ? 'http://localhost:8082/oauth/google/finish'
    : 'https://serve.onegraph.io/oauth/google/finish',
  response_type: 'code',
  scope: googleAuthScopes.join(' '),
  access_type: 'offline',
  state: sandboxId,
};
const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
Object.keys(googleAuthParams).forEach(k =>
  googleAuthUrl.searchParams.append(k, googleAuthParams[k]),
);

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
      query: params.query ? decodeURIComponent(params.query) : '',
      params,
    };
    this._params = params;
  }
  setParam = (param, value) => {
    this._params[param] = value;
    updateURL(this._params);
  };
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
      <div className="graphiql-container" style={{height: '100vh'}}>
        <div style={{position: 'absolute', right: 85}}>
          <div className="topBar">
            <div className="toolbar">
              <a className="toolbar-button" href={googleAuthUrl}>Log In</a>
            </div>
          </div>
        </div>
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
