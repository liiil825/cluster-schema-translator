/*
 * fetch cluster.json.mustache from qingcloud backend
 */
const request = require('superagent');
const _ = require('underscore');
const describe = require('./Describe');
const logger=require('./logger');

const userAgent =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko)\
 Chrome/65.0.3325.181 Safari/537.36';

const header = {
  Accept: 'application/json, */*; q=0.8',
  // 'Cache-Control': 'no-cache',
  // Pragma: 'no-cache',
  // Connection: 'keep-alive',
  'Content-Type': 'application/x-www-form-urlencoded',
  'User-Agent': userAgent,
  'X-Requested-With': 'XMLHttpRequest'
};

const requiredKeys = ['sk', 'token', 'query'];
const optionalKeys = ['offset', 'limit'];
const queryTypes = ['ca', 'app', 'appv'];
const defaultHost = 'console.alphacloud.com';
const defaultZone = 'test';

class Agent {
  constructor(host, params = {}) {
    if (arguments.length === 1 && _.isObject(arguments[0])) {
      params = arguments[0];
      host = params.host || defaultHost;
    }

    if (typeof host !== 'string') {
      throw Error('host should be string, ' + typeof host + ' given');
    }

    if (!Agent.validateParams(params)) {
      throw Error('invalid params, required ' + requiredKeys.join(', '));
    }

    this.host = host || defaultHost;
    this.zone = params.zone || defaultZone;
    this.debug = params.debug || false;
    this.params = _.pick(params, _.union(requiredKeys, optionalKeys));
    // for shortcut, eg: `this.token`
    for (let p in this.params) {
      if (this.params.hasOwnProperty(p)) {
        this[p] = this.params[p];
      }
    }
    this.sk = this.sk || 'x'; // fix csrftoken empty
    this.token = this.token || 'x';
    this.setQueryType();
  }

  setQueryType() {
    let matchQuery = this.query.match(/^(ca|app|appv)-\w+$/i);
    // special case: all
    if (this.query === 'all') {
      this.queryType = 'ca';
      this.ca = '';
      return;
    }

    if (matchQuery && _.contains(queryTypes, matchQuery[1])) {
      this.queryType = matchQuery[1];
    } else {
      throw Error('invalid query type');
    }
    this.ca = this.queryType === 'ca' ? this.query : '';
  }

  static validateParams(params = {}) {
    return _.intersection(_.keys(params), requiredKeys).length === requiredKeys.length;
  }

  static instance() {
    return new Agent(...arguments);
  }

  getRequestUrl() {
    let normalize_host = this.host.endsWith('/')
      ? this.host.substring(0, this.host.lastIndexOf('/'))
      : this.host;
    if (normalize_host.startsWith('http')) {
      normalize_host = normalize_host.replace(/https?:\/\//, '');
    }
    return (this.zone === defaultZone ? 'http' : 'https') + '://' + normalize_host + '/api/';
  }

  getHeader() {
    return _.extend({}, header, {
      Cookie: ['csrftoken=' + this.token, 'zone=' + this.zone, 'lang=zh-cn', 'sk=' + this.sk].join(
        '; '
      ),
      'X-CSRFToken': this.token
    });
  }

  run(cb) {
    let reqUrl = this.getRequestUrl(),
      reqHeader = this.getHeader();

    if (this.debug) {
      logger.info('request url: ', reqUrl);
      logger.info('request header: ', JSON.stringify(reqHeader));
    }

    let req = request
      .post(reqUrl)
      .retry(0) // no need retry
      .timeout({
        response: this.query === 'all' ? 15000 : 5000
      })
      .set(reqHeader);

    // fallback callback
    if (typeof cb !== 'function') {
      cb = res => {
        console.log('attachment set: ', res);
      };
    }

    let fetchAttachment = reqBody => {
      req
        .send('params=' + JSON.stringify(reqBody))
        .then(res => {
          const body = res.body;
          cb(body.attachment_set, this.ca);
        })
        .catch(err => {
          if (err.timeout) {
            console.error('request timeout');
          }
          console.error('error occurred: ', err.stack);
          // @see: https://github.com/visionmedia/superagent/issues/1344
          req.abort(); // end stuck promise
        });
    };

    if (this.queryType === 'ca') {
      let reqBody = describe.attachment.getQueryParams(_.pick(this, ['zone', 'ca', 'limit']));
      this.debug && logger.info('request params: ', JSON.stringify(reqBody), '\n');
      fetchAttachment(reqBody);
    } else {
      let describeModule = this.queryType === 'appv' ? describe.appVer : describe.app;
      describeModule.fetch(req, fetchAttachment);
    }
  }
}

module.exports = Agent;
