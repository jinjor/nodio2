/// <reference path="../d.ts/DefinitelyTyped/webaudioapi/Web-Audio-API.d.ts"/>
/// <reference path="../d.ts/DefinitelyTyped/underscore/underscore.d.ts"/>
/// <reference path="../d.ts/DefinitelyTyped/backbone/backbone.d.ts"/>

module models {
    
    export interface ConnectionTarget {
        getUniqueKey: () => string;
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
        constructor(private id:number, public description, public min:number, public max:number, public step:number, value: any, onChange:any) {
            super();
            this.on('change:value', (_, value) => {
                onChange(value);
            });
            this.set('value', value);
        }
        getUniqueKey(){
            return 'param' + super.id;
        }
    }
    export class TargetParam extends Param implements ConnectionTarget {
        constructor(id, description, min, max, step, public value: AudioParam) {
            super(id, description, min, max, step, value.value, (_value) => {
                value.value = _value;
            });
        }
    }
    
    export class Node extends Backbone.Model implements ConnectionTarget {
        id: number;
        private targets: any;
        value: any;
        params: Param[];
        constructor(private id:number, private audioNode, public description,
                public isSource:bool, public isTarget:bool) {
            super();
            this.url = 'child/' + this.id;
            this.targets = {};
            this.value = audioNode;
            /*
            this.on('dispose', () => {
                this.params.forEach((p) => {
                    p.dispose();
                }); 
            });*/
        }
        getUniqueKey(){
            return 'node' + this.id;
        }
        connect(to: ConnectionTarget) {
            try{
                this.audioNode.connect(to.value);
                this.targets[to.getUniqueKey()] = to;
            }catch(e){
                console.log(e);
            }
            
        }
        disconnect(to: ConnectionTarget) {
            this.audioNode.disconnect(to.value);
            delete this.targets[to.getUniqueKey()];
            for(var key in this.targets){
                if(this.targets.hasOwnProperty(key)){
                    this.connect(this.targets[key]);
                }
            }
        }
        getParam(name: string): any {//TODO type
            if(name == 'in'){
                return this;
            }
            return null;//FIXME
            //var ps = this.params.filter((p) => {
            //    return p.name == name;
            //});
            //return ps.length == 0 ? null : ps[0];
        }
        remove() {
            //this.destroy();
            this.set('disposed', true);
            this.trigger('dispose');
        }
    }
    
    export class GainNode extends Node  {
        gain: TargetParam;
        constructor(relId:number, node: any) {
            super(relId, node, 'Gain', true, true);
            this.gain = new TargetParam(0, 'Gain', 0, 1, 0.01, node.gain);
            this.set('nodeType', 'gain');
            this.set('gain', this.gain);
            this.params = [this.gain];
        }
    }
    export class DelayNode extends Node {
        delayTime: TargetParam;
        constructor(relId:number, node: any) {
            super(relId, node, 'Delay', true, true);
            this.delayTime = new TargetParam(0, 'DelayTime', 0.0, 0.5, 0.01, node.delayTime);
            this.set('nodeType', 'delay');
            this.set('delayTime', this.delayTime);
            this.params = [this.delayTime];
        }
    }
    export class OscillatorNode extends Node {
        type: Param;
        freq: TargetParam;
        constructor(relId:number, node: any) {
            super(relId, node, 'Oscillator', true, false);
            this.type = new Param(0, 'Type', 0, 3, 1, 0, (value) => {
                node.type = parseInt(value);
            });
            this.freq = new TargetParam(0, 'Freq', 60.0, 2000.0, 0.1, node.frequency);
            this.set('nodeType', 'oscillator');
            this.set('type', this.type);
            this.set('freq', this.freq);
            this.params = [this.type, this.freq];
        }
    }
    export class AnalyserNode extends Node {
        mode: Param;
        constructor(relId:number, public node: any) {
            super(relId, node, 'Analyser', true, true);
            this.mode = new Param(0, 'Mode', 0, 1, 1, node.mode, (value) => {
                node.mode = value;
            });
            this.set('nodeType', 'analyser');
            this.params = [this.mode];
        }
    }
    export class ADSRNode extends Node {
        attack: Param;
        decay: Param;
        sustain: Param;
        release: Param;
        constructor(relId:number, context, node: any) {
            super(relId, node, 'ADSR', true, true);
            var a = 5;
            var d = 3;
            var s = 0.5;
            var r = 10;
            this.attack = new Param(0, 'Attack', 0, 200, 0.1, a, (_a) => { a = _a; });
            this.decay = new Param(0, 'Decay', 0, 200, 0.1, d, (_d) => { d = _d; });
            this.sustain = new Param(0, 'Sustain', 0, 1, 0.01, s, (_s) => { s = _s; });
            this.release = new Param(0, 'Release', 0, 200, 0.1, r, (_r) => { r = _r; });
            this.set('nodeType', 'adsr');
            this.set('attack', this.attack);
            this.set('decay', this.decay);
            this.set('sustain', this.sustain);
            this.set('release', this.release);
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
        constructor(relId:number, node: any) {
            super(relId, node, 'Destination', false, true);
            this.params = [];
        }
    }

    export class Connection extends Backbone.Model {
        constructor(private id:number, public source: Node, public target: ConnectionTarget) {
            super();
            this.url = '/connection/' + this.id;
            this.listenTo(source, 'dispose', this.remove);
            this.listenTo(target, 'dispose', this.remove);
            source.connect(target);
            //this.set('sourceId', source.id);
            //this.set('targetId', target.id);
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
            this.set('disposed', true);
            this.trigger('dispose');
        }
    }
    
