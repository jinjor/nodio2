var http = require("http")
var fs = require("fs")
var path = require("path")
var sys = require("sys");
var express = require("express");
var url = require("url");
var mysql = require("mysql");
var async = require("async");
var rows2obj = require("./rows2obj/rows2obj.js");
var _ = require("underscore");

var pool  = mysql.createPool({
  host     : 'localhost',
  database : 'nodio',
  user     : 'root',
  //password : 'root'
});

pool.getConnection(function(err, connection) {
    if(err) throw err;
    
    var sql =
        ' SELECT'+
        '   n.id'+
        '   ,n.name'+
        '   ,n.author'+
        '   ,n.create_date as createDate'+
        '   ,n.prc_date as prcDate'+
        '   ,n.max_in as maxIn'+
        '   ,n.max_out as maxOut'+
        '   ,cnp.id as params$id'+
        '   ,cnp.param_name as params$ParamName'+
        '   ,cnp.value as params$value'+
        '   ,cnp.public_name as params$publicName'+
        '   ,cnp.public_max_in as params$publicMaxIn'+
        ' FROM'+
        '   node_relations nr'+
        '   ,child_node_params cnp'+
        '   ,nodes n'+
        ' WHERE'+
        '   nr.parent_id = ?'+
        '   and nr.child_id = n.id'+
        '   and cnp.node_relation_id = nr.id'+
        ' ORDER BY'+
        '   n.id';
    
    connection.query(sql, [1000], function(err, children, fields) {
        if (err) throw err;   
        
        children = _.groupBy(children, function(child){
            return {
                id: child.id,
                name: child.name,
                createDate: child.createDate,
                prcDate: child.prcDate,
                maxIn: child.maxIn,
                maxOut: child.maxOut
            };
        });
                       
        console.log(children);
    });
    
    var sql =
        'SELECT'+
        '   *'+
        ' FROM'+
        '   node_relations nr'+
        ' WHERE'+
        '   parent_id = ?';
    
    connection.query(sql, [1000], function(err, nodeRelations, fields) {
        if (err) throw err;
        
        //console.log(nodeRelations);
        
        var nextSql =
            'SELECT'+
            '   *'+
            ' FROM'+
            '   child_node_params cnp'+
            ' WHERE'+
            '   node_relation_id = ?';
        var tasks = nodeRelations.map(function(rel){
            return function(callback){
                return connection.query(nextSql, [rel.id], function(err, records, fields){
                    //console.log(records);
                    rel.params = records;
                    callback();
                });
            };
        });
        
        var sqlNodeView =
            'SELECT'+
            '   *'+
            ' FROM'+
            '   node_views nv'+
            ' WHERE'+
            '   node_rel_id = ?';
        var tasks2 = nodeRelations.map(function(rel){
            return function(callback){
                return connection.query(sqlNodeView, [rel.id], function(err, records, fields){
                    rel.view = records[0];
                    callback();
                });
            };
        });
        
        async.parallel(tasks.concat(tasks2), function (err) {
            if (err) { throw err; }

            console.log(nodeRelations);
        });
        
        
    });
});


var debugMode = process.env.NODE_APP_MODE === 'debug';
var host = process.env.HOST || 'localhost';
var port = process.env.PORT || 3000;
console.log('host: ' + host);
var app = express();
app.configure(function () {
    app.set('port', port);
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({
        secret: 'your secret here'
    }));
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'bin')));
    app.use(express.static(path.join(__dirname, 'lib')));
    app.use(express.errorHandler());
});

var db = {
    synth: {
        tmp: {
            connections:[
            { sourceId: 'node1', targetId: 'node2'},
            { sourceId: 'node2', targetId: 'node3'},
            { sourceId: 'node3', targetId: 'node4'},
            { sourceId: 'node5', targetId: 'node4'},
            { sourceId: 'node4', targetId: 'node5'},
            { sourceId: 'node6', targetId: 'node7'},
            { sourceId: 'node3', targetId: 'node6'},
            { sourceId: 'node4', targetId: 'node6'}
            ],
            nodes:[{
                id: 'node1',
                nodeType: 'oscillatorNode',
                type: 0,
                freq: 440
            },{
                id: 'node2',
                nodeType: 'adsrNode'
            },{
                id: 'node3',
                nodeType: 'gainNode',
                gain: 0.3
            },{
                id: 'node4',
                nodeType: 'gainNode',
                gain: 0.3
            },{
                id: 'node5',
                nodeType: 'delayNode',
                value: 100
            },{
                id: 'node6',
                nodeType: 'analyserNode'
            },{
                id: 'node7',
                nodeType: 'destinationNode'
            }],
            nodeviews:{
                'node1' : {top: 20, left:200},
                'node2' : {top: 100, left:200},
                'node3' : {top: 260, left:200},
                'node4' : {top: 340, left:340},
                'node5' : {top: 420, left:480},
                'node6' : {top: 400, left:100},
                'node7' : {top: 570, left:160},
            }
        }
    }
};


app.get('/', function (req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });
    var rs = fs.createReadStream('index.html');
    sys.pump(rs, res);
});
app.get('/:synth/connections', function (req, res) {
    var synth = db.synth[req.params.synth];
    var connections = synth ? (synth.connections || []) : [];//TODO このへんてきとう
    res.contentType('application/json');
    res.send(connections);
});
app.get('/:synth/nodes', function (req, res) {
    var synth = db.synth[req.params.synth];
    var nodes = synth ? (synth.nodes || []) : [];//TODO このへんてきとう
    res.contentType('application/json');
    console.log(nodes);
    res.send(nodes);
    
    
});
app.get('/:synth/nodeviews/:id', function (req, res) {
    var synth = db.synth[req.params.synth];
    var nodeviews = synth ? (synth.nodeviews || {}) : {};//TODO このへんてきとう
    var nodeview = nodeviews[req.params.id];
    res.contentType('application/json');
    res.send(nodeview);
});
app.put('/:synth/connections/:id', function (req, res) {
    console.log(req.body);
    db.synth[req.params.synth].connections[req.params.id] = req.body;//TODO このへんてきとう
    res.send();
});
app.post('/:synth/connections/:id', function (req, res) {
    console.log(req.body);
    db.synth[req.params.synth].connections[req.params.id] = req.body;//TODO このへんてきとう
    res.send();
});
app.put('/:synth/nodes/:id', function (req, res) {
    console.log(req.body);
    db.synth[req.params.synth].nodes[req.params.id] = req.body;//TODO このへんてきとう
    res.send();
});
app.post('/:synth/nodes/:id', function (req, res) {
    console.log(req.body);
    db.synth[req.params.synth].nodes[req.params.id] = req.body;//TODO このへんてきとう
    res.send();
});
app.put('/:synth/nodeviews/:id', function (req, res) {
    console.log(req.body);
    db.synth[req.params.synth].nodeviews[req.params.id] = req.body;//TODO このへんてきとう
    res.send();
});
app.post('/:synth/nodeviews/:id', function (req, res) {
    console.log(req.body);
    db.synth[req.params.synth].nodeviews[req.params.id] = req.body;//TODO このへんてきとう
    res.send();
});


var server = http.createServer(app);
server.listen(port, function () {
    console.log("Express server listening on port " + port);
});
exports.App = server;
//@ sourceMappingURL=server.js.map
