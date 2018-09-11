// @flow

import React from 'react';
import GraphiQL from '@onegraph/graphiql';
import StorageAPI from '@onegraph/graphiql/dist/utility/StorageAPI';
import '@onegraph/graphiql/graphiql.css';
import {defaultQuery} from './oneGraphQL';
import {introspectionQuery, buildClientSchema} from 'graphql';
// $FlowFixMe: flow doesn't like graphql-language-service-interface
import {getDiagnostics} from 'graphql-language-service-interface';
import {getPath, debounce, safeURIDecode} from './utils';
import Config from './Config';
import OneGraphAuth from 'onegraph-auth';
import prettyPrint from './prettyPrint';
import copy from 'copy-to-clipboard';
import {ToastContainer, Slide, toast} from 'react-toastify';

import type {AuthResponse, Service, ServicesStatus} from 'onegraph-auth';

import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const Explorer = require('./explorer/explorer.bs').explorer;

// Remove search until we have a way to search public queries
// import Search from './Search';

type AppDetails = {name: string, id: string};

type QueryMetrics = {
  requestMs?: number,
  api?: {
    totalRequestMs: number,
    requestCount: number,
  },
};

function windowParams() {
  const params = {};
  const searchParams = new URL(window.location.href).searchParams;
  for (const key of searchParams.keys()) {
    params[key] = safeURIDecode(searchParams.get(key));
  }
  return params;
}

const BETA_SCHEMA_STORAGE_KEY = 'onegraph:showBetaSchema';
const EXPLORER_STORAGE_KEY = 'onegraph:showExplorer';
const PARAMS_STORAGE_KEY = 'onegraph:params';

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
  url.searchParams.set('show_metrics', 'true');
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
  const url = new URL(window.location.href);
  const searchParams = url.searchParams;
  for (const param of Object.keys(params)) {
    const value = params[param];
    if (value == null) {
      searchParams.delete(param);
    } else {
      searchParams.set(param, encodeURIComponent(value));
    }
  }
  const queryParam = searchParams.toString();
  if (queryParam.length < 15000) {
    window.history.replaceState(null, null, url.pathname + '?' + queryParam);
  }
}

