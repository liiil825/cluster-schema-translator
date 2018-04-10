const fs = require('fs');
const path = require('path');

const Translator = require('../src/index').default;

describe('Translator', () => {
  const baseDir = path.resolve('test/fixture');

  const readFiles = () => {
    return new Promise((resolve, reject) => {
      fs.readdir(baseDir, (err, files) => {
        if (err) {
          reject(err);
        }

        const caFiles = files.filter(file => {
          return path.extname(file) === '.mustache';
        });

        resolve(caFiles);
      });
    });
  };

  it('toJson', () => {
    return readFiles()
      .then(files => {
        expect.assertions(files.length);

        files.forEach(file => {
          const mustache = fs.readFileSync(path.join(baseDir, file), {encoding: 'utf8'});
          const trans = new Translator(mustache);
          expect(trans.toJson.bind(trans)).not.toThrow();
        });
      })
      .catch(err => {
        expect(err).toMatch('invalid mustache');
      });
  });
});
