'use strict';


module.exports = function (router) {

    router.get('/', function (ctx) {
        ctx.status=200;
        ctx.body='ok';
    });

};
