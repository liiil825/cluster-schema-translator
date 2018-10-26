#!/usr/bin/env node

const fs=require('fs');
const path=require('path');
const program = require('commander');
const _ = require('underscore');
const pkg = require('../package.json');
const utils = require('./utils');
const logger=require('./logger');
const Translator=require('../lib/index');

const binName = _.keys(pkg.bin)[0];
const pkgVer = pkg.version;

program
  .version(pkgVer, '-v , --version')
  .description('A qingcloud cluster schema translator')
  .option('-s, --sk [sk]', 'secret key')
  .option('-t, --token [token]', 'access token')
  .option('-d, --debug', 'verbose mode');

program.on('--help', () => {
  console.log(`
  Examples:
      $ ${binName} fetch -c 10 -w -d
      $ ${binName} fetch ca-xxx
      $ ${binName} trans ca-xxx (find in test/fixture)
      $ ${binName} trans <path/to/schema-file>
      $ ${binName} view  ca-xxx
      $ ${binName} view  <path/to/schema-file>
    `);
});

const envConfig = utils.getEnvConfig();
const fileExt='.json.mustache';
const pathPrefix='test/fixture';

program
  .command('fetch [id]')
  .description('fetch cluster schema based on attachment id, default: all')
  .option('-w, --write [write]', 'write schema to file')
  .option('-c, --count [count]', 'limit result count')
  .action((id, options)=> {
    const debug = !!program.debug;
    const count=options.count;
    const write=!!options.write;
    id = id || 'all';

    // validate arguments
    if (id !== 'all' && !id.match(/^ca-/)) {
      // describe attachment is excluded in api list
      if (!program.sk) {
        logger.error('no sk given');
        process.exit(1);
      }
      if (!program.token) {
        logger.error('no token given');
        process.exit(1);
      }
    }

    let limit;
    if(count!==undefined){
      limit = isNaN(Number(count)) ? 1 : Number(count);
    }

    debug && logger.info('fetch query: ', id, ', limit: ', limit);

    try {
      const agent = require('./agent').instance({
        host: envConfig.host,
        zone: envConfig.zone,
        query: id,
        debug: debug,
        sk: program.sk || envConfig.sk,
        token: program.token || envConfig.token,
        limit: limit
      });

      utils
        .runAgent(agent, write)
        .then(countFiles => logger.info(write ? 'saved' : 'get', countFiles, ' schema file(s)'));
    } catch (e) {
      logger.error(e.message);
    }
  });

program
  .command('trans <id>')
  .description('translate cluster schema to json')
  .action(id=> {
    let file;
    if(id.indexOf('.json.mustache') < 0 && id.indexOf('/') < 0){
      // compose file
      file=path.resolve(pathPrefix, id+fileExt);
    } else{
      file=path.resolve(id);
    }

    if(!fs.existsSync(file)){
      logger.error(file, 'no exists');
      process.exit(1);
    }

    fs.readFile(file, {encoding: 'utf8'}, function(err, data) {
      if(err){
        logger.error(err.message);
        return;
      }
      try{
        const trans=new Translator(data);
        logger.info(JSON.stringify(trans.toJson(), null, 4));
      }
      catch (e){
        logger.error(e.message);
      }

    });
  });

program
  .command('view <id>')
  .description('generate view component (jsx syntax) based on schema id')
  .action(id=> {
    // todo
    logger.info('working on..');
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
