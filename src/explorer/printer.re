open GraphQLTypes;

open ReGraphQL;

let indent = depth =>
  Array.make(depth, "") |> Array.to_list |> String.concat("\t");

let rec printArgObject = (arg: argSubField) => {
  let baseType = arg.field |> Schema.Field.type_ |> Schema.Type.getNamedType;
  /* Js.log3(
       arg.path,
       Printf.sprintf("[] subfields: "),
       subFields
       |> Array.map(field => field##name)
       |> Array.to_list
       |> String.concat(", "),
     ); */
  switch (Schema.Type.isInputObjectType(baseType)) {
  | false => raise(Failure("ArgObject is not an InputObjectType, bailing"))
  | true =>
    /* Js.log2("Full argSubField: ", arg); */
    let checkedFields =
      arg.children
      |> List.filter(((_name, subField): (string, argSubField)) => {
           /* Js.log(
                Printf.sprintf("\t%s checked? %b", _name, subField.checked),
              ); */
           ();
           subField.checked;
         });
    switch (List.length(checkedFields)) {
    | 0 => ""
    | _ =>
      let objectFields =
        List.map(
          ((_name, field)) => printArgObjectField(field),
          checkedFields,
        );
      /* objectFields
         |> List.iter(fieldString => Js.log2("Field string: ", fieldString)); */
      Printf.sprintf("{%s}", String.concat(", ", objectFields));
    };
  };
}
and printScalar = (subField: argSubField) : string => {
  let classified = classifyScalarField(subField.field);
  let defaultValue = Option.default("", subField.value);
  /* Js.log3("PrintScalar Classified", classified, subField); */
  let value =
    switch (classified) {
    | StringField(_) => Printf.sprintf({|"%s"|}, defaultValue)
    | IntField(_)
    | FloatField(_)
    | EnumField(_) => defaultValue
    | ObjectField(_) => printArgObjectField(subField)
    | InputObjectField(_) => printArgObject(subField)
    | _ => "UNKNOWN"
    };
  value;
}
and printArgObjectField = subField =>
  /* Js.log4(
       "printArgObjectField: ",
       subField,
       subField.value,
       switch (subField.value) {
       | None => "No value!"
       | Some(value) => "Some value: " ++ value
       },
     ); */
  Printf.sprintf("%s: %s", subField.name, printScalar(subField))
and printArgList = (arg: argSubField) =>
  Printf.sprintf(
    "[%s]",
    List.map(((_name, child)) => printArgType(child), arg.children)
    |> String.concat(", "),
  )
and printArgType = (arg: argSubField) => {
  let baseType = arg.field |> Schema.Field.type_ |> Schema.Type.getNamedType;
  Schema.Type.isInputObjectType(baseType) ?
    printArgObject(arg) :
    Schema.Type.isListType(baseType) ?
      printArgList(arg) :
      Schema.Type.isScalarType(baseType) ?
        printScalar(arg) :
        Schema.Type.isBooleanType(baseType) ?
          printScalar(arg) : "\"UnrecognizedArgumentType\"";
}
and printArgEntry = (_entry, _key, arg: argEntry) =>
  /* Js.log4(
       "Field/args: ",
       entry.name,
       Array.map(
         arg => arg |> Schema.Field.Arg.type_ |> Schema.Type.getNamedType,
         entry.field##args,
       ),
       Array.length(entry.field##args),
     ); */
  /* let baseType = Schema.Type.getNamedType(arg.typ); */
  /* Js.log2("BaseType", baseType); */
  /* Js.log2("\targEntry:", arg); */
  switch (arg.checked) {
  | false => ""
  | true =>
    let subfield = Option.expect("Arg subfield", arg.subField);
    Printf.sprintf("%s: %s", arg.name, printArgType(subfield));
  };

let rec printEntry = (depth, entry: entry) =>
  switch (entry.checked) {
  | false => ""
  | true =>
    let field = entry.name;
    /* Js.log3(indent(depth), "field: ", entry.name); */
    let checkedArgs =
      entry.args
      |> List.filter(((_, arg): (string, argEntry)) => arg.checked);
    let args =
      switch (checkedArgs) {
      | [] => ""
      | args =>
        let subArgs =
          List.map(((key, arg)) => printArgEntry(entry, key, arg), args)
          |> String.concat(", ");
        switch (subArgs) {
        | "" => ""
        | subArgs => Printf.sprintf("(%s)", subArgs)
        };
      };
    let subfields =
      switch (entry.children) {
      | [] => ""
      | fields =>
        /* Js.log2(
             indent(depth),
             entry.name
             ++ " has "
             ++ string_of_int(List.length(fields))
             ++ " children",
           ); */
        let entries =
          fields
          |> List.map(((_name, (_position, entry))) =>
               printEntry(depth + 1, entry)
             );
        let entries = String.concat("\n\t", entries);
        Printf.sprintf("{\n\t%s}", entries);
      };
    Printf.sprintf("%s %s %s", field, args, subfields);
  };

let entriesToGraphQLText = (root: entry) => {
  /* Js.log2("entriesToGraphQLText", root); */
  let query =
    try (Some(List.assoc("query", root.children))) {
    | Not_found => None
    };
  let mutation =
    try (Some(List.assoc("mutation", root.children))) {
    | Not_found => None
    };
  let subscription =
    try (Some(List.assoc("Subscription", root.children))) {
    | Not_found => None
    };
  let output =
    [query, mutation, subscription]
    |> List.map(entryT =>
         switch (entryT) {
         | None => ""
         | Some((_, entry)) =>
           let checkedChildren =
             entry.children
             |> List.filter(((_, (_, child))) => child.checked);
           switch (checkedChildren) {
           | [] => ""
           | _ =>
             printEntry(
               0,
               {
                 ...entry,
                 checked: true,
                 name: Js.String.toLowerCase(entry.name),
               },
             )
           };
         }
       )
    |> String.concat("\n\n");
  /* Js.log2("Printed output: \n", output); */
  output;
  /* build(0, root) |> prettyPrint; */
};
