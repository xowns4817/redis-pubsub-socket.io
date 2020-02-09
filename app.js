// redis -clear
var express = require("express");
var app = express();
var http = require("http");
var server = http.createServer(app);

server.listen(3000, function( ) {
    console.log("Server Connected !!");
});

var io = require('socket.io').listen(server);
var redis = require('redis');
var fs = require('fs');

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

var store = redis.createClient();
var pub = redis.createClient();
var sub = redis.createClient();

sub.subscribe("chatting");

io.sockets.on('connection', function (client) {

  sub.on("message", function (channel, message) {
    console.log("message received on server from publish ");
    client.send(message);
  });

  client.on("message", function (msg) {
    console.log(msg);
    if(msg.type == "chat"){
      pub.publish("chatting",msg.message);
    }

    else if(msg.type == "setUsername"){
      pub.publish("chatting","A new user in connected:" + msg.user);
      store.sadd("onlineUsers",msg.user);
    }
  });

  client.on('disconnect', function () {
    sub.quit();
    pub.publish("chatting","User is disconnected :" + client.id);
  });
});
