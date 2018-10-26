import resolve from 'rollup-plugin-node-resolve';
import globals from 'rollup-plugin-node-globals';
import builtins from 'rollup-plugin-node-builtins';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';

export default {
  input: "src/index.js",
  output: {
    name: "ClusterSchemaTranslator",
    file: "lib/index.js",
    format: "umd"
  },
  plugins: [
    resolve({
      jsnext: true,
      main: true
    }),
    commonjs({

    }),
    globals(),
    builtins(),
    babel({
      babelrc: false,
      exclude: "node_modules/**",
      presets: [
        ["env", {"modules": false}],
        {"comments": false}
      ],
      plugins: ['external-helpers']
    })
  ]
};
