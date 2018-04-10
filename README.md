cluster schema translator
===

> a cluster schema translator for qingcloud

## 1. Intro
This library is designed to translate `qingcloud cluster schema` (Format like: mustache, json, toml..)

Provide a convenient way to validate, easy-to-test, render-to-view interface for cluster schema.


## 2. CLI
```javascript
qc-cl --help
```

## 3. Testing

First you should setup testing fixture
```
npm run setup
```

Then
```
npm test
```

### 4. Goals

- [x] Support format like: mustache, json, toml
- [x] Ship with a `cli` tool to manipulate schema files
- [ ] Generate form view component capable in React


### License
MIT
