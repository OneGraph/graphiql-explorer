// @flow

import React from 'react';
import GraphiQL from 'graphiql';
import StorageAPI from 'graphiql/dist/utility/StorageAPI';
import 'graphiql/graphiql.css';
import Graphitree from './graphitree';
import {defaultQuery} from './oneGraphQL';
import {introspectionQuery, buildClientSchema} from 'graphql';
import {getPath} from './utils';
import Config from './Config';
import OneGraphAuth from 'onegraph-auth';

import type {AuthResponse, Service} from 'onegraph-auth';

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
const EXPLORER_STORAGE_KEY = 'onegraph:showExplorer';

// Defines a GraphQL fetcher using the fetch API.
function graphQLFetcher(
  serveUrl: string,
  appId: string,
  graphQLParams: Object,
): Promise<string> {
  const url = new URL(serveUrl);
  url.searchParams.set('application_id', appId);
  return fetch(url.toString(), {
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

function handleGQLExplorerUpdated(editor, query) {
  const {parse, print} = require('graphql');
  var prettyText = query;
  try {
    prettyText = print(parse(query));
  } catch (e) {}
  editor.setValue(prettyText);
}

type LoginButtonProps = {
  oneGraphAuth: OneGraphAuth,
  onAuthResponse: (response: AuthResponse) => void,
  isSignedIn: ?boolean,
};

class LoginButton extends React.Component<
  LoginButtonProps,
  {loading: boolean},
> {
  state = {loading: false};
  _onSelect = async (): Promise<void> => {
    const {oneGraphAuth, onAuthResponse} = this.props;
    try {
      this.setState({loading: true});
      const authResponse = await oneGraphAuth.login();
      onAuthResponse(authResponse);
      this.setState({loading: false});
    } catch (e) {
      console.error(e);
      this.setState({loading: false});
    }
  };
  render() {
    const {oneGraphAuth, isSignedIn} = this.props;
    const serviceName = oneGraphAuth.friendlyServiceName;
    return (
      <GraphiQL.MenuItem
        label={(isSignedIn ? '\u2713 ' : '  ') + serviceName}
        disabled={this.state.loading || isSignedIn}
        title={serviceName}
        onSelect={this._onSelect}
      />
    );
  }
}

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
      oneGraph {
        id
      }
    }
  }
`;

const appsQuery = `
  query {
    oneGraph {
      apps {
        name
        id
      }
    }
  }
`;

function makeOneGraphAuth(service: Service): OneGraphAuth {
  return new OneGraphAuth({
    oneGraphOrigin: Config.oneGraphOrigin,
    appId: Config.appId,
    service,
  });
}

type Props = {};
type State = {
  apps: Array<{id: string, name: string}>,
  query: string,
  variables: string,
  params: Object,
  explorerIsOpen: boolean,
  rawSchema: ?Object,
  schema: ?Object,
  selectedNodes: Object,
  queryResultMessage: string,
  onegraphLoggedIn: ?boolean,
  githubLoggedIn: ?boolean,
  googleLoggedIn: ?boolean,
  stripeLoggedIn: ?boolean,
  twitterLoggedIn: ?boolean,
  sfdcLoggedIn: ?boolean,
  activeApp: {id: string, name: string},
};

const DEFAULT_APP = {
  name: 'onegraphiql',
  id: Config.appId,
};

class App extends React.Component<Props, State> {
  _storage = new StorageAPI();
  _githubOneGraphAuth: OneGraphAuth = makeOneGraphAuth('github');
  _googleOneGraphAuth: OneGraphAuth = makeOneGraphAuth('google');
  _stripeOneGraphAuth: OneGraphAuth = makeOneGraphAuth('stripe');
  _twitterOneGraphAuth: OneGraphAuth = makeOneGraphAuth('twitter');
  _showBetaSchema: boolean;
  _params: Object;
  graphiql: GraphiQL;
  constructor(props: Props) {
    super(props);
    const params = windowParams();
    this._showBetaSchema = !!this._storage.get(BETA_SCHEMA_STORAGE_KEY);
    this.state = {
      githubLoggedIn: null,
      googleLoggedIn: null,
      stripeLoggedIn: null,
      twitterLoggedIn: null,
      onegraphLoggedIn: null,
      sfdcLoggedIn: null,
      query: params.query
        ? decodeURIComponent(params.query)
        : defaultQuery(this._showBetaSchema),
      variables: params.variables ? decodeURIComponent(params.variables) : '',
      explorerIsOpen: this._storage.get(EXPLORER_STORAGE_KEY),
      params,
      selectedNodes: new Set([]),
      queryResultMessage: 'Request time: -ms',
      rawSchema: null,
      schema: null,
      apps: [DEFAULT_APP],
      activeApp: DEFAULT_APP,
    };
    this._params = params;
  }
  _graphQLFetch = (params: Object): Object => {
    return graphQLFetcher(Config.fetchUrl, this.state.activeApp.id, {
      ...params,
      showBetaSchema: this._showBetaSchema,
    });
  };

  _graphiqlFetch = (params: Object): Object => {
    const startTs = Date.now();
    return this._graphQLFetch(params).then(result => {
      this.setState({
        queryResultMessage:
          'Request time: ' + ((Date.now() - startTs) | 0) + 'ms',
      });
      return result;
    });
  };

  _fetchAuth = () => {
    this._graphQLFetch({query: meQuery}).then(x => {
      this.setState({
        googleLoggedIn: !!getPath(x, ['data', 'me', 'google', 'email']),
        githubLoggedIn: !!getPath(x, ['data', 'me', 'github', 'login']),
        sfdcLoggedIn: !!getPath(x, ['data', 'me', 'sfdc', 'email']),
        stripeLoggedIn: !!getPath(x, ['data', 'me', 'stripe', 'id']),
        twitterLoggedIn: !!getPath(x, ['data', 'me', 'twitter', 'screenName']),
        onegraphLoggedIn: !!getPath(x, ['data', 'me', 'oneGraph', 'id']),
      });
    });
  };
  _fetchApps = () => {
    this._graphQLFetch({query: appsQuery}).then(data => {
      this.setState({
        apps: [DEFAULT_APP].concat(getPath(data, ['data', 'oneGraph', 'apps'])),
      });
    });
  };
  _setupForNewApp = () => {
    this._fetchAuth();
  };
  componentDidMount() {
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
    this._fetchApps();
    this._setupForNewApp();
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (this.state.activeApp.id !== prevState.activeApp.id) {
      this._setupForNewApp();
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this._keyboardEventHandler);
  }

  _keyboardEventHandler = (event: KeyboardEvent) => {
    if (event.ctrlKey && event.altKey && event.keyCode === 66) {
      this._storage.set(
        BETA_SCHEMA_STORAGE_KEY,
        !this._storage.get(BETA_SCHEMA_STORAGE_KEY),
      );
      window.location = window.location;
    }
  };
  setParam = (param: string, value: string) => {
    this._params[param] = value;
    updateURL(this._params);
  };
  onEditQuery = (newQuery: string) => {
    this.setState({
      query: newQuery,
    });
    this.setParam('query', newQuery);
  };
  onEditVariables = (newVariables: string) => {
    this.setParam('variables', newVariables);
  };
  onEditOperationName = (newOperationName: string) => {
    this.setParam('operationName', newOperationName);
  };
  toggleExplorer = () => {
    this.setState(
      currentState => {
        return {
          explorerIsOpen: !currentState.explorerIsOpen,
        };
      },
      args =>
        this._storage.set(EXPLORER_STORAGE_KEY, this.state.explorerIsOpen),
    );
  };
  _appSelector = () => {
    const {activeApp, apps} = this.state;
    return (
      <GraphiQL.Menu
        label={activeApp.name}
        title="Choose the OneGraph app you want to use">
        {apps.map(app => (
          <GraphiQL.MenuItem
            key={app.id}
            label={`${activeApp.id === app.id ? '\u2713 ' : ''}${app.name}`}
            title={`${app.id}`}
            onSelect={() => this.setState({activeApp: app})}
          />
        ))}
        {apps.length === 1 && apps[0] === DEFAULT_APP ? (
          <GraphiQL.MenuItem
            label="Create an app"
            title="Go to OneGraph to create a new app"
            onSelect={() => window.open('https://dash.onegraph.com')}
          />
        ) : null}
      </GraphiQL.Menu>
    );
  };
  render() {
    const showGraphQLSchema = !!this._storage.get(BETA_SCHEMA_STORAGE_KEY);
    return (
      <div>
        {this.state.explorerIsOpen && !!this.state.rawSchema ? (
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
            width: this.state.explorerIsOpen ? '90%' : '100%',
            position: 'absolute',
            right: '0px',
          }}>
          {!!this.state.schema ? (
            <GraphiQL
              ref={c => (this.graphiql = c)}
              fetcher={this._graphiqlFetch}
              onEditQuery={this.onEditQuery}
              onEditVariables={this.onEditVariables}
              onEditOperationName={this.onEditOperationName}
              query={this.state.query}
              response={null}
              variables={this.state.variables}
              operationName={null}
              schema={this.state.schema}>
              <GraphiQL.Logo>OneGraphiQL</GraphiQL.Logo>
              <GraphiQL.Toolbar>
                <GraphiQL.Button
                  onClick={() => this.graphiql.handlePrettifyQuery()}
                  label="Prettify"
                  title="Prettify Query (Shift-Ctrl-P)"
                />
                <GraphiQL.Button
                  onClick={() => this.graphiql.handleToggleHistory()}
                  title="Show History"
                  label="History"
                />
                <GraphiQL.Button
                  onClick={event => {
                    this.toggleExplorer.bind(this)();
                    event.preventDefault();
                    return false;
                  }}
                  label="Explorer"
                  title="Toggle Explorer"
                />
                <GraphiQL.Menu label="Authentication" title="Authentication">
                  {showGraphQLSchema ? (
                    <LoginButton
                      oneGraphAuth={this._githubOneGraphAuth}
                      onAuthResponse={this._fetchAuth}
                      isSignedIn={this.state.githubLoggedIn}
                    />
                  ) : null}
                  {showGraphQLSchema ? (
                    <LoginButton
                      oneGraphAuth={this._googleOneGraphAuth}
                      onAuthResponse={this._fetchAuth}
                      isSignedIn={this.state.googleLoggedIn}
                    />
                  ) : null}
                  <LoginButton
                    oneGraphAuth={this._stripeOneGraphAuth}
                    onAuthResponse={this._fetchAuth}
                    isSignedIn={this.state.stripeLoggedIn}
                  />
                  {showGraphQLSchema ? (
                    <LoginButton
                      oneGraphAuth={this._twitterOneGraphAuth}
                      onAuthResponse={this._fetchAuth}
                      isSignedIn={this.state.twitterLoggedIn}
                    />
                  ) : null}
                </GraphiQL.Menu>
                {this._appSelector()}
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
