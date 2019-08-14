const express = require('express');
const app = express();
const port = process.env.npm_package_config_port || 8090;
const http = require('http')
const server = http.createServer(app);
const io = require('socket.io').listen(server);
const Tail = require('tail').Tail;
const tail = new Tail(__dirname + '/public/file.txt');
const files = []

app.use(express.static('public'));
app.use(express.static('files'));

app.use('/static', express.static('public'));

app.get('/', function (req, res) {
    res.send('Hello World!');
});
app.get('/socket.io/socket.io.js', function (req, res) {
    res.sendfile(__dirname + '/node_modules/socket.io-client/dist/socket.io.js');
});
// open a route for each file from the command line
app.get('/files/0', function (req, res) {
    res.sendfile(__dirname + '/public/index.html');
});

tail.on("line", function (data) {
    var nsName = '/files/0',
        ns = io.of(nsName)
            .on('connection', function (socket) {
                socket.emit('files', files);
            });

    ns.emit('message', data);
    console.log(data);
});




server.listen(port);