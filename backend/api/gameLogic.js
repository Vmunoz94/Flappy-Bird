const WebSocket = require('ws');
const uuidv1 = require('uuid/v1');

const wss = new WebSocket.Server({port: 4000});

// create game settings
const gameSettings = {
  gameWidth: 1000,
  gameHeight: 500,
  gravity: .75,
  birdRadius: 20,
}

// create birds
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

// store all players
let allBirds = []

// ws connection
wss.on('connection', (ws) => {
  // when player connects, give specific ID
  console.log('someone has connected');
  let uniqueID = uuidv1();
  let connected = {
    type: 'connect',
    action: {
      id: uniqueID,
    }
  }
  ws.send(JSON.stringify(connected));

  // recieve message
  ws.on('message', (message) => {
    message = JSON.parse(message)
    
    switch (message.type){
      case 'start': {
        let id = message.action;
        allBirds.push(new Bird(gameSettings, id));
        break;
      }
      case 'flap': {
        let id = message.action
        
        allBirds.forEach((bird) => {
          if (bird.id === id){
            bird.velocity = -10;
          };
        })
      }
    };

    wss.broadcast(JSON.stringify(message));
  });

  ws.on('close', () => {
    console.log('client has closed');
  });

  ws.on('error', (e) => {
    console.log('client has thrown an error', e);
  });
});

// game loop interval
gameLoop = setInterval(() => {
  allBirds.forEach((bird) => {
    // update positions
    bird.yPosition += bird.velocity;
    bird.velocity += gameSettings.gravity;

    // check collision
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