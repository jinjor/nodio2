/// <reference path="../d.ts/DefinitelyTyped/webaudioapi/Web-Audio-API.d.ts"/>
/// <reference path="../d.ts/DefinitelyTyped/underscore/underscore.d.ts"/>
/// <reference path="../d.ts/DefinitelyTyped/backbone/backbone.d.ts"/>
/// <reference path="models.ts"/>
/// <reference path="views.ts"/>

module nodio {
    
    declare var $: any;
    
    var context:AudioContext = new webkitAudioContext();
    
    var tmpConnection = new models.TemporaryConnection();
    
    $(() => {
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
        var conn5 = connections.createConnection(analyser1, dest);
        //var conn5 = connections.createConnection(osc1, gain1.gain);
        var conn6 = connections.createConnection(gain1, analyser1);
        var conn7 = connections.createConnection(gain2, analyser1);
        //conn1.disconnect();
    });

}

