/* eslint-disable */
// Generated by BUCKLESCRIPT VERSION 3.1.5, PLEASE EDIT WITH CARE
'use strict';

var $$Array = require('bs-platform/lib/js/array.js');
var Block = require('bs-platform/lib/js/block.js');
var Curry = require('bs-platform/lib/js/curry.js');
var React = require('react');
var Js_exn = require('bs-platform/lib/js/js_exn.js');
var Belt_Id = require('bs-platform/lib/js/belt_Id.js');
var Graphql = require('graphql');
var Caml_obj = require('bs-platform/lib/js/caml_obj.js');
var ReasonReact = require('reason-react/src/ReasonReact.js');
var Js_primitive = require('bs-platform/lib/js/js_primitive.js');
var Js_null_undefined = require('bs-platform/lib/js/js_null_undefined.js');
var Caml_builtin_exceptions = require('bs-platform/lib/js/caml_builtin_exceptions.js');
var Option$GraphiqlExplorer = require('../option.bs.js');
var Printer$GraphiqlExplorer = require('./printer.bs.js');
var ReGraphQL$GraphiqlExplorer = require('../graphql/ReGraphQL.bs.js');
var ReactTree$GraphiqlExplorer = require('./reactTree.bs.js');
var TreeEntry$GraphiqlExplorer = require('./treeEntry.bs.js');
var GraphQLTypes$GraphiqlExplorer = require('./graphQLTypes.bs.js');

function cmp(param, param$1) {
  var c = Caml_obj.caml_compare(param[0], param$1[0]);
  if (c !== 0) {
    return c;
  } else {
    return Caml_obj.caml_compare(param[1], param$1[1]);
  }
}

var Comparable1 = Belt_Id.MakeComparable(
  /* module */ Block.localModule(['cmp'], [cmp]),
);

var component = ReasonReact.reducerComponent('GraphiQL.Explorer');

function topLevelEntry(ctx, subFieldsFor, topIndex, obj) {
  if (obj) {
    var obj$1 = obj[0];
    var name = obj$1.name;
    var match = topIndex === 0;
    var match$1 = topIndex === 0;
    var tmp = {
      borderBottom: '1px solid #d6d6d6',
      padding: '6px',
    };
    var tmp$1 = match
      ? /* None */ 0
      : /* Some */ Block.simpleVariant('Some', ['1px solid #d6d6d6']);
    if (tmp$1) {
      tmp.borderTop = tmp$1[0];
    }
    var tmp$2 = match$1
      ? /* None */ 0
      : /* Some */ Block.simpleVariant('Some', ['10px']);
    if (tmp$2) {
      tmp.marginTop = tmp$2[0];
    }
    return ReasonReact.element(
      /* None */ 0,
      /* None */ 0,
      ReactTree$GraphiqlExplorer.make(
        React.createElement(
          'div',
          {
            style: tmp,
          },
          name,
        ),
        /* array */ [
          $$Array.mapi(function(idx, field) {
            return ReasonReact.element(
              /* Some */ Block.simpleVariant('Some', [String(idx)]),
              /* None */ 0,
              TreeEntry$GraphiqlExplorer.make(
                ctx,
                field,
                name + ('.' + field.name),
                obj$1,
                subFieldsFor,
                /* None */ 0,
                /* array */ [],
              ),
            );
          }, Curry._1(
            ReGraphQL$GraphiqlExplorer
              .Schema[/* ObjectType */ 4][/* getFields */ 0],
            obj$1,
          )),
        ],
      ),
    );
  } else {
    return null;
  }
}

var rootField = {
  args: /* array */ [],
  deprecationReason: Js_null_undefined.fromOption(/* None */ 0),
  description: Js_null_undefined.fromOption(/* None */ 0),
  isDeprecated: false,
  name: 'Root',
};

