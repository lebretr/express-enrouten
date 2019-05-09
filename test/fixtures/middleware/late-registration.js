'use strict';


module.exports = function (router) {

    router.use('/foo', function (ctx, next) {
        ctx.foo = true;
        next();
    });

    router.get('/foo', function (ctx) {
        if (ctx.foo) {
            ctx.status=200;
            ctx.body='ok';
            return;
        }
        ctx.status=500;
        ctx.body='not ok';
    });

};
