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

export {getPath, setPath, debounce, safeURIDecode};
