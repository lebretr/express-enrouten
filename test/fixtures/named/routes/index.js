'use strict';


module.exports = function (router) {

    router
        .get('my-foo', '/', function (ctx) {
            ctx.status=200;
            ctx.body='ok';
        });

    router
        .get('my-bar', '/bar', function (ctx) {
            ctx.status=200;
            ctx.body='ok';
        });

    router
        .get('the-bar', '/bar/:id',function (ctx) {
            ctx.status=200;
            ctx.body='ok';
        });

};
