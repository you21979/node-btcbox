var rp = require('request-promise');
var constant = require('./constant');
var makeapi = function(api){
    return constant.BTCBOX_APIV1_URL + '/' + api;
}
var createEndPoint = function(apiv1, pair){
    return apiv1 + '/' + pair.toLowerCase();
}

var query = exports.query = function(method, pair){
    return rp(createEndPoint(makeapi(method), pair)).then(JSON.parse);
}

exports.ticker = function(){
    return query('ticker', '');
}
exports.depth = function(){
    return query('depth', '');
}
exports.orders = function(){
    return query('orders', '');
}
