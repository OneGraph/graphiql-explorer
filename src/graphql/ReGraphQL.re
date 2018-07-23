module Document = {
  module Arg = {
    type t = {
      .
      "kind": string,
      "name": {
        .
        "kind": string,
        "value": string,
      },
      "value": {
        .
        "kind": string,
        "value": string,
      },
    };
    external toObj : 's => Js.t({..}) = "%identity";
  };
  module SelectionSet = {
    type kindSimpleValue = {
      .
      "kind": string,
      "value": string,
    }
    and selection = {
      .
      "kind": string,
      "value": string,
      "alias": Js.Nullable.t(string),
      "name": {
        .
        "kind": string,
        "value": string,
      },
      "arguments": {
        .
        "kind": string,
        "name": {
          .
          "kind": string,
          "value": string,
        },
        "value": {
          .
          "kind": string,
          "fields":
            Js.Nullable.t(
              array(
                {
                  .
                  "kind": string,
                  "name": kindSimpleValue,
                },
              ),
            ),
        },
      },
      "selectionSet": Js.Nullable.t(t),
    }
    and t = {
      .
      "kind": string,
      "selections": array(selection),
    };
    external selectionToObj : selection => Js.t({..}) = "%identity";
  };
  module Definition = {
    type t = {
      .
      "kind": string,
      "name": Js.Nullable.t(string),
      "operation": string,
      "selectionSet": SelectionSet.t,
    };
  };
  type t = {
    .
    "kind": string,
    "definitions": array(Definition.t),
  };
  [@bs.module "graphql"] external parse : string => t = "";
};

let baseTypeNameFromString = (typeName: string) : string =>
  Js.String.replaceByRe([%re "/[\\[\\]!]/"], typeName, "");

module Schema = {
  module Introspection = {
    type t = {.};
    [@bs.module "graphql"] external query : string = "introspectionQuery";
  };
  module Enum = {
    module Value = {
      type t = {
        .
        "deprecationReason": Js.Nullable.t(string),
        "description": Js.Nullable.t(string),
        "isDeprecated": bool,
        "name": string,
        "value": string,
      };
    };
    type t = {. "name": string};
    [@bs.send] external getValues : t => array(Value.t) = "getValues";
  };
  module Type = {
    type t_ = {. "name": string};
    [@bs.module "graphql"] external introspectionQuery : string = "";
    [@bs.module "graphql"] external isScalarType : t_ => bool = "";
    [@bs.module "graphql"] external isObjectType : t_ => bool = "";
    [@bs.module "graphql"] external isInterfaceType : t_ => bool = "";
    [@bs.module "graphql"] external isUnionType : t_ => bool = "";
    [@bs.module "graphql"] external isListType : t_ => bool = "";
    [@bs.module "graphql"] external isNonNullType : t_ => bool = "";
    [@bs.module "graphql"] external isInputObjectType : t_ => bool = "";
    [@bs.module "graphql"] external isEnumType : t_ => bool = "";
    [@bs.module "graphql"] external getNamedType : t_ => t_ = "";
    [@bs.return nullable] [@bs.get] external ofType : t_ => option(t_) = "";
    let isBooleanType = (t: t_) => {
      let baseType = getNamedType(t);
      baseType##name == "Boolean";
    };
    let toEnumType = (t: t_) : option(Enum.t) =>
      switch (isEnumType(t)) {
      | false => None
      | true => Some(t)
      };
  };
  module Field = {
    module Arg = {
      type t = {
        .
        "name": string,
        "type_": Type.t_,
        "description": Js.Nullable.t(string),
      };
      [@bs.get_index] external type_ : (t, [@bs.as "type"] _) => Type.t_ = "";
    };
    type t = {
      .
      "args": array(Arg.t),
      "deprecationReason": Js.Nullable.t(string),
      "description": Js.Nullable.t(string),
      "isDeprecated": bool,
      "name": string,
    };
    [@bs.get_index] external type_ : (t, [@bs.as "type"] _) => Type.t_ = "";
    [@bs.set_index]
    external setType : (t, [@bs.as "type"] _, Type.t_) => unit = "";
    [@bs.send] external args : t => array(Arg.t) = "";
    let argByName = (t: t, name: string) : option(Arg.t) => {
      let args = t##args;
      let max = Array.length(args);
      let rec helper = idx =>
        idx < max ?
          args[idx]##name == name ? Some(args[idx]) : helper(idx + 1) : None;
      helper(0);
    };
    [@bs.send]
    external fieldsForType_ : Type.t_ => Js.Dict.t(t) = "getFields";
    let fieldsForType = obj : array(t) =>
      try (obj |> fieldsForType_ |> Js.Dict.values) {
      | _ => [||]
      };
    let fieldForType = (obj, name) : option(t) =>
      obj |> fieldsForType_ |. Js.Dict.get(name);
    external toType : t => Type.t_ = "%identity";
    external ofType : Type.t_ => t = "%identity";
    let argFieldByPath = (field: t, path: list(string)) : option(t) => {
      /* First, find the arg by the first part of the path */
      let args = field##args;
      switch (path) {
      | [] => None
      | [argName, ...argPath] =>
        let targetArg =
          Array.fold_left(
            (acc, next: Arg.t) =>
              switch (acc) {
              | None => next##name == argName ? Some(next) : None
              | next => next
              },
            None,
            args,
          );
        switch (targetArg) {
        | None => None
        | Some(arg) =>
          let argType = Arg.type_(arg) |> Type.getNamedType;
          switch (Type.isInputObjectType(argType)) {
          | false => None
          | true =>
            switch (argPath) {
            | [] => None
            | [argStep, ...rest] =>
              let nextField = fieldForType(argType, argStep);
              let rec helper = (field, remainingPath) =>
                switch (remainingPath) {
                | [] => field
                | [argStep, ...rest] =>
                  let nextField = fieldForType(argType, argStep);
                  helper(nextField, rest);
                };
              helper(nextField, rest);
            }
          };
        };
      };
    };
  };
  module ObjectType = {
    type t = {. "name": string};
    [@bs.send] external getFields_ : t => Js.Dict.t(Field.t) = "getFields";
    let getFields = obj : array(Field.t) =>
      obj |> getFields_ |> Js.Dict.values;
    let getField = (obj: t, fieldName: string) : option(Field.t) =>
      obj |> getFields_ |. Js.Dict.get(fieldName);
    [@bs.get_index] external type_ : (t, [@bs.as "type"] _) => Type.t_ = "";
    external toType : t => Type.t_ = "%identity";
    external ofType : Type.t_ => t = "%identity";
  };
  type t;
  type typeMap = {.};
  [@bs.send] external getTypeMap : t => typeMap = "";
  [@bs.send] external getType : (t, string) => Type.t_ = "";
  [@bs.return nullable] [@bs.send]
  external getTypeSafe : (t, string) => option(Type.t_) = "";
  [@bs.return nullable] [@bs.send]
  external getQueryType : t => option(ObjectType.t) = "";
  [@bs.return nullable] [@bs.send]
  external getMutationType : t => option(ObjectType.t) = "";
  [@bs.return nullable] [@bs.send]
  external getSubscriptionType : t => option(ObjectType.t) = "";
  [@bs.module "graphql"]
  external buildClientSchema : Introspection.t => t = "buildClientSchema";
};

