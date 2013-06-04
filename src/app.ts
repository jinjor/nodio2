/// <reference path="../d.ts/DefinitelyTyped/webaudioapi/Web-Audio-API.d.ts"/>
/// <reference path="../d.ts/DefinitelyTyped/underscore/underscore.d.ts"/>
/// <reference path="../d.ts/DefinitelyTyped/backbone/backbone.d.ts"/>
/// <reference path="models.ts"/>
/// <reference path="views.ts"/>

module nodio {
    
    declare var $: any;
    
    window.onload = function () {
        //var connections = [];
        var connections2 = [];
    
        var context = {
            createGain: function(){
                return {
                    gain: {
                        value: null
                    },
                    connect: function(){
                    },
                    disconnect: function() {
                    }
                };
            }
            
        }
        
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

}

