const fs = require('fs');
const path = require('path');
const yml = require('js-yaml');

describe('Env', () => {
  it('read env file', () => {
    const env_file = path.resolve('env.example.yml');
    let cont;
    try {
      cont = yml.safeLoad(fs.readFileSync(env_file, 'utf8'));
      expect(cont).toEqual(
        expect.objectContaining({
          sk: expect.any(String),
          token: expect.any(String)
        })
      );
    } catch (err) {
      expect(err).toBe(expect.anything());
    }
  });
});
