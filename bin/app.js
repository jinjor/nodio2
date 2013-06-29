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
        function Param(id, description, min, max, step, value, onChange) {
                _super.call(this);
            this.id = id;
            this.description = description;
            this.min = min;
            this.max = max;
            this.step = step;
            this.on('change:value', function (_, value) {
                onChange(value);
            });
            this.set('value', value);
        }
        Param.prototype.getUniqueKey = function () {
            return 'param' + _super.prototype.id;
        };
        return Param;
    })(Backbone.Model);
    models.Param = Param;    
    var TargetParam = (function (_super) {
        __extends(TargetParam, _super);
        function TargetParam(id, description, min, max, step, value) {
                _super.call(this, id, description, min, max, step, value.value, function (_value) {
        value.value = _value;
    });
            this.value = value;
        }
        return TargetParam;
    })(Param);
    models.TargetParam = TargetParam;    
    var Node = (function (_super) {
        __extends(Node, _super);
        function Node(id, audioNode, description, isSource, isTarget) {
                _super.call(this);
            this.id = id;
            this.audioNode = audioNode;
            this.description = description;
            this.isSource = isSource;
            this.isTarget = isTarget;
            this.url = 'child/' + this.id;
            this.targets = {
            };
            this.value = audioNode;
        }
        Node.prototype.getUniqueKey = function () {
            return 'node' + this.id;
        };
        Node.prototype.connect = function (to) {
            try  {
                this.audioNode.connect(to.value);
                this.targets[to.getUniqueKey()] = to;
            } catch (e) {
                console.log(e);
            }
        };
        Node.prototype.disconnect = function (to) {
            this.audioNode.disconnect(to.value);
            delete this.targets[to.getUniqueKey()];
            for(var key in this.targets) {
                if(this.targets.hasOwnProperty(key)) {
                    this.connect(this.targets[key]);
                }
            }
        };
        Node.prototype.getParam = function (name) {
            if(name == 'in') {
                return this;
            }
            return null;
        };
        Node.prototype.remove = function () {
            this.set('disposed', true);
            this.trigger('dispose');
        };
        return Node;
    })(Backbone.Model);
    models.Node = Node;    
    var GainNode = (function (_super) {
        __extends(GainNode, _super);
        function GainNode(relId, node) {
                _super.call(this, relId, node, 'Gain', true, true);
            this.gain = new TargetParam(0, 'Gain', 0, 1, 0.01, node.gain);
            this.set('nodeType', 'gain');
            this.set('gain', this.gain);
            this.params = [
                this.gain
            ];
        }
        return GainNode;
    })(Node);
    models.GainNode = GainNode;    
    var DelayNode = (function (_super) {
        __extends(DelayNode, _super);
        function DelayNode(relId, node) {
                _super.call(this, relId, node, 'Delay', true, true);
            this.delayTime = new TargetParam(0, 'DelayTime', 0.0, 0.5, 0.01, node.delayTime);
            this.set('nodeType', 'delay');
            this.set('delayTime', this.delayTime);
            this.params = [
                this.delayTime
            ];
        }
        return DelayNode;
    })(Node);
    models.DelayNode = DelayNode;    
    var OscillatorNode = (function (_super) {
        __extends(OscillatorNode, _super);
        function OscillatorNode(relId, node) {
                _super.call(this, relId, node, 'Oscillator', true, false);
            this.type = new Param(0, 'Type', 0, 3, 1, 0, function (value) {
                node.type = parseInt(value);
            });
            this.freq = new TargetParam(0, 'Freq', 60.0, 2000.0, 0.1, node.frequency);
            this.set('nodeType', 'oscillator');
            this.set('type', this.type);
            this.set('freq', this.freq);
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
        function AnalyserNode(relId, node) {
                _super.call(this, relId, node, 'Analyser', true, true);
            this.node = node;
            this.mode = new Param(0, 'Mode', 0, 1, 1, node.mode, function (value) {
                node.mode = value;
            });
            this.set('nodeType', 'analyser');
            this.params = [
                this.mode
            ];
        }
        return AnalyserNode;
    })(Node);
    models.AnalyserNode = AnalyserNode;    
    var ADSRNode = (function (_super) {
        __extends(ADSRNode, _super);
        function ADSRNode(relId, context, node) {
                _super.call(this, relId, node, 'ADSR', true, true);
            var a = 5;
            var d = 3;
            var s = 0.5;
            var r = 10;
            this.attack = new Param(0, 'Attack', 0, 200, 0.1, a, function (_a) {
                a = _a;
            });
            this.decay = new Param(0, 'Decay', 0, 200, 0.1, d, function (_d) {
                d = _d;
            });
            this.sustain = new Param(0, 'Sustain', 0, 1, 0.01, s, function (_s) {
                s = _s;
            });
            this.release = new Param(0, 'Release', 0, 200, 0.1, r, function (_r) {
                r = _r;
            });
            this.set('nodeType', 'adsr');
            this.set('attack', this.attack);
            this.set('decay', this.decay);
            this.set('sustain', this.sustain);
            this.set('release', this.release);
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
        function DestinationNode(relId, node) {
                _super.call(this, relId, node, 'Destination', false, true);
            this.params = [];
        }
        return DestinationNode;
    })(Node);
    models.DestinationNode = DestinationNode;    
    var Connection = (function (_super) {
        __extends(Connection, _super);
        function Connection(id, source, target) {
                _super.call(this);
            this.id = id;
            this.source = source;
            this.target = target;
            this.url = '/connection/' + this.id;
            this.listenTo(source, 'dispose', this.remove);
            this.listenTo(target, 'dispose', this.remove);
            source.connect(target);
        }
        Connection.prototype.remove = function () {
            this.stopListening(this.target);
            this.stopListening(this.source);
            this.source.disconnect(this.target);
            this.set('disposed', true);
            this.trigger('dispose');
        };
        return Connection;
    })(Backbone.Model);
    models.Connection = Connection;    
    var Nodes = (function (_super) {
        __extends(Nodes, _super);
        function Nodes(nodeId) {
                _super.call(this);
            this.nodeId = nodeId;
            this.url = '/children/' + nodeId;
            this.on('add', function (node) {
            });
        }
        Nodes.prototype.load = function (context) {
            var _this = this;
            var self = this;
            self.fetch({
                success: function (collection, data) {
                    data.forEach(function (d) {
                        console.log(d);
                        if(d.id == 1) {
                            _this.gainNode(context, 0.3, d.relationId);
                        } else if(d.id == 2) {
                            _this.destinationNode(context, d.relationId);
                        } else if(d.id == 3) {
                            _this.oscillatorNode(context, 3, 440, d.relationId);
                        } else if(d.id == 4) {
                            _this.delayNode(context, 0.5, d.relationId);
                        } else if(d.id == 100) {
                            _this.adsrNode(context, d.relationId);
                        } else if(d.id == 101) {
                            _this.analyserNode(context, d.relationId);
                        }
                    });
                    _this.trigger('loaded');
                }
            });
        };
        Nodes.prototype.parse = function (res) {
            return [];
        };
        Nodes.prototype.getSource = function (nodeId) {
            var _this = this;
            return _this.get(nodeId);
        };
        Nodes.prototype.getTarget = function (nodeId, paramName) {
            var _this = this;
            var node = _this.get(nodeId);
            if(!node) {
                console.log('node[' + nodeId + '] not found');
                return null;
            }
            var param = node.getParam(paramName);
            if(!param) {
                console.log('param[' + paramName + '] not found');
                return null;
            }
            return param;
        };
        Nodes.prototype.gainNode = function (context, val, id) {
            var audioNode = context.createGain();
            var node = new GainNode(this.url, audioNode);
            node.gain.set('value', val);
            if(id) {
                node.id = id;
            }
            this.add(node);
            return node;
        };
        Nodes.prototype.oscillatorNode = function (context, type, freq, id) {
            var audioNode = context.createOscillator();
            var node = new OscillatorNode(this.url, audioNode);
            node.type.set('value', type);
            node.freq.set('value', freq);
            if(id) {
                node.id = id;
            }
            this.add(node);
            audioNode.start(0);
            return node;
        };
        Nodes.prototype.analyserNode = function (context, id) {
            var audioNode = context.createAnalyser();
            audioNode.fftSize = 1024;
            var node = new AnalyserNode(this.url, audioNode);
            if(id) {
                node.id = id;
            }
            this.add(node);
            return node;
        };
        Nodes.prototype.delayNode = function (context, val, id) {
            var audioNode = context.createDelay();
            var node = new DelayNode(this.url, audioNode);
            node.delayTime.set('value', val);
            if(id) {
                node.id = id;
            }
            this.add(node);
            return node;
        };
        Nodes.prototype.adsrNode = function (context, id) {
            var bufsize = 1024;
            var gainNode = context.createGain();
            gainNode.gain.value = 0;
            var node = new ADSRNode(this.url, context, gainNode);
            if(id) {
                node.id = id;
            }
            this.add(node);
            return node;
        };
        Nodes.prototype.destinationNode = function (context, id) {
            var audioNode = context.destination;
            var node = new DestinationNode(this.url, audioNode);
            if(id) {
                node.id = id;
            }
            this.add(node);
            return node;
        };
        return Nodes;
    })(Backbone.Collection);
    models.Nodes = Nodes;    
    var Connections = (function (_super) {
        __extends(Connections, _super);
        function Connections(nodeId, nodes, tmp) {
            var _this = this;
                _super.call(this);
            this.nodes = nodes;
            this.listenTo(tmp, 'resolve', function (st) {
                _this.createConnection(st.source, st.target);
            });
            this.url = '/connections/' + nodeId;
            this.listenTo(nodes, 'loaded', function () {
                return _this.load();
            });
        }
        Connections.prototype.load = function () {
            var _this = this;
            var self = this;
            self.fetch({
                success: function (collection, data) {
                    console.log(data);
                    data.forEach(function (c) {
                        _this.createConnection2(c);
                    });
                    _this.trigger('loaded');
                }
            });
        };
        Connections.prototype.parse = function (res) {
            return [];
        };
        Connections.prototype.createConnection = function (source, target) {
            var connection = new Connection(0, source, target);
            this.add(connection);
            return connection;
        };
        Connections.prototype.createConnection2 = function (c) {
            var nodes = this.nodes;
            var source = nodes.getSource(c.sourceNodeId);
            var target = nodes.getTarget(c.targetNodeId, c.targetParamName);
            if(!source) {
                console.log(nodes);
                throw 'source[' + c.sourceNodeId + '] not found';
            }
            if(!target) {
                console.log(nodes);
                throw 'target[' + c.targetNodeId + ', ' + c.targetParamName + '] not found';
            }
            var connection = new Connection(c.id, source, target);
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
                if(source) {
                    source.trigger('cancelSource');
                }
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
            if(!this.source || target == null || !target.isTarget) {
                if(this.target) {
                    this.target.trigger('cancelTarget');
                }
                this.target = null;
                return;
            }
            if(this.source == target) {
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
    var NodeViewModel = (function (_super) {
        __extends(NodeViewModel, _super);
        function NodeViewModel(nodeRelId) {
                _super.call(this);
            this.url = '/nodeviews/' + nodeRelId;
        }
        NodeViewModel.prototype.load = function () {
            var _this = this;
            var self = this;
            self.fetch({
                success: function (model, data) {
                    _this.set('offsetY', data.top);
                    _this.set('offsetX', data.left);
                }
            });
        };
        NodeViewModel.prototype.parse = function (res) {
            return [];
        };
        return NodeViewModel;
    })(Backbone.Model);
    views.NodeViewModel = NodeViewModel;    
    var globalKeyState = false;
    var _views = {
    };
    var NodeView = (function (_super) {
        __extends(NodeView, _super);
        function NodeView(node, tmpConn) {
            var _this = this;
                _super.call(this);
            this.viewModel = new NodeViewModel(node.id);
            this.listenTo(this.viewModel, 'change:offsetX', function (_, x) {
                _this.$el.css({
                    left: x + 'px'
                });
                _this.resetPosition();
            });
            this.listenTo(this.viewModel, 'change:offsetY', function (_, y) {
                _this.$el.css({
                    top: y + 'px'
                });
                _this.resetPosition();
            });
            this.viewModel.load();
            this.listenTo(node, 'dispose', function () {
                _this.viewModel.destroy();
                _this.remove();
            });
            this.paramViews = node.params.map(function (p) {
                var view = new ParamView(p);
                _views[p.getUniqueKey()] = view;
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
            this.listenTo(node, 'setToSource', function () {
                $el.addClass('source');
            });
            this.listenTo(node, 'cancelSource', function () {
                $el.removeClass('source');
            });
            this.listenTo(node, 'setToTarget', function () {
                $el.addClass('target');
            });
            this.listenTo(node, 'cancelTarget', function () {
                $el.removeClass('target');
            });
            this.paramViews.forEach(function (pv) {
                body.append(pv.$el);
            });
            if(node.description == "ADSR") {
                var button = $('<Button/>').text('Note On').on('mousedown', function () {
                    globalKeyState = true;
                    node.set('keyState', 1);
                    return false;
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
            this.viewModel.set('offsetX', offset.left);
            this.viewModel.set('offsetY', offset.top);
            this.trigger('move');
        };
        return NodeView;
    })(Backbone.View);
    views.NodeView = NodeView;    
    var NodesView = (function (_super) {
        __extends(NodesView, _super);
        function NodesView(nodeId, nodes, connections, tmpConn) {
                _super.call(this);
            this.nodeId = nodeId;
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
                delete _views[node.getUniqueKey()];
            });
            _views[node.getUniqueKey()] = view;
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
            this.sourceView = _views[connection.source.getUniqueKey()];
            this.targetView = _views[connection.target.getUniqueKey()];
            console.log(_views);
            console.log(this.sourceView);
            console.log(this.targetView);
            this.listenTo(connection, 'dispose', function () {
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
            }).click(function () {
                connection.remove();
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
    var nodeId = 1000;
    var nodes = new models.Nodes(nodeId);
    var context = new webkitAudioContext();
    var tmpConnection = new models.TemporaryConnection();
    var connections = new models.Connections(nodeId, nodes, tmpConnection);
    $(function () {
        var nodesView = new views.NodesView(nodeId, nodes, connections, tmpConnection);
        $('body').append(nodesView.$el);
        nodes.load(context);
    });
})(nodio || (nodio = {}));
//@ sourceMappingURL=app.js.map
