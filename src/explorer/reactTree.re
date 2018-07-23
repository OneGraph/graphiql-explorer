[@bs.module] external treeView : ReasonReact.reactClass = "react-treeview";

[@bs.deriving abstract]
type jsProps = {nodeLabel: ReasonReact.reactElement};

let make = (~nodeLabel, children) =>
  ReasonReact.wrapJsForReason(
    ~reactClass=treeView,
    ~props=jsProps(~nodeLabel),
    children,
  );
