const camelize = (myString) => {
  return myString.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
};

const uncamelize = (myString) => {
  return myString.replace(/[A-Z]/g, '-$&').toLowerCase();
};

const serializeParams = (obj, prefix) => {
  let str = [],
    p;
  for (p in obj) {
    if (obj.hasOwnProperty(p)) {
      const k = prefix ? prefix + `[${p}]` : p,
        v = obj[p];
      str.push((v !== null && typeof v === `object`) ?
        serialize(v, k) :
        encodeURIComponent(k) + `=` + encodeURIComponent(v));
    }
  }
  return str.join(`&`);
};

module.exports = {
  camelize: camelize,
  uncamelize: uncamelize,
  serializeParams: serializeParams
};
