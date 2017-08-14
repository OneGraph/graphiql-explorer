import React from 'react';
import GraphiQL from 'graphiql';
import 'graphiql/graphiql.css';
import Graphitree from './graphitree.js';
import {introspectionQuery, buildClientSchema} from 'graphql';

// const DEV = process.env.NODE_ENV === 'development';
const DEV = true;

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
    ? 'http://serve.onegraph.dev:8082/oauth/google/finish'
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

// const fetchURL = 'http://serve.onegraph.dev:8082/graphql';
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
    // credentials: 'include',
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

let handleGQLExplorerUpdated = (editor, query) => {
  const currentText = editor.getValue();
  const {parse, print} = require('graphql');
  var prettyText = query;
  try {
    prettyText = print(parse(query));
  } catch (e) {}
  editor.setValue(prettyText);
};

class App extends React.PureComponent {
  state: {
    query: string,
    params: object,
    showGraphitree: boolean,
    rawSchema: object,
    schema: object,
    selectedNodes: object,
  };
  constructor(props) {
    super(props);
    const params = windowParams();
    this.state = {
      loggedIn: null,
      query: params.query ? decodeURIComponent(params.query) : '',
      showGraphitree: false,
      params,
      selectedNodes: new Set([]),
    };
    this._params = params;
  }
  componentDidMount() {
    graphQLFetcher({query: 'query { me { google { email } }}'}).then(x => {
      if (x.data && x.data.me && x.data.me.google && x.data.me.google.email) {
        this.setState({loggedIn: true});
      } else {
        this.setState({loggedIn: false});
      }
    });
    graphQLFetcher({query: introspectionQuery}).then(result => {
      if (result.data) {
        this.setState(currentState => {
          return {
            schema: buildClientSchema(result.data),
            rawSchema: result.data,
          };
        });
      }
    });
  }
  setParam = (param, value) => {
    this._params[param] = value;
    updateURL(this._params);
  };
  onEditQuery = newQuery => {
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
  toggleGraphitree = () => {
    console.log('toggle ffs');
    this.setState(currentState => {
      console.log({
        showGraphitree: !currentState.showGraphitree,
      });
      return {
        showGraphitree: !currentState.showGraphitree,
      };
    });
  };
  render() {
    return (
      <div>
        {this.state.showGraphitree && !!this.state.rawSchema
          ? <div
              className="graphitree-container"
              style={{
                height: '100vh',
                width: '25%',
                float: 'left',
                overflow: 'scroll',
              }}
            >
              <Graphitree
                onQueryChange={query => {
                  if (!!this.graphiql) {
                    console.log('Query:', query);
                    handleGQLExplorerUpdated(
                      this.graphiql.getQueryEditor(),
                      query,
                    );
                  }
                  console.log('Query:', query);
                }}
                rawSchema={this.state.rawSchema}
                selectedNodes={this.state.selectedNodes}
              />
            </div>
          : null}
        <div
          className="graphiql-container"
          style={{
            height: '100vh',
            width: this.state.showGraphitree ? '90%' : '100%',
            position: 'absolute',
            right: '0px',
          }}
        >
          {this.state.loggedIn === false
            ? <div style={{position: 'absolute', right: 170}}>
                <div className="topBar">
                  <div className="toolbar">
                    <a
                      className="toolbar-button"
                      onClick={event => {
                        this.toggleGraphitree.bind(this)();
                        event.preventDefault();
                        return false;
                      }}
                    >
                      Tree
                    </a>
                  </div>
                </div>
              </div>
            : null}
          {this.state.loggedIn === false
            ? <div style={{position: 'absolute', right: 85}}>
                <div className="topBar">
                  <div className="toolbar">
                    <a className="toolbar-button" href={googleAuthUrl}>
                      Log In
                    </a>
                  </div>
                </div>
              </div>
            : null}
          {!!this.state.schema
            ? <GraphiQL
                ref={c => (this.graphiql = c)}
                fetcher={graphQLFetcher}
                onEditQuery={this.onEditQuery}
                onEditVariables={this.onEditVariables}
                onEditOperationName={this.onEditOperationName}
                query={this.state.query || ''}
                response={null}
                variables={null}
                operationName={null}
                schema={this.state.schema}
              />
            : null}
        </div>
      </div>
    );
  }
}

export default App;
