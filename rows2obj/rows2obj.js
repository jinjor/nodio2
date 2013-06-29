var _ = require("underscore");

exports.group = function(rows) {
    if(rows.length == 0){
        return;
    }
    var keyOfId = _.chain(rows[0]).keys().find(function(r){ return r.indexOf('$') < 0 }).value();
    if(!keyOfId){
        throw 'no main field found';
    }
    
    
    var keys4Property = {};
    var keys4Children = {};        
    rows.forEach(function(r){
        _.keys(r).forEach(function(k){
            var keyPair = k.split('$', 2);
            (keyPair.length == 1 ? keys4Property : keys4Children)[keyPair[0]] = '';
        });
    });
    keys4Property = _.keys(keys4Property);
    keys4Children = _.keys(keys4Children);
    
    var getUniqObj = function(row){
        var obj = {};
        keys4Property.forEach(function(k){
            obj[k] = row[k];
        });
        return JSON.stringify(obj);
    };
    
        
    var memo = {};
    rows.forEach(function(r){
        var uniqObj = getUniqObj(r);
        if(!memo[uniqObj]){
            memo[uniqObj] = {};
        }
        var obj = memo[uniqObj];
        keys4Property.forEach(function(k){
            obj[k] = r[k];
        });
        keys4Children.forEach(function(k){
            var matchedKeys = _.keys(r).filter(function(kk){return kk.indexOf(k + '$') >= 0 });
            if(matchedKeys.length == 0){
                return;//one to zero relation
            }
            if(!obj[k]){
                obj[k] = [];
            }
            obj[k].push({});
            var lastChild = _.last(obj[k]);
            matchedKeys.map(function(kk){
                return kk.split('$', 2)[1];
            }).forEach(function(kk){
                lastChild[kk] = r[k + '$' + kk];
            });
        });
    });
    return _.values(memo);
};