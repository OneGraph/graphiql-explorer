[@bs.module "../prettyPrint"]
external prettyPrint : string => string = "default";

let maybeFind = (needle, haystack) =>
  try (Some(List.assoc(needle, haystack))) {
  | Not_found => None
  };

open ReGraphQL;

type node = {
  name: string,
  path: array(string),
  typ_: string,
};

type path = string;

type context = {
  schema: ReGraphQL.Schema.t,
  toggleArg: (path, path) => unit,
  toggleField: path => unit,
  isFieldChecked: path => bool,
  isArgChecked: (path, path) => bool,
  getArgValue: (path, path) => option(string),
  setArgValue: (path, path, option(string)) => unit,
};

type argSubField = {
  name: string,
  field: ReGraphQL.Schema.Field.t,
  path: string,
  checked: bool,
  value: option(string),
  children: list((string, argSubField)),
};

type argEntry = {
  name: string,
  checked: bool,
  typ: ReGraphQL.Schema.Type.t_,
  path: string,
  subField: option(argSubField),
};

type argish =
  | Arg(argEntry)
  | ArgField(argSubField);

type entry = {
  name: string,
  checked: bool,
  field: ReGraphQL.Schema.Field.t,
  args: list((string, argEntry)),
  path: string,
  children: list((string, (int, entry))),
};

let lowerCaseFirst = list =>
  switch (list) {
  | [] => []
  | [head] => [Js.String.toLowerCase(head)]
  | [head, ...rest] => [Js.String.toLowerCase(head), ...rest]
  };

