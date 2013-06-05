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
        valueToDescription: any;
        private static createParamId() {
            return 'param' + _id++;
        }
        constructor(public name, public description, valueToDescription?) {
            super();
            this.id = Param.createParamId();
            this.valueToDescription = valueToDescription || function(){};
        }
    }
    
    export class Node extends Backbone.Model {
        id: string;
        targets: any;
        private static createParamId() {
            return 'node' + _id++;
        }
        constructor(context, public audioNode, public params, public description?) {
            super();
            this.id = Node.createParamId();
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
        gainNode(context: AudioContext, val){
            var audioNode = context.createGain();
            var _node = new Node('gain', audioNode,
                [new Param('gain', 'Gain')],
                'Gain');
            this.add(_node);
            return _node
        }
        oscillatorNode(context: AudioContext, type, freq){
            var audioNode = context.createOscillator();
            var _node = new Node('oscillator', audioNode,
                [new Param('type', 'Gain'), new Param('freq', 'Freq')],
                'Oscillator');
            this.add(_node);
            audioNode.start(0);
            return _node
        }
        biquadFilterNode(context: AudioContext, type:String, freq, q, gain){
            var audioNode = context.createBiquadFilter();
            
            var useGain = false;
            if(type == 'lowpass'){
            }else if(type == 'highpass'){
            }else if(type == 'bandpass'){
            }else if(type == 'lowshelf'){
                useGain = true;
            }else if(type == 'highshelf'){
                useGain = true;
            }else if(type == 'peaking'){
                useGain = true;
            }else if(type == 'notch'){
            }else if(type == 'allpass'){
            }else {
                throw '!';
            }
            var params = [new Param('frequency', 'Freq'), new Param('Q', 'Q')]
            if(useGain){
                params.push(new Param('gain', 'Gain'));
            }
            var _node = new Node('filter', audioNode,
                params,
                'Filter[' + type + ']');
            this.add(_node);
            return _node
        }
        analyserNode(context: AudioContext){
            var audioNode = context.createAnalyser();
            audioNode.fftSize = 1024;
            var _node = new Node('analyser', audioNode, [new Param('mode', 'Mode')], 'Analyser');
            this.add(_node);
            return _node
        }
        delayNode(context: AudioContext, val){
            var audioNode = context.createDelay();
            var _node = new Node('delay', audioNode, [new Param('delayTime', 'Time')], 'Delay');
            this.add(_node);
            return _node
        }/*
        scriptProcessor(context, keyState){
            var bufsize = 1024;
            var node = context.createGain();
            node.gain.value = 0;
            
            var attackTime = Signal(5);
            var decayTime = Signal(3);
            var sustainLevel = Signal(0.5);//[ms]
            var releaseTime = Signal(10);
            Observer(() => {
                if(keyState() == 1){
                    var t0 = context.currentTime;
                    var t1 = t0 + attackTime()/1000;
                    node.gain.setValueAtTime(0, t0);
                    node.gain.linearRampToValueAtTime(1, t1);
                    node.gain.setTargetAtTime(sustainLevel(), t1, decayTime()/1000);
                } else{
                    var t0 = context.currentTime;
                    node.gain.cancelScheduledValues(t0);
                    node.gain.setValueAtTime(node.gain.value, t0);
                    node.gain.setTargetAtTime(0, t0, releaseTime()/1000);
                }
            })
            var _node = new Node('scriptProcessor',
                [new Param('attack', 0, 200, 0.1, attackTime),
                new Param('decay', 0, 200, 0.1, decayTime),
                new Param('sustain', 0, 1, 0.01, sustainLevel),
                new Param('release', 0, 200, 0.1, releaseTime)
                ], node);
            this.add(_node);
            return _node
        }*/
        destinationNode(context: AudioContext){
            var audioNode = context.destination
            var _node = new Node('destination', audioNode, [], 'Destination');
            this.add(_node);
            return _node
        }
    }
    
    export class Connections extends Backbone.Collection {
        createConnection(from, to) {
            this.add(new Connection(from, to));
        }
    }
   

}

