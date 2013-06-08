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
        if(Math.abs(dx) > Math.abs(dy)) {
            var x2 = x1 + dx / 2;
            var x3 = x1 + dx / 2;
            var y2 = y1;
            var y3 = y4;
        } else {
            var x2 = x1;
            var x3 = x4;
            var y2 = y1 + dy / 2;
            var y3 = y1 + dy / 2;
        }
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
        function Param(description, min, max, step, value, onChange) {
                _super.call(this);
            this.description = description;
            this.min = min;
            this.max = max;
            this.step = step;
            this.id = Param.createParamId();
            this.on('change:value', function (_, value) {
                onChange(value);
            });
            this.set('value', value);
        }
        Param.createParamId = function createParamId() {
            return 'param' + _id++;
        };
        return Param;
    })(Backbone.Model);
    models.Param = Param;    
    var TargetParam = (function (_super) {
        __extends(TargetParam, _super);
        function TargetParam(description, min, max, step, value) {
                _super.call(this, description, min, max, step, value.value, function (_value) {
        value.value = _value;
    });
            this.value = value;
        }
        return TargetParam;
    })(Param);
    models.TargetParam = TargetParam;    
    var Node = (function (_super) {
        __extends(Node, _super);
        function Node(audioNode, description, isSource, isTarget) {
                _super.call(this);
            this.audioNode = audioNode;
            this.description = description;
            this.isSource = isSource;
            this.isTarget = isTarget;
            this.url = 'node';
            this.id = Node.createParamId();
            this.targets = {
            };
            this.value = audioNode;
        }
        Node.createParamId = function createParamId() {
            return 'node' + _id++;
        };
        Node.prototype.connect = function (to) {
            try  {
                this.audioNode.connect(to.value);
                this.targets[to.id] = to;
            } catch (e) {
                console.log(e);
            }
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
        Node.prototype.remove = function () {
            this.destroy();
        };
        return Node;
    })(Backbone.Model);
    models.Node = Node;    
    var GainNode = (function (_super) {
        __extends(GainNode, _super);
        function GainNode(node) {
                _super.call(this, node, 'Gain', true, true);
            this.gain = new TargetParam('Gain', 0, 1, 0.01, node.gain);
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
                _super.call(this, node, 'Delay', true, true);
            this.delayTime = new TargetParam('DelayTime', 0.0, 0.5, 0.01, node.delayTime);
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
                _super.call(this, node, 'Oscillator', true, false);
            this.type = new Param('Type', 0, 3, 1, 0, function (value) {
                console.log(value);
                node.type = parseInt(value);
            });
            this.freq = new TargetParam('Freq', 60.0, 2000.0, 0.1, node.frequency);
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
                _super.call(this, node, 'Analyser', true, true);
            this.node = node;
            this.mode = new Param('Mode', 0, 1, 1, node.mode, function (value) {
                node.mode = value;
            });
            this.params = [
                this.mode
            ];
        }
        return AnalyserNode;
    })(Node);
    models.AnalyserNode = AnalyserNode;    
    var ADSRNode = (function (_super) {
        __extends(ADSRNode, _super);
        function ADSRNode(context, node) {
                _super.call(this, node, 'ADSR', true, true);
            var a = 5;
            var d = 3;
            var s = 0.5;
            var r = 10;
            this.attack = new Param('Attack', 0, 200, 0.1, a, function (_a) {
                a = _a;
            });
            this.decay = new Param('Decay', 0, 200, 0.1, d, function (_d) {
                d = _d;
            });
            this.sustain = new Param('Sustain', 0, 1, 0.01, s, function (_s) {
                s = _s;
            });
            this.release = new Param('Release', 0, 200, 0.1, r, function (_r) {
                r = _r;
            });
            this.params = [
                this.attack, 
                this.decay, 
                this.sustain, 
                this.release
            ];
            this.set('keyState', 0);
            this.on('change:keyState', function (_, keyState) {
                if(keyState == 1) {
                    var t0 = context.currentTime;
                    var t1 = t0 + a / 1000;
                    node.gain.setValueAtTime(0, t0);
                    node.gain.linearRampToValueAtTime(1, t1);
                    node.gain.setTargetAtTime(s, t1, d / 1000);
                } else {
                    var t0 = context.currentTime;
                    node.gain.cancelScheduledValues(t0);
                    node.gain.setValueAtTime(node.gain.value, t0);
                    node.gain.setTargetAtTime(0, t0, r / 1000);
                }
            });
        }
        return ADSRNode;
    })(Node);
    models.ADSRNode = ADSRNode;    
    var DestinationNode = (function (_super) {
        __extends(DestinationNode, _super);
        function DestinationNode(node) {
                _super.call(this, node, 'Destination', false, true);
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
            this.listenTo(source, 'destroy', this.remove);
            this.listenTo(target, 'destroy', this.remove);
            source.connect(target);
        }
        Connection.prototype.remove = function () {
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
            node.gain.set('value', val);
            this.add(node);
            return node;
        };
        Nodes.prototype.oscillatorNode = function (context, type, freq) {
            var audioNode = context.createOscillator();
            var node = new OscillatorNode(audioNode);
            node.type.set('value', type);
            node.freq.set('value', freq);
            this.add(node);
            audioNode.start(0);
            return node;
        };
        Nodes.prototype.analyserNode = function (context) {
            var audioNode = context.createAnalyser();
            audioNode.fftSize = 1024;
            var node = new AnalyserNode(audioNode);
            this.add(node);
            return node;
        };
        Nodes.prototype.delayNode = function (context, val) {
            var audioNode = context.createDelay();
            var node = new DelayNode(audioNode);
            node.delayTime.set('value', val);
            this.add(node);
            return node;
        };
        Nodes.prototype.adsrNode = function (context) {
            var bufsize = 1024;
            var gainNode = context.createGain();
            gainNode.gain.value = 0;
            var node = new ADSRNode(context, gainNode);
            this.add(node);
            return node;
        };
        Nodes.prototype.destinationNode = function (context) {
            var audioNode = context.destination;
            var node = new DestinationNode(audioNode);
            this.add(node);
            return node;
        };
        return Nodes;
    })(Backbone.Collection);
    models.Nodes = Nodes;    
    var Connections = (function (_super) {
        __extends(Connections, _super);
        function Connections(tmp) {
            var _this = this;
                _super.call(this);
            this.listenTo(tmp, 'resolve', function (st) {
                _this.createConnection(st.source, st.target);
            });
        }
        Connections.prototype.createConnection = function (source, target) {
            var connection = new Connection(source, target);
            this.add(connection);
            return connection;
        };
        return Connections;
    })(Backbone.Collection);
    models.Connections = Connections;    
    var TemporaryConnection = (function (_super) {
        __extends(TemporaryConnection, _super);
        function TemporaryConnection() {
            _super.apply(this, arguments);

            this.source = null;
            this.target = null;
        }
        TemporaryConnection.prototype.setSource = function (source) {
            if(source == null || !source.isSource) {
                if(this.source) {
                    this.source.trigger('cancelSource');
                }
                this.source = null;
                return;
            }
            this.source = source;
            source.trigger('setToSource');
            return;
        };
        TemporaryConnection.prototype.setTarget = function (target) {
            if(!this.source) {
                return;
            }
            if(target == null || !target.isTarget) {
                if(this.target) {
                    this.target.trigger('cancelTarget');
                }
                this.target = null;
                return;
            }
            this.target = target;
            target.trigger('setToTarget');
            return;
        };
        TemporaryConnection.prototype.resolve = function () {
            if(this.source && this.target && this.source != this.target) {
                this.trigger('resolve', {
                    source: this.source,
                    target: this.target
                });
            }
            this.setSource(null);
            this.setTarget(null);
        };
        return TemporaryConnection;
    })(Backbone.Model);
    models.TemporaryConnection = TemporaryConnection;    
})(models || (models = {}));
var views;
(function (views) {
    var createBezierPath = function (x1, y1, x4, y4) {
        var dx = x4 - x1;
        var dy = y4 - y1;
        if(false) {
            var x2 = x1 + dx / 2;
            var x3 = x1 + dx / 2;
            var y2 = y1;
            var y3 = y4;
        } else {
            var x2 = x1;
            var x3 = x4;
            var y2 = y1 + dy / 2;
            var y3 = y1 + dy / 2;
        }
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
            var val = $('<label/>').text(param.get('value'));
            var range = $('<input type="range"/>').attr('min', param.min.toFixed(1)).attr('step', param.step).attr('max', param.max).val(param.get('value')).on('change', function () {
                var v = $(this).val();
                val.text(v);
                param.set('value', parseFloat(v));
            });
            var $el = $('<li class="param"/>').append(label).append(range).append(val);
            this.listenTo(param, 'change value', function (value) {
            });
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
    var globalKeyState = false;
    var _views = {
    };
    var NodeView = (function (_super) {
        __extends(NodeView, _super);
        function NodeView(node, tmpConn) {
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
            var xButton = $('<div class="xButton"/>').on('click', function () {
                node.remove();
            });
            var header = $('<div class="node_header"/>').append(label).append(xButton);
            var body = $('<div class="node_body"/>').mousedown(function () {
                tmpConn.setSource(node);
                tmpConn.setTarget(node);
            }).mouseenter(function () {
                tmpConn.setTarget(node);
            }).mouseleave(function () {
                tmpConn.setTarget(null);
            }).mouseup(function () {
                tmpConn.resolve();
            });
            this.listenTo(tmpConn, 'setToSource', function () {
                body.addClass('source');
            });
            this.listenTo(tmpConn, 'cancelSource', function () {
                body.removeClass('source');
            });
            this.listenTo(tmpConn, 'setToTarget', function () {
                body.addClass('target');
            });
            this.listenTo(tmpConn, 'cancelTarget', function () {
                body.removeClass('target');
            });
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
                },
                handle: header
            }).append(header);
            this.paramViews.forEach(function (pv) {
                body.append(pv.$el);
            });
            if(node.description == "ADSR") {
                var button = $('<Button/>').text('Note On').on('mousedown', function () {
                    globalKeyState = true;
                    node.set('keyState', 1);
                }).on('mouseup', function () {
                    globalKeyState = false;
                    node.set('keyState', 0);
                }).on('mouseenter', function () {
                    if(globalKeyState) {
                        node.set('keyState', 1);
                    }
                }).on('mouseleave', function () {
                    node.set('keyState', 0);
                });
                body.append(button);
            }
            $el.append(body);
            if(node.description == "Analyser") {
                var _node = node;
                var canvas = document.createElement('canvas');
                var sample = 1024;
                var height = 256;
                canvas.width = sample;
                canvas.height = height;
                $el.append($(canvas).addClass('analyser'));
                var ctx = canvas.getContext("2d");
                setInterval(function () {
                    ctx.fillStyle = '#000';
                    ctx.fillRect(0, 0, sample, height);
                    var data = new Uint8Array(sample);
                    if(_node.mode.get('value') == 0) {
                        _node.node.getByteFrequencyData(data);
                    } else {
                        _node.node.getByteTimeDomainData(data);
                    }
                    for(var i = 0; i < sample; ++i) {
                        ctx.fillStyle = '#0f0';
                        ctx.fillRect(i, height - data[i], 1, data[i]);
                    }
                }, 100);
            }
            this.$el = $el;
            this.resetPosition();
            setTimeout(function () {
                _this.resetPosition();
            }, 0);
        }
        NodeView.prototype.resetPosition = function () {
            var offset = this.$el.offset();
            this.inX = offset.left + this.$el.width() / 2;
            this.inY = offset.top;
            this.outX = offset.left + this.$el.width() / 2;
            this.outY = offset.top + this.$el.height();
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
        function NodesView(nodes, connections, tmpConn) {
                _super.call(this);
            this.tmpConn = tmpConn;
            var that = this;
            this.$el = $('<div class="container"/>').css({
                width: '800px',
                height: '600px'
            }).mouseup(function () {
                tmpConn.setSource(null);
                tmpConn.setTarget(null);
            }).disableSelection();
            this.raphael = Raphael(this.$el[0], this.$el.width(), this.$el.height());
            this.listenTo(nodes, 'add', this.addNodeView);
            this.listenTo(connections, 'add', this.addConnectionView);
        }
        NodesView.prototype.addNodeView = function (node) {
            var view = new NodeView(node, this.tmpConn);
            this.listenTo(view, 'remove', function () {
                delete _views[view.id];
            });
            _views[node.id] = view;
            this.$el.prepend(view.$el);
        };
        NodesView.prototype.addConnectionView = function (connection) {
            this.$el.append(new ConnectionView(connection, this.raphael).$el);
        };
        return NodesView;
    })(Backbone.View);
    views.NodesView = NodesView;    
    var ConnectionView = (function (_super) {
        __extends(ConnectionView, _super);
        function ConnectionView(connection, raphael) {
            var _this = this;
                _super.call(this);
            this.sourceView = _views[connection.source.id];
            this.targetView = _views[connection.target.id];
            this.listenTo(connection, 'destroy', function () {
                _this.path.remove();
            });
            this.listenTo(this.sourceView, 'move', this.render);
            this.listenTo(this.targetView, 'move', this.render);
            this.path = raphael.path('M0 1L90 0').attr({
                stroke: '#666',
                fill: 'none',
                'stroke-width': 3,
                'stroke-linecap': 'round',
                'arrow-end': 'classic-wide-long'
            });
            this.render();
        }
        ConnectionView.prototype.render = function () {
            var path = createBezierPath(this.sourceView.outX, this.sourceView.outY, this.targetView.inX, this.targetView.inY);
            if(path == 'M,0.000,0.000,C,0.000,0.000,0.000,0.000,0.000,0.000') {
                return;
            }
            this.path.attr('path', path);
        };
        return ConnectionView;
    })(Backbone.View);
    views.ConnectionView = ConnectionView;    
})(views || (views = {}));
var nodio;
(function (nodio) {
    var context = new webkitAudioContext();
    var tmpConnection = new models.TemporaryConnection();
    $(function () {
        var connections = new models.Connections(tmpConnection);
        var nodes = new models.Nodes();
        console.log(views);
        var nodesView = new views.NodesView(nodes, connections, tmpConnection);
        $('body').append(nodesView.$el);
        var osc1 = nodes.oscillatorNode(context, 0, 440);
        var adsr = nodes.adsrNode(context);
        var gain1 = nodes.gainNode(context, 0.3);
        var gain2 = nodes.gainNode(context, 0.3);
        var delay1 = nodes.delayNode(context, 100);
        var analyser1 = nodes.analyserNode(context);
        var dest = nodes.destinationNode(context);
        var conn0 = connections.createConnection(osc1, adsr);
        var conn1 = connections.createConnection(adsr, gain1);
        var conn2 = connections.createConnection(gain1, gain2);
        var conn3 = connections.createConnection(delay1, gain2);
        var conn4 = connections.createConnection(gain2, delay1);
        var conn5 = connections.createConnection(gain1, analyser1);
        var conn6 = connections.createConnection(gain1, dest);
        var conn7 = connections.createConnection(gain2, dest);
    });
})(nodio || (nodio = {}));
//@ sourceMappingURL=app.js.map
