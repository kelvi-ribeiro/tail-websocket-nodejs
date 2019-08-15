const express = require('express');
const app = express();
const port = process.env.npm_package_config_port || 8090;
const http = require('http')
const server = http.createServer(app);
const io = require('socket.io').listen(server);
const Tail = require('tail').Tail;
//const options = {separator: /[\r]{0,1}\n/, fsWatchOptions: {}, follow: true, logger: console,flushAtEOF:true}
const tail = new Tail('C:\\Users\\kelvi.ribeiro\\git\\processoSeletivo\\logs\\production_profile_app.log');
const files = []

app.use(express.static('public'));
app.use(express.static('files'));

app.use('/static', express.static('public'));

app.get('/', function (req, res) {
    res.send('Hello World!');
});
app.get('/socket.io/socket.io.js', function (req, res) {
    res.sendFile(__dirname + '/node_modules/socket.io-client/dist/socket.io.js');
});
// open a route for each file from the command line
app.get('/files/0', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

tail.on("line", function (data) {
    var nsName = '/files/0',
        ns = io.of(nsName)
            .on('connection', function (socket) {                
                socket.setMaxListeners(15)
                socket.emit('files', files);
            });

    ns.emit('message', data);    
});




server.listen(port);