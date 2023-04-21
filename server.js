const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
var path = require('path');
const {v4: uuidv4} = require('uuid');

let testing = true;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
app.use("/public", express.static(path.join(__dirname, 'public')));


let config = {
  zoom : 1,
  tabetCount : (testing)? 100 : 500,
  worldBorder : {
    startX: (testing)? -1500 : -5000,
    startY: (testing)? -1500 : -5000,
    endX: (testing)? 1500 : 5000,
    endY: (testing)? 1500  : 5000
  },
  dafshe : 10,
  tabetRadius: 16,
  tabeStartRadius: 64
}

let tabet = [];
let players = [];

let tabetStartX = config.worldBorder.startX + config.dafshe;
let tabetEndX = config.worldBorder.endX - config.dafshe;
let tabetStartY = config.worldBorder.startY + config.dafshe;
let tabetEndY = config.worldBorder.endY - config.dafshe;

for(let i = 0; i < config.tabetCount; i++){
  tabet.push(getNewDot());
}

let initData = {
  config: config,
  tabet: tabet,
  players: players
}

io.on('connection', (socket) => {
  
  let player = getNewDot(true, socket.id);


  initData.playerData = player;
  players.push(player);
  socket.emit('init', initData);
  io.emit('player-connected', player);

  socket.on('dot-eaten', (id) => {
    let i = indexOfTabe(id, tabet);
    if(i >= 0){
      tabet[i] = getNewDot(false, null);
      io.emit('update-dot', {
        index: i,
        dot: tabet[i]
      });
    }
  });
  
  socket.on('player-moved', (player) => {
    let index = indexOfTabe(player.id, players);

    if(index >= 0){
      players[index] = player;
      io.emit('other-player-moved', player);
    }
  });

  socket.on('player-dead', (id) => {
    console.log('player dead ' + id);
    let i = indexOfTabe(id, players);
    if(i >= 0){
      players.splice(i, 1);
      io.emit('player-remove', id);
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected ' + socket.id);

    let index = indexOfTabe(socket.id, players);
    if(index >= 0){
      let player = players[index];
      players.splice(index, 1);
      io.emit('player-disconnected', player.id);
    }
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});

function indexOfTabe(id, arr){
  for(let i = 0; i < arr.length; i++){
    if(arr[i].id == id){
      return i;
    }
  }
  return -1;
}

function getNewDot(isPlayer, player_id){
  return {
    id: (isPlayer)? player_id : uuidv4(),
    x: (Math.random() * (tabetEndX - tabetStartX)) + tabetStartX, 
    y: (Math.random() * (tabetEndY - tabetStartY)) + tabetStartY,
    r: (isPlayer)? config.tabeStartRadius : config.tabetRadius,
    c: {
      R: Math.random() * 255,
      G: Math.random() * 255,
      B: Math.random() * 255
    }
  };
}