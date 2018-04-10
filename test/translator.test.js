const fs=require('fs');
const path=require('path');

const Translator=require('../lib/index').default;

describe('Translator', ()=> {
  it('read test dir', ()=>{
    const baseDir=path.resolve('test/fixture')
    fs.readdir(baseDir, (err, files)=> {
      if(err){
        throw err;
      }
      files.forEach(file=> {
        if(path.extname(file) === 'mustache'){
          let file_cont=fs.readFileSync(path.join(baseDir, file));
          let trans=new Translator(file_cont);
          expect(trans.toJson()).not.toThrow();
        }
      })
    })
  });

});
