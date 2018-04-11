const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const Agent = require('./agent');
const utils = require('./utils');

const debug = true;

// read yml conf
const env_file = path.resolve('env.yml');

if (!fs.existsSync(env_file)) {
  console.warn('no env.yml found, you can do: `cp env.example.yml env.yml`');
  process.exit(1);
}

const envConfig = utils.getEnvConfig();

const agent = new Agent(
  _.extend({}, envConfig, {
    query: 'all',
    debug: debug
  })
);

utils.runAgent(agent).then(countSaved => {
  console.log('count saved fixture files: ', countSaved);
});
