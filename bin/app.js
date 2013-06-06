var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
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
    var tmpNodeFrom = null;
    var tmpNodeTo = null;
    var _id = 0;
    var Param = (function (_super) {
        __extends(Param, _super);
        function Param(description, setValue) {
                _super.call(this);
            this.description = description;
            this.setValue = setValue;
            this.id = Param.createParamId();
        }
        Param.createParamId = function createParamId() {
            return 'param' + _id++;
        };
        return Param;
    })(Backbone.Model);
    models.Param = Param;    
    var TargetParam = (function (_super) {
        __extends(TargetParam, _super);
        function TargetParam(description, value) {
                _super.call(this, description, function (_value) {
        value.value = _value;
    });
            this.value = value;
        }
        return TargetParam;
    })(Param);
    models.TargetParam = TargetParam;    
    var Node = (function (_super) {
        __extends(Node, _super);
        function Node(audioNode, description) {
                _super.call(this);
            this.audioNode = audioNode;
            this.description = description;
            this.id = Node.createParamId();
            this.targets = {
            };
            this.value = audioNode;
        }
        Node.createParamId = function createParamId() {
            return 'node' + _id++;
        };
        Node.prototype.connect = function (to) {
            this.audioNode.connect(to.value);
            this.targets[to.id] = to;
        };
        Node.prototype.disconnect = function (to) {
            this.audioNode.disconnect(to.value);
            delete this.targets[to.id];
            for(var key in this.targets) {
                if(this.targets.hasOwnProperty(key)) {
                    this.connect(this.targets[key]);
                }
            }
        };
        return Node;
    })(Backbone.Model);
    models.Node = Node;    
    var GainNode = (function (_super) {
        __extends(GainNode, _super);
        function GainNode(node) {
                _super.call(this, node, 'Gain');
            this.gain = new TargetParam('Gain', node.gain);
            this.params = [
                this.gain
            ];
        }
        return GainNode;
    })(Node);
    models.GainNode = GainNode;    
    var DelayNode = (function (_super) {
        __extends(DelayNode, _super);
        function DelayNode(node) {
                _super.call(this, node, 'Delay');
            this.delayTime = new TargetParam('DelayTime', node.delayTime);
            this.params = [
                this.delayTime
            ];
        }
        return DelayNode;
    })(Node);
    models.DelayNode = DelayNode;    
    var OscillatorNode = (function (_super) {
        __extends(OscillatorNode, _super);
        function OscillatorNode(node) {
                _super.call(this, node, 'Oscillator');
            this.type = new Param('Type', function (value) {
                node.type = value;
            });
            this.freq = new TargetParam('Freq', node.frequency);
            this.params = [
                this.type, 
                this.freq
            ];
        }
        return OscillatorNode;
    })(Node);
    models.OscillatorNode = OscillatorNode;    
    var AnalyserNode = (function (_super) {
        __extends(AnalyserNode, _super);
        function AnalyserNode(node) {
                _super.call(this, node, 'Analyser');
            this.mode = new Param('Mode', function (value) {
                node.mode = value;
            });
            this.attack = new Param('Attack', function (value) {
                console.log('attack:' + value);
            });
            this.decay = new Param('Decay', function (value) {
                console.log('decay:' + value);
            });
            this.sustain = new Param('Sustain', function (value) {
                console.log('sustain:' + value);
            });
            this.release = new Param('Release', function (value) {
                console.log('release:' + value);
            });
            this.params = [
                this.mode, 
                this.attack, 
                this.decay, 
                this.sustain, 
                this.release
            ];
        }
        return AnalyserNode;
    })(Node);
    models.AnalyserNode = AnalyserNode;    
    var DestinationNode = (function (_super) {
        __extends(DestinationNode, _super);
        function DestinationNode(node) {
                _super.call(this, node, 'Destination');
            this.params = [];
        }
        return DestinationNode;
    })(Node);
    models.DestinationNode = DestinationNode;    
    var Connection = (function (_super) {
        __extends(Connection, _super);
        function Connection(source, target) {
                _super.call(this);
            this.source = source;
            this.target = target;
            this.listenTo(source, 'destroy', this.destroyBySource);
            this.listenTo(target, 'destroy', this.destroyByTarget);
            source.connect(target);
        }
        Connection.prototype.destroyBySource = function () {
            this.stopListening(this.target);
            this.destroy();
        };
        Connection.prototype.destroyByTarget = function () {
            this.stopListening(this.source);
            this.destroy();
        };
        Connection.prototype.disconnect = function () {
            this.stopListening(this.target);
            this.stopListening(this.source);
            this.source.disconnect(this.target);
            this.destroy();
        };
        return Connection;
    })(Backbone.Model);
    models.Connection = Connection;    
    var Nodes = (function (_super) {
        __extends(Nodes, _super);
        function Nodes() {
            _super.apply(this, arguments);

        }
        Nodes.prototype.gainNode = function (context, val) {
            var audioNode = context.createGain();
            var node = new GainNode(audioNode);
            this.add(node);
            return node;
        };
        Nodes.prototype.oscillatorNode = function (context, type, freq) {
            var audioNode = context.createOscillator();
            var _node = new OscillatorNode(audioNode);
            this.add(_node);
            audioNode.start(0);
            return _node;
        };
        Nodes.prototype.analyserNode = function (context) {
            var audioNode = context.createAnalyser();
            audioNode.fftSize = 1024;
            var _node = new AnalyserNode(audioNode);
            this.add(_node);
            return _node;
        };
        Nodes.prototype.delayNode = function (context, val) {
            var audioNode = context.createDelay();
            var node = new DelayNode(context);
            this.add(node);
            return node;
        };
        Nodes.prototype.destinationNode = function (context) {
            var audioNode = context.destination;
            var _node = new DestinationNode(audioNode);
            this.add(_node);
            return _node;
        };
        return Nodes;
    })(Backbone.Collection);
    models.Nodes = Nodes;    
    var Connections = (function (_super) {
        __extends(Connections, _super);
        function Connections() {
            _super.apply(this, arguments);

        }
        Connections.prototype.createConnection = function (from, to) {
            var connection = new Connection(from, to);
            this.add(connection);
            return connection;
        };
        return Connections;
    })(Backbone.Collection);
    models.Connections = Connections;    
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
    var ParamView = (function (_super) {
        __extends(ParamView, _super);
        function ParamView(param) {
                _super.call(this);
            var position = _.extend({
            }, Backbone.Events);
            var label = $('<label/>').text(param.description);
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
        }
        ParamView.prototype.move = function () {
            this.inX = this.$el.offset().left + 8;
            this.inY = this.$el.offset().top + 8;
            this.trigger('move');
        };
        return ParamView;
    })(Backbone.View);
    views.ParamView = ParamView;    
    var tmpNodeFrom = null;
    var tmpNodeTo = null;
    var _id = 0;
    var Param = (function (_super) {
        __extends(Param, _super);
        function Param(name, description, valueToDescription) {
                _super.call(this);
            this.name = name;
            this.description = description;
            this.valueToDescription = valueToDescription;
            this.id = this.createParamId();
        }
        Param.prototype.createParamId = function () {
            return 'param' + _id++;
        };
        return Param;
    })(Backbone.Model);
    views.Param = Param;    
    var _views = {
    };
    var NodeView = (function (_super) {
        __extends(NodeView, _super);
        function NodeView(node) {
            var _this = this;
                _super.call(this);
            this.listenTo(node, 'destroy', function () {
                _this.remove();
            });
            this.paramViews = node.params.map(function (p) {
                var view = new ParamView(p);
                _views[p.id] = view;
                return view;
            });
            var label = $('<label/>').text(node.description);
            var $el = $('<div class="node"/>').css({
                position: 'absolute',
                top: rnd(400) + 'px',
                left: rnd(400) + 'px'
            }).draggable({
                drag: function (e, ui) {
                    _this.resetPosition();
                },
                stop: function (e, ui) {
                    _this.resetPosition();
                }
            }).append(label);
            this.paramViews.forEach(function (pv) {
                $el.append(pv.$el);
            });
            this.$el = $el;
            this.resetPosition();
            setTimeout(function () {
                _this.resetPosition();
            }, 0);
        }
        NodeView.prototype.resetPosition = function () {
            var offset = this.$el.offset();
            this.inX = offset.left;
            this.inY = offset.top + 10;
            this.outX = offset.left + this.$el.width();
            this.outY = offset.top + this.$el.height() / 2;
            this.paramViews.forEach(function (pv) {
                pv.move();
            });
            this.trigger('move');
        };
        return NodeView;
    })(Backbone.View);
    views.NodeView = NodeView;    
    var NodesView = (function (_super) {
        __extends(NodesView, _super);
        function NodesView(nodes, connections) {
                _super.call(this);
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
        }
        NodesView.prototype.addNodeView = function (node) {
            var view = new NodeView(node);
            this.listenTo(view, 'remove', function () {
                delete _views[view.id];
            });
            _views[node.id] = view;
            this.$el.prepend(view.$el);
        };
        NodesView.prototype.addConnectionView = function (connection) {
            var sourceView = _views[connection.source.id];
            var targetView = _views[connection.target.id];
            this.$el.append(new ConnectionView(connection, this.raphael, sourceView, targetView).$el);
        };
        return NodesView;
    })(Backbone.View);
    views.NodesView = NodesView;    
    var ConnectionView = (function (_super) {
        __extends(ConnectionView, _super);
        function ConnectionView(connection, raphael, sourceView, targetView) {
            var _this = this;
                _super.call(this);
            this.sourceView = sourceView;
            this.targetView = targetView;
            this.listenTo(connection, 'destroy', function () {
                _this.path.remove();
            });
            this.listenTo(sourceView, 'move', this.render);
            this.listenTo(targetView, 'move', this.render);
            this.path = raphael.path().attr({
                stroke: '#666',
                fill: 'none',
                'stroke-width': 3,
                'stroke-linecap': 'round'
            });
            this.render();
        }
        ConnectionView.prototype.render = function () {
            var path = createBezierPath(this.sourceView.outX, this.sourceView.outY, this.targetView.inX, this.targetView.inY);
            this.path.attr('path', path);
        };
        return ConnectionView;
    })(Backbone.View);
    views.ConnectionView = ConnectionView;    
})(views || (views = {}));
var nodio;
(function (nodio) {
    var context = new webkitAudioContext();
    $(function () {
        var connections = new models.Connections();
        var nodes = new models.Nodes();
        console.log(views);
        var nodesView = new views.NodesView(nodes, connections);
        $('body').append(nodesView.$el);
        var node1 = nodes.oscillatorNode(context, null, null);
        var node2 = nodes.gainNode(context, null);
        var node3 = nodes.destinationNode(context);
        var conn1 = connections.createConnection(node1, node2);
        var conn2 = connections.createConnection(node2, node3);
        var conn3 = connections.createConnection(node1, node2.gain);
    });
})(nodio || (nodio = {}));
//@ sourceMappingURL=app.js.map