let updateFieldAt =
    (
      schema: ReGraphQL.Schema.t,
      root,
      fieldPath: string,
      update: entry => entry,
    )
    : entry => {
  /*Js.log2("updateFieldAt", fieldPath);*/
  let rec findAndUpdateEntry =
          (
            depth,
            (_order: int, entry: entry),
            entryGQLType: Schema.Type.t_,
            traversedPieces,
            pieces,
          )
          : entry =>
    /*(Js.log4("findAndUpdateEntry", depth, entry, List.length(pieces));)*/
    switch (pieces) {
    | [] => update(entry)
    | [nextStep, ...rest] =>
      let path: list(string) = List.concat([traversedPieces, [nextStep]]);
      let rest: list(string) = rest;
      let position = 0;
      let nextGQLTypeCont: ref(option(Schema.Type.t_)) = ref(None);
      /*(Js.log3("Looking for/in: ", nextStep, entry.children);)*/
      let next: (int, entry) =
        try (
          {
            let (_pos, entry) = List.assoc(nextStep, entry.children);
            let nextGQLType =
              (
                switch (depth) {
                | 0 => Schema.Field.toType(entry.field)
                | _ => Schema.Field.type_(entry.field)
                }
              )
              |> Schema.Type.getNamedType;
            nextGQLTypeCont := Some(nextGQLType);
            /*(Js.log3("Found entry, nextGQLType: ", entry, nextGQLType);)*/
            (_pos, entry);
          }
        ) {
        | Not_found =>
          let field =
            switch (depth) {
            | 0 =>
              let r =
                Schema.Field.ofType(entryGQLType |> Schema.Type.getNamedType);
              nextGQLTypeCont := Some(entryGQLType);
              r;
            | _ =>
              /*(Js.log4("At _ depth: ", depth, entryGQLType, nextStep);)*/
              let n =
                Schema.Field.fieldForType(
                  entryGQLType |> Schema.Type.getNamedType,
                  nextStep,
                );
              let n' = Option.expect("FieldForType-" ++ nextStep, n);
              let subType =
                Schema.Field.type_(n') |> Schema.Type.getNamedType;
              /*(Js.log4("\tn: ", n', entryGQLType, nextStep);)*/
              /*(Js.log2("\tSubtype: ", subType);)*/
              nextGQLTypeCont := Some(subType);
              n';
            };
          let nextEntry: entry = {
            name: nextStep,
            checked: false,
            field,
            path: String.concat(".", path),
            children: [],
            args: [],
          };
          (position, nextEntry);
        };
      let nextGQLType =
        Option.expect("GQLType-" ++ nextStep, nextGQLTypeCont^);
      /*(Js.log3(
          "Calling findAndUpdateEntry with nextGQLType: ",
          nextGQLType,
          nextGQLTypeCont,
        );)*/
      let next' = (
        position,
        findAndUpdateEntry(depth + 1, next, nextGQLType, path, rest),
      );
      let otherChildren =
        List.filter(((name, _)) => name != nextStep, entry.children);
      {...entry, children: [(nextStep, next'), ...otherChildren]};
    };
  let pieces' = Js.String.split(".", fieldPath) |> Array.to_list;
  let pieces =
    switch (pieces') {
    | [] => []
    | [head] => [Js.String.toLowerCase(head)]
    | [head, ...rest] => [Js.String.toLowerCase(head), ...rest]
    };
  let gqlType' =
    switch (Js.String.toLowerCase(List.hd(pieces))) {
    | "query" => Schema.getQueryType(schema)
    | "mutation" => Schema.getMutationType(schema)
    | "subscription" => Schema.getSubscriptionType(schema)
    | other => raise(Failure("Unrecognized root field: " ++ other))
    };
  let gqlType =
    gqlType' |> Option.expect("Base GQL Type") |> Schema.ObjectType.toType;
  findAndUpdateEntry(0, (0, root), gqlType, [], pieces);
};

let fieldByPath = (root, fieldPath) => {
  let rec findEntry = ((_order: int, entry: entry), pieces) : option(entry) =>
    switch (pieces) {
    | [] => Some(entry)
    | [nextStep, ...rest] =>
      /* /*(Js.log4(
           "fieldByPath: Looking for ",
           nextStep,
           " in ",
           List.map(((name, _)) => name, entry.children)
           |> String.concat(", "),
         );)*/ */
      try (findEntry(List.assoc(nextStep, entry.children), rest)) {
      | Not_found => None
      }
    };
  let pathPieces =
    Js.String.split(".", fieldPath) |> Array.to_list |> lowerCaseFirst;
  findEntry((0, root), pathPieces);
};

let isFieldCheckedByPath = (root, fieldPath: string) : bool => {
  let result =
    switch (fieldByPath(root, fieldPath)) {
    | None => false
    | Some(entry) => entry.checked
    };
  /* /*(Js.log3("Looking for fieldChecked by path: ", fieldPath, result);)*/ */
  result;
};

let stripOrdering = (items: list((string, (int, 'a)))) =>
  List.map(((name, (_, item))) => (name, item), items);

let gqlArgOfField = (field: Schema.Field.t, argPath) => {
  let _argPathPieces = Js.String.split(".", argPath) |> Array.to_list;
  let _fieldArgs = Schema.Field.argFieldByPath(field, _argPathPieces);
  /*(Js.log3("gqlArgOfField: ", field, fieldArgs);)*/
  None;
};

let toggleFieldByPath = (schema: ReGraphQL.Schema.t, root, fieldPath: string) =>
  updateFieldAt(
    schema,
    root,
    fieldPath,
    entry => {
      /* /*(Js.log4(
           "Toggling fieldChecked by path (before => after): ",
           fieldPath,
           entry.checked,
           ! entry.checked,
         );)*/ */
      ();
      {...entry, checked: ! entry.checked};
    },
  );

let entryArgByName = (entry: entry, name: string) : option(argEntry) =>
  maybeFind(name, entry.args);

/* TODO: Log here to see why the values come back as None */
let argByPath = (root, fieldPath, argPath) : option(argish) =>
  fieldByPath(root, fieldPath)
  |. Option.fmap(entry => {
       let rec findArg =
               (argFieldT: option(argSubField), pieces: list(string))
               : option(argish) =>
         argFieldT
         |. Option.fmap(argField =>
              switch (pieces) {
              | [] => Some(ArgField(argField))
              | [nextStep, ...rest] =>
                maybeFind(nextStep, argField.children) |. findArg(rest)
              }
            );
       let argPathPieces = Js.String.split(".", argPath) |> Array.to_list;
       switch (argPathPieces) {
       | [] => raise(Failure("bad arg path (empty)"))
       | [head] =>
         entryArgByName(entry, head) |. Option.map(arg => Arg(arg))
       | [head, ...rest] =>
         entryArgByName(entry, head)
         |. Option.fmap(arg => findArg(arg.subField, rest))
       };
     });

let isArgCheckedByPath = (root, fieldPath: string, argPath: string) : bool =>
  argByPath(root, fieldPath, argPath)
  |. Option.map(arg =>
       switch (arg) {
       | Arg(arg) => arg.checked
       | ArgField(field) => field.checked
       }
     )
  |> Option.default(false);

let argValueByPath =
    (root, fieldPath: string, argPath: string)
    : option(string) =>
  argByPath(root, fieldPath, argPath)
  |. Option.fmap(arg =>
       switch (arg) {
       | Arg(arg) => arg.subField |. Option.fmap(field => field.value)
       | ArgField(field) => field.value
       }
     );

let isFieldGQLObjectOrInputObject = field => {
  let currentFieldBaseType =
    Schema.Field.type_(field) |> Schema.Type.getNamedType;
  switch (
    Schema.Type.isInputObjectType(currentFieldBaseType)
    || Schema.Type.isInputObjectType(currentFieldBaseType)
  ) {
  | false => None
  | true => Some(currentFieldBaseType)
  };
};

let appendChildUniq = (list, childName, child) => {
  let otherChildren = list |> List.filter(((name, _)) => name != childName);
  List.append(otherChildren, [(childName, child)]);
};

let makeDefaultArgField = (name, field, path) => {
  /*(Js.log2("makeDefaultArgField for ", name);)*/
  name,
  checked: false,
  field,
  path,
  value: None,
  children: [],
};

let rec findAndUpdateArgField =
        (
          argField: argSubField,
          argPath: list(string),
          update: argish => argish,
        )
        : option(argSubField) =>
  /*(Js.log2("\tfindAndUpdateArgField.0", argField);)*/
  switch (argPath) {
  | [] =>
    /*(Js.log("\tfindAndUpdateArgField.1");)*/
    /* Coerce to an ArgField here */
    switch (update(ArgField(argField))) {
    | Arg(_arg) => raise(Failure("Got arg back when expected argSubField"))
    | ArgField(updatedField) =>
      /*(Js.log3("\tfindAndUpdateArgField.2:", argField, updatedField);)*/
      Some(updatedField)
    }
  | [head, ...rest] =>
    let finder = ((name, _)) => name == head;
    switch (List.exists(finder, argField.children)) {
    | false =>
      /*(Js.log2("\tfindAndUpdateArgField.3", argField.field);)*/
      isFieldGQLObjectOrInputObject(argField.field)
      |. Option.fmap(currentFieldBaseType
           /*(Js.log2("\tfindAndUpdateArgField.4", currentFieldBaseType);)*/
           =>
             Schema.ObjectType.getField(currentFieldBaseType, head)
             |. Option.map(gqlField => {
                  let nextArgField =
                    makeDefaultArgField(
                      head,
                      gqlField,
                      argField.path ++ "." ++ head,
                    );
                  nextArgField;
                })
             |. Option.fmap(nextArgField => {
                  /*(Js.log2("\tfindAndUpdateArgField.5", nextArgField);)*/
                  let nextChild =
                    findAndUpdateArgField(nextArgField, rest, update);
                  switch (nextChild) {
                  | None => Some(nextArgField)
                  | Some(child) =>
                    Some({
                      ...argField,
                      children:
                        appendChildUniq(argField.children, child.name, child),
                    })
                  };
                })
           )
    | true =>
      let (_, nextArgField) = List.find(finder, argField.children);
      let nextChild = findAndUpdateArgField(nextArgField, rest, update);
      switch (nextChild) {
      | None => Some(nextArgField)
      | Some(child) =>
        Some({
          ...argField,
          children: appendChildUniq(argField.children, child.name, child),
        })
      };
    };
  };

let makeDefaultArgEntry = (name, argType) => {
  let gqlField = {
    "args": [||],
    "deprecationReason": Js.Nullable.fromOption(None),
    "description": Js.Nullable.fromOption(None),
    "isDeprecated": false,
    "name": name,
  };
  Schema.Field.setType(gqlField, argType);
  let subField = {
    name,
    field: gqlField,
    path: name,
    checked: false,
    value: None,
    children: [],
  };
  let argEntry = {
    name,
    checked: false,
    typ: argType,
    path: name,
    subField: Some(subField),
  };
  /*(Js.log3("makeDefaultArgEntry: ", name, argEntry);)*/
  argEntry;
};

let findAndUpdateArgEntry =
    (fieldEntry: entry, argPath: list(string), update: argish => argish)
    : option(argEntry) =>
  switch (argPath) {
  | [] => raise(Failure("Bad (empty) argPath in findAndUpdateArgEntry"))
  | [head] =>
    /* Js.log2("findAndUpdateArgEntry.0", head); */
    maybeFind(head, fieldEntry.args)
    |> (
      maybeEntry =>
        switch (maybeEntry) {
        | None =>
          /* Js.log2("findAndUpdateArgEntry.0.1", head); */
          let arg = Schema.Field.argByName(fieldEntry.field, head);
          switch (arg) {
          | None =>
            /* Js.log("Bail out here"); */
            None
          | Some(arg) =>
            /* Js.log2("findAndUpdateArgEntry.0.2", head); */
            let argType =
              Schema.Field.Arg.type_(arg) |> Schema.Type.getNamedType;
            /* Js.log2("argType:", argType); */
            let argEntry = makeDefaultArgEntry(head, argType);
            Some(argEntry);
          };
        | Some(entry) =>
          /* Js.log2("findAndUpdateArgEntry.0.3", head); */
          Some(entry)
        }
    )
    |. Option.map(arg
         /* Js.log2("findAndUpdateArgEntry.0.4", head); */
         => update(Arg(arg)))
    |. Option.map(argish =>
         switch (argish) {
         | Arg(arg) => arg
         | ArgField(_field) =>
           raise(Failure("Got field back when expected argEntry"))
         }
       )
  | [head, ...rest] =>
    /* let restLog = String.concat(".", rest); */
    /* Js.log3("findAndUpdateArgEntry.1", head, restLog); */
    switch (maybeFind(head, fieldEntry.args)) {
    | None =>
      /* This would be triggered if we toggled a descendant of an argEntry without creating an argEntry first */
      raise(Failure("findAndUpdateArgEntry.1.1: Couldn't maybeFind arg"))
    | Some(argEntry) =>
      /*(Js.log2("findAndUpdateArgEntry.3.0: Found argEntry: ", argEntry);)*/
      /* TODO: Handle case where entry is missing, create default field */
      /* TODO: Handle other case */
      /* Js.log3("findAndUpdateArgEntry.3.1", head, restLog); */
      switch (argEntry.subField) {
      | None =>
        /* Js.log2("Now bail out", argEntry.subField); */
        None
      | Some(field) =>
        let newField = findAndUpdateArgField(field, rest, update);
        /* Js.log2(
             "findAndUpdateArgEntry.3.2: findAndUpdateArgField returned: ",
             newField,
           ); */
        Some({...argEntry, subField: newField});
      }
    }
  };

let updateArgAt =
    (
      schema: ReGraphQL.Schema.t,
      root,
      fieldPath: string,
      argPath: string,
      update: argish => argish,
    )
    : entry => {
  let argPathPieces = Js.String.split(".", argPath) |> Array.to_list;
  let updater = (entry: entry) => {
    let _oldValue = argValueByPath(root, fieldPath, argPath);
    let newArgEntryT = findAndUpdateArgEntry(entry, argPathPieces, update);
    switch (newArgEntryT) {
    | None =>
      /*(Js.log3(
          "Not updateArgAt because no value returned for path ",
          fieldPath,
          argPath,
        );)*/
      entry
    | Some(newArgEntry) =>
      let _isOldArgChecked = isArgCheckedByPath(root, fieldPath, argPath);
      /*(Js.log4(
          "Updated path",
          Printf.sprintf(
            "%s>%s [checked? %b => %b]",
            fieldPath,
            argPath,
            isOldArgChecked,
            newArgEntry.checked,
          ),
          oldValue,
          argValueByPath(root, fieldPath, argPath),
        );)*/
      let newArgs =
        entry.args
        |> List.filter(((name, _arg)) => name != newArgEntry.name)
        |> List.append([(newArgEntry.name, newArgEntry)]);
      {...entry, args: newArgs};
    };
  };
  /*(Js.log3("Attempt to update:", fieldPath, argPath);)*/
  updateFieldAt(schema, root, fieldPath, updater);
};

let toggleArgByPath =
    (schema: ReGraphQL.Schema.t, root, fieldPath: string, argPath: string) =>
  /*(Js.log2(
      "Attempt argToggle: ",
      Printf.sprintf("%s>%s", fieldPath, argPath),
    );)*/
  updateArgAt(schema, root, fieldPath, argPath, argish
    /* /*(Js.log4(
         "Toggling argChecked by path (before => after): ",
         fieldPath ++ ">" ++ argPath,
         arg.checked,
         ! arg.checked,
       );)*/ */
    =>
      switch (argish) {
      | Arg(arg) =>
        let isChecked = ! arg.checked;
        let subField =
          switch (arg.subField) {
          | None => None
          | Some(subField) => Some({...subField, checked: isChecked})
          };
        let newArg = {...arg, checked: isChecked, subField};
        /*(Js.log4(
            "\t\t\tToggling arg: ",
            Printf.sprintf("%s>%s", fieldPath, argPath),
            arg,
            newArg,
          );)*/
        Arg(newArg);
      | ArgField(field) =>
        let newField = {...field, checked: ! field.checked};
        /*(Js.log4(
            "\t\t\tToggling argField: ",
            Printf.sprintf("%s>%s", fieldPath, argPath),
            field,
            newField,
          );)*/
        ArgField(newField);
      }
    );

let argishValue = (argish: argish) =>
  switch (argish) {
  | Arg(arg) => arg.subField |. Option.fmap(field => field.value)
  | ArgField(field) => field.value
  };

let setArgValueByPath =
    (
      schema: ReGraphQL.Schema.t,
      root,
      fieldPath: string,
      argPath: string,
      value: option(string),
    ) => {
  /*(Js.log4(
      "Attempt set argValue by path:",
      Printf.sprintf("%s>%s", fieldPath, argPath),
      value,
      root,
    );)*/
  let newRoot =
    updateArgAt(
      schema,
      root,
      fieldPath,
      argPath,
      argish => {
        ();
        /*(Js.log4(
            "Setting argValue by path (before => after): ",
            fieldPath ++ ">" ++ argPath,
            argishValue(argish),
            value,
          );)*/
        switch (argish) {
        | Arg(arg) =>
          let field =
            Option.expect("setArgValueByPath for Arg(arg)", arg.subField);
          let field = {...field, value};
          let entry = {...arg, subField: Some(field)};
          /*(Js.log2("setArgValueByPath argEntry: ", entry);)*/
          Arg(entry);
        | ArgField(field) =>
          let argField = {...field, value};
          /*(Js.log2("setArgValueByPath argField: ", argField);)*/
          ArgField(argField);
        };
      },
    );
  /* /*(Js.log2("\tUpdated value: ", argValueByPath(root, fieldPath, argPath));)*/ */
  newRoot;
};

let rootField = {
  "args": [||],
  "deprecationReason": Js.Nullable.fromOption(None),
  "description": Js.Nullable.fromOption(None),
  "isDeprecated": false,
  "name": "Root",
};

type documentAction =
  | CheckField(string)
  | CheckArg(string, string)
  | SetArgValue(string, string, option(string));

let documentToTree = (schema, text: string) : entry => {
  let rec addNestedArguments =
          (
            depth: int,
            fieldPath: string,
            baseArgPath: option(string),
            dangerArg,
          )
          : list(documentAction) => {
    /* Js.log2("\tdangerArg:", dangerArg); */
    let _isNested =
      switch (dangerArg##value##kind) {
      | "ListValue"
      | "ObjectValue" => true
      | _ => false
      };
    /* Js.log3("\tdangerArg##value##kind:", depth, dangerArg##value##kind); */
    switch (dangerArg##value##kind) {
    | "ObjectValue" =>
      let subfields =
        dangerArg##value##fields
        |> Js.Nullable.toOption
        |> Option.default([||])
        |> Array.to_list;
      let argPath =
        switch (baseArgPath) {
        | None => dangerArg##name##value
        | Some(path) => path ++ "." ++ dangerArg##name##value
        };
      List.append(
        [CheckArg(fieldPath, argPath)],
        subfields
        |> List.map(field
             /* Js.log4("\t\tRecur with field/path: ", depth, field, argPath); */
             =>
               addNestedArguments(depth + 1, fieldPath, Some(argPath), field)
             )
        |> List.concat,
      );
    | _other =>
      /* Js.log3("\t\tNot a ObjectValue: ", depth, _other); */
      let argPath =
        switch (baseArgPath) {
        | None => dangerArg##name##value
        | Some(path) => path ++ "." ++ dangerArg##name##value
        };
      let argValue = dangerArg##value##value |> Js.Nullable.toOption;
      [
        CheckArg(fieldPath, argPath),
        SetArgValue(fieldPath, argPath, argValue),
      ];
    };
  };
  let addArgumentsFromSelection =
      (fieldPath: string, selection: Document.SelectionSet.selection)
      : list(documentAction) => {
    let dangerSel = Document.SelectionSet.selectionToObj(selection);
    let args: list(Js.t({..})) =
      dangerSel##arguments
      |> Js.Nullable.toOption
      |> Option.default([||])
      |> Array.to_list;
    /* Js.log4("DangerSel args: ", dangerSel, args, dangerSel##arguments); */
    let actions =
      args
      |> List.map(arg => {
           let isNested =
             switch (arg##value##kind) {
             | "ListValue"
             | "ObjectValue" => true
             | _ => false
             };
           /* Js.log2("\tArg is nested? ", isNested); */
           switch (isNested) {
           | false =>
             let argPath = arg##name##value;
             let argValue = arg##value##value |> Js.Nullable.toOption;
             [
               CheckArg(fieldPath, argPath),
               SetArgValue(fieldPath, argPath, argValue),
             ];
           | true =>
             /* let argPath = arg##name##value; */
             List.append(
               [] /*CheckArg(fieldPath, argPath)*/,
               addNestedArguments(
                 0,
                 fieldPath,
                 None,
                 Document.Arg.toObj(arg),
               ),
             )
           };
         });
    List.concat(actions);
  };
  let rec addChildrenFromSelectionSet =
          (rootPath, selectionSet: Document.SelectionSet.t)
          : list(documentAction) => {
    let selections = selectionSet##selections |> Array.to_list;
    let actions =
      List.map(
        (selection: Document.SelectionSet.selection) => {
          let name = selection##name##value;
          let path = rootPath ++ "." ++ name;
          List.concat([
            [CheckField(path)],
            addArgumentsFromSelection(path, selection),
            switch (Js.Nullable.toOption(selection##selectionSet)) {
            | None => []
            | Some(selectionSet) =>
              addChildrenFromSelectionSet(path, selectionSet)
            },
          ]);
        },
        selections,
      )
      |> List.concat;
    List.append(actions, []);
  };
  let addDefinition =
      (operation: Document.Definition.t)
      : list(documentAction) => {
    let name = operation##operation;
    let _field =
      (
        switch (Js.String.toLowerCase(name)) {
        | "query" => Schema.getQueryType(schema)
        | "mutation" => Schema.getMutationType(schema)
        | "subscription" => Schema.getSubscriptionType(schema)
        | other => raise(Failure("Unrecognized operation kind: " ++ other))
        }
      )
      |> Option.expect("addOperation findOperation");
    let action = CheckField(name);
    let childrenActions =
      addChildrenFromSelectionSet(name, operation##selectionSet);
    [action, ...childrenActions];
  };
  let parsed = Document.parse(text);
  let root: entry = {
    name: "Root",
    checked: true,
    args: [],
    path: "",
    field: rootField,
    children: [],
  };
  let actions =
    parsed##definitions
    |> Array.to_list
    |> List.map(addDefinition)
    |> List.concat;
  /* Js.log2("Final actions: ", Array.of_list(actions)); */
  let finalRoot =
    List.fold_left(
      (root, action) =>
        switch (action) {
        | CheckField(path) =>
          /* Js.log2("Toggle Field Path: ", path); */
          toggleFieldByPath(schema, root, path)
        | CheckArg(fieldPath, argPath) =>
          /* Js.log3("Toggle Arg Path: ", fieldPath, argPath); */
          toggleArgByPath(schema, root, fieldPath, argPath)
        | SetArgValue(fieldPath, argPath, argValue) =>
          /* Js.log4("SetArgValue: ", fieldPath, argPath, argValue); */
          setArgValueByPath(schema, root, fieldPath, argPath, argValue)
        },
      root,
      actions,
    );
  finalRoot;
};
