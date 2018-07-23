open ReasonReact;

type typeName = string;

type path = string;

module GQL = ReGraphQL;

let component = statelessComponent("GraphiQL.Explorer.TreeEntry");

type ctx = GraphQLTypes.context;

let argEntry = (key, ctx: ctx, path, arg: GQL.Schema.Field.Arg.t, depth) =>
  <ReactTree key=(string_of_int(key)) nodeLabel=null>
    <ArgEntry ctx arg path depth=(depth + 1) />
  </ReactTree>;

let label = (ctx: ctx, field: ReGraphQL.Schema.Field.t, path, checked, depth) =>
  <div
    style=(
      ReactDOMRe.Style.make(
        ~paddingLeft=string_of_int(depth * 4) ++ "px",
        ~width="1000px",
        (),
      )
    )
    onClick=(
      event => {
        ReactEventRe.Mouse.stopPropagation(event);
        ctx.toggleField(path);
      }
    )>
    <span className="node">
      <input type_="checkbox" readOnly=true checked />
      (string(field##name))
    </span>
    (
      switch (checked, field##args) {
      | (_, [||])
      | (false, _) => null
      | (true, args) =>
        Array.mapi(
          (idx, arg) =>
            <div
              key=(string_of_int(idx))
              style=(
                ReactDOMRe.Style.make(
                  ~marginLeft=string_of_int(16 + depth * 8) ++ "px",
                  ~borderRadius="4px",
                  ~backgroundColor="rgb(241, 241, 241)",
                  (),
                )
              )>
              (argEntry(idx, ctx, path, arg, depth))
            </div>,
          args,
        )
        |> array
      }
    )
  </div>;

let rec make =
        (
          ~ctx: ctx,
          ~field: ReGraphQL.Schema.Field.t,
          ~path,
          ~currentObject,
          ~subFieldsFor,
          ~depth=0,
          _children,
        ) => {
  ...component,
  render: _self => {
    let checked = ctx.isFieldChecked(path);
    <ReactTree
      nodeLabel={<div> (label(ctx, field, path, checked, depth)) </div>}>
      (
        switch (checked) {
        | false => null
        | true =>
          let (nextType, subFields) =
            subFieldsFor(currentObject, field##name);
          Array.sort(
            (fieldA, fieldB) => String.compare(fieldA##name, fieldB##name),
            subFields,
          );
          Array.mapi(
            (idx, nextField) =>
              element(
                ~key=string_of_int(idx),
                make(
                  ~ctx,
                  ~path=path ++ "." ++ nextField##name,
                  ~subFieldsFor,
                  ~currentObject=nextType,
                  ~field=nextField,
                  ~depth=depth + 1,
                  [||],
                ),
              ),
            subFields,
          )
          |. array;
        }
      )
    </ReactTree>;
  },
};
