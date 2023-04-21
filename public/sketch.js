let testing = true;
let config = {};
let setupFinished, initedFromServer;
let serverData;
let player_id;
let tabe;
let tabet = [];
let allTabetSorted = [];
let players = [];
let gameIsOver = false;

function setup() {
  createCanvas(1500, 900);
  setupFinished = true;

  if(initedFromServer){
    initServer(serverData);
  }
}

function initServer(data){
  if(setupFinished){
    console.log('game setup before init server');
    console.log(data);
    config = data.config;
    for(var i = 0; i < data.tabet.length; i++){
      tabet.push(new Tabe(data.tabet[i].x, data.tabet[i].y, config.tabetRadius, data.tabet[i].id, data.tabet[i].c));
    }
    for(var i = 0; i < data.players.length; i++){
      players.push(new Tabe(data.players[i].x, data.players[i].y, data.players[i].r, data.players[i].id, data.players[i].c));
      console.log('players');
      console.log(players);
    }
    player_id = socket.id;
    tabe = new Tabe(data.playerData.x, data.playerData.y, data.playerData.r, player_id, data.playerData.c);
    console.log(player_id);
  }else{
    serverData = data;
    initedFromServer = true;
    console.log('inited server before game setup');
  }
}

function updateDot(data){
  tabet[data.index] = new Tabe(data.dot.x, data.dot.y, config.tabetRadius, data.dot.id, data.dot.c);
}

function playerMoved(player){
  if(player.id != player_id){
    let i = indexOfPlayer(player.id);
    players[i].actualise(player);
  }
}

function playerDisconnected(id){
  let i = indexOfPlayer(id);
  players.splice(i, 1);
}

function checkPlayersCollision(){
  for(var i = 0; i < players.length; i++){
    if(player_id != players[i].id){
      let otherPlayer = players[i];

      if(tabe.r > otherPlayer.r){
        if(tabe.eats(otherPlayer)){
          socket.emit('player-dead', otherPlayer.id);
        }
      }
    }
  }
}

function playerRemove(id){
  if(id == player_id){
    tabe = null;
    gameIsOver = true;players[i]
  }else{
    let i = indexOfPlayer(id);
    players.splice(i, 1);
  }
}

function playerConnected(player){
  if(player.id != player_id){
    players.push(new Tabe(player.x, player.y, player.r, player.id, player.c));
  }
}

function putAllInOne(){
  allTabetSorted = [];
  if(tabe){
    allTabetSorted.push(tabe);
  }
  allTabetSorted.push(...tabet);
  allTabetSorted.push(...players);

  allTabetSorted.sort((tabeA, tabeB) => {
    if(tabeA.r < tabeB.r){
      return -1;
    }
    if(tabeA.r > tabeB.r){
      return 1;
    }
    return 0;
  });
}

function draw() {
  background(0);

  if(tabe){
    let newZoom = 64 / tabe.r;
    config.zoom = lerp(config.zoom, newZoom, 0.1);
    translate(width / 2, height / 2);
    scale(config.zoom);
    translate(-tabe.pos.x, -tabe.pos.y);
  }


  for(let i = tabet.length - 1; i >= 0; i--){
    
    tabet[i].show();
    if(tabe){
      if(tabe.eats(tabet[i])){
        socket.emit('dot-eaten', tabet[i].id);
      }
    }
  }


  if(tabe){
    tabe.show();
    tabe.update(config.worldBorder);
    checkPlayersCollision();
  }

  for(var i = 0; i < players.length; i++){
    if(players[i].id != player_id){
      players[i].show();
    }
  }

  if(gameIsOver){
    fill(255);
    textAlign(CENTER);
    textSize(width / 4);
    text('GAME OVER', width/2, height/2);
  }
}

function indexOfPlayer(id){
  for(let i = 0; i < players.length; i++){
    if(players[i].id == id){
      return i;
    }
  }
  return -1;
}


//TODO add al tabet in one array and sort by radius then call show on all of them
