/// <reference path="../d.ts/DefinitelyTyped/webaudioapi/Web-Audio-API.d.ts"/>
/// <reference path="../d.ts/DefinitelyTyped/underscore/underscore.d.ts"/>
/// <reference path="../d.ts/DefinitelyTyped/backbone/backbone.d.ts"/>
/// <reference path="models.ts"/>
/// <reference path="views.ts"/>

module nodio {
    
    declare var $: any;
    
    var nodeId = 1000;
    var nodes = new models.Nodes(nodeId);
    
    var context:AudioContext = new webkitAudioContext();
    var tmpConnection = new models.TemporaryConnection();
    var connections = new models.Connections(nodeId, nodes, tmpConnection);
    
    $(() => {
        var nodesView = new views.NodesView(nodeId, nodes, connections, tmpConnection);
        $('body').append(nodesView.$el);
        nodes.load(context);
        
    });

}