type scalarType =
  | IntType(Schema.Type.t_)
  | FloatType(Schema.Type.t_)
  | StringType(Schema.Type.t_)
  | EnumType(Schema.Type.t_)
  | BooleanType(Schema.Type.t_)
  | ObjectType(Schema.Type.t_)
  | InputObjectType(Schema.Type.t_)
  | OtherType(Schema.Type.t_);

type scalarField =
  | IntField(Schema.Field.t)
  | FloatField(Schema.Field.t)
  | StringField(Schema.Field.t)
  | EnumField(Schema.Field.t)
  | BooleanField(Schema.Field.t)
  | ObjectField(Schema.Field.t)
  | InputObjectField(Schema.Field.t)
  | OtherField(Schema.Field.t);

type graphQLType =
  | Object({.})
  | NonNull(graphQLType)
  | List(graphQLType);

let classifyScalarType = (typ: Schema.Type.t_) => {
  let baseType = typ |> Schema.Type.getNamedType;
  switch (baseType##name) {
  | "Int" => IntType(typ)
  | "Float" => IntType(typ)
  | "String" => StringType(typ)
  | "Boolean" => BooleanType(typ)
  | _other =>
    Schema.Type.isEnumType(baseType) ?
      EnumType(typ) :
      Schema.Type.isObjectType(baseType) ?
        ObjectType(typ) :
        Schema.Type.isInputObjectType(baseType) ?
          InputObjectType(typ) : OtherType(typ)
  };
};

let classifyScalarField = (field: Schema.Field.t) => {
  let baseType = field |> Schema.Field.type_ |> Schema.Type.getNamedType;
  switch (classifyScalarType(baseType)) {
  | IntType(_) => IntField(field)
  | FloatType(_) => FloatField(field)
  | StringType(_) => StringField(field)
  | BooleanType(_) => BooleanField(field)
  | EnumType(_) => EnumField(field)
  | ObjectType(_) => ObjectField(field)
  | InputObjectType(_) => InputObjectField(field)
  | _other =>
    Schema.Type.isEnumType(baseType) ? EnumField(field) : OtherField(field)
  };
};

type stringable;

let stringify: stringable => string = [%raw
  "function (r) { const r2 = {...r, toJSON: null}; return (JSON.stringify(r2, null, 2));}"
];

external stringableOfType : Schema.Type.t_ => stringable = "%identity";

external stringableOfField : Schema.Field.t => stringable = "%identity";

external stringableOfArg : Schema.Field.Arg.t => stringable = "%identity";

external stringableOfObject : Schema.ObjectType.t => stringable = "%identity";

let stringifyType = v => stringify @@ stringableOfType(v);

let stringifyField = v => stringify @@ stringableOfField(v);

let stringifyArg = v => stringify @@ stringableOfArg(v);

let stringifyObject = v => stringify @@ stringableOfObject(v);

let logQueryFields = (schema: Schema.t) =>
  switch (Schema.getQueryType(schema)) {
  | None => ()
  | Some(queryType) =>
    let fields = queryType |> Schema.ObjectType.getFields_ |> Js.Dict.values;
    Js.log("-----Log test-----");
    Js.log2("queryType: ", queryType);
    Js.log2("fields: ", fields);
    Array.iter(
      (field: Schema.Field.t) =>
        Js.log4("Field: ", field##name, field, Schema.Field.type_(field)),
      fields,
    );
  };
