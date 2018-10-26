// import Logger from './logger';

export default class Translator {
  constructor(schema, options = {}) {
    this.schema = schema;
    this.options = options;
  }

  setSchema(schema) {
    this.schema = schema;
  }

  /**
   *
   * @returns {{}}
   */
  toJson() {
    if (!this.schema) {
      throw Error('invalid cluster schema');
    }

    // 注意replace的顺序
    const normalizedStr = this.schema
      .replace(/({{[\w.-]+}}[^,\r\n}]*)/g, '"$1"') // 包含公式计算的情形 eg: ```{{cluster.props}} * count```
      .replace(/[\r\n\f]+/g, '') // 去掉 json.parse 不可解析的hidden chars
      .replace(/\t+/g, ' ') // tab符转为单个空格
      .replace(/^"/, '') // 去掉开始的引号
      .replace(/"$/, '') // 去掉结尾的引号
      .replace(/\\n\s*/g, '') // 去掉个别情形出现的显式\n
      .replace(/""([^:"]+)""/g, '"$1"') // 替换多余引号的问题
      .replace(/\\/g, '') // 去掉显式的反斜线
      .replace(/"{4,}/g, '""');  // 个别情形出现的4个连续的引号

    return JSON.parse(normalizedStr);
  }
}
