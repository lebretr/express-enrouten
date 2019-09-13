# express-enrouten

[![npm version](https://badge.fury.io/js/%40lebretr%2Fkoa-router-enrouten.svg)](https://badge.fury.io/js/%40lebretr%2Fkoa-router-enrouten)

Route configuration middleware for koa-router.


### API
#### `enrouten(options, router))`
```javascript
const Koa = require('koa')
    , app = new Koa()
    , Router = require('koa-router')
    , router = new Router()
    , enrouten = require('@lebretr/koa-router-enrouten');

enrouten({
    directory: './controllers'
},router);

app.use(router.routes())
    .use(router.allowedMethods());
...
// or app.use('/foo', enrouten({ ... }));
```
### CONFIGURATION

#### directory
The `directory` configuration option (optional) is the path to a directory.
Specify a directory to have enrouten scan all files recursively to find files
that match the controller-spec API. With this API, the directory structure
dictates the paths at which handlers will be mounted.

```text
controllers
 |-user
     |-create.js
     |-list.js
```
```javascript
// create.js
module.exports = function (router) {
    router.post('/', function (ctx) {
        ctx.status=200;
        ctx.body('ok');
    });
};
```
```javascript
enrouten({
    directory: './controllers'
},router);
```
Routes are now:
```test
/user/create
/user/list
```

#### index
The `index` configuration option (optional) is the path to the single file to
load (which acts as the route 'index' of the application).
```javascript
enrouten({
    index: 'routes/'
},router);
```
```javascript
// index.js
module.exports = function (router) {

    router.get('/', index);
    router.all(passport.protect).get('/account', account);

    // etc...
};
```


### Controller Files
A 'controller' is defined as any `require`-able file which exports a function
that accepts a single argument. Any files with an extension of `.js` (or `.coffee`
if CoffeeScript is registered) will be loaded and if it exports a function that
accepts a single argument then this function will be called. **NOTE: Any file in
the directory tree that matches the API will be invoked/initialized with the
koa-router object.**

```javascript
// Good :)
// controllers/controller.js
module.exports = function (router) {
    router.get('/', function (ctx) {
        // ...
    });
};

// Bad :(
// Function does not get returned when `require`-ed, use `module.exports`
exports = function (router) {
    // ...
};

// Bad :(
// controllers/other-file-in-same-controller-directory.js
modules.exports = function (config) {
    // `config` will be an koa-router
    // ...
};

## Linting
```bash
$ npm run-script lint
```

## Tests
```bash
$ npm test
```

## Coverage
```bash
$ npm run-script cover && open coverage/lcov-report/index.html
```
