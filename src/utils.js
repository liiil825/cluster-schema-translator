// utils module, @cjs
const fs = require('fs');
const path = require('path');
const yml = require('js-yaml');
const _ = require('underscore');

const envFile = path.resolve('env.yml');

let countSaved = 0; // count saved schema files

module.exports = {
  getEnvConfig: function() {
    let env;
    try {
      env = yml.safeLoad(fs.readFileSync(envFile, 'utf8'));
    } catch (e) {
      env = {};
    }
    return _.pick(env, ['host', 'zone', 'sk', 'token']);
  },

  validAttachment: function(ca) {
    return _.isObject(ca) && ca.category === 'resource_kit' && ca.resource_type === 'app_version';
  },

  /**
   * inject agent
   *
   * @param agent instanceof `src/Agent`
   * @param write
   * @returns {Promise}
   */
  runAgent: function(agent, write) {
    countSaved = 0; // reset count

    let filteredCountCa = 0;

    // default write schema files
    if (write === undefined) {
      write = true;
    }

    const handleSchema = schema => {
      filteredCountCa--;
      if (write) {
        this.saveSchema(schema);
      } else {
        // show schema content
        countSaved++; // incr counter
        console.log('\n[INFO]', path.basename(schema.filename));
        console.log({raw: schema.content});
      }
    };

    return new Promise((resolve, reject) => {
      agent.run((attachments, id) => {
        if (!attachments) {
          reject(Error('no attachments'));
        }

        let filteredCa = attachments.filter(this.validAttachment);
        filteredCountCa = filteredCa.length;

        if (!id) {
          // handle all attachments
          filteredCa.forEach(ca => {
            let schema = this.getSchema(ca.attachment_id, ca.attachment_content);
            handleSchema(schema);
          });
        } else {
          let schema_cont = _.findWhere(filteredCa, {attachment_id: id}).attachment_content;
          let schema = this.getSchema(id, schema_cont);
          handleSchema(schema);
        }

        let timer = setInterval(() => {
          if (filteredCountCa === 0) {
            clearInterval(timer);
            resolve(countSaved);
          }
        }, 100);
      });
    });
  },

  getSchema: function(id, schema) {
    let file = path.resolve('test/fixture', id + '.json.mustache');
    schema = schema['cluster.json.mustache'];
    if (!schema) {
      console.warn('invalid schema file: ', path.basename(file));
      return;
    }
    schema = typeof schema === 'object' ? JSON.stringify(schema) : schema.toString();

    return {
      filename: file,
      content: schema
    };
  },

  saveSchema: function(schema) {
    if (_.isEmpty(schema)) {
      return;
    }
    let file, cont;
    if (arguments.length > 1) {
      file = arguments[0];
      cont = arguments[1];
    } else {
      file = schema.filename;
      cont = schema.content;
    }

    fs.writeFile(file, cont, err => {
      if (err) {
        // dont throw exception
        console.warn('[skip] write file: ', file, ' failed');
        return;
      }
      console.log('[fixture]', file, ' saved');
      countSaved++;
    });
  }
};
