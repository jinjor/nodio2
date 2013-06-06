/// <reference path="../d.ts/DefinitelyTyped/webaudioapi/Web-Audio-API.d.ts"/>
/// <reference path="../d.ts/DefinitelyTyped/underscore/underscore.d.ts"/>
/// <reference path="../d.ts/DefinitelyTyped/backbone/backbone.d.ts"/>
/// <reference path="models.ts"/>
/// <reference path="views.ts"/>

module nodio {
    
    declare var $: any;
    
    var context:AudioContext = new webkitAudioContext();
    
    $(() => {
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
        
        conn1.disconnect();
    });

}

