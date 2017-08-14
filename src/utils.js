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

export {getPath, setPath};
