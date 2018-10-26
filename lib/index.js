(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.ClusterSchemaTranslator = factory());
}(this, (function () { 'use strict';

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var Translator = function () {
  function Translator(schema) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    classCallCheck(this, Translator);

    this.schema = schema;
    this.options = options;
  }

  createClass(Translator, [{
    key: 'setSchema',
    value: function setSchema(schema) {
      this.schema = schema;
    }
  }, {
    key: 'toJson',
    value: function toJson() {
      if (!this.schema) {
        throw Error('invalid cluster schema');
      }

      var normalizedStr = this.schema.replace(/({{[\w.-]+}}[^,\r\n}]*)/g, '"$1"').replace(/[\r\n\f]+/g, '').replace(/\t+/g, ' ').replace(/^"/, '').replace(/"$/, '').replace(/\\n\s*/g, '').replace(/""([^:"]+)""/g, '"$1"').replace(/\\/g, '').replace(/"{4,}/g, '""');

      return JSON.parse(normalizedStr);
    }
  }]);
  return Translator;
}();

return Translator;

})));
