var http = require("http")
var fs = require("fs")
var path = require("path")
var sys = require("sys");
var express = require("express");
var url = require("url");
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
            connections:{},
            nodes:{},
            nodeviews:{}
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
    res.send(nodes);
});
app.get('/:synth/nodeviews', function (req, res) {
    var synth = db.synth[req.params.synth];
    var nodes = synth ? (synth.nodeviews || []) : [];//TODO このへんてきとう
    res.contentType('application/json');
    res.send(nodes);
});
app.put('/:synth/connections/:id', function (req, res) {
    console.log(req.body);
    db.synth[req.params.synth].connections[req.params.id] = req.body;//TODO このへんてきとう
});
app.post('/:synth/connections/:id', function (req, res) {
    console.log(req.body);
    db.synth[req.params.synth].connections[req.params.id] = req.body;//TODO このへんてきとう
});
app.put('/:synth/nodes/:id', function (req, res) {
    console.log(req.body);
    db.synth[req.params.synth].nodes[req.params.id] = req.body;//TODO このへんてきとう
});
app.post('/:synth/nodes/:id', function (req, res) {
    console.log(req.body);
    db.synth[req.params.synth].nodes[req.params.id] = req.body;//TODO このへんてきとう
});
app.put('/:synth/nodeviews/:id', function (req, res) {
    console.log(req.body);
    db.synth[req.params.synth].nodeviews[req.params.id] = req.body;//TODO このへんてきとう
});
app.post('/:synth/nodeviews/:id', function (req, res) {
    console.log(req.body);
    db.synth[req.params.synth].nodeviews[req.params.id] = req.body;//TODO このへんてきとう
});


var server = http.createServer(app);
server.listen(port, function () {
    console.log("Express server listening on port " + port);
});
exports.App = server;
//@ sourceMappingURL=server.js.map
