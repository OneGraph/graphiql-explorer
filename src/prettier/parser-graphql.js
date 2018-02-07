const gql = require('graphql');

function createError(message, loc) {
  // Construct an error similar to the ones thrown by Babylon.
  const error = new SyntaxError(
    message + ' (' + loc.start.line + ':' + loc.start.column + ')',
  );
  error.loc = loc;
  return error;
}

function parseComments(ast) {
  const comments = [];
  const startToken = ast.loc.startToken;
  let next = startToken.next;
  while (next.kind !== '<EOF>') {
    if (next.kind === 'Comment') {
      Object.assign(next, {
        // The Comment token's column starts _after_ the `#`,
        // but we need to make sure the node captures the `#`
        column: next.column - 1,
      });
      comments.push(next);
    }
    next = next.next;
  }

  return comments;
}

function removeTokens(node) {
  if (node && typeof node === 'object') {
    delete node.startToken;
    delete node.endToken;
    delete node.prev;
    delete node.next;
    for (const key in node) {
      removeTokens(node[key]);
    }
  }
  return node;
}

function parse(text /*, parsers, opts*/) {
  // Inline the require to avoid loading all the JS if we don't use it
  try {
    const ast = gql.parse(text);
    ast.comments = parseComments(ast);
    removeTokens(ast);
    return ast;
  } catch (error) {
    const GraphQLError = gql.GraphQLError;
    if (error instanceof GraphQLError) {
      throw createError(error.message, {
        start: {
          line: error.locations[0].line,
          column: error.locations[0].column,
        },
      });
    } else {
      throw error;
    }
  }
}

export default parse;
