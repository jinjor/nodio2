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
    export var ParamView = Backbone.View.extend({
        constructor: function(param) {
            var position = _.extend({}, Backbone.Events);
            var label = $('<label/>').text(param.description ? param.description : param.name);
            var $el = $('<div class="param"/>').css({
                top: rnd(400) + 'px',
                left: rnd(400) + 'px',
                width: '100px',
                //height: '20px',
            }).append(label);
            
            $('#holder').append($el);
            var r = Raphael($el[0], 16, 16);
            
            $el.raphael = r.circle(8, 8, 6, 9).attr({
                fill: '#222'
            });
            
            this.inX = $el.offset().left + 8;
            this.inY = $el.offset().top + 8;
            
            var position = _.extend({}, Backbone.Events);
            this.$el = $el;
        },
        move: function(){
            this.inX = this.$el.offset().left + 8;
            this.inY = this.$el.offset().top + 8;
            this.trigger('move');
        }
    });
    

    var tmpNodeFrom = null;
    var tmpNodeTo = null;
    
    var _id = 0;
    var Param = Backbone.Model.extend({
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
    
    var _views = {};
    export var NodeView = Backbone.View.extend({
        constructor: function(node) {
            var that = this;
            this.listenTo(node, 'destroy', function(){
                this.remove();
            });
            this.paramViews = node.params.map(function(p){
                var view = new ParamView(p);
                _views[p.id] = view;
                return view;
            });
            var label = $('<label/>').text(node.description ? node.description : node.type);
            var $el = $('<div class="node"/>').css({
                position: 'absolute',
                top: rnd(400)+'px',
                left: rnd(400)+'px'
            }).draggable({
                drag:function(e, ui){
                    that._resetPosition();
                },
                stop:function(e, ui){
                    that._resetPosition();
                }
            }).append(label);
            this.paramViews.forEach(function(pv){
               $el.append(pv.$el)
            });
            this.$el = $el;
            this._resetPosition();
        },
        _resetPosition: function(){
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
    });
    
    export var NodesView = Backbone.View.extend({
        constructor: function(nodes, connections) {
            var that = this;
            this.$el = $('<div/>').css({
                position: 'absolute',
                background: '#dde',
                overflow: 'hidden',
                width: '800px',
                height: '600px',
            });
            this.raphael = Raphael(this.$el[0], this.$el.width(), this.$el.height());
            this.listenTo(nodes, 'add', this.addNodeView);
            this.listenTo(connections, 'add', this.addConnectionView);
            
        },
        addNodeView: function(node) {
            var view = new NodeView(node);
            this.listenTo(view, 'remove', function(){
                delete _views[view.id];
            });
            _views[node.id] = view;
            this.$el.prepend(view.$el);
        },
        addConnectionView: function(connection) {
            var sourceView = _views[connection.source.id];
            var targetView = _views[connection.target.id];
            //var raphael = Raphael(this.$el[0], this.$el.width(), this.$el.height());
            this.$el.append(new ConnectionView(connection, this.raphael, sourceView, targetView).$el);
        }
    });

    export var ConnectionView = Backbone.View.extend({
        constructor: function(connection, raphael, sourceView, targetView) {
            this.sourceView = sourceView;
            this.targetView = targetView;
            this.listenTo(sourceView, 'move', this.render);
            this.listenTo(targetView, 'move', this.render);
            this.path = raphael.path().attr({
                stroke: '#666',
                fill: 'none',
                'stroke-width': 3,
                'stroke-linecap': 'round'
            });
            this.render();
        },
        render: function(pos) {
            var path = createBezierPath(
                this.sourceView.outX,
                this.sourceView.outY,
                this.targetView.inX,
                this.targetView.inY);
            this.path.attr('path', path).toFront();
        }
    });
    
}
