import React, {Component} from 'react';
import TreeView from 'react-treeview';
import './App.css';
import {getPath, setPath} from './utils.js';

// var r = {}; Array.from(sn.values()).sort((a, b) => {return b.length - a.length}).forEach((path) => typeof (getPath(r, path)) == "undefined" ? setPath(r, path, true) : (typeof (getPath(r, path)) == "object" ? null : null))

// var gqlOfObj = function(obj, depth, output) { let depthStr = new Array(depth).reduce((acc, _) => {return acc + "  "}, ""); let keys = Object.keys(obj); keys.reduce((acc, nextKey) => typeof (obj[nextKey]) == "object" : acc + depthStr + "{\n" + gqlOfObj(obj) + "\n}" output += str; return str }

let basicQuery = {
  twTimeline: {tweets: {user: {lang: true}}},
  ytVideo: {
    statistics: {dislikeCount: true, viewCount: true},
    contentDetails: {licensedContent: true},
  },
  twTrends: {trends: {tweetVolume: true}},
};

window.bq = basicQuery;

var gqlOfQueryObj = function(obj, depth, output) {
  let keys = Object.keys(obj);
  let depthStr = new Array(depth + 1).join('  ');
  keys.forEach(key => {
    let nextStr =
      typeof obj[key] === 'object'
        ? depthStr +
          key +
          ' {\n' +
          gqlOfQueryObj(obj[key], depth + 1, '') +
          depthStr +
          '}\n'
        : depthStr + key + '\n';
    output += nextStr;
  });

  return output;
};

class TreeEntry extends React.Component {
  handleClick(path) {
    this.props.handleNodesUpdated(path);
  }
  render() {
    let node = this.props.node;
    let depth = this.props.depth || 0;
    // Let's make it so that the tree also toggles when we click the
    // label. Controlled components make this effortless.
    var typeName = null;
    var tmpNodeTypeInfo = node.type;
    // Find the base type
    for (var i = 0; i < 10; i++) {
      if (tmpNodeTypeInfo.ofType == null) {
        typeName = tmpNodeTypeInfo.name;
        break;
      }
      tmpNodeTypeInfo = tmpNodeTypeInfo.ofType;
    }
    const isChecked = this.props.hasNode(this.props.path);
    const nodeType = this.props.typeLookup[typeName];
    const fields = nodeType && nodeType.fields;
    const label = (
      <span
        className="node"
        onClick={this.handleClick.bind(this, this.props.path)}>
        <input
          type="checkbox"
          checked={!!isChecked}
          onClick={this.handleClick.bind(this, this.props.path)}
        />
        {node.name}
      </span>
    );
    return (
      <TreeView key={node.name + i} nodeLabel={label}>
        {isChecked ? (
          <div>
            {fields &&
              Array.prototype.slice
                .call(fields)
                .sort((a, b) => {
                  if (a < b) return -1;
                  if (a > b) return 1;
                  return 0;
                })
                .map((field, i) => (
                  <div className="info" key={field.name}>
                    <TreeEntry
                      node={field}
                      depth={depth + 1}
                      path={this.props.path.concat([field.name])}
                      handleNodesUpdated={this.props.handleNodesUpdated}
                      hasNode={this.props.hasNode}
                      typeLookup={this.props.typeLookup}
                    />{' '}
                  </div>
                ))}
          </div>
        ) : null}
      </TreeView>
    );
  }
}

let buildGQLQuery = selectedNodes => {
  var r = {};
  Array.from(selectedNodes.values())
    .sort((a, b) => {
      return b.length - a.length;
    })
    .forEach(stringPath => {
      var path = stringPath.split('||');
      if (typeof getPath(r, path) === 'undefined') {
        setPath(r, path, true);
      } else if (typeof getPath(r, path) === 'object') {
      } else {
      }
    });
  var query = 'query {\n' + gqlOfQueryObj(r, 1, '') + '\n}\n';
  return query;
};

// A controlled TreeView, akin to React's controlled inputs
// (http://facebook.github.io/react/docs/forms.html#controlled-components), has
// many benefits. Among others, you can expand/collapse everything (i.e. easily
// trigger those somewhere else).
class TreeTop extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(i) {}

  render() {
    var selectedNodes = this.props.selectedNodes;
    return (
      <div>
        {this.props.dataSource.map((node, i) => {
          return (
            <TreeEntry
              node={node}
              key={node.name + i}
              depth={0}
              path={[node.name]}
              selectedNodes={selectedNodes}
              hasNode={this.props.hasNode}
              handleNodesUpdated={this.props.handleNodesUpdated}
              typeLookup={this.props.typeLookup}
            />
          );
        })}
      </div>
    );
  }
}

class Graphitree extends Component {
  updateNodes(arrayPath) {
    var path = arrayPath.join('||');
    var selectedNodes = this.props.selectedNodes;
    var deleteList = [];
    // Delete any key that starts with this path
    window.sn = selectedNodes;
    var helper = () => {
      selectedNodes.delete(path);
      Array.from(selectedNodes).forEach(value => {
        if (value.startsWith(path + '||')) deleteList.push(value);
      });
      deleteList.forEach(key => selectedNodes.delete(key));
    };
    selectedNodes.has(path) ? helper() : selectedNodes.add(path);
    this.forceUpdate();
    this.props.onQueryChange(buildGQLQuery(this.props.selectedNodes));
  }
  hasNode(arrayPath) {
    var path = (arrayPath || []).join('||');
    var hasPath = this.props.selectedNodes.has(path);
    return hasPath;
  }

  render() {
    let typeLookup = {};
    this.props.rawSchema.__schema.types.forEach(
      type => (typeLookup[type.name] = type),
    );

    const queryType = this.props.rawSchema.__schema.queryType.name;

    var queryTopLevel = this.props.rawSchema.__schema.types.filter(type => {
      return type.name === queryType && type.kind === 'OBJECT';
      // return type.kind === 'OBJECT';
    })[0];

    let dataSource = queryTopLevel.fields;

    return (
      <div className="graphitree">
        <TreeTop
          handleNodesUpdated={this.updateNodes.bind(this)}
          selectedNodes={this.props.selectedNodes}
          hasNode={this.hasNode.bind(this)}
          typeLookup={typeLookup}
          dataSource={dataSource}
        />
      </div>
    );
  }
}

export default Graphitree;
