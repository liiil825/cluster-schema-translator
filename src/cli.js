#!/usr/bin/env node

const program = require('commander');
const _ = require('underscore');
const pkg = require('../package.json');
const utils = require('./utils');

const binName = _.keys(pkg.bin)[0];
const pkgVer = pkg.version;

const showMsg = (...msg) => console.log('[DEBUG]', ...msg);

program
  .version(pkgVer, '-v , --version')
  .description('A qingcloud cluster schema translator')
  .option('-s, --sk [sk]', 'secret key')
  .option('-t, --token [token]', 'access token')
  .option('-c, --count [count]', 'limit result count')
  .option('-d, --debug', 'verbose mode');

program.on('--help', () => {
  console.log(`
  Commands:
  
    fetch [id]           fetch cluster schema based on attachment id, default: all
    trans <id>           translate cluster schema to json
    view <id>            generate view component (jsx syntax) based on schema id
    
  Examples:
      $ ${binName} fetch
      $ ${binName} fetch ca-xxx (find in test/fixture)
      $ ${binName} trans ca-xxx
      $ ${binName} trans <path/to/schema-file>
      $ ${binName} view  ca-xxx
      $ ${binName} view  <path/to/schema-file>
    `);
});

const envConfig = utils.getEnvConfig();
const acceptCmds = ['fetch', 'trans', 'view'];

const actions = {
  fetch: function(id) {
    const debug = !!program.debug;
    id = id || 'all';

    // validate arguments
    if (id !== 'all' && !id.match(/^ca-/)) {
      // describe attachment is excluded in api list
      if (!program.sk) {
        console.error('no sk given');
        process.exit(1);
      }
      if (!program.token) {
        console.error('no token given');
        process.exit(1);
      }
    }

    debug && showMsg('fetch query: ', id);

    try {
      const agent = require('./agent').instance({
        query: id,
        debug: debug,
        sk: program.sk || envConfig.sk,
        token: program.token || envConfig.token,
        limit: isNaN(Number(program.count)) ? 1 : Number(program.count)
      });

      utils
        .runAgent(agent, false)
        .then(countRead => console.log('get ', countRead, ' schema file(s)'));
    } catch (e) {
      console.error(e.message);
      process.exit(1);
    }
  },
  trans: function(id) {
    if (!id) {
      console.error('Missing param <id>, exec: qc-cl trans <id>');
      process.exit(1);
    }

    // todo
    console.log('working on..');
  },
  view: function(id) {
    if (!id) {
      console.error('Missing param <id>, exec: qc-cl view <id>');
      process.exit(1);
    }

    // todo
    console.log('working on..');
  }
};

program.arguments('<cmd> [param]').action((cmd, param) => {
  // console.log(
  //   'cmd: ', cmd, '\n',
  //   'params: ', param, '\n',
  //   'sk', program.sk, '\n',
  //   'token', program.token, '\n',
  //   'count', program.count, '\n',
  //   'debug', program.debug, '\n'
  // );
  //
  // process.exit(0);

  // dispatch actions
  if (!_.contains(acceptCmds, cmd)) {
    console.error('Unknown cmd, only support: ' + acceptCmds.join(', '));
    process.exit(1);
  }

  actions[cmd](param);
});

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
