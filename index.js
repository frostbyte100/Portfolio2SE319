var express = require('express');
var app = express();
var path = require('path');
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var users = {};
var userRooms = {};
var qued = "";
var numGames = 0;

app.use(express.static('public/'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  //console.log('a user connected');
  socket.on('disconnect', function(){
    //console.log('user disconnected');
    if(socket.nickname in users){
        delete users[socket.nickname];
    }
  });
});

io.on('connection', function(socket){
    socket.on('player enter', function(name, callback){
        if(name in users){
            callback(false);
        } else {
            callback(true);
            socket.nickname = name;
            users[socket.nickname] = socket;
        }
    });

    socket.on('get users online', function(numUsers){
        numUsers(Object.keys(users).length);
    });

    socket.on("exit menu", function(){
        delete users[socket.nickname];
    });

    socket.on("leave que", function(){
        if(socket.nickname == qued.nickname){
            qued = 0;
        }
    });

    socket.on("join game", function(){
        if(qued != 0){
            //create room
            socket.join("room" + numGames);
            qued.join("room" + numGames);
            userRooms[socket.nickname] = "room" + numGames;
            userRooms[qued.nickname] = "room" + numGames;
            io.sockets.connected[socket.id].emit("joined room", qued.nickname);
            io.sockets.connected[qued.id].emit("joined room", socket.nickname);
            qued = 0;
            numGames++;
        } else {
            qued = socket;
            io.sockets.connected[socket.id].emit("in que");
        }
    });

    socket.on("chat message", function(msg){
        socket.broadcast.to(userRooms[socket.nickname]).emit("chat message", msg);
    });

    socket.on("update board", function(board){
        socket.broadcast.to(userRooms[socket.nickname]).emit("update board", board);
    });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

/* node install instructions

    npm init
    npm install --save express socket.io
    npm install -g nodemon

*/
