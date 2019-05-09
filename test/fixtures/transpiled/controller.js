'use strict';


// faking a module transpiled from es6
exports.default = function (router) {

    router.get('/', function (ctx) {
        ctx.status=200;
        ctx.body='ok';
    });

};
