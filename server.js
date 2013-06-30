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

var dburl = process.env.CLEARDB_DATABASE_URL;
var debug = dburl ? false : true;

var pool  = debug ? mysql.createPool({
  host     : 'localhost',
  database : 'nodio',
  user     : 'root'
}) : mysql.createPool(dburl);

var withConnection = function(f){
    pool.getConnection(function(err, connection) {
        if(err) throw err;
        f(connection);
        connection.end();
    });
};

var getChildNodes = function(nodeId, callback){
    withConnection(function(connection){
        var sql =
        ' SELECT'+
        '   n.id'+
        '   ,n.name'+
        '   ,n.author'+
        '   ,n.create_date as createDate'+
        '   ,n.prc_date as prcDate'+
        '   ,n.max_in as maxIn'+
        '   ,n.max_out as maxOut'+
        '   ,nr.id as relationId'+
        '   ,cnp.id as params$id'+
        '   ,cnp.param_name as params$ParamName'+
        '   ,cnp.value as params$value'+
        '   ,cnp.public_name as params$publicName'+
        '   ,cnp.public_max_in as params$publicMaxIn'+
        ' FROM'+
        '   node_relations nr LEFT JOIN child_node_params cnp ON cnp.node_relation_id = nr.id'+
        '   ,nodes n'+
        ' '+
        ' WHERE'+
        '   nr.parent_id = ?'+
        '   and nr.child_id = n.id'+
        ' ORDER BY'+
        '   n.id';
        connection.query(sql, [nodeId], function(err, children, fields) {
            if (err) callback(err);
            
            callback(null, rows2obj.group(children));
        });
    });
}
var getNodeView = function(nodeRelId, callback){
    withConnection(function(connection){
        console.log(nodeRelId);
        var sql =
        ' SELECT'+
        '   nv.id'+
        '   ,nv.offset_x as offsetX'+
        '   ,nv.offset_y as offsetY'+
        ' FROM'+
        '   node_views nv'+
        ' WHERE'+
        '   nv.node_rel_id = ?';
        connection.query(sql, [nodeRelId], function(err, views, fields) {
            if (err) callback(err);
            callback(null, views && views.length > 0 ? views[0] : null);
        });
    });
};
var getNodeConnections = function(nodeId, callback){
    withConnection(function(connection){
        var sql =
         ' SELECT'+
         '   c.id'+
         '   ,c.source_node_rel_id as sourceNodeId'+
         '   ,cnp.node_relation_id  as targetNodeId'+
         '   ,cnp.param_name as targetParamName'+
         ' FROM'+
         '   node_relations nr'+
         '   ,connections c'+
         '   ,child_node_params cnp'+
         ' WHERE'+
         '   nr.parent_id = ?'+
         '   and c.source_node_rel_id = nr.id'+
         '   and cnp.id = c.target_child_param_id';
        connection.query(sql, [nodeId], function(err, connections, fields) {
            if (err) callback(err);
            callback(null, connections);
        });
    });
}

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
    if(debug){
        app.use(express.static(path.join(__dirname, '.')));//for source map
    }
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
            ]
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
app.get('/children/:nodeId', function (req, res) {
    var nodeId = req.params.nodeId;
    
    getChildNodes(nodeId, function(err, children){
        if(err){
            throw err;
        }
        res.contentType('application/json');
        console.log(children);
        res.send(children);
    });
});
/*
app.get('/:synth/connections', function (req, res) {
    var synth = db.synth[req.params.synth];
    var connections = synth ? (synth.connections || []) : [];//TODO このへんてきとう
    res.contentType('application/json');
    res.send(connections);
});
*/
app.get('/connections/:nodeId', function (req, res) {
    var nodeId = req.params.nodeId;
    getNodeConnections(nodeId, function(err, connections){
        if(err){
            throw err;
        }
        res.contentType('application/json');
        console.log(connections);
        res.send(connections);
    });
});

app.get('/nodeviews/:nodeRelId', function (req, res) {
    var nodeRelId = req.params.nodeRelId;

    getNodeView(nodeRelId, function(err, view){
        view.left = view.offsetX;
        view.top = view.offsetY;
        res.contentType('application/json');
        res.send(view);
    });
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
