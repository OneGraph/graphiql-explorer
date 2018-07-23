open ReasonReact;

open ReGraphQL;

type action =
  | Log
  | ToggleField(Schema.t, string)
  | ToggleArg(Schema.t, string, string)
  | SetArgValue(Schema.t, string, string, option(string))
  | SyncQueryText(string);

module Comparable1 =
  Belt.Id.MakeComparable({
    type t = (int, int);
    let cmp = ((a0, a1), (b0, b1)) =>
      switch (Pervasives.compare(a0, b0)) {
      | 0 => Pervasives.compare(a1, b1)
      | c => c
      };
  });

type state = {
  root: GraphQLTypes.entry,
  queryText: string,
  debounceAfter: option(float),
};

type typeName = string;

type path = string;

let component = reducerComponent("GraphiQL.Explorer");

let topLevelEntry =
    (
      ctx,
      subFieldsFor:
        (Schema.ObjectType.t, string) =>
        (Schema.ObjectType.t, array(Schema.Field.t)),
      topIndex,
      obj,
    ) =>
  switch (obj) {
  | None => null
  | Some(obj) =>
    let name = obj##name;

    <ReactTree
      nodeLabel={
        <div
          style=(
            ReactDOMRe.Style.make(
              ~padding="6px",
              ~borderBottom="1px solid #d6d6d6",
              ~borderTop=?topIndex == 0 ? None : Some("1px solid #d6d6d6"),
              ~marginTop=?topIndex == 0 ? None : Some("10px"),
              (),
            )
          )>
          (string(name))
        </div>
      }>
      (
        Array.mapi(
          (idx, field) =>
            <TreeEntry
              key=(string_of_int(idx))
              ctx
              currentObject=obj
              path=(name ++ "." ++ field##name)
              subFieldsFor
              field
            />,
          Schema.ObjectType.getFields(obj),
        )
        |. array
      )
    </ReactTree>;
  };

open GraphQLTypes;

let rootField = {
  "args": [||],
  "deprecationReason": Js.Nullable.fromOption(None),
  "description": Js.Nullable.fromOption(None),
  "isDeprecated": false,
  "name": "Root",
};

let make =
    (
      ~clientSchema: option(Schema.t),
      ~onEdit,
      ~queryText,
      ~debounceMs,
      _children,
    ) => {
  ...component,
  initialState: () => {
    let root: GraphQLTypes.entry = {
      name: "Root",
      checked: true,
      args: [],
      path: "",
      field: rootField,
      children: [],
    };
    let root =
      switch (clientSchema, queryText) {
      | (Some(schema), Some(queryText)) =>
        try (GraphQLTypes.documentToTree(schema, queryText)) {
        | _ => root
        }
      | _ => root
      };
    {root, queryText: Option.default("", queryText), debounceAfter: None};
  },
  reducer: (action, state) =>
    switch (action) {
    | Log =>
      onEdit(Printer.entriesToGraphQLText(state.root));
      NoUpdate;
    | ToggleField(schema, path) =>
      let newRoot = toggleFieldByPath(schema, state.root, path);
      let newState = {...state, root: newRoot};
      Js.log("Toggled field in explorer!");
      onEdit(Printer.entriesToGraphQLText(newState.root));
      UpdateWithSideEffects(
        newState,
        (
          ({state: newState}) => {
            /* onEdit(Printer.entriesToGraphQLText(newState.root)) */
            Js.log2(
              "New query:\n",
              Printer.entriesToGraphQLText(newState.root),
            );
            onEdit(Printer.entriesToGraphQLText(newState.root));
          }
        ),
      );
    | ToggleArg(schema, fieldPath, argPath) =>
      let newRoot = toggleArgByPath(schema, state.root, fieldPath, argPath);
      let newState = {...state, root: newRoot};
      Js.log("Toggled arg in explorer!");
      onEdit(Printer.entriesToGraphQLText(newState.root));
      Js.log2(
        "data.reason: ",
        GraphQLTypes.argByPath(
          newState.root,
          "Mutation.stripe.refundCharge",
          "data.reason",
        ),
      );
      UpdateWithSideEffects(
        newState,
        (
          ({state: newState}) =>
            onEdit(Printer.entriesToGraphQLText(newState.root))
        ),
      );
    | SetArgValue(schema, fieldPath, argPath, value) =>
      Js.log("set Arg value in explorer!");
      let newRoot =
        setArgValueByPath(schema, state.root, fieldPath, argPath, value);
      let newState = {...state, root: newRoot};
      onEdit(Printer.entriesToGraphQLText(newState.root));
      UpdateWithSideEffects(
        newState,
        (
          ({state: newState}) =>
            onEdit(Printer.entriesToGraphQLText(newState.root))
        ),
      );
    | SyncQueryText(queryText) =>
      let now = Js.Date.now();
      let debounceAfter = Option.default(0.0, state.debounceAfter);
      let shouldSync = now > debounceAfter;
      switch (clientSchema, shouldSync) {
      | (Some(schema), true) =>
        try (
          {
            let newRoot = GraphQLTypes.documentToTree(schema, queryText);
            Update({...state, root: newRoot});
          }
        ) {
        | exn =>
          Js.log2("Failed to generate tree from text, so not syncing: ", exn);
          NoUpdate;
        }
      | (_, false) => NoUpdate
      | _ => NoUpdate
      };
    },
  willReceiveProps: self =>
    switch (self.state.queryText == Option.default("", queryText)) {
    | false =>
      let text = Option.default("", queryText);
      let timeOffset = Option.default(1000, debounceMs);
      let debounceAfter = Js.Date.now() +. float_of_int(timeOffset - 10);
      Js.Global.setTimeout(() => self.send(SyncQueryText(text)), timeOffset)
      |> ignore;
      {...self.state, debounceAfter: Some(debounceAfter)};
    | true => self.state
    },
  render: ({state, send}) =>
    switch (clientSchema) {
    | None => <div> (string("No clientSchema")) </div>
    | Some(clientSchema) =>
      let ctx: GraphQLTypes.context = {
        schema: clientSchema,
        toggleField: path =>
          /* Js.log2("toggleField: ", path); */
          send(ToggleField(clientSchema, path)),
        toggleArg: (fieldPath, argPath) =>
          send(ToggleArg(clientSchema, fieldPath, argPath)),
        isFieldChecked: path => isFieldCheckedByPath(state.root, path),
        isArgChecked: (fieldPath, argPath) =>
          isArgCheckedByPath(state.root, fieldPath, argPath),
        getArgValue: (fieldPath, argPath) =>
          argValueByPath(state.root, fieldPath, argPath),
        setArgValue: (fieldPath, argPath, value: option(string)) =>
          send(SetArgValue(clientSchema, fieldPath, argPath, value)),
      };
      let query = Schema.getQueryType(clientSchema);
      let mutation = Schema.getMutationType(clientSchema);
      let subscription = Schema.getSubscriptionType(clientSchema);
      let subFieldsFor =
          (obj: Schema.ObjectType.t, fieldName: string)
          : (Schema.ObjectType.t, array(Schema.Field.t)) =>
        switch (Schema.ObjectType.getField(obj, fieldName)) {
        | None => raise(Failure("No field found for: " ++ fieldName))
        | Some(field) =>
          let type_ = Schema.Field.type_(field) |> Schema.Type.getNamedType;
          (type_, Schema.Field.fieldsForType(type_));
        };
      <div className="graphitree">
        (topLevelEntry(ctx, subFieldsFor, 0, query))
        (topLevelEntry(ctx, subFieldsFor, 1, mutation))
        (topLevelEntry(ctx, subFieldsFor, 2, subscription))
      </div>;
    },
};

[@bs.deriving abstract]
type jsProps = {
  name: Js.nullable(string),
  clientSchema: Js.nullable(Schema.t),
  queryText: Js.nullable(string),
  debounceMs: Js.nullable(int),
  children: array(ReasonReact.reactElement),
  onEdit: string => unit,
};

let explorer =
  ReasonReact.wrapReasonForJs(~component, jsProps =>
    make(
      ~clientSchema=jsProps |. clientSchema |. Js.Nullable.toOption,
      ~onEdit=jsProps |. onEdit,
      ~queryText=jsProps |. queryText |. Js.Nullable.toOption,
      ~debounceMs=jsProps |. debounceMs |. Js.Nullable.toOption,
      jsProps |. children,
    )
  );

let default = explorer;
