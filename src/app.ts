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
        var nodesView = new views.NodesView(root, nodes, connections, tmpConnection);
        $('body').append(nodesView.$el);
        nodes.load(context);
        
    });

}

