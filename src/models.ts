/// <reference path="../d.ts/DefinitelyTyped/webaudioapi/Web-Audio-API.d.ts"/>
/// <reference path="../d.ts/DefinitelyTyped/underscore/underscore.d.ts"/>
/// <reference path="../d.ts/DefinitelyTyped/backbone/backbone.d.ts"/>

module models {
    
    export interface ConnectionTarget {
        id: string;
        value: any;
    }
    
    var createBezierPath = function(x1, y1, x4, y4){
        var dx = x4 - x1;
        var dy = y4 - y1;
        if(Math.abs(dx) > Math.abs(dy)){
            var x2 = x1 + dx/2;
            var x3 = x1 + dx/2;
            var y2 = y1;
            var y3 = y4;
        }else{
            var x2 = x1;
            var x3 = x4;
            var y2 = y1 + dy/2;
            var y3 = y1 + dy/2;
        }
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
        constructor(public description, public min:number, public max:number, public step:number, value: any, onChange:any) {
            super();
            this.id = Param.createParamId();
            this.on('change:value', (_, value) => {
                onChange(value);
            });
            this.set('value', value);
        }
    }
    export class TargetParam extends Param implements ConnectionTarget {
        constructor(description, min, max, step, public value: AudioParam) {
            super(description, min, max, step, value.value, (_value) => {
                value.value = _value;
            });

        }
    }
    
    export class Node extends Backbone.Model implements ConnectionTarget {
        url = 'node';
        id: string;
        private targets: any;
        value: any;
        
        private static createParamId() {
            return 'node' + _id++;
        }
        params: Param[];
        constructor(private audioNode, public description, public isSource:bool, public isTarget:bool) {
            super();
            this.id = Node.createParamId();
            this.targets = {};
            this.value = audioNode;
        }
        connect(to: ConnectionTarget) {
            
            try{
                this.audioNode.connect(to.value);
                this.targets[to.id] = to;
            }catch(e){
                console.log(e);
            }
            
        }
        disconnect(to: ConnectionTarget) {
            this.audioNode.disconnect(to.value);
            delete this.targets[to.id];
            for(var key in this.targets){
                if(this.targets.hasOwnProperty(key)){
                    this.connect(this.targets[key]);
                }
            }
        }
        remove() {
            this.destroy();
        }
    }
    
    export class GainNode extends Node  {
        gain: TargetParam;
        constructor(node: any) {
            super(node, 'Gain', true, true);
            this.gain = new TargetParam('Gain', 0, 1, 0.01, node.gain);
            this.params = [this.gain];
        }
    }
    export class DelayNode extends Node {
        delayTime: TargetParam;
        constructor(node: any) {
            super(node, 'Delay', true, true);
            this.delayTime = new TargetParam('DelayTime', 0.0, 0.5, 0.01, node.delayTime);
            this.params = [this.delayTime];
        }
    }
    export class OscillatorNode extends Node {
        type: Param;
        freq: TargetParam;
        constructor(node: any) {
            super(node, 'Oscillator', true, false);
            this.type = new Param('Type', 0, 3, 1, 0, (value) => {
                console.log(value);
                node.type = parseInt(value);
            });
            this.freq = new TargetParam('Freq', 60.0, 2000.0, 0.1, node.frequency);
            this.params = [this.type, this.freq];
        }
    }
    export class AnalyserNode extends Node {
        mode: Param;
        constructor(public node: any) {
            super(node, 'Analyser', true, true);
            this.mode = new Param('Mode', 0, 1, 1, node.mode, (value) => {
                node.mode = value;
            });
            this.params = [this.mode];
        }
    }
    export class ADSRNode extends Node {
        attack: Param;
        decay: Param;
        sustain: Param;
        release: Param;
        constructor(context, node: any) {
            super(node, 'ADSR', true, true);
            var a = 5;
            var d = 3;
            var s = 0.5;
            var r = 10;
            this.attack = new Param('Attack', 0, 200, 0.1, a, (_a) => { a = _a; });
            this.decay = new Param('Decay', 0, 200, 0.1, d, (_d) => { d = _d; });
            this.sustain = new Param('Sustain', 0, 1, 0.01, s, (_s) => { s = _s; });
            this.release = new Param('Release', 0, 200, 0.1, r, (_r) => { r = _r; });
            this.params = [this.attack, this.decay, this.sustain, this.release];
            this.set('keyState', 0);
            this.on('change:keyState', (_, keyState) => {
                if(keyState == 1){
                    var t0 = context.currentTime;
                    var t1 = t0 + a/1000;
                    node.gain.setValueAtTime(0, t0);
                    node.gain.linearRampToValueAtTime(1, t1);
                    node.gain.setTargetAtTime(s, t1, d/1000);
                } else{
                    var t0 = context.currentTime;
                    node.gain.cancelScheduledValues(t0);
                    node.gain.setValueAtTime(node.gain.value, t0);
                    node.gain.setTargetAtTime(0, t0, r/1000);
                }
            });
        }
    }
    export class DestinationNode extends Node {
        constructor(node: any) {
            super(node, 'Destination', false, true);
            this.params = [];
        }
    }