type LoginButtonProps = {
  oneGraphAuth: OneGraphAuth,
  service: Service,
  onAuthResponse: (response: AuthResponse) => void,
  isSignedIn: ?boolean,
  scopes?: ?Array<string>,
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

const PROD_SERVICES = new Set([
  'stripe',
  'github',
  'intercom',
  'eventil',
  'zendesk',
  'salesforce',
]);

class LoginButton extends React.Component<
  LoginButtonProps,
  {loading: boolean},
> {
  state = {loading: false};
  _onSelect = async (e): Promise<void> => {
    const {
      oneGraphAuth,
      service,
      onAuthResponse,
      scopes,
      isSignedIn,
    } = this.props;
    try {
      this.setState({loading: true});
      const serviceName = oneGraphAuth.friendlyServiceName(service);
      if (isSignedIn) {
        if (service === 'slack') {
          const authResponse = await oneGraphAuth.login(service, [
            'users:read',
            'team:read',
            'chat:write:bot',
          ]);
          toast('Logged in to ' + serviceName);
          onAuthResponse(authResponse);
        } else {
          const {result} = await oneGraphAuth.logout(service);
          if (result === 'success') {
            toast('Logged out of ' + serviceName);
          } else {
            toast.error('Error logging out of ' + serviceName);
          }
          onAuthResponse({});
        }
      } else {
        const authResponse = await oneGraphAuth.login(service, scopes);
        toast('Logged in to ' + serviceName);
        onAuthResponse(authResponse);
      }
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
        label={
          (isSignedIn && service !== 'slack'
            ? '\u2713 Log out of '
            : 'Log in to ') +
          (serviceName + (PROD_SERVICES.has(service) ? '' : ' (beta)'))
        }
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

type Props = {};
type State = {
  servicesStatus: ?ServicesStatus,
  apps: Array<{id: string, name: string}>,
  query: string,
  variables: string,
  explorerIsOpen: boolean,
  rawSchema: ?Object,
  schema: ?Object,
  selectedNodes: Object,
  queryMetrics: QueryMetrics,
  operationName: string,
  activeApp: {id: string, name: string},
  exportText: string,
};

const DEFAULT_EXPORT_TEXT = 'Share Query';

const DEFAULT_APP: AppDetails = {
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

class ErrorBoundary extends React.Component<*, {hasError: boolean}> {
  state = {hasError: false};

  componentDidCatch(error, info) {
    // Display fallback UI
    this.setState({hasError: true});
    // You can also log the error to an error reporting service
    console.error('Error in component', error, info);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <div>Something went wrong.</div>;
    }
    return this.props.children;
  }
}

class App extends React.Component<Props, State> {
  _params: {query: string, variables: string, operationName: string};
  _storage = new StorageAPI();
  _oneGraphAuth: OneGraphAuth;
  _showBetaSchema: boolean;
  _defaultApp: AppDetails;
  graphiql: GraphiQL;

  constructor(props: Props) {
    super(props);
    this._showBetaSchema = !!this._storage.get(BETA_SCHEMA_STORAGE_KEY);
    const appFromURL = getAppFromURL();
    this._defaultApp = appFromURL || DEFAULT_APP;
    this._params = this._getInitialParams();
    this.state = {
      servicesStatus: null,
      query: this._params.query,
      variables: this._params.variables,
      operationName: this._params.operationName,
      explorerIsOpen: this._storage.get(
        this._makeStorageKey(this._defaultApp, EXPLORER_STORAGE_KEY),
      ),
      queryMetrics: {},
      selectedNodes: new Set([]),
      rawSchema: null,
      schema: null,
      apps: [this._defaultApp],
      activeApp: this._defaultApp,
      exportText: DEFAULT_EXPORT_TEXT,
    };
    this._resetAuths(this._defaultApp.id);
  }

  _getInitialParams = () => {
    let storedParams = {};
    try {
      storedParams =
        JSON.parse(
          this._storage.get(
            this._makeStorageKey(this._defaultApp, PARAMS_STORAGE_KEY),
          ),
        ) || {};
    } catch (e) {
      console.error('error fetching params from storage', e);
    }
    const urlParams = windowParams();
    return {
      query:
        urlParams.query ||
        storedParams.query ||
        urlParams.defaultQuery ||
        defaultQuery(this._showBetaSchema),
      variables: urlParams.variables || storedParams.variables || '',
      operationName:
        urlParams.operationName || storedParams.operationName || '',
    };
  };

  _makeStorageKey(activeApp: AppDetails, key: string) {
    return activeApp.id + ':' + key;
  }

  _setStorage = (key: string, value: string | boolean) => {
    this._storage.set(this._makeStorageKey(this.state.activeApp, key), value);
  };

  _getStorage = (key: string): string | boolean => {
    return this._storage.get(this._makeStorageKey(this.state.activeApp, key));
  };

  _resetAuths = (appId: string) => {
    this._oneGraphAuth = new OneGraphAuth({
      oneGraphOrigin: Config.oneGraphOrigin,
      appId,
    });
    this.setState({servicesStatus: null});
  };

  _graphQLFetch = (params: Object): Object => {
    return graphQLFetcher(
      Config.fetchUrl,
      this.state.activeApp.id,
      this._showBetaSchema,
      this._oneGraphAuth,
      params,
    );
  };

  _queryError = (query: string) => {
    const {schema} = this.state;
    if (!schema) {
      return;
    }
    const errors = getDiagnostics(query, schema).filter(
      diag => diag.severity === 1,
    );
    console.log('errors', errors);
    if (errors.length) {
      return {
        errors: errors.map(error => ({
          message: error.message,
          locations: [
            {
              line: error.range.start.line + 1,
              column: error.range.start.character + 1,
            },
          ],
        })),
      };
    }
  };

  _graphiqlFetch = (params: Object): Object => {
    const startTs = Date.now();
    return this._graphQLFetch(params).then(result => {
      const metrics = result.extensions && result.extensions.metrics;
      // Don't show metrics in extensions on GraphiQL so that people
      // don't rely on it in their apps
      if (metrics) {
        delete result.extensions.metrics;
        if (Object.keys(result.extensions).length === 0) {
          delete result.extensions;
        }
      }
      this.setState({
        queryMetrics: {...metrics, requestMs: Date.now() - startTs},
      });
      // Replace server error with what graphql-js would produce
      if (result.errors && this._queryError(params.query)) {
        return this._queryError(params.query);
      }
      return result;
    });
  };

  _fetchAuth = () => {
    this._oneGraphAuth
      .servicesStatus()
      .then(servicesStatus => this.setState({servicesStatus}));
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
          const schema = buildClientSchema(result.data);
          return {
            schema: schema,
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
      this._setStorage(
        BETA_SCHEMA_STORAGE_KEY,
        !this._storage.get(BETA_SCHEMA_STORAGE_KEY),
      );
      window.location = window.location;
    }
  };
  storeParamsStar = (param: string, value: string) => {
    this._setStorage(PARAMS_STORAGE_KEY, JSON.stringify(this._params));
    updateURL(this._params);
  };

  storeParams = debounce(this.storeParamsStar, 300);

  onEditQuery = (newQuery: string) => {
    this.setState({
      query: newQuery,
    });
    this._params.query = newQuery;
    this.storeParams();
  };
  onEditVariables = (variables: string) => {
    this.setState({variables});
    this._params.variables = variables;
    this.storeParams();
  };
  onEditOperationName = (operationName: string) => {
    this.setState({operationName});
    this._params.operationName = operationName;
    this.storeParams();
  };
  toggleExplorer = () => {
    this.setState(
      currentState => {
        return {
          explorerIsOpen: !currentState.explorerIsOpen,
        };
      },
      args => this._setStorage(EXPLORER_STORAGE_KEY, this.state.explorerIsOpen),
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

  handleExplorerUpdated = (value: string) => {
    try {
      this.onEditQuery(prettyPrint(value));
    } catch (e) {
      this.onEditQuery(value);
    }
  };

  _exportQuery = () => {
    const shareUrl = new URL(window.location.href);
    for (const param of Object.keys(this._params)) {
      shareUrl.searchParams.set(param, encodeURIComponent(this._params[param]));
    }
    if (copy(shareUrl.toString())) {
      this.setState({exportText: 'Copied to clipboard!'});
      window.setTimeout(
        () => this.setState({exportText: DEFAULT_EXPORT_TEXT}),
        1000,
      );
    } else {
      prompt('Copy the URL to share', shareUrl.toString());
    }
  };

  _footerMessage = () => {
    if (!this.state.schema) {
      return (
        <div>
          <div className="inline-spinner">
            <div className="spinner-container">
              <div className="spinner" />
            </div>
          </div>
          Loading schema...
        </div>
      );
    }
    const metrics = this.state.queryMetrics;
    const apiMetrics = metrics.api || {};
    const metricsString = metric => (metric ? metric.toLocaleString() : '-');
    return (
      <span>
        <span style={{whiteSpace: 'nowrap'}}>
          Request time: {metricsString(metrics.requestMs)}ms
        </span>
        <span> </span>
        <span style={{whiteSpace: 'nowrap'}}>
          | API calls: {metricsString(apiMetrics.requestCount)}
        </span>
        <span> </span>
        <span
          style={{whiteSpace: 'nowrap'}}
          title="Total time to make all API requests. Will often be larger than the request time because OneGraph executes API calls in parallel.">
          | API request time: {metricsString(apiMetrics.totalRequestMs)}ms
        </span>
      </span>
    );
  };

  render() {
    return (
      <div
        className="graphiql-container"
        style={{
          height: '100%',
          display: 'flex',
        }}>
        <ToastContainer
          bodyClassName="toast"
          closeButton={false}
          autoClose={5000}
          hideProgressBar={true}
          transition={Slide}
          style={{padding: 18}}
        />
        <div
          className="historyPaneWrap"
          style={{
            height: '100%',
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
              <ErrorBoundary>
                <Explorer
                  queryText={this.state.query}
                  clientSchema={this.state.schema}
                  debounceMs={250}
                  onEdit={this.handleExplorerUpdated}
                />
              </ErrorBoundary>
            ) : null}
          </div>
        </div>
        <div
          style={{
            width: this.state.explorerIsOpen ? 'calc(100% - 230px)' : '100%',
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
                {this._oneGraphAuth.supportedServices.map((service, i) => (
                  <LoginButton
                    key={i}
                    oneGraphAuth={this._oneGraphAuth}
                    service={service}
                    onAuthResponse={this._fetchAuth}
                    isSignedIn={
                      this.state.servicesStatus
                        ? this.state.servicesStatus[service]
                          ? this.state.servicesStatus[service].isLoggedIn
                          : false
                        : false
                    }
                  />
                ))}
              </GraphiQL.Menu>
              <GraphiQL.Button
                onClick={this._exportQuery}
                label={this.state.exportText}
                title="Get a url for this query in GraphiQL"
              />
              {/*
                  Remove app selector until we have a way to authenticate to OneGraph from graphiql
                  {this._appSelector()}
                   */}

              {/* Remove search until we have a way to search public queries
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
                /> */}
            </GraphiQL.Toolbar>
            <GraphiQL.Footer>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1em',
                  lineHeight: '1.4em',
                }}>
                {this._footerMessage()}
              </div>
            </GraphiQL.Footer>
          </GraphiQL>
        </div>
      </div>
    );
  }
}

export default App;
