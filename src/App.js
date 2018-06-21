// @flow

import React from 'react';
import GraphiQL from '@onegraph/graphiql';
import StorageAPI from '@onegraph/graphiql/dist/utility/StorageAPI';
import '@onegraph/graphiql/graphiql.css';
import Graphitree from './graphitree';
import {defaultQuery} from './oneGraphQL';
import {introspectionQuery, buildClientSchema} from 'graphql';
import {getPath} from './utils';
import Config from './Config';
import OneGraphAuth from 'onegraph-auth';
import prettyPrint from './prettyPrint';
import Search from './Search';

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
  showBetaSchema: boolean,
  oneGraphAuth: OneGraphAuth,
  graphQLParams: Object,
): Promise<Object | string> {
  const url = new URL(serveUrl);
  url.searchParams.set('app_id', appId);
  return fetch(url.toString(), {
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      show_beta_schema: !!showBetaSchema,
      ...oneGraphAuth.authHeaders(),
    },
    body: JSON.stringify(graphQLParams),
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
    })
    .catch(function(err) {
      return {
        errors: [
          "Network error. Hint: Did you enable 'https://graphiql.onegraphapp.com' under your app's CORS origins in the OneGraph dashboard?",
        ],
      };
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
  service: Service,
  onAuthResponse: (response: AuthResponse) => void,
  isSignedIn: ?boolean,
};

// eslint-disable-next-line
const _devTimeLoginButtonForNewAuthService = (service, isSignedIn, href) => {
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

class LoginButton extends React.Component<
  LoginButtonProps,
  {loading: boolean},
> {
  state = {loading: false};
  _onSelect = async (): Promise<void> => {
    const {oneGraphAuth, service, onAuthResponse} = this.props;
    try {
      this.setState({loading: true});
      const authResponse = await oneGraphAuth.login(service);
      onAuthResponse(authResponse);
      this.setState({loading: false});
    } catch (e) {
      console.error(e);
      this.setState({loading: false});
    }
  };
  render() {
    const {oneGraphAuth, service, isSignedIn} = this.props;
    const serviceName = oneGraphAuth.friendlyServiceName(service);
    return (
      <GraphiQL.MenuItem
        key={serviceName}
        label={(isSignedIn ? '\u2713 ' : 'Log in to ') + serviceName}
        disabled={this.state.loading || isSignedIn}
        title={serviceName}
        onSelect={this._onSelect}
      />
    );
  }
}

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

const searchQueriesQuery = `
  query searchQueries($query: String!) {
    oneGraph {
      searchQueries(query: $query) {
        name
        description
        body
        public
      }
    }
  }
`;

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
  salesforceLoggedIn: ?boolean,
  stripeLoggedIn: ?boolean,
  twitterLoggedIn: ?boolean,
  sfdcLoggedIn: ?boolean,
  twilioLoggedIn: ?boolean,
  eventilLoggedIn: ?boolean,
  zendeskLoggedIn: ?boolean,
  operationName: string,
  activeApp: {id: string, name: string},
};

const DEFAULT_APP = {
  name: 'onegraphiql',
  id: Config.appId,
};

function getAppFromURL(): ?{id: string, name: string} {
  const url = new URL(window.location);
  const id = url.searchParams.get('appId');
  const name = url.searchParams.get('appName'); // TODO: lookup name from API
  if (id && name) {
    return {id, name};
  }
}

class App extends React.Component<Props, State> {
  _storage = new StorageAPI();
  _oneGraphAuth: OneGraphAuth;
  _showBetaSchema: boolean;
  _params: Object;
  _defaultApp: {id: string, name: string};
  graphiql: GraphiQL;

  constructor(props: Props) {
    super(props);
    const params = windowParams();
    this._showBetaSchema = !!this._storage.get(BETA_SCHEMA_STORAGE_KEY);
    const appFromURL = getAppFromURL();
    this._defaultApp = appFromURL || DEFAULT_APP;
    this.state = {
      eventilLoggedIn: null,
      githubLoggedIn: null,
      googleLoggedIn: null,
      salesforceLoggedIn: null,
      stripeLoggedIn: null,
      twitterLoggedIn: null,
      onegraphLoggedIn: null,
      sfdcLoggedIn: null,
      twilioLoggedIn: null,
      zendeskLoggedIn: null,
      query: params.query
        ? decodeURIComponent(params.query)
        : defaultQuery(this._showBetaSchema),
      variables: params.variables ? decodeURIComponent(params.variables) : '',
      operationName: params.operationName
        ? decodeURIComponent(params.operationName)
        : '',
      explorerIsOpen: this._storage.get(EXPLORER_STORAGE_KEY),
      params,
      selectedNodes: new Set([]),
      queryResultMessage: 'Request time: -ms',
      rawSchema: null,
      schema: null,
      apps: [this._defaultApp],
      activeApp: this._defaultApp,
    };
    this._params = params;
    this._resetAuths(this._defaultApp.id);
  }
  _resetAuths = (appId: string) => {
    this._oneGraphAuth = new OneGraphAuth({
      oneGraphOrigin: Config.oneGraphOrigin,
      appId,
    });
  };
  _graphQLFetch = (params: Object): Object => {
    return graphQLFetcher(
      Config.fetchUrl,
      params.appId || this.state.activeApp.id,
      this._showBetaSchema,
      this._oneGraphAuth,
      params,
    );
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
    this._oneGraphAuth
      .isLoggedIn('eventil')
      .then(eventilLoggedIn => this.setState({eventilLoggedIn}));
    this._oneGraphAuth
      .isLoggedIn('github')
      .then(githubLoggedIn => this.setState({githubLoggedIn}));
    this._oneGraphAuth
      .isLoggedIn('google')
      .then(googleLoggedIn => this.setState({googleLoggedIn}));
    this._oneGraphAuth
      .isLoggedIn('salesforce')
      .then(salesforceLoggedIn => this.setState({salesforceLoggedIn}));
    this._oneGraphAuth
      .isLoggedIn('stripe')
      .then(stripeLoggedIn => this.setState({stripeLoggedIn}));
    this._oneGraphAuth
      .isLoggedIn('twitter')
      .then(twitterLoggedIn => this.setState({twitterLoggedIn}));
    this._oneGraphAuth
      .isLoggedIn('twilio')
      .then(twilioLoggedIn => this.setState({twilioLoggedIn}));
    this._oneGraphAuth
      .isLoggedIn('zendesk')
      .then(zendeskLoggedIn => this.setState({zendeskLoggedIn}));
  };
  _fetchApps = () => {
    this._graphQLFetch({
      query: appsQuery,
      // Always use GraphiQL's appId when fetching apps
      appId: Config.appId,
    }).then(data => {
      this.setState({
        apps: [this._defaultApp]
          .concat(getPath(data, ['data', 'oneGraph', 'apps']))
          .filter(Boolean)
          .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0)),
      });
    });
  };
  _setupForNewApp = () => {
    this._resetAuths(this.state.activeApp.id);
    this._fetchAuth();
  };
  componentDidMount() {
    this._graphQLFetch({
      query: introspectionQuery,
      // Always use GraphiQL's appId when fetching the schema
      appId: Config.appId,
    }).then(result => {
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
  onEditVariables = (variables: string) => {
    this.setState({variables});
    this.setParam('variables', variables);
  };
  onEditOperationName = (operationName: string) => {
    this.setState({operationName});
    this.setParam('operationName', operationName);
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

  handlePrettifyQuery = () => {
    try {
      const editor = this.graphiql.getQueryEditor();
      editor.setValue(prettyPrint(editor.getValue()));
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  render() {
    return (
      <div>
        <div
          className="graphiql-container"
          style={{
            height: '100vh',
            display: 'flex',
          }}>
          <div
            className="historyPaneWrap"
            style={{
              height: '100vh',
              width: '230px',
              zIndex: 7,
              display: this.state.explorerIsOpen ? 'block' : 'none',
            }}>
            <div className="history-title-bar">
              <div className="history-title">Explorer</div>
              <div className="doc-explorer-rhs">
                <div className="docExplorerHide" onClick={this.toggleExplorer}>
                  {'\u2715'}
                </div>
              </div>
            </div>
            <div className="history-contents">
              {this.state.schema ? (
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
              ) : null}
            </div>
          </div>
          <div
            style={{
              width: this.state.explorerIsOpen
                ? 'calc(100vw - 230px)'
                : '100vw',
            }}>
            <GraphiQL
              ref={c => (this.graphiql = c)}
              fetcher={this._graphiqlFetch}
              onEditQuery={this.onEditQuery}
              onEditVariables={this.onEditVariables}
              onEditOperationName={this.onEditOperationName}
              query={this.state.query}
              variables={this.state.variables}
              operationName={this.state.operationName}
              schema={this.state.schema}>
              <GraphiQL.Logo>OneGraphiQL</GraphiQL.Logo>
              <GraphiQL.Toolbar>
                <GraphiQL.Button
                  onClick={this.handlePrettifyQuery}
                  label="Prettify"
                  title="Prettify Query (Shift-Ctrl-P)"
                />
                <GraphiQL.Button
                  onClick={() => this.graphiql.handleToggleHistory()}
                  title="Show History"
                  label="History"
                />
                <GraphiQL.Button
                  onClick={this.toggleExplorer}
                  label="Explorer"
                  title="Toggle Explorer"
                />
                <GraphiQL.Menu label="Authentication" title="Authentication">
                  {/*
               _devTimeLoginButtonForNewAuthService(
               'Zendesk',
               this.state.zendeskLoggedIn,
               Config.authUrl('zendesk'),
               )
             */}
                  <LoginButton
                    oneGraphAuth={this._oneGraphAuth}
                    service="eventil"
                    onAuthResponse={this._fetchAuth}
                    isSignedIn={this.state.eventilLoggedIn}
                  />
                  <LoginButton
                    oneGraphAuth={this._oneGraphAuth}
                    service="github"
                    onAuthResponse={this._fetchAuth}
                    isSignedIn={this.state.githubLoggedIn}
                  />
                  <LoginButton
                    oneGraphAuth={this._oneGraphAuth}
                    service="google"
                    onAuthResponse={this._fetchAuth}
                    isSignedIn={this.state.googleLoggedIn}
                  />
                  <LoginButton
                    oneGraphAuth={this._oneGraphAuth}
                    service="salesforce"
                    onAuthResponse={this._fetchAuth}
                    isSignedIn={this.state.salesforceLoggedIn}
                  />
                  <LoginButton
                    oneGraphAuth={this._oneGraphAuth}
                    service="stripe"
                    onAuthResponse={this._fetchAuth}
                    isSignedIn={this.state.stripeLoggedIn}
                  />
                  <LoginButton
                    oneGraphAuth={this._oneGraphAuth}
                    service="twilio"
                    onAuthResponse={this._fetchAuth}
                    isSignedIn={this.state.twilioLoggedIn}
                  />
                  <LoginButton
                    oneGraphAuth={this._oneGraphAuth}
                    service="twitter"
                    onAuthResponse={this._fetchAuth}
                    isSignedIn={this.state.twitterLoggedIn}
                  />
                </GraphiQL.Menu>
                {/*
                  Remove app selector until we have a way to authenticate to OneGraph from graphiql
                  {this._appSelector()}
                   */}

                <Search
                  placeholder={'Search queries...'}
                  onSuggestionSelected={(
                    event,
                    {
                      suggestion,
                      suggestionValue,
                      suggestionIndex,
                      sectionIndex,
                      method,
                    },
                  ) => {
                    this.graphiql.getQueryEditor().setValue(suggestion.body);
                  }}
                  getSuggestions={(value, cb) => {
                    const query = value;
                    if (!query || query.length < 4) {
                      return null;
                    }
                    this._graphQLFetch({
                      query: searchQueriesQuery,
                      appId: this.state.activeApp.id,
                      variables: {query},
                    }).then(result => {
                      console.log(
                        'Search results for `' + query + '`: ',
                        result,
                      );
                      cb(result);
                    });
                  }}
                />
              </GraphiQL.Toolbar>
              <GraphiQL.Footer>
                <div
                  style={{
                    display: 'flex',
                    height: '3em',
                    alignItems: 'center',
                    paddingLeft: '1em',
                  }}>
                  {this.state.schema ? (
                    this.state.queryResultMessage
                  ) : (
                    <div>
                      <div className="inline-spinner">
                        <div className="spinner-container">
                          <div className="spinner" />
                        </div>
                      </div>
                      Loading schema...
                    </div>
                  )}
                </div>
              </GraphiQL.Footer>
            </GraphiQL>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
