open ReasonReact;

type typeName = string;

type path = string;

open ReGraphQL;

type ctx = GraphQLTypes.context;

let label =
    (
      ctx: ctx,
      name,
      description,
      fieldPath,
      argPath,
      checked,
      depth,
      children,
    ) =>
  <div
    style=(
      ReactDOMRe.Style.make(
        ~paddingLeft=string_of_int(depth * 4) ++ "px",
        (),
      )
    )
    onClick=(
      event => {
        ReactEvent.Mouse.stopPropagation(event);
        ctx.toggleArg(fieldPath, argPath);
      }
    )>
    <span className="node">
      <input
        type_="checkbox"
        readOnly=true
        onClick=(
          event => {
            ReactEvent.Mouse.stopPropagation(event);
            ctx.toggleArg(fieldPath, argPath);
          }
        )
        checked
      />
    </span>
    <label title=?(Js.Nullable.toOption(description))>
      (string(name))
      (array(children))
    </label>
  </div>;

let renderScalar = (~ctx: ctx, ~fieldPath, ~argPath, ~typ, checked, ()) => {
  open GraphQLTypes;
  let isRequired = Schema.Type.isNonNullType(typ);
  let baseType = Schema.Type.getNamedType(typ);
  let isBoolean = Schema.Type.isBooleanType(baseType);
  switch (isBoolean) {
  | false =>
    <input
      type_="text"
      onClick=(event => ReactEvent.Mouse.stopPropagation(event))
      required=(isRequired && checked)
      onChange=(
        event => {
          let newValue' = ReactEvent.Form.target(event)##value;
          let newValue =
            switch (newValue') {
            | "" => None
            | value => Some(value)
            };
          ctx.setArgValue(fieldPath, argPath, newValue);
        }
      )
      value=?(ctx.getArgValue(fieldPath, argPath))
    />
  | true =>
    <input
      style=(ReactDOMRe.Style.make(~width="1000px", ()))
      type_="checkbox"
      onClick=(event => ReactEvent.Mouse.stopPropagation(event))
      required=(isRequired && checked)
      onChange=(
        _event => {
          let newValue =
            switch (ctx.getArgValue(fieldPath, argPath)) {
            | Some("true") => "false"
            | _ => "true"
            };
          ctx.setArgValue(fieldPath, argPath, Some(newValue));
        }
      )
      checked=(
                /* The user may have typed something other than true/false as
                   the arg value, so it'll be present (Some), but not boolean-able
                   */
                try (
                  ctx.getArgValue(fieldPath, argPath)
                  |> Option.default("false")
                  |> bool_of_string
                ) {
                | Invalid_argument(_msg) => false
                }
              )
    />
  };
};

let renderEnum = (~key, ~ctx: ctx, ~fieldPath, ~argPath, ~typ, _checked, ()) => {
  open GraphQLTypes;

  let enumType =
    switch (Schema.Type.toEnumType(typ)) {
    | None =>
      raise(
        Failure("Non-enum type made it through to renderEnum: " ++ typ##name),
      )
    | Some(enumType) => enumType
    };
  let values = Schema.Enum.getValues(enumType);
  let value = ctx.getArgValue(fieldPath, argPath);
  <select
    key
    ?value
    onClick=(event => ReactEvent.Mouse.stopPropagation(event))
    onChange=(
      event =>
        ctx.setArgValue(
          fieldPath,
          argPath,
          Some(ReactEvent.Form.target(event)##value),
        )
    )>
    (
      Array.mapi(
        (idx, value) =>
          <option key=(string_of_int(idx)) value=value##name>
            (string(value##name))
          </option>,
        values,
      )
      |> array
    )
  </select>;
};

let rec renderObject = (~ctx: ctx, ~fieldPath, ~argPath, ~depth, ~obj, ()) =>
  Schema.(
    <div>
      (
        ObjectType.getFields(obj)
        |> Array.mapi((idx, field) => {
             let argPath = argPath ++ "." ++ field##name;
             let checked = ctx.isArgChecked(fieldPath, argPath);
             let typ = Schema.Type.getNamedType(Field.type_(field));
             let isObject = Type.isInputObjectType(typ);
             let isScalar = Type.isScalarType(typ);
             let isEnum = Type.isEnumType(typ);
             <ReactTree
               key=(string_of_int(idx))
               nodeLabel={
                 <div>
                   (
                     label(
                       ctx,
                       field##name,
                       field##description,
                       fieldPath,
                       argPath,
                       checked,
                       depth + 1,
                       switch (isScalar, isEnum, checked) {
                       | (true, true, _)
                       | (false, false, _) => [||]
                       | (true, false, true) => [|
                           renderScalar(
                             ~ctx,
                             ~fieldPath,
                             ~argPath,
                             ~typ,
                             checked,
                             (),
                           ),
                         |]
                       | (false, true, true) => [|
                           renderEnum(
                             ~key=string_of_int(idx),
                             ~ctx,
                             ~fieldPath,
                             ~argPath,
                             ~typ,
                             checked,
                             (),
                           ),
                         |]
                       | _ => [||]
                       },
                     )
                   )
                 </div>
               }>
               (
                 switch (isObject && checked) {
                 | false => null
                 | true =>
                   renderObject(
                     ~ctx,
                     ~fieldPath,
                     ~argPath,
                     ~obj=typ,
                     ~depth=depth + 1,
                     (),
                   )
                 }
               )
             </ReactTree>;
           })
        |> array
      )
    </div>
  );

let component = statelessComponent("GraphiQL.Explorer.TreeEntry.ArgEntry");

let make =
    (
      ~ctx: ctx,
      ~arg: Schema.Field.Arg.t,
      ~path as fieldPath,
      ~depth,
      _children,
    ) => {
  ...component,
  render: _self => {
    open Schema;
    let argPath = arg##name;
    let checked = ctx.isArgChecked(fieldPath, argPath);
    let typ = Schema.Type.getNamedType(Field.Arg.type_(arg));
    let outerType = Schema.Field.Arg.type_(arg);
    let isRequired = Schema.Type.isNonNullType(outerType);
    let requiredMarker =
      switch (isRequired) {
      | false => ":"
      | true => "*:"
      };
    let isObject = Type.isInputObjectType(typ);
    let isScalar = Type.isScalarType(typ);
    <ReactTree
      nodeLabel={
        <div>
          (
            label(
              ctx,
              arg##name ++ requiredMarker,
              arg##description,
              fieldPath,
              argPath,
              checked,
              depth,
              switch (isScalar && checked) {
              | false => [||]
              | true => [|
                  renderScalar(~ctx, ~fieldPath, ~argPath, ~typ, checked, ()),
                |]
              },
            )
          )
        </div>
      }>
      (
        switch (isObject && checked) {
        | false => null
        | true =>
          renderObject(~ctx, ~fieldPath, ~argPath, ~obj=typ, ~depth, ())
        }
      )
    </ReactTree>;
  },
};
