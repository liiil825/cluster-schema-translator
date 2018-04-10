// const resolve=require("rollup-plugin-node-resolve");
const babel=require("rollup-plugin-babel");

export default {
  input: "src/index.js",
  output: {
    name: "ClusterSchemaTranslator",
    file: "lib/index.js",
    format: "umd"
  },
  plugins: [babel()]
};
