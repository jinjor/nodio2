/// <reference path="../d.ts/DefinitelyTyped/webaudioapi/Web-Audio-API.d.ts"/>
/// <reference path="../d.ts/DefinitelyTyped/underscore/underscore.d.ts"/>
/// <reference path="../d.ts/DefinitelyTyped/backbone/backbone.d.ts"/>
/// <reference path="../d.ts/DefinitelyTyped/raphael/raphael.d.ts"/>
/// <reference path="models.ts"/>

module views {
    
    declare var $: any;
    declare var Raphael: any;
    
    var createBezierPath = function(x1, y1, x4, y4){
        var dx = x4 - x1;
        var dy = y4 - y1;
        //if(Math.abs(dx) > Math.abs(dy)){
        if(false){
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
    export class ParamView extends Backbone.View {
        inX: number;
        inY: number;
        constructor(param: models.Param) {
            super();
            var position = _.extend({}, Backbone.Events);
            var label = $('<label/>').text(param.description);
            var val = $('<label/>').text(param.get('value'));
            var range = $('<input type="range"/>')
                .attr('min', param.min.toFixed(1))
                .attr('step', param.step)
                .attr('max', param.max)
                .val(param.get('value'))
                .on('change', function(){
                    var v = $(this).val();
                    val.text(v);
                    param.set('value', parseFloat(v));
                });
            //var max = $('<label/>').text(param.max);
            var $el = $('<li class="param"/>').append(label).append(range).append(val);
            
            this.listenTo(param, 'change value', function(value){
                //range.val(value);
            });
            
            $('#holder').append($el);
            var r = Raphael($el[0], 16, 16);
            
            $el.raphael = r.circle(8, 8, 6, 9).attr({
                fill: '#222'
            });
            this.inX = $el.offset().left + 8;
            this.inY = $el.offset().top + 8;
            var position = _.extend({}, Backbone.Events);
            this.$el = $el;
        }
        move(){
            this.inX = this.$el.offset().left + 8;
            this.inY = this.$el.offset().top + 8;
            this.trigger('move');
        }
    }
    

    var tmpNodeFrom = null;
    var tmpNodeTo = null;
    
    var _id = 0;
    export class Param extends Backbone.Model {
        private createParamId() {
            return 'param' + _id++;
        }
        constructor(public name, public description, public valueToDescription) {
            super();
            this.id = this.createParamId();
        }
    }
    
    export class NodeViewModel extends Backbone.Model {
        constructor(root:string, nodeId:string) {
            super();
            this.url = root + '/nodeviews/' + nodeId;
        }
        load(){
            var self:any = this;
            self.fetch({
                success : (model, data) => {
                    this.set('offsetY', data.top);
                    this.set('offsetX', data.left);
                }
            });
        }
        parse(res) {
            return [];
        }
    }
    
    var globalKeyState = false;
    var _views = {};
    export class NodeView extends Backbone.View {
        public viewModel: NodeViewModel;
        paramViews: any;
        inX: number;
        inY: number;
        outX: number;
        outY: number;
        
        constructor(root:string, node: models.Node, tmpConn: models.TemporaryConnection) {
            super();
            this.viewModel = new NodeViewModel(root, node.id);
            
            this.listenTo(this.viewModel, 'change:offsetX', (_, x)=> {
                this.$el.css({left:x + 'px'});
                this.resetPosition();
            });
            this.listenTo(this.viewModel, 'change:offsetY', (_, y)=> {
                this.$el.css({top:y + 'px'})
                this.resetPosition();
            });
            
            
            this.viewModel.load();
            
            this.listenTo(node, 'destroy', () => {
                this.viewModel.destroy();
                this.remove();
            });
            this.paramViews = node.params.map(function(p: models.Param){
                var view = new ParamView(p);
                _views[p.id] = view;
                return view;
            });
            
            var label = $('<label/>').text(node.description);
            var xButton = $('<div class="xButton"/>').on('click', () => {
                node.remove();
            });
            var header = $('<div class="node_header"/>').append(label).append(xButton);
            var body = $('<div class="node_body"/>').mousedown(() => {
                tmpConn.setSource(node);
                tmpConn.setTarget(node);
            }).mouseenter(() => {
                tmpConn.setTarget(node);
            }).mouseleave(() => {
                tmpConn.setTarget(null);
            }).mouseup(() => {
                tmpConn.resolve();
            });
            
            var $el = $('<div class="node"/>').css({
                position: 'absolute',
                top: rnd(400)+'px',
                left: rnd(400)+'px'
            }).draggable({
                drag:(e, ui) => {
                    this.resetPosition();
                },
                stop: (e, ui) =>{
                    this.resetPosition();
                },
                handle: header
            }).append(header);
            
            this.listenTo(node, 'setToSource', () => {
                $el.addClass('source');
            });
            this.listenTo(node, 'cancelSource', () => {
                $el.removeClass('source');
            });
            this.listenTo(node, 'setToTarget', () => {
                $el.addClass('target');
            });
            this.listenTo(node, 'cancelTarget', () => {
                $el.removeClass('target');
            });
            
            this.paramViews.forEach(function(pv){
               body.append(pv.$el)
            });
            if(node.description == "ADSR"){
                var button = $('<Button/>').text('Note On')
                    .on('mousedown', () => {
                        globalKeyState = true;
                        node.set('keyState', 1);
                        return false;
                    }).on('mouseup', () => {
                        globalKeyState = false;
                        node.set('keyState', 0);
                    }).on('mouseenter', () => {
                        if(globalKeyState){
                            node.set('keyState', 1);
                        }
                    }).on('mouseleave', () => {
                        node.set('keyState', 0);
                    });
                body.append(button);
            }
            $el.append(body);
            if(node.description == "Analyser"){
                var _node: any = node;
                var canvas:any = document.createElement('canvas');
                var sample = 1024;
                var height = 256
                canvas.width = sample;
                canvas.height = height;
                $el.append($(canvas).addClass('analyser'));
                var ctx = canvas.getContext("2d");
                setInterval(() => {
                    ctx.fillStyle = '#000';
                    ctx.fillRect(0, 0, sample, height);
                    var data = new Uint8Array(sample);
                    if(_node.mode.get('value') == 0) _node.node.getByteFrequencyData(data); //Spectrum Data
                    else _node.node.getByteTimeDomainData(data); //Waveform Data
                    for(var i = 0; i < sample; ++i) {
                        ctx.fillStyle = '#0f0'
                        ctx.fillRect(i, height - data[i], 1, data[i]);
                    }
                }, 100);
            }
            
            this.$el = $el;
            this.resetPosition();
            setTimeout(()=>{
                this.resetPosition();
            },0)
            
        }
        private resetPosition(){
            var offset = this.$el.offset();
            this.inX = offset.left + this.$el.width() / 2;
            this.inY = offset.top;
            this.outX = offset.left + this.$el.width() / 2;
            this.outY = offset.top + this.$el.height();
            this.paramViews.forEach(function(pv){
                pv.move();
            });
            this.viewModel.set('offsetX', offset.left);
            this.viewModel.set('offsetY', offset.top);
            this.trigger('move');
        }
    }
    
    export class NodesView extends Backbone.View {
        raphael: any;
        constructor(private root:string, nodes: models.Nodes, connections: models.Connections, private tmpConn: models.TemporaryConnection) {
            super();
            var that = this;
            this.$el = $('<div class="container"/>').css({
                width: '800px',
                height: '600px'
            }).mouseup(() => {
                tmpConn.setSource(null);
                tmpConn.setTarget(null);
            }).disableSelection();
            this.raphael = Raphael(this.$el[0], this.$el.width(), this.$el.height());
            this.listenTo(nodes, 'add', this.addNodeView);
            this.listenTo(connections, 'add', this.addConnectionView);
            
        }
        addNodeView(node) {
            var view = new NodeView(this.root, node, this.tmpConn);
            this.listenTo(view, 'remove', function(){
                delete _views[view.id];
            });
            _views[node.id] = view;
            this.$el.prepend(view.$el);
        }
        addConnectionView(connection: models.Connection) {
            this.$el.append(new ConnectionView(connection, this.raphael).$el);
        }
    }

    export class ConnectionView extends Backbone.View {
        path: any;
        sourceView: NodeView;
        targetView: NodeView;
        constructor(connection: models.Connection, raphael) {
            super();
            this.sourceView = _views[connection.source.id];
            this.targetView = _views[connection.target.id];
            this.listenTo(connection, 'destroy', () => {
                this.path.remove();
            });
            this.listenTo(this.sourceView, 'move', this.render);
            this.listenTo(this.targetView, 'move', this.render);
            
            this.path = raphael.path('M0 1L90 0').attr({//TODO
                stroke: '#666',
                fill: 'none',
                'stroke-width': 3,
                'stroke-linecap': 'round',
                'arrow-end' :'classic-wide-long',
            }).click(() => {
                connection.remove();
            });
            
            this.render();
        }
        private render() {
            var path = createBezierPath(
                this.sourceView.outX,
                this.sourceView.outY,
                this.targetView.inX,
                this.targetView.inY);
            if(path == 'M,0.000,0.000,C,0.000,0.000,0.000,0.000,0.000,0.000'){//TODO
                return;
            }
            this.path.attr('path', path);
        }
    }
    
}

