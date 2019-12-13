const WebSocket = require('ws');
const uuidv1 = require('uuid/v1');

const wss = new WebSocket.Server({port: 4000});

/* 
  GAME SETTINGS
*/
const gameSettings = {
  gameWidth: 1000,
  gameHeight: 500,
  gravity: .75,
  birdRadius: 20,
}

/*
  DECLARATION/STORE ALL PLAYERS
*/
let allBirds = []
class Bird {
  constructor(gameSettings, id){
    this.id = id;
    this.xPosition = 100;
    this.yPosition = 100;
    this.velocity = -10;
    this.radius = gameSettings.birdRadius;
    this.color = 'orange';
    this.alive = true;
  }
}

/*
  START WEBSOCKET CONNECTION
*/
wss.on('connection', (ws) => {
  // when player connects, send player a unique ID
  console.log('someone has connected');
  let uniqueID = uuidv1();
  let connected = {
    type: 'clientConnected',
    action: {
      id: uniqueID,
    }
  }
  ws.send(JSON.stringify(connected));

  // receiving message
  ws.on('message', (message) => {
    message = JSON.parse(message)
    
    switch (message.type){
      // on start game -> add new player
      case 'startGame': {
        let id = message.action;
        allBirds.push(new Bird(gameSettings, id));
        break;
      }
      // on space button press -> flap player's wing
      case 'playerFlap': {
        let id = message.action
        
        allBirds.forEach((bird) => {
          if (bird.id === id){
            bird.velocity = -10;
          };
        })
      }
    };

    // send message to newly connected client
    wss.broadcast(JSON.stringify(message));
  });


  ws.on('close', () => {
    console.log('client has closed');
  });
  ws.on('error', (e) => {
    console.log('client has thrown an error', e);
  });
});

/*
 GAME LOOP 
*/
gameLoop = setInterval(() => {
  allBirds.forEach((bird) => {
    // update all player positions
    bird.yPosition += bird.velocity;
    bird.velocity += gameSettings.gravity;

    // check collision between bottom and top window -> make sure player cannot go past game window
    if (bird.yPosition > gameSettings.gameHeight) {
      bird.yPosition = gameSettings.gameHeight;
      bird.velocity = 0;
    }
    else if (bird.yPosition < 0) {
      bird.yPosition = 0;
      bird.velocity = 0;
    }
  });

  // transmit all player locations
  const players = {
    type: 'players',
    action: {
      players: [...allBirds]
    },
  }
  wss.broadcast(JSON.stringify(players));
}, 20);


// utility broadcast function
wss.broadcast = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};