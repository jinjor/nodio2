var models;
(function (models) {
    var createBezierPath = function (x1, y1, x4, y4) {
        var dx = x4 - x1;
        var dy = y4 - y1;
        var x2 = x1 + dx / 2;
        var x3 = x1 + dx / 2;
        var y2 = y1;
        var y3 = y4;
        return [
            'M', 
            x1.toFixed(3), 
            y1.toFixed(3), 
            'C', 
            x2.toFixed(3), 
            y2.toFixed(3), 
            x3.toFixed(3), 
            y3.toFixed(3), 
            x4.toFixed(3), 
            y4.toFixed(3)
        ].join(',');
    };
    var rnd = function (n) {
        return Math.floor(Math.random() * (n + 1));
    };
    var Position = Backbone.Model.extend({
        change: function (x, y) {
            var cssColor = prompt("Please enter a CSS color:");
            this.set({
                color: cssColor
            });
        }
    });
    var tmpNodeFrom = null;
    var tmpNodeTo = null;
    var _id = 0;
    models.Param = Backbone.Model.extend({
        _createParamId: function () {
            return 'param' + _id++;
        },
        constructor: function (name, description, valueToDescription) {
            this.id = this._createParamId();
            this.name = name;
            this.description = description;
            this.valueToDescription = valueToDescription;
        }
    });
    models.Node = Backbone.Model.extend({
        _createParamId: function () {
            return 'node' + _id++;
        },
        constructor: function (context, type, description) {
            this.id = this._createParamId();
            this.type = type;
            this.description = description;
            if(type == 'gain') {
                this.audioNode = context.createGain();
                this.params = [
                    new models.Param('gain', 'Gain', null)
                ];
            } else {
                throw 'unsupported type: ' + type;
            }
            this.targets = {
            };
        },
        setParamValue: function (param, value) {
            if(this.audioNode[param.name].value) {
                this.audioNode[param.name].value = value;
            } else {
                this.audioNode[param.name] = value;
            }
        },
        connect: function (to) {
            if(to.audioNode) {
                this.audioNode.connect(to.audioNode);
            }
            this.targets[to.id] = to;
        },
        disconnect: function (to) {
            if(to.audioNode) {
                this.audioNode.disconnect(to.audioNode);
            } else if(to.param.value) {
                this.audioNode.disconnect(to.param);
            }
            delete this.targets[to.id];
            for(var key in this.targets) {
                if(this.targets.hasOwnProperty(key)) {
                    this.connect(this.targets[key]);
                }
            }
        }
    });
    models.Connection = Backbone.Model.extend({
        constructor: function (source, target) {
            this.listenTo(source, 'destroy', this._destroyBySource);
            this.listenTo(target, 'destroy', this._destroyByTarget);
            this.source = source;
            this.target = target;
            source.connect(target);
        },
        _destroyBySource: function () {
            this.stopListening(this.target);
            this._destroy();
        },
        _destroyByTarget: function () {
            this.stopListening(this.source);
            this._destroy();
        },
        _destroy: function () {
            this.from.disconnect(this.target);
            this.destroy();
        }
    });
    models.Nodes = Backbone.Collection.extend({
        model: models.Node,
        createNode: function (context, type) {
            var node = new models.Node(context, type);
            this.add(node);
            return node;
        }
    });
    models.Connections = Backbone.Collection.extend({
        createConnection: function (from, to) {
            this.add(new models.Connection(from, to));
        }
    });
})(models || (models = {}));
var views;
(function (views) {
    var createBezierPath = function (x1, y1, x4, y4) {
        var dx = x4 - x1;
        var dy = y4 - y1;
        var x2 = x1 + dx / 2;
        var x3 = x1 + dx / 2;
        var y2 = y1;
        var y3 = y4;
        return [
            'M', 
            x1.toFixed(3), 
            y1.toFixed(3), 
            'C', 
            x2.toFixed(3), 
            y2.toFixed(3), 
            x3.toFixed(3), 
            y3.toFixed(3), 
            x4.toFixed(3), 
            y4.toFixed(3)
        ].join(',');
    };
    var rnd = function (n) {
        return Math.floor(Math.random() * (n + 1));
    };
    views.ParamView = Backbone.View.extend({
        constructor: function (param) {
            var position = _.extend({
            }, Backbone.Events);
            var label = $('<label/>').text(param.description ? param.description : param.name);
            var $el = $('<div class="param"/>').css({
                top: rnd(400) + 'px',
                left: rnd(400) + 'px',
                width: '100px'
            }).append(label);
            $('#holder').append($el);
            var r = Raphael($el[0], 16, 16);
            $el.raphael = r.circle(8, 8, 6, 9).attr({
                fill: '#222'
            });
            this.inX = $el.offset().left + 8;
            this.inY = $el.offset().top + 8;
            var position = _.extend({
            }, Backbone.Events);
            this.$el = $el;
        },
        move: function () {
            this.inX = this.$el.offset().left + 8;
            this.inY = this.$el.offset().top + 8;
            this.trigger('move');
        }
    });
    var tmpNodeFrom = null;
    var tmpNodeTo = null;
    var _id = 0;
    var Param = Backbone.Model.extend({
        _createParamId: function () {
            return 'param' + _id++;
        },
        constructor: function (name, description, valueToDescription) {
            this.id = this._createParamId();
            this.name = name;
            this.description = description;
            this.valueToDescription = valueToDescription;
        }
    });
    var _views = {
    };
    views.NodeView = Backbone.View.extend({
        constructor: function (node) {
            var that = this;
            this.listenTo(node, 'destroy', function () {
                this.remove();
            });
            this.paramViews = node.params.map(function (p) {
                var view = new views.ParamView(p);
                _views[p.id] = view;
                return view;
            });
            var label = $('<label/>').text(node.description ? node.description : node.type);
            var $el = $('<div class="node"/>').css({
                position: 'absolute',
                top: rnd(400) + 'px',
                left: rnd(400) + 'px'
            }).draggable({
                drag: function (e, ui) {
                    that._resetPosition();
                },
                stop: function (e, ui) {
                    that._resetPosition();
                }
            }).append(label);
            this.paramViews.forEach(function (pv) {
                $el.append(pv.$el);
            });
            this.$el = $el;
            this._resetPosition();
        },
        _resetPosition: function () {
            var offset = this.$el.offset();
            this.inX = offset.left;
            this.inY = offset.top + 10;
            this.outX = offset.left + this.$el.width();
            this.outY = offset.top + this.$el.height() / 2;
            this.paramViews.forEach(function (pv) {
                pv.move();
            });
            this.trigger('move');
        }
    });
    views.NodesView = Backbone.View.extend({
        constructor: function (nodes, connections) {
            var that = this;
            this.$el = $('<div/>').css({
                position: 'absolute',
                background: '#dde',
                overflow: 'hidden',
                width: '800px',
                height: '600px'
            });
            this.raphael = Raphael(this.$el[0], this.$el.width(), this.$el.height());
            this.listenTo(nodes, 'add', this.addNodeView);
            this.listenTo(connections, 'add', this.addConnectionView);
        },
        addNodeView: function (node) {
            var view = new views.NodeView(node);
            this.listenTo(view, 'remove', function () {
                delete _views[view.id];
            });
            _views[node.id] = view;
            this.$el.prepend(view.$el);
        },
        addConnectionView: function (connection) {
            var sourceView = _views[connection.source.id];
            var targetView = _views[connection.target.id];
            this.$el.append(new views.ConnectionView(connection, this.raphael, sourceView, targetView).$el);
        }
    });
    views.ConnectionView = Backbone.View.extend({
        constructor: function (connection, raphael, sourceView, targetView) {
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
        render: function (pos) {
            var path = createBezierPath(this.sourceView.outX, this.sourceView.outY, this.targetView.inX, this.targetView.inY);
            this.path.attr('path', path).toFront();
        }
    });
})(views || (views = {}));
var nodio;
(function (nodio) {
    window.onload = function () {
        var connections2 = [];
        var context = {
            createGain: function () {
                return {
                    gain: {
                        value: null
                    },
                    connect: function () {
                    },
                    disconnect: function () {
                    }
                };
            }
        };
        var connections = new models.Connections();
        var nodes = new models.Nodes();
        console.log(views);
        var nodesView = new views.NodesView(nodes, connections);
        $('body').append(nodesView.$el);
        var node1 = nodes.createNode(context, 'gain');
        var node2 = nodes.createNode(context, 'gain');
        connections.createConnection(node1, node2);
        connections.createConnection(node1, node2.params[0]);
    };
})(nodio || (nodio = {}));
//@ sourceMappingURL=app.js.map
