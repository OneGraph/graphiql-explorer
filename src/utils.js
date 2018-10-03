import {isLeafType} from 'graphql';

var getPath = function(obj, keys) {
  var result = obj;
  for (var i = 0; i < keys.length; i++) {
    result = result[keys[i]];
    if (result == null) break;
  }
  return result;
};

var setPath = function(obj, keys, terminalValue) {
  var result = obj;
  for (var i = 0; i < keys.length - 1; i++) {
    var value = result[keys[i]];
    var dummy = {};
    if (value == null) {
      result[keys[i]] = dummy;
      result = dummy;
    } else {
      result = value;
    }
  }
  result[keys[keys.length - 1]] = terminalValue;
  return obj;
};

function debounce(func: Function, wait: number) {
  let timeout;

  const debounced = function() {
    const context = this;
    const args = arguments;

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };

  return debounced;
}

function safeURIDecode(val) {
  try {
    return decodeURIComponent(val);
  } catch (e) {
    console.error('Error decoding uri component', val);
  }
}

function getDefaultFieldNames(type) {
  // If this type cannot access fields, then return an empty set.
  if (!type.getFields) {
    return [];
  }

  const fields = type.getFields();

  // Is there an `id` field?
  if (fields['id']) {
    let res = ['id'];
    if (fields['email']) {
      res.push('email');
    } else if (fields['name']) {
      res.push('name');
    }
    return res;
  }

  // Is there an `edges` field?
  if (fields['edges']) {
    return ['edges'];
  }

  // Is there an `node` field?
  if (fields['node']) {
    return ['node'];
  }

  if (fields['nodes']) {
    return ['nodes'];
  }

  // Include all leaf-type fields.
  const leafFieldNames = [];
  Object.keys(fields).forEach(fieldName => {
    if (isLeafType(fields[fieldName].type)) {
      leafFieldNames.push(fieldName);
    }
  });
  return leafFieldNames;
}


export {getPath, setPath, debounce, safeURIDecode, getDefaultFieldNames};
