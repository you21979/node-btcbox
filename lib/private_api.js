// sorry notest module
var rp = require('request-promise');
var crypto = require('crypto');
var querystring = require('querystring');
var constant = require('./constant');

var md5 = function(data){
    return crypto.createHash('md5').
        update(new Buffer(data)).
        digest('hex').toString();
}
var createSign = function(argo, key, qstring){
    return crypto.createHmac(argo, key).
        update(new Buffer(qstring)).
        digest('hex').toString();
};
var createHeader = function(user_agent, postdata){
    return {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postdata.length,
        'User-Agent': user_agent,
    };
}
var createPostParam = function(objarray){
    var postparams = {};
    objarray.forEach(function(obj){
        Object.keys(obj).forEach(function(key){ postparams[key] = obj[key]; });
    });
    return postparams;
}
var createPostOption = function(url, api_key, secret_key, user_agent, nonce, method, params){
    var post = createPostParam([{nonce:nonce, key:api_key}, params]);
    var qstring = querystring.stringify(post);
    var poststring = [qstring, ['signature', createSign('sha256', secret_key, qstring)].join('=')].join('&');
    return {
        url: url + '/' + method + '/',
        method: 'POST',
        form: poststring,
        headers: createHeader(user_agent, poststring),
    };
}
var createPrivateApi = module.exports = function(api_key, secret_key, user_agent, nonce_func){
    var skey = md5(secret_key);
    var url = function(){ return constant.BTCBOX_APIV1_URL };
    var initnonce = new Date()/1000|0;
    nonce_func = nonce_func || function(){ return initnonce++; }
    var query = function(method, params, isResult){
        return rp(createPostOption(url(), api_key, skey, user_agent, nonce_func(), method, params)).
        then(JSON.parse).then(function(v){
            if(!isResult) return v;
            else if(v.result === true) return v;
            else throw(new Error('result error'));
        });
    };
    var query_method = function(method, defparams, isResult){ return function(opt){
        var params = defparams || {};
        if(opt instanceof Object) Object.keys(opt).forEach(function(keys){ params[keys] = opt[keys] });
        return query(method, params, isResult) };
    };
    return {
        query : query,
        balance : function(){ return query('balance', {}, false) },
        wallet : function(pair){
            return query('wallet', {'coin':pair.split('_').shift()}, true)
        },
        tradeList : query_method('trade_list', {since:0,type:'all'}, false),
        tradeView : function(orderid){ return query('trade_view', {'id':orderid}, false) },
        tradeCancel : function(orderid){ return query('trade_cancel', {'id':orderid}, true) },
        tradeAdd : function(pair, amount, price, type){
            return query('trade_add', {
                'coin':pair.split('_').shift(),
                'amount':amount,
                'price':price,
                'type':type
            }, true)
        },
    };
}

