const r = require('./plugins/regenerator')

module.exports = function(api) {
  api.cache(true);
  return {
    "presets":["@babel/preset-env"],
    "plugins":["@babel/plugin-transform-modules-commonjs", r],
    "babelrcRoots": [".", "node_modules"]
  };
}