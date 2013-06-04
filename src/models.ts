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
        
    var tmpNodeFrom = null;
    var tmpNodeTo = null;
    
    var _id = 0;
    export class Param extends Backbone.Model {
        id: string;
        private static createParamId() {
            return 'param' + _id++;
        }
        constructor(public name, public description, public valueToDescription) {
            super();
            this.id = Param.createParamId();
        }
    }
    
    export class Node extends Backbone.Model {
        id: string;
        audioNode: AudioNode;
        params: Param[];
        targets: any;
        private static createParamId() {
            return 'node' + _id++;
        }
        constructor(context, public type, public description?) {
            super();
            this.id = Node.createParamId();
            if(type == 'gain'){
                this.audioNode = context.createGain();
                this.params = [new Param('gain', 'Gain', null)];
            }else{
                throw 'unsupported type: ' + type;
            }
            this.targets = {};
        }
        setParamValue(param, value) {
            if(this.audioNode[param.name].value){
                this.audioNode[param.name].value = value;
            }else{
                this.audioNode[param.name] = value;
            }
        }
        connect(to/* Node | Param */) {
            if(to.audioNode) {
                this.audioNode.connect(to.audioNode);
            }/*else if(to.param.value){//AudioParam
                this.audioNode.connect(to.audioParam);
            }*/
            this.targets[to.id] = to;
        }
        disconnect(to/* Node | Param */) {
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
    }
    
    export class Connection extends Backbone.Model {
        constructor(public source, public target) {
            super();
            this.listenTo(source, 'destroy', this.destroyBySource);
            this.listenTo(target, 'destroy', this.destroyByTarget);
            source.connect(target);
        }
        private destroyBySource(){
            this.stopListening(this.target);
            this.destroy();
        }
        private destroyByTarget(){
            this.stopListening(this.source);
            this.destroy();
        }
        private destroy(){
            this.source.disconnect(this.target);
            this.destroy();
        }
    }
    
    export class Nodes extends Backbone.Collection {
        model: Node;
        createNode(context, type){
            var node = new Node(context, type);
            this.add(node);
            return node;
        }
    }
    
    export class Connections extends Backbone.Collection {
        createConnection(from, to) {
            this.add(new Connection(from, to));
        }
    }
   

}

