const fs=require('fs');
const path=require('path');
const _=require('underscore');
const Agent=require('../src/agent');

let debug=true;

let agent=new Agent({
  sk: 'xLCzIOXoJ6dwLdZIf6WROcir3dpvZNKT',
  token: 'JVe7bc0tGh20nibp2HFkKb3tqxT7Xnj3',
  query: 'all',
  // query: 'ca-mr1tku3o',
  debug: debug
});

let countSaved=0;

const saveFile = (id, schema)=> {
  let file=path.resolve('test/fixture', id + '.json.mustache');
  schema = schema['cluster.json.mustache'];
  if(!schema){
    return;
  }
  schema=typeof schema === 'object' ? JSON.stringify(schema, null, 4) : schema.toString();

  if(debug){
    console.log('schema: ', schema);
  }

  fs.writeFile(file, schema, (err)=> {
    if(err){
      // dont throw exception
      console.warn('[skip] write file: ', file, ' failed');
      return;
    }
    console.log('[fixture]', file, ' saved');
    countSaved++;
  });
};

const validAttachment=(ca)=> {
  return _.isObject(ca) && ca.category === 'resource_kit' && ca.resource_type === 'app_version';
};

let runAgent = ()=> {
  return new Promise((resolve, reject)=> {
    agent.run((attachments, id)=> {
      if(!attachments){
        reject(Error('no attachments'));
      }

      let filteredCa=attachments.filter(validAttachment);
      let countCa=filteredCa.length;

      if(!id){
        // save all attachments
        filteredCa.forEach((ca)=> {
          countCa--;
          saveFile(ca.attachment_id, ca.attachment_content);
        });
      }
      else {
        let schema = _.findWhere(filteredCa, { attachment_id: id }).attachment_content;
        countCa--;
        saveFile(id, schema);
      }

      let timer=setInterval(()=> {
        if(countCa === 0){
          clearInterval(timer);
          resolve(countSaved);
        }
      }, 100)

    });
  });
};

runAgent().then(countSaved=> {
  console.log('count saved fixture files: ', countSaved);
});

