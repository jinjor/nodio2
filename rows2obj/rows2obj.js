var _ = require("underscore");

exports.group = function(rows) {
    var id = arguments[1];
    var attrs = _.tail(arguments);
    
    var prev = {};
    var ret = _(rows).foldl(function(memo, r){
        
        if(_.keys(memo).length == 0 || !memo[r[id]]){
            var keyObj = _.pick(r, attrs);
            var restObj = _.omit(r, attrs);
            memo[r[id]] = [keyObj, [restObj]];
            return memo;
        }else{
            var restObj = _.omit(r, attrs);
            memo[r[id]][1].push(restObj);
            return memo;
        }
    }, {});// this logic has some side-effects...
    
    return _.values(ret);
};