    export class Connection extends Backbone.Model {
        constructor(public source: Node, public target: ConnectionTarget) {
            super();
            this.listenTo(source, 'destroy', this.remove);
            this.listenTo(target, 'destroy', this.remove);
            source.connect(target);
            
        }/*
        private destroyBySource(){
            this.stopListening(this.target);
            this.source.dis
            this.destroy();
        }
        private destroyByTarget(){
            this.stopListening(this.source);
            this.destroy();
        }*/
        public remove(){
            this.stopListening(this.target);
            this.stopListening(this.source);
            this.source.disconnect(this.target);
            this.destroy();
        }
    }
    
    export class Nodes extends Backbone.Collection {
        model: Node;
        gainNode(context: AudioContext, val){
            var audioNode = context.createGain();
            var node = new GainNode(audioNode);
            node.gain.set('value', val);
            this.add(node);
            return node
        }
        oscillatorNode(context: AudioContext, type, freq){
            var audioNode = context.createOscillator();
            var node = new OscillatorNode(audioNode);
            node.type.set('value', type);
            node.freq.set('value', freq);
            this.add(node);
            audioNode.start(0);
            return node
        }
        /*
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
        }*/
        analyserNode(context: AudioContext){
            var audioNode = context.createAnalyser();
            audioNode.fftSize = 1024;
            var node = new AnalyserNode(audioNode);
            this.add(node);
            return node
        }
        delayNode(context: AudioContext, val){
            var audioNode = context.createDelay();
            var node = new DelayNode(audioNode);
            node.delayTime.set('value', val);
            this.add(node);
            return node
        }
        adsrNode(context){
            var bufsize = 1024;
            var gainNode = context.createGain();
            gainNode.gain.value = 0;
            var node = new ADSRNode(context, gainNode);
            this.add(node);
            return node
        }
        destinationNode(context: AudioContext){
            var audioNode = context.destination
            var node = new DestinationNode(audioNode);
            this.add(node);
            return node
        }
    }
    
    export class Connections extends Backbone.Collection {
        constructor(tmp: TemporaryConnection){
            super();
            this.listenTo(tmp, 'resolve', (st) => {
                this.createConnection(st.source, st.target);
            });
        }        
        createConnection(source: Node, target: Node) {
            var connection = new Connection(source, target);
            this.add(connection);
            return connection;
        }
    }
    
    export class TemporaryConnection extends Backbone.Model{
        private source: Node = null;
        private target: Node = null;
        setSource(source: Node){
            if(source == null || !source.isSource){
                if(this.source){
                    this.source.trigger('cancelSource');
                }
                this.source = null;
                return;
            }
            this.source = source;
            source.trigger('setToSource');
            return;
        }
        setTarget(target: Node){
            if(!this.source){
                return;
            }
            if(target == null || !target.isTarget){
                if(this.target){
                    this.target.trigger('cancelTarget');
                }
                this.target = null;
                return;
            }
            this.target = target;
            target.trigger('setToTarget');
            return;
        }
        resolve() {
            if(this.source && this.target && this.source != this.target){
                this.trigger('resolve', {
                    source: this.source,
                    target: this.target
                });
            }
            this.setSource(null);
            this.setTarget(null);
        }
    }
   

}

