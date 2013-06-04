/// <reference path="../d.ts/DefinitelyTyped/webaudioapi/Web-Audio-API.d.ts"/>
/// <reference path="../d.ts/DefinitelyTyped/underscore/underscore.d.ts"/>
/// <reference path="../d.ts/DefinitelyTyped/backbone/backbone.d.ts"/>

module models {
    
    var createBezierPath = function(x1, y1, x4, y4){
        var dx = x4 - x1;
        var dy = y4 - y1;
        //if(Math.abs(dx) > Math.abs(dy)){
            var x2 = x1 + dx/2;
            var x3 = x1 + dx/2;
            var y2 = y1;
            var y3 = y4;
        /*}else{
            var x2 = x1;
            var x3 = x4;
            var y2 = y1 + dy/2;
            var y3 = y1 + dy/2;
        }*/
        return ['M', x1.toFixed(3), y1.toFixed(3),
                'C', x2.toFixed(3), y2.toFixed(3),
                     x3.toFixed(3), y3.toFixed(3),
                     x4.toFixed(3), y4.toFixed(3)
                ].join(',');
    }
    
    
    var rnd = function(n) {
        return Math.floor(Math.random() * (n + 1));
    };
    
    var Position = Backbone.Model.extend({
      change: function(x, y) {
        var cssColor = prompt("Please enter a CSS color:");
        this.set({color: cssColor});
      }
    });
        
    var tmpNodeFrom = null;
    var tmpNodeTo = null;
    
    var _id = 0;
    export var Param = Backbone.Model.extend({
        _createParamId: function() {
            return 'param' + _id++;
        },
        constructor: function(name, description, valueToDescription) {
            this.id = this._createParamId();
            this.name = name;
            this.description = description;
            this.valueToDescription = valueToDescription;
        }
    });
    
    export var Node = Backbone.Model.extend({
        _createParamId: function() {
            return 'node' + _id++;
        },
        constructor: function(context, type, description) {
            this.id = this._createParamId();
            this.type = type;
            this.description = description;
            if(type == 'gain'){
                this.audioNode = context.createGain();
                this.params = [new Param('gain', 'Gain', null)];
            }else{
                throw 'unsupported type: ' + type;
            }
            this.targets = {};
        },
        setParamValue: function(param, value) {
            if(this.audioNode[param.name].value){
                this.audioNode[param.name].value = value;
            }else{
                this.audioNode[param.name] = value;
            }
        },
        connect: function(to/* Node | Param */) {
            if(to.audioNode) {
                this.audioNode.connect(to.audioNode);
            }/*else if(to.param.value){//AudioParam
                this.audioNode.connect(to.audioParam);
            }*/
            this.targets[to.id] = to;
        },
        disconnect: function(to/* Node | Param */) {
            if(to.audioNode) {
                this.audioNode.disconnect(to.audioNode);
            }else if(to.param.value){//AudioParam
                this.audioNode.disconnect(to.param);
            }
            delete this.targets[to.id];
            for(var key in this.targets){
                if(this.targets.hasOwnProperty(key)){
                    this.connect(this.targets[key]);
                }
            }
        }
    });
    
    export var Connection = Backbone.Model.extend({
        constructor: function(source, target) {
            this.listenTo(source, 'destroy', this._destroyBySource);
            this.listenTo(target, 'destroy', this._destroyByTarget);
            this.source = source;
            this.target = target;
            source.connect(target);
        },
        _destroyBySource: function(){
            this.stopListening(this.target);
            this._destroy();
        },
        _destroyByTarget: function(){
            this.stopListening(this.source);
            this._destroy();
        },
        _destroy: function(){
            this.from.disconnect(this.target);
            this.destroy();
        }
    });
    
    export var Nodes = Backbone.Collection.extend({
        model: Node,
        createNode: function(context, type){
            var node = new Node(context, type);
            this.add(node);
            return node;
        }
    });
    
    export var Connections = Backbone.Collection.extend({
        createConnection: function(from, to) {
            this.add(new Connection(from, to));
        }
    });
   

}

