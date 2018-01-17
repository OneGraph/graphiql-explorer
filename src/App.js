import React from 'react';
import GraphiQL from 'graphiql';
import StorageAPI from 'graphiql/dist/utility/StorageAPI';
import 'graphiql/graphiql.css';
import Graphitree from './graphitree';
import {defaultQuery} from './graphql';
import {introspectionQuery, buildClientSchema} from 'graphql';
import {getPath} from './utils';
import Config from './Config';

function windowParams() {
  const parameters = {};
  window.location.search
    .substr(1)
    .split('&')
    .forEach(function(entry) {
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

const BETA_SCHEMA_STORAGE_KEY = 'onegraph:showBetaSchema';
const TREE_STORAGE_KEY = 'onegraph:showTree';

// Defines a GraphQL fetcher using the fetch API.
function graphQLFetcher(graphQLParams) {
  return fetch(Config.fetchUrl, {
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      show_beta_schema: !!graphQLParams.showBetaSchema,
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
  const queryParam = locationQuery(params);
  if (queryParam.length < 15000) {
    window.history.replaceState(null, null, queryParam);
  }
}

let handleGQLExplorerUpdated = (editor, query) => {
  const {parse, print} = require('graphql');
  var prettyText = query;
  try {
    prettyText = print(parse(query));
  } catch (e) {}
  editor.setValue(prettyText);
};

let logInButton = (service, isSignedIn, href) => {
  return (
    <GraphiQL.MenuItem
      label={(isSignedIn ? '\u2713 ' : '  ') + service}
      disabled={isSignedIn}
      title={service}
      onSelect={event => {
        // console.log is here to make the no-unused-expression error go away. What's the equivalent of ignore() in JS?
        console.log(
          isSignedIn
            ? null
            : window.open(
                href,
                '_blank',
                'location=yes,height=570,width=520,scrollbars=yes,status=yes',
              ),
        );
      }}
    />
  );
};

const meQuery = `
  query {
    me {
      google {
        email
      }
      twitter {
        screenName
      }
      github {
        login
      }
      stripe {
        id
      }
    }
  }
`;

class App extends React.PureComponent {
  state: {
    query: string,
    variables: string,
    params: object,
    showGraphitree: boolean,
    rawSchema: object,
    schema: object,
    selectedNodes: object,
    queryResultMessage: string,
  };
  _storage = new StorageAPI();
  constructor(props) {
    super(props);
    const params = windowParams();
    this.state = {
      githubLoggedIn: null,
      googleLoggedIn: null,
      stripeLoggedIn: null,
      twitterLoggedIn: null,
      sfdcLoggedIn: null,
      query: params.query ? decodeURIComponent(params.query) : '',
      variables: params.variables ? decodeURIComponent(params.variables) : '',
      showGraphitree: this._storage.get(TREE_STORAGE_KEY),
      params,
      selectedNodes: new Set([]),
      queryResultMessage: 'OneGraphiQL timing',
    };
    this._params = params;
  }
  _graphQLFetch = params => {
    const startTs = Date.now();
    const showBetaSchema = !!this._storage.get(BETA_SCHEMA_STORAGE_KEY);
    return graphQLFetcher({...params, showBetaSchema}).then(result => {
      const queryResultMessage =
        'OneGraphiQL timing: ' + ((Date.now() - startTs) | 0) + 'ms';
      this.setState(oldState => {
        return {
          queryResultMessage,
        };
      });
      return result;
    });
  };
  componentDidMount() {
    this._graphQLFetch({query: meQuery}).then(x => {
      this.setState({
        googleLoggedIn: !!getPath(x, ['data', 'me', 'google', 'email']),
        githubLoggedIn: !!getPath(x, ['data', 'me', 'github', 'login']),
        sfdcLoggedIn: !!getPath(x, ['data', 'me', 'sfdc', 'email']),
        stripeLoggedIn: !!getPath(x, ['data', 'me', 'stripe', 'id']),
        twitterLoggedIn: !!getPath(x, ['data', 'me', 'twitter', 'screenName']),
      });
    });
    this._graphQLFetch({query: introspectionQuery}).then(result => {
      if (result.data) {
        this.setState(currentState => {
          return {
            schema: buildClientSchema(result.data),
            rawSchema: result.data,
          };
        });
      }
    });
    document.addEventListener('keydown', this._keyboardEventHandler);
  }
  componentWillUnmount() {
    document.removeEventListener('keydown', this._keyboardEventHandler);
  }
  _keyboardEventHandler = event => {
    if (event.ctrlKey && event.altKey && event.keyCode === 66) {
      this._storage.set(
        BETA_SCHEMA_STORAGE_KEY,
        !this._storage.get(BETA_SCHEMA_STORAGE_KEY),
      );
      window.location = window.location;
    }
  };
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
    this.setParam('variables', newVariables);
  };
  onEditOperationName = newOperationName => {
    this.setParam('operationName', newOperationName);
  };
  toggleGraphitree = () => {
    this.setState(
      currentState => {
        return {
          showGraphitree: !currentState.showGraphitree,
        };
      },
      args => this._storage.set(TREE_STORAGE_KEY, this.state.showGraphitree),
    );
  };
  render() {
    return (
      <div>
        {this.state.showGraphitree && !!this.state.rawSchema ? (
          <div
            className="graphitree-container"
            style={{
              height: '100vh',
              width: '25%',
              float: 'left',
              overflow: 'scroll',
            }}>
            <Graphitree
              onQueryChange={query => {
                if (!!this.graphiql) {
                  handleGQLExplorerUpdated(
                    this.graphiql.getQueryEditor(),
                    query,
                  );
                }
              }}
              rawSchema={this.state.rawSchema}
              selectedNodes={this.state.selectedNodes}
            />
          </div>
        ) : null}
        <div
          className="graphiql-container"
          style={{
            height: '100vh',
            width: this.state.showGraphitree ? '90%' : '100%',
            position: 'absolute',
            right: '0px',
          }}>
          {!!this.state.schema ? (
            <GraphiQL
              ref={c => (this.graphiql = c)}
              fetcher={this._graphQLFetch}
              onEditQuery={this.onEditQuery}
              onEditVariables={this.onEditVariables}
              onEditOperationName={this.onEditOperationName}
              defaultQuery={this.state.query || defaultQuery}
              response={null}
              variables={this.state.variables || ''}
              operationName={null}
              schema={this.state.schema}>
              <GraphiQL.Logo>OneGraphiQL</GraphiQL.Logo>
              <GraphiQL.Toolbar>
                <GraphiQL.Button
                  onClick={this.handleClickPrettifyButton}
                  label="Prettify"
                  title="Prettify Query (Shift-Ctrl-P)"
                />
                <GraphiQL.Button
                  onClick={event => {
                    this.toggleGraphitree.bind(this)();
                    event.preventDefault();
                    return false;
                  }}
                  label="Tree"
                  title="Toggle Tree"
                />
                <GraphiQL.Menu label="Authentication" title="Authentication">
                  {logInButton(
                    'Stripe',
                    this.state.stripeLoggedIn,
                    Config.authUrl('stripe'),
                  )}
                  {logInButton(
                    'GitHub',
                    this.state.githubLoggedIn,
                    Config.authUrl('github'),
                  )}
                  {logInButton(
                    'Twitter',
                    this.state.twitterLoggedIn,
                    Config.authUrl('twitter'),
                  )}
                  {logInButton(
                    'Google',
                    this.state.googleLoggedIn,
                    Config.authUrl('google'),
                  )}
                </GraphiQL.Menu>
              </GraphiQL.Toolbar>
              <GraphiQL.Footer>{this.state.queryResultMessage}</GraphiQL.Footer>
            </GraphiQL>
          ) : null}
        </div>
      </div>
    );
  }
}

export default App;
