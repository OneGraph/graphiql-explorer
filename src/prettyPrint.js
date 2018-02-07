import printer from './prettier/printer-graphql';
import parse from './prettier/parser-graphql';
import FastPath from './prettier/fast-path';
import {printDocToString} from './prettier/doc-printer';
import {propagateBreaks} from './prettier/doc-utils';

function prettyPrint(text) {
  const result = parse(text);
  const cache = new Map();
  const options = {
    originalText: text,
    bracketSpacing: 2,
    printWidth: 80,
    tabWidth: 2,
  };
  function printGenerically(path, args) {
    const node = path.getValue();

    const shouldCache = node && typeof node === 'object' && args === undefined;
    if (shouldCache && cache.has(node)) {
      return cache.get(node);
    }

    const res = printer.print(path, options, printGenerically, args);

    if (shouldCache) {
      cache.set(node, res);
    }

    return res;
  }

  const doc = printGenerically(new FastPath(result));
  propagateBreaks(doc);
  console.log({doc});

  return printDocToString(doc, options).formatted;
}

export default prettyPrint;
