/// <reference path="../d.ts/DefinitelyTyped/webaudioapi/Web-Audio-API.d.ts"/>
/// <reference path="../d.ts/DefinitelyTyped/underscore/underscore.d.ts"/>
/// <reference path="../d.ts/DefinitelyTyped/backbone/backbone.d.ts"/>
/// <reference path="models.ts"/>
/// <reference path="views.ts"/>

module nodio {
    
    declare var $: any;
    
    var root = 'tmp';
    var nodes = new models.Nodes(root);
    var context:AudioContext = new webkitAudioContext();
    var tmpConnection = new models.TemporaryConnection();
    var connections = new models.Connections(root, nodes, tmpConnection);
    
    $(() => {
        console.log(views);
        
        var nodesView = new views.NodesView(root, nodes, connections, tmpConnection);
        $('body').append(nodesView.$el);
        
        /*
        var synthInfo = new models.SynthInfo(
            'synth:0',
            [new NodeInfo('node:0', 'oscillator', [new ParamInfo('param:0', 'type', 0), new ParamInfo('param:1', 'frequency', 440)])
            new NodeInfo('node:1', 'asdr', []),
            new NodeInfo('node:2', 'gain', [new ParamInfo('param:2', 'gain', 0.3)]),
            new NodeInfo('node:3', 'gain', [new ParamInfo('param:3', 'gain', 0.3)]),
            new NodeInfo('node:4', 'delay', [new ParamInfo('param:4', 'delayTime', 100)]),
            new NodeInfo('node:5', 'analyser', [new ParamInfo('param:5', 'type', 0)]),
            new NodeInfo('node:6', 'destination', [new ParamInfo('param:6', 'type', 0)])]
            [new ConnectionInfo('node:0', 'node:1'),
            new ConnectionInfo('node:1', 'node:2'),
            new ConnectionInfo('node:2', 'node:3'),
            new ConnectionInfo('node:4', 'node:3'),
            new ConnectionInfo('node:3', 'node:4'),
            new ConnectionInfo('node:5', 'node:6'),
            new ConnectionInfo('node:2', 'node:5'),
            new ConnectionInfo('node:3', 'node:5')]
        );
        */
        
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
        var conn5 = connections.createConnection(analyser1, dest);
        //var conn5 = connections.createConnection(osc1, gain1.gain);
        var conn6 = connections.createConnection(gain1, analyser1);
        var conn7 = connections.createConnection(gain2, analyser1);
        //conn1.disconnect();
    });

}

