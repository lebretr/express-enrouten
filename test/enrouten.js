'use strict';

var test = require('tape');
var path = require('path');
var koa = require('koa');
var Router = require('koa-router');
var enrouten = require('../');
var request = require('supertest');


test('enrouten', function (t) {

    run(t.test.bind(t), 'root', '', function plain(router, settings) {
        enrouten(settings, router);
    });


    // run(t.test.bind(t), 'mountpoint', '/foo', function route(app, settings) {
    //     enrouten(settings, router);
    //     app.use('/foo', enrouten(settings));
    // });
});


function get(router, route, next) {

    var app = new koa();
        
    app.use(router.routes())
    .use(router.allowedMethods());


    var server;
    server=app.listen();

    request(server)
        .get(route)
        .expect('Content-Type', /text\/plain/)
        .expect(200, 'ok', function(err) {
            server.close();
            next(err);
        });
}


function getfail(router, route, status, next) {

    var app = new koa();
        
    app.use(router.routes())
    .use(router.allowedMethods());


    var server;
    server=app.listen();
    request(server)
        .get(route)
        .expect(status, function(err) {
            server.close();
            next(err);
        });
}


function run(test, name, mount, fn) {

    test(name + ' mounting', function (t) {
        var router;

        router = new Router();
        fn(router);
        fn(router, { basedir: path.join(__dirname, 'fixtures') });
        fn(router, { directory: null });
        fn(router, { index: null });
        fn(router, { routes: null });
        fn(router, { routes: [] });

        t.equal(router.stack.length, 0);
        t.end();
    });


    test(name + ' directory', function (t) {

        t.test('relative path', function (t) {
            var router, settings;

            router = new Router();
            settings = {
                directory: path.join('fixtures', 'flat')
            };

            fn(router, settings);

            get(router, mount + '/controller', function (err) {
                t.error(err);
                t.end();
            });
        });


        t.test('absolute path', function (t) {
            var router, settings;
    
            router = new Router();
            settings = {
                directory: path.join(__dirname, 'fixtures', 'flat')
            };

            fn(router, settings);

            get(router, mount + '/controller', function (err) {
                t.error(err);
                t.end();
            });
        });


        t.test('unknown extensions (regression)', function (t) {
            var router, settings;
   
            router = new Router();
            settings = {
                directory: path.join(__dirname, 'fixtures', 'extensions', 'unknown')
            };

            fn(router, settings);                

            get(router, mount + '/controller', function (err) {
                t.error(err);
                t.end();
            });
        });


        t.test('custom extensions', function (t) {
            var router, settings;

            require.extensions['.custom'] = require.extensions['.js'];
            
            router = new Router();
            settings = {
                directory: path.join(__dirname, 'fixtures', 'extensions', 'custom')
            };

            fn(router, settings);
            
            get(router, mount + '/controller', function (err) {
                t.error(err);
                delete require.extensions['.custom'];
                t.end();
            });              
        });


        t.test('throw from required module', function (t) {
            var router, settings;

            t.plan(1);

            router = new Router();
            settings = {
                directory: path.join(__dirname, 'fixtures', 'badController')
            };

            t.throws(function () {
                fn(router, settings);
            });

            t.end();
        });


        t.test('es6 default export', function (t) {
            var router, settings;

            router = new Router();
            settings = {
                directory: path.join('fixtures', 'transpiled')
            };

            fn(router, settings);

            get(router, mount + '/controller', function (err) {
                t.error(err);
                t.end();
            });
        });
        
        
        t.test('nested', function (t) {
            var router, settings;

           router = new Router();
            settings = {
                directory: path.join('fixtures', 'nested')
            };

            fn(router, settings);

            get(router, mount + '/controller', function (err) {
                t.error(err);
                get(router, mount + '/subdirectory/subcontroller', function (err) {
                    t.error(err);
                    t.end();
                });
            });
        });


        // t.test('router caseSensitive', function (t) {
        //     var router, settings;

        //     router = new Router();
        //     // app.set('case sensitive routing', true);
        //     settings = {
        //         directory: path.join('fixtures', 'caseSensitive'),
        //         routerOptions: {
        //             caseSensitive: true
        //         }
        //     };

        //     fn(router, settings);

        //     get(router, mount + '/caseSensitive', function (err) {
        //         t.error(err);
        //         getfail(router, mount + '/casesensitive', 404, function (err) {
        //             t.error(err);
        //             get(router, mount + '/lowercase', function (err) {
        //                 t.error(err);
        //                 getfail(router, mount + '/LOWERCASE', 404, function (err) {
        //                     t.error(err);
        //                     get(router, mount + '/UPPERCASE', function (err) {
        //                         t.error(err);
        //                         getfail(router, mount + '/uppercase', 404, function (err) {
        //                             t.error(err);
        //                             t.end();
        //                         });
        //                     });
        //                 });
        //             });
        //         });
        //     });
        // });


        // t.test('router strict', function (t) {
        //     var router, settings;

        //     router = new Router();
        //     // app.set('strict routing', true);
        //     settings = {
        //         index: path.join('fixtures', 'strict'),
        //         routerOptions: {
        //             strict: true
        //         }
        //     };

        //     fn(router, settings);

        //     get(router, mount + '/', function (err) {
        //         t.error(err);
        //         get(router, mount + '/strict', function (err) {
        //             getfail(router, mount + '/strict/', 404, function (err) {
        //                 t.error(err);
        //                 get(router, mount + '/very-strict/', function (err) {
        //                     getfail(router, mount + '/very-strict', 404, function (err) {
        //                         t.error(err);
        //                         t.end();
        //                     });
        //                 });
        //             });
        //         });
        //     });
        // });


        t.test('index', function (t) {
            var router, settings;

            router = new Router();
            settings = {
                directory: path.join('fixtures', 'indexed')
            };

            fn(router, settings);

            get(router, mount + '/', function (err) {
                t.error(err);
                get(router, mount + '/good', function (err) {
                    t.error(err);
                    get(router, mount + '/subgood', function (err) {
                        t.error(err);
                        t.end();
                    });
                });
            });
        });


        t.test('missing path', function (t) {
            var router, settings;

        router = new Router();
            settings = {
                directory: path.join('fixtures', 'undefined')
            };

            t.throws(function () {
                fn(router, settings);
            });

            t.end();
        });


        t.test('invalid api', function (t) {
            var router, settings;

            router = new Router();
            settings = {
                directory: path.join('fixtures', 'superfluous')
            };

            fn(router, settings);

            get(router, mount + '/controller', function (err) {
                t.error(err);
                get(router, mount + '/subsuperfluous/subcontroller', function (err) {
                    t.error(err);
                    t.end();
                });
            });
        });


        t.test('named', function (t) {
            var router, settings;

            router = new Router();
            settings = {
                directory: path.join('fixtures', 'named', 'routes')
            };

            fn(router, settings);

            // t.ok(typeof router.locals.routes, 'object');
            // t.equal(router.locals.enrouten.routes['my-foo'], mount ? mount : '/');
            // t.equal(router.locals.enrouten.routes['my-bar'], mount + '/bar');
            // t.equal(router.locals.enrouten.routes['my-list'], mount + '/list/stuff');

            get(router, mount + '/', function (err) {
                t.error(err);
                get(router, mount + '/list', function (err) {
                    t.error(err);
                    get(router, mount + '/list/stuff', function (err) {
                        t.error(err);
                        t.end();
                    });
                });
            });
        });


        // t.test('duplicate names', function (t) {
        //     var router, settings;

        //     router = new Router();
        //     settings = {
        //         directory: path.join('fixtures', 'named', 'duplicates')
        //     };

        //     t.throws(function () {
        //         fn(router, settings);
        //     });

        //     t.end();
        // });

    });


    test('index', function (t) {

        t.test('module default', function (t) {
            var router, settings;

            router = new Router();
            settings = {
                index: path.join('fixtures', 'indexed')
            };

            fn(router, settings);

            get(router, mount + '/good', function (err) {
                t.error(err);
                get(router, mount + '/subgood', function (err) {
                    t.error(err);
                    t.end();
                });
            });
        });


        t.test('explicit index file', function (t) {
            var router, settings;

            router = new Router();
            settings = {
                index: path.join('fixtures', 'indexed', 'index')
            };

            fn(router, settings);

            get(router, mount + '/good', function (err) {
                t.error(err);

                get(router, mount + '/subgood', function (err) {
                    t.error(err);
                    t.end();
                });
            });
        });


        t.test('transpiled from es6', function (t) {
            var router, settings;

            router = new Router();
            settings = {
                index: path.join('fixtures', 'transpiled', 'controller')
            };

            fn(router, settings);

            get(router, mount, function (err) {
                t.error(err);
                t.end();
            });
        });


        t.test('missing index file', function (t) {
            var router, settings;

            router = new Router();
            settings = {
                index: path.join('fixtures', 'indexed', 'undefined')
            };

            t.throws(function () {
                fn(router, settings);
            });
            t.end();
        });


        t.test('named', function (t) {
            var router, settings;

            router = new Router();
            settings = {
                index: path.join('fixtures', 'named', 'routes')
            };

            fn(router, settings);

            // t.ok(typeof router.locals.routes, 'object');
            // t.equal(router.locals.enrouten.routes['my-foo'], mount ? mount : '/');
            // t.equal(router.locals.enrouten.routes['my-bar'], mount + '/bar');
            // // t.equal(router.locals.routes['my-list'], mount + '/list');

            get(router, mount + '/', function (err) {
                t.error(err);
                get(router, mount + '/bar', function (err) {
                    t.error(err);
                    t.end();
                });
            });
        });


        // t.test('duplicate names', function (t) {
        //     var router, settings;

        //     router = new Router();
        //     settings = {
        //         index: path.join('fixtures', 'named', 'duplicates')
        //     };

        //     t.throws(function () {
        //         fn(router, settings);
        //     });

        //     t.end();
        // });

    });


    // test('router', function (t) {

    //     t.test('basic routes', function (t) {
    //         var app, settings;

    //         app = new koa();         router = new Router();
    //         settings = {
    //             routes: [
    //                 {
    //                     path: '/',
    //                     method: 'get',
    //                     handler: function (req, res) {
    //                         res.send('ok');
    //                     }
    //                 },
    //                 {
    //                     path: '/sub',
    //                     method: 'get',
    //                     handler: function (req, res) {
    //                         res.send('ok');
    //                     }
    //                 }
    //             ]
    //         };

    //         fn(app, settings);

    //         get(app, mount, function (err) {
    //             t.error(err);
    //             get(app, mount + '/sub', function (err) {
    //                 t.error(err);
    //                 t.end();
    //             });
    //         });
    //     });


    //     t.test('default to GET', function (t) {
    //         var app, settings;

    //         app = new koa();         router = new Router();
    //         settings = {
    //             routes: [
    //                 {
    //                     path: '/',
    //                     handler: function (req, res) {
    //                         res.send('ok');
    //                     }
    //                 },
    //                 {
    //                     path: '/sub',
    //                     handler: function (req, res) {
    //                         res.send('ok');
    //                     }
    //                 }
    //             ]
    //         };

    //         fn(app, settings);

    //         get(app, mount, function (err) {
    //             t.error(err);
    //             get(app, mount + '/sub', function (err) {
    //                 t.error(err);
    //                 t.end();
    //             });
    //         });
    //     });


    //     t.test('multiple verbs', function (t) {
    //         var app, settings;

    //         app = new koa();         router = new Router();
    //         settings = {
    //             routes: [
    //                 {
    //                     path: '/',
    //                     method: 'post',
    //                     handler: function (req, res) {
    //                         res.send('ok');
    //                     }
    //                 },
    //                 {
    //                     path: '/sub',
    //                     method: 'get',
    //                     handler: function (req, res) {
    //                         res.send('ok');
    //                     }
    //                 }
    //             ]
    //         };

    //         fn(app, settings);

    //         get(app, mount + '/sub', function (err) {
    //             t.error(err);
    //             request(app)
    //                 .post(mount)
    //                 .expect('Content-Type', /html/)
    //                 .expect(200, 'ok', function (err) {
    //                     t.error(err);
    //                     t.end();
    //                 });
    //         });
    //     });


    //     t.test('missing path', function (t) {
    //         var app, settings;

    //         app = new koa();         router = new Router();
    //         settings = {
    //             routes: [
    //                 {
    //                     path: '/',
    //                     method: 'get'
    //                 }
    //             ]
    //         };

    //         t.throws(function () {
    //             fn(app, settings);
    //         });
    //         t.end();
    //     });

    //     t.test('single middleware', function(t) {
    //         var app, settings;

    //         app = new koa();         router = new Router();
    //         settings = {
    //             routes: [
    //                 {
    //                     path: '/',
    //                     method: 'get',
    //                     middleware: [
    //                         function(req, res, next) {
    //                             res.value = 'middleware';
    //                             next();
    //                         }
    //                     ],
    //                     handler: function (req, res) {
    //                         res.send(res.value);
    //                     }
    //                 }
    //             ]
    //         };

    //         fn(app, settings);

    //         request(app)
    //             .get(mount)
    //             .expect('Content-Type', /html/)
    //             .expect(200, 'middleware', function (err) {
    //                 t.error(err);
    //                 t.end();
    //             });
    //     });

    //     t.test('multiple middleware', function(t) {
    //         var app, settings;

    //         app = new koa();         router = new Router();
    //         settings = {
    //             routes: [
    //                 {
    //                     path: '/',
    //                     method: 'get',
    //                     middleware: [
    //                         function(req, res, next) {
    //                             res.value1 = 1;
    //                             next();
    //                         },
    //                         function(req, res, next) {
    //                             res.value2 = 2;
    //                             next();
    //                         }
    //                     ],
    //                     handler: function (req, res) {
    //                         res.send((res.value1 + res.value2).toString());
    //                     }
    //                 }
    //             ]
    //         };

    //         fn(app, settings);

    //         request(app)
    //             .get(mount)
    //             .expect('Content-Type', /html/)
    //             .expect(200, (3).toString(), function (err) {
    //                 t.error(err);
    //                 t.end();
    //             });
    //     });

    //     t.test('error thrown in middleware', function(t) {
    //         var app, settings;

    //         app = new koa();         router = new Router();
    //         settings = {
    //             routes: [
    //                 {
    //                     path: '/',
    //                     method: 'get',
    //                     middleware: [
    //                         function(req, res, next) {
    //                             next(new Error('middleware error'));
    //                         },
    //                         function(req, res, next) {
    //                             res.msg = 'You wont see this';
    //                             next();
    //                         }
    //                     ],
    //                     handler: function (req, res) {
    //                         res.send(res.msg);
    //                     }
    //                 }
    //             ]
    //         };

    //         fn(app, settings);

    //         // error handler
    //         app.use(function(err, req, res, next) {
    //             res.status(503).send(err.message);
    //         });

    //         request(app)
    //             .get(mount)
    //             .expect('Content-Type', /html/)
    //             .expect(503, 'middleware error', function (err) {
    //                 t.error(err);
    //                 t.end();
    //             });
    //     });


    // });

    // test('path generation', function (t) {

    //     t.test('api', function (t) {
    //         var router, settings, actual;

    //         router = new Router();
    //         settings = {
    //             directory: path.join('fixtures', 'named', 'routes')
    //         };

    //         // enrouten not yet run
    //         actual = enrouten.path(router, 'the-bar', { id: 10 });
    //         t.equal(actual, undefined);

    //         fn(router, settings);

    //         actual = enrouten.path(router, 'the-bar', { id: 10 });
    //         t.equal(actual, mount + '/bar/10');

    //         actual = enrouten.path(router, 'my-bar');
    //         t.equal(actual, mount + '/bar');

    //         actual = enrouten.path(router, 'unknown');
    //         t.equal(actual, undefined);

    //         t.end();
    //     });


    //     t.test('locals', function (t) {
    //         var app, settings, actual;

    //         app = new koa();         router = new Router();
    //         settings = {
    //             directory: path.join('fixtures', 'named', 'routes')
    //         };

    //         fn(app, settings);

    //         actual = app.locals.enrouten.path('the-bar', { id: 10 });
    //         t.equal(actual, mount + '/bar/10');

    //         actual = app.locals.enrouten.path('my-bar');
    //         t.equal(actual, mount + '/bar');

    //         actual = app.locals.enrouten.path(app, 'unknown');
    //         t.equal(actual, undefined);

    //         t.end();
    //     });

    //     t.test()

    // });

}
