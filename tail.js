const express = require('express');
const app = express();
const port = process.env.npm_package_config_port || 8090;
const http = require('http')
const server = http.createServer(app);
const io = require('socket.io').listen(server);
const Tail = require('tail').Tail;
var ip = require('ip');
const files = [
                  {codigo:'controle-acesso', name:'Controle de Acesso', path:'./testFiles/file_1.txt'}
                , {codigo:'financeiro', name:'Financeiro', path:'./testFiles/file_2.txt'}
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
    if(files.find(file => file.codigo === req.params.codigoFile)){
        return res.sendFile(__dirname + '/public/index.html');
    } else {
        return res.status(404).send('Arquivo não encontrado')
    } 

});

files.forEach(file => {
    var nsName = '/files/' + file.codigo,
    ns = io.of(nsName)
    .on('connection', function (socket) {                
        socket.setMaxListeners(15)
        socket.emit('files', files);
    });        
    console.log(`Listening on http://${ip.address()}:${port}/${file.codigo}`);

    tails.forEach(tail => {      
        tail.on("line", function (data) {                       
            ns.emit(file.codigo, data);            
        });
    });
});

server.listen(port);