'use strict';


module.exports = function (router) {

    router
        .get('my-foo', '/foo', function (ctx) {
            ctx.status=200;
            ctx.body='ok';
        });

    router
        .get('my-foo', '/bar', function (ctx) {
            ctx.status=200;
            ctx.body='ok';
        });

};
