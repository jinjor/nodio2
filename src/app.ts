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
        
        
        
        var node1 = nodes.gainNode(context, 0.2);
        var node2 = nodes.gainNode(context, 0.3);
        connections.createConnection(node1, node2);
        connections.createConnection(node1, node2.params[0]);
        
    });

}

