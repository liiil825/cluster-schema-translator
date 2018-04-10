// import Mustache from './Format/Mustache';
// import Toml from './Format/Toml';
// import agent from './agent';

export default class Parser {
  constructor(mustache, options = {}) {
    this.mustache = mustache;
    this.options = options;
  }

  /**
   *
   * @returns {{}}
   */
  toJson() {
    if(!this.mustache){
      throw Error('invalid mustache');
    }

    let normalizedStr = this.mustache.replace(/\\n\s*/g, '') // 去掉个别情形出现的显式\n
      .replace(/""([^:"]+)""/g, '"$1"') // 替换多余引号的问题
      .replace(/\\/g, '') // 去掉显式的反斜线
      .replace(/^"/, '') // 去掉开始的引号
      .replace(/"$/, '') // 去掉结尾的引号
      .replace(/"{4}/g, '""') // 个别情形出现的4个连续的引号
      .replace(/[\r\n\f]+/g, '') // 去掉 json.parse 不可解析的hidden chars
      .replace(/\t+/g, ' ') // tab符转为单个空格
      .replace(/({{[\w\.\-]+}}[^,\r\n}]*)/g, '"$1"');  // 包含公式计算的情形 eg: ```{{cluster.props}} * count```

    return JSON.parse(normalizedStr);
  }
}
