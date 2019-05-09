'use strict';

//
//XXX: the trailing slashes in this file are very important,
// if you change them you will likely break some tests
//
module.exports = function (router) {

    router.get('/', function (ctx) {
        ctx.status=200;
        ctx.body='ok';
    });

    router.get('/strict', function (ctx) {
        ctx.status=200;
        ctx.body='ok';
    });

    router.get('/very-strict/', function (ctx) {
        ctx.status=200;
        ctx.body='ok';
    });

};
