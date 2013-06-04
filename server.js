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
app.get('/', function (req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });
    var rs = fs.createReadStream('index.html');
    sys.pump(rs, res);
});
var server = http.createServer(app);
server.listen(port, function () {
    console.log("Express server listening on port " + port);
});
exports.App = server;
//@ sourceMappingURL=server.js.map
