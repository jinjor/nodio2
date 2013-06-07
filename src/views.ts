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
    
    var _views = {};
    export class NodeView extends Backbone.View {
        paramViews: any;
        inX: number;
        inY: number;
        outX: number;
        outY: number;
        
        constructor(node: models.Node) {
            super();
            this.listenTo(node, 'destroy', () => {
                this.remove();
            });
            this.paramViews = node.params.map(function(p: models.Param){
                var view = new ParamView(p);
                _views[p.id] = view;
                return view;
            });
            var label = $('<label/>').text(node.description);
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
                }
            }).append(label);
            this.paramViews.forEach(function(pv){
               $el.append(pv.$el)
            });
            this.$el = $el;
            this.resetPosition();
            setTimeout(()=>{
                this.resetPosition();
            },0)
            
        }
        private resetPosition(){
            var offset = this.$el.offset();
            this.inX = offset.left;
            this.inY = offset.top + 10;
            this.outX = offset.left + this.$el.width();
            this.outY = offset.top + this.$el.height() / 2;
            this.paramViews.forEach(function(pv){
                pv.move();
            });
            this.trigger('move');
        }
    }
    
    export class NodesView extends Backbone.View {
        raphael: any;
        constructor(nodes, connections: models.Connections) {
            super();
            var that = this;
            this.$el = $('<div class="container"/>').css({
                width: '800px',
                height: '600px'
            });
            this.raphael = Raphael(this.$el[0], this.$el.width(), this.$el.height());
            this.listenTo(nodes, 'add', this.addNodeView);
            this.listenTo(connections, 'add', this.addConnectionView);
            
        }
        addNodeView(node) {
            var view = new NodeView(node);
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
            this.path = raphael.path().attr({
                stroke: '#666',
                fill: 'none',
                'stroke-width': 3,
                'stroke-linecap': 'round'
            });
            this.render();
            
        }
        private render() {
            var path = createBezierPath(
                this.sourceView.outX,
                this.sourceView.outY,
                this.targetView.inX,
                this.targetView.inY);
            this.path.attr('path', path);
        }
    }
    
}