function make(clientSchema, onEdit, queryText, debounceMs, _) {
  return /* record */ Block.record(
    [
      'debugName',
      'reactClassInternal',
      'handedOffState',
      'willReceiveProps',
      'didMount',
      'didUpdate',
      'willUnmount',
      'willUpdate',
      'shouldUpdate',
      'render',
      'initialState',
      'retainedProps',
      'reducer',
      'jsElementWrapped',
    ],
    [
      component[/* debugName */ 0],
      component[/* reactClassInternal */ 1],
      component[/* handedOffState */ 2],
      function(self) {
        var match =
          self[/* state */ 1][/* queryText */ 1] ===
          Option$GraphiqlExplorer.$$default('', queryText);
        if (match) {
          return self[/* state */ 1];
        } else {
          var text = Option$GraphiqlExplorer.$$default('', queryText);
          var timeOffset = Option$GraphiqlExplorer.$$default(1000, debounceMs);
          var debounceAfter = Date.now() + ((timeOffset - 10) | 0);
          setTimeout(function() {
            return Curry._1(
              self[/* send */ 3],
              /* SyncQueryText */ Block.variant('SyncQueryText', 3, [text]),
            );
          }, timeOffset);
          var init = self[/* state */ 1];
          return /* record */ Block.record(
            ['root', 'queryText', 'debounceAfter'],
            [
              init[/* root */ 0],
              init[/* queryText */ 1],
              Block.simpleVariant('Some', [debounceAfter]),
            ],
          );
        }
      },
      component[/* didMount */ 4],
      component[/* didUpdate */ 5],
      component[/* willUnmount */ 6],
      component[/* willUpdate */ 7],
      component[/* shouldUpdate */ 8],
      function(param) {
        if (clientSchema) {
          var clientSchema$1 = clientSchema[0];
          var send = param[/* send */ 3];
          var state = param[/* state */ 1];
          var ctx_001 = function(fieldPath, argPath) {
            return Curry._1(
              send,
              /* ToggleArg */ Block.variant('ToggleArg', 1, [
                clientSchema$1,
                fieldPath,
                argPath,
              ]),
            );
          };
          var ctx_002 = function(path) {
            return Curry._1(
              send,
              /* ToggleField */ Block.variant('ToggleField', 0, [
                clientSchema$1,
                path,
              ]),
            );
          };
          var ctx_003 = function(path) {
            return GraphQLTypes$GraphiqlExplorer.isFieldCheckedByPath(
              state[/* root */ 0],
              path,
            );
          };
          var ctx_004 = function(fieldPath, argPath) {
            return GraphQLTypes$GraphiqlExplorer.isArgCheckedByPath(
              state[/* root */ 0],
              fieldPath,
              argPath,
            );
          };
          var ctx_005 = function(fieldPath, argPath) {
            return GraphQLTypes$GraphiqlExplorer.argValueByPath(
              state[/* root */ 0],
              fieldPath,
              argPath,
            );
          };
          var ctx_006 = function(fieldPath, argPath, value) {
            return Curry._1(
              send,
              /* SetArgValue */ Block.variant('SetArgValue', 2, [
                clientSchema$1,
                fieldPath,
                argPath,
                value,
              ]),
            );
          };
          var ctx = /* record */ Block.record(
            [
              'schema',
              'toggleArg',
              'toggleField',
              'isFieldChecked',
              'isArgChecked',
              'getArgValue',
              'setArgValue',
            ],
            [
              clientSchema$1,
              ctx_001,
              ctx_002,
              ctx_003,
              ctx_004,
              ctx_005,
              ctx_006,
            ],
          );
          var query = clientSchema$1.getQueryType();
          var mutation = clientSchema$1.getMutationType();
          var subscription = clientSchema$1.getSubscriptionType();
          var subFieldsFor = function(obj, fieldName) {
            var match = Curry._2(
              ReGraphQL$GraphiqlExplorer
                .Schema[/* ObjectType */ 4][/* getField */ 1],
              obj,
              fieldName,
            );
            if (match) {
              var type_ = Graphql.getNamedType(match[0]['type']);
              return /* tuple */ [
                type_,
                Curry._1(
                  ReGraphQL$GraphiqlExplorer
                    .Schema[/* Field */ 3][/* fieldsForType */ 2],
                  type_,
                ),
              ];
            } else {
              throw [
                Caml_builtin_exceptions.failure,
                'No field found for: ' + fieldName,
              ];
            }
          };
          return React.createElement(
            'div',
            {
              className: 'graphitree',
            },
            topLevelEntry(
              ctx,
              subFieldsFor,
              0,
              query == null
                ? /* None */ 0
                : Block.simpleVariant('Some', [query]),
            ),
            topLevelEntry(
              ctx,
              subFieldsFor,
              1,
              mutation == null
                ? /* None */ 0
                : Block.simpleVariant('Some', [mutation]),
            ),
            topLevelEntry(
              ctx,
              subFieldsFor,
              2,
              subscription == null
                ? /* None */ 0
                : Block.simpleVariant('Some', [subscription]),
            ),
          );
        } else {
          return React.createElement('div', undefined, 'No clientSchema');
        }
      },
      function() {
        var root = /* record */ Block.record(
          ['name', 'checked', 'field', 'args', 'path', 'children'],
          ['Root', true, rootField, 0, '', 0],
        );
        var root$1;
        if (clientSchema && queryText) {
          try {
            root$1 = GraphQLTypes$GraphiqlExplorer.documentToTree(
              clientSchema[0],
              queryText[0],
            );
          } catch (exn) {
            root$1 = root;
          }
        } else {
          root$1 = root;
        }
        return /* record */ Block.record(
          ['root', 'queryText', 'debounceAfter'],
          [root$1, Option$GraphiqlExplorer.$$default('', queryText), 0],
        );
      },
      component[/* retainedProps */ 11],
      function(action, state) {
        if (typeof action === 'number') {
          Curry._1(
            onEdit,
            Printer$GraphiqlExplorer.entriesToGraphQLText(state[/* root */ 0]),
          );
          return /* NoUpdate */ 0;
        } else {
          switch (action.tag | 0) {
            case 0:
              var newRoot = GraphQLTypes$GraphiqlExplorer.toggleFieldByPath(
                action[0],
                state[/* root */ 0],
                action[1],
              );
              var newState_001 = /* queryText */ state[/* queryText */ 1];
              var newState_002 =
                /* debounceAfter */ state[/* debounceAfter */ 2];
              var newState = /* record */ Block.record(
                ['root', 'queryText', 'debounceAfter'],
                [newRoot, newState_001, newState_002],
              );
              console.log('Toggled field in explorer!');
              Curry._1(
                onEdit,
                Printer$GraphiqlExplorer.entriesToGraphQLText(newRoot),
              );
              return /* UpdateWithSideEffects */ Block.variant(
                'UpdateWithSideEffects',
                2,
                [
                  newState,
                  function(param) {
                    var newState = param[/* state */ 1];
                    console.log(
                      'New query:\n',
                      Printer$GraphiqlExplorer.entriesToGraphQLText(
                        newState[/* root */ 0],
                      ),
                    );
                    return Curry._1(
                      onEdit,
                      Printer$GraphiqlExplorer.entriesToGraphQLText(
                        newState[/* root */ 0],
                      ),
                    );
                  },
                ],
              );
            case 1:
              var newRoot$1 = GraphQLTypes$GraphiqlExplorer.toggleArgByPath(
                action[0],
                state[/* root */ 0],
                action[1],
                action[2],
              );
              var newState_001$1 = /* queryText */ state[/* queryText */ 1];
              var newState_002$1 =
                /* debounceAfter */ state[/* debounceAfter */ 2];
              var newState$1 = /* record */ Block.record(
                ['root', 'queryText', 'debounceAfter'],
                [newRoot$1, newState_001$1, newState_002$1],
              );
              console.log('Toggled arg in explorer!');
              Curry._1(
                onEdit,
                Printer$GraphiqlExplorer.entriesToGraphQLText(newRoot$1),
              );
              console.log(
                'data.reason: ',
                GraphQLTypes$GraphiqlExplorer.argByPath(
                  newRoot$1,
                  'Mutation.stripe.refundCharge',
                  'data.reason',
                ),
              );
              return /* UpdateWithSideEffects */ Block.variant(
                'UpdateWithSideEffects',
                2,
                [
                  newState$1,
                  function(param) {
                    return Curry._1(
                      onEdit,
                      Printer$GraphiqlExplorer.entriesToGraphQLText(
                        param[/* state */ 1][/* root */ 0],
                      ),
                    );
                  },
                ],
              );
            case 2:
              console.log('set Arg value in explorer!');
              var newRoot$2 = GraphQLTypes$GraphiqlExplorer.setArgValueByPath(
                action[0],
                state[/* root */ 0],
                action[1],
                action[2],
                action[3],
              );
              var newState_001$2 = /* queryText */ state[/* queryText */ 1];
              var newState_002$2 =
                /* debounceAfter */ state[/* debounceAfter */ 2];
              var newState$2 = /* record */ Block.record(
                ['root', 'queryText', 'debounceAfter'],
                [newRoot$2, newState_001$2, newState_002$2],
              );
              Curry._1(
                onEdit,
                Printer$GraphiqlExplorer.entriesToGraphQLText(newRoot$2),
              );
              return /* UpdateWithSideEffects */ Block.variant(
                'UpdateWithSideEffects',
                2,
                [
                  newState$2,
                  function(param) {
                    return Curry._1(
                      onEdit,
                      Printer$GraphiqlExplorer.entriesToGraphQLText(
                        param[/* state */ 1][/* root */ 0],
                      ),
                    );
                  },
                ],
              );
            case 3:
              var now = Date.now();
              var debounceAfter = Option$GraphiqlExplorer.$$default(
                0.0,
                state[/* debounceAfter */ 2],
              );
              var shouldSync = now > debounceAfter;
              if (clientSchema && shouldSync) {
                try {
                  var newRoot$3 = GraphQLTypes$GraphiqlExplorer.documentToTree(
                    clientSchema[0],
                    action[0],
                  );
                  return /* Update */ Block.variant('Update', 0, [
                    /* record */ Block.record(
                      ['root', 'queryText', 'debounceAfter'],
                      [
                        newRoot$3,
                        state[/* queryText */ 1],
                        state[/* debounceAfter */ 2],
                      ],
                    ),
                  ]);
                } catch (raw_exn) {
                  var exn = Js_exn.internalToOCamlException(raw_exn);
                  console.log(
                    'Failed to generate tree from text, so not syncing: ',
                    exn,
                  );
                  return /* NoUpdate */ 0;
                }
              } else {
                return /* NoUpdate */ 0;
              }
          }
        }
      },
      component[/* jsElementWrapped */ 13],
    ],
  );
}

var explorer = ReasonReact.wrapReasonForJs(component, function(jsProps) {
  return make(
    Js_primitive.null_undefined_to_opt(jsProps.clientSchema),
    jsProps.onEdit,
    Js_primitive.null_undefined_to_opt(jsProps.queryText),
    Js_primitive.null_undefined_to_opt(jsProps.debounceMs),
    jsProps.children,
  );
});

var $$default = explorer;

exports.Comparable1 = Comparable1;
exports.component = component;
exports.topLevelEntry = topLevelEntry;
exports.rootField = rootField;
exports.make = make;
exports.explorer = explorer;
exports.$$default = $$default;
exports.default = $$default;
exports.__esModule = true;
/* Comparable1 Not a pure module */