    export class Nodes extends Backbone.Collection {
        model: Node;
        constructor(private nodeId:number){
            super();
            this.url = '/children/' + nodeId;
            this.on('add', (node) => {
                //node.save();
            });
        }
        load(context: AudioContext){
            var self:any = this;
            
            self.fetch({
                //data: {},
                //dataType : 'json',
                success : (collection, data) => {
                    data.forEach((d:any) => {
                        console.log(d);
                        if(d.id == 1){
                            this.gainNode(context, 0.3, d.relationId);
                        }else if(d.id == 2){
                            this.destinationNode(context, d.relationId);
                        }else if(d.id == 3){
                            this.oscillatorNode(context, 3, 440, d.relationId);
                        }else if(d.id == 4){
                            this.delayNode(context, 0.5, d.relationId);
                        }else if(d.id == 100){
                            this.adsrNode(context, d.relationId);
                        }else if(d.id == 101){
                            this.analyserNode(context, d.relationId);
                        }
                    });
                    this.trigger('loaded');
                }
            });
        }
        parse(res) {
            return [];
        }
        getSource(nodeId: number) : Node {
            var _this:any = this;
            return _this.get(nodeId);
        }
        getTarget(nodeId: number, paramName: string) : ConnectionTarget {
            var _this:any = this;
            var node = _this.get(nodeId);
            if(!node){
                console.log('node[' + nodeId + '] not found');
                return null;
            }
            var param = node.getParam(paramName);
            if(!param){
                console.log('param[' + paramName + '] not found');
                return null;
            }
            return param;
        }
        gainNode(context: AudioContext, val, id?){
            var audioNode = context.createGain();
            var node = new GainNode(this.url, audioNode);
            node.gain.set('value', val);
            if(id) node.id = id;
            this.add(node);
            return node;
        }
        oscillatorNode(context: AudioContext, type, freq, id?){
            var audioNode = context.createOscillator();
            var node = new OscillatorNode(this.url, audioNode);
            node.type.set('value', type);
            node.freq.set('value', freq);
            if(id) node.id = id;
            this.add(node);
            
            audioNode.start(0);
            return node;
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
        analyserNode(context: AudioContext, id?){
            var audioNode = context.createAnalyser();
            audioNode.fftSize = 1024;
            var node = new AnalyserNode(this.url, audioNode);
            if(id) node.id = id;
            this.add(node);
            
            return node
        }
        delayNode(context: AudioContext, val, id?){
            var audioNode = context.createDelay();
            var node = new DelayNode(this.url, audioNode);
            node.delayTime.set('value', val);
            if(id) node.id = id;
            this.add(node);
            return node
        }
        adsrNode(context: AudioContext, id?){
            var bufsize = 1024;
            var gainNode = context.createGain();
            gainNode.gain.value = 0;
            var node = new ADSRNode(this.url, context, gainNode);
            if(id) node.id = id;
            this.add(node);
            return node
        }
        destinationNode(context: AudioContext, id?){
            var audioNode = context.destination
            var node = new DestinationNode(this.url, audioNode);
            if(id) node.id = id;
            this.add(node);
            return node
        }
    }
    
    export class Connections extends Backbone.Collection {
        constructor(nodeId:number, private nodes:Nodes, tmp: TemporaryConnection){
            super();
            this.listenTo(tmp, 'resolve', (st) => {
                this.createConnection(st.source, st.target);
            });
            this.url = '/connections/' + nodeId;
            this.listenTo(nodes, 'loaded', () => this.load());
            
            
            //this.load();
        }
        load(){
            var self:any = this;
            self.fetch({
                //data: {},
                //dataType : 'json',
                success : (collection, data) => {
                    console.log(data);
                    data.forEach((c:any) => {
                        this.createConnection2(c);
                    });
                    this.trigger('loaded');
                }
            });
        }
        parse(res) {
            return [];
        }
        createConnection(source: Node, target: ConnectionTarget) {
            var connection = new Connection(0, source, target);//TODO
            this.add(connection);
            return connection;
        }
        private createConnection2(c:any) {
            var nodes = this.nodes;
            var source = nodes.getSource(c.sourceNodeId);
            var target = nodes.getTarget(c.targetNodeId, c.targetParamName);
            if(!source){
                console.log(nodes);
                throw 'source[' + c.sourceNodeId + '] not found';
            }
            if(!target){
                console.log(nodes);
                throw 'target[' + c.targetNodeId + ', ' + c.targetParamName + '] not found';
            }
            var connection = new Connection(c.id, source, target);//TODO
            this.add(connection);
            return connection;
        }
    }
    
    export class TemporaryConnection extends Backbone.Model{
        private source: Node = null;
        private target: Node = null;
        setSource(source: Node){
            if(source == null || !source.isSource){
                if(source){
                    source.trigger('cancelSource');
                }
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
            if(!this.source || target == null || !target.isTarget){
                if(this.target){
                    this.target.trigger('cancelTarget');
                }
                this.target = null;
                return;
            }
            if(this.source == target){
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
    
    
    /*
    export class SynthInfo extends Backbone.Model {
        constructor(
            public id:string,
            public nodes:NodeInfo[],
            public nodeviews:NodeViewInfo[],
            public connections:ConnectionInfo[]){
        }
    }
    export class NodeInfo {
        constructor(
            public id:string,
            public type:string,
            public params:ParamInfo[]){
        }
    }
    export class NodeViewInfo {
        constructor(
            public nodeId:string,
            public offsetX:number,
            public offsetY:number){
        }
    }
    export class ParamInfo {
        constructor(
            public id:string,
            public type:string,
            public value:number){
        }
    }
    export class ConnectionInfo {
        constructor(
            public sourceId:string,
            public targetId:string){
        }
    }
    */
   

}

