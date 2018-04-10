#!/usr/bin/env node

const program = require('commander');
const _ = require('underscore');
const pkg = require('../package.json');

const binName = _.keys(pkg.bin)[0];
const pkgVer = pkg.version;

const showMsg = (...msg) => console.log(...msg);

program
  .version(pkgVer, '-v , --version')
  .description('A qingcloud cluster schema json translator')
  .option('-s, --sk <sk>', 'secret key')
  .option('-t, --token <token>', 'access token')
  .option('-d, --debug', 'verbose mode');

program.on('--help', () => {
  console.log(`\n  Examples:
        $ ${binName} --sk <sk> --token <token> <attachmentId |appId |appVer>
    `);
});

program.arguments('<query>').action(query => {
  const debug = !!program.debug;

  // validate arguments
  if (!query) {
    console.error('no query given');
    process.exit(1);
  }
  if (!program.sk) {
    console.error('no sk given');
    process.exit(1);
  }
  if (!program.token) {
    console.error('no token given');
    process.exit(1);
  }

  debug && showMsg('handle query: ', query, '\n');
  let agent = require('./agent').instance({
    sk: program.sk,
    token: program.token,
    query: query,
    debug: debug
  });

  agent.run();
});

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
