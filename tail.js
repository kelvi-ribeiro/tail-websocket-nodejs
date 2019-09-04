const express = require('express');
const app = express();
const port = process.env.npm_package_config_port || 8090;
const http = require('http')
const server = http.createServer(app);
const io = require('socket.io').listen(server);
const Tail = require('tail').Tail;
const files = [
                  {codigo:'controle-acesso', path:'C:\\Users\\kelvi.ribeiro\\Documents\\documentacao-scripts-sql-anotacoes\\duvidas-do-projeto.txt'}
                , {codigo:'test', path:'C:\\Users\\kelvi.ribeiro\\Documents\\documentacao-scripts-sql-anotacoes\\anotacoes.txt'}
              ]
const tails = files.map(file => new Tail(file.path));
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
app.get('/files/:codigoFile', function (req, res) {    
    res.sendFile(__dirname + '/public/index.html');
});

tails.forEach(tail => {
    tail.on("line", function (data) {        
        files.forEach(file => {
            var nsName = file.codigo,
            ns = io.of(nsName)
                .on('connection', function (socket) {                
                    socket.setMaxListeners(15)
                    socket.emit('files', files);
                });
    
            ns.emit('message', data);            
        });
    });
});

server.listen(port);