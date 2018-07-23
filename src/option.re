exception MissingValue(string);

let default = (defaultValue, opt) =>
  switch (opt) {
  | None => defaultValue
  | Some(value) => value
  };

let expect = (name, opt) =>
  switch (opt) {
  | None => raise(MissingValue("Missing value for " ++ name))
  | Some(value) => value
  };

let map = (opt, update) =>
  switch (opt) {
  | None => None
  | Some(value) => Some(update(value))
  };

let fmap = (opt, update) =>
  switch (opt) {
  | None => None
  | Some(value) => update(value)
  };
