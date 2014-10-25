var rp = require('request-promise');
var constant = require('./constant');
var makeapi = function(api){
    return constant.BTCBOX_APIV1_URL + '/' + api;
}
var createEndPoint = function(apiv1, pair){
    return apiv1 + '/' + '?' + ['coin', pair.toLowerCase()].join('=');
}

var query = exports.query = function(method, pair){
    return rp(createEndPoint(makeapi(method), pair)).then(JSON.parse);
}

exports.ticker = function(pair){
    return query('ticker', pair.split('_').shift());
}
exports.depth = function(pair){
    return query('depth', pair.split('_').shift());
}
exports.orders = function(pair){
    return query('orders', pair.split('_').shift());
}
