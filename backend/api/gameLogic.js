const WebSocket = require('ws');
const uuidv1 = require('uuid/v1');
const wss = new WebSocket.Server({port: 4000});


/* 
  GAME SETTINGS
*/
const gameSettings = {
  gameWidth: 2000,
  gameHeight: 650,
  gravity: .75,
  birdRadius: 20,
  flap: -10,
  birdColor: 'orange',
  pipeSpeed: -5,
  pipeColor: 'green',
  pipeWidth: 75,
}

/*
  CLASSES
*/
class Bird {
  constructor(id, flap, radius, color){
    this.id = id;
    this.xPosition = 100;
    this.yPosition = 100;
    this.velocity = flap;
    this.radius = radius;
    this.color = color;
    this.alive = true;
  };
};

class Pipe {
  constructor(width, height, xPosition, yPosition, speed, color) {
    this.width = width;
    this.height = height;
    this.yPosition = yPosition;
    this.xPosition = xPosition;
    this.speed = speed;
    this.color = color;
  };
};

/*
  STORAGE
*/
let allBirds = [];
let allPipes = [];

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
        allBirds.push(new Bird(id, gameSettings.flap, gameSettings.birdRadius, gameSettings.birdColor));
        break;
      }
      // on space button press -> flap player's wing
      case 'playerFlap': {
        let id = message.action
        
        allBirds.forEach((bird) => {
          if (bird.id === id){
            bird.velocity = gameSettings.flap;
          };
        })
        break;
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
  GAME LOGIC
*/
updateAllBirdPositions = (allBirds) => {
  allBirds.forEach((bird) => {
    // update all bird positions
    bird.yPosition += bird.velocity;
    bird.velocity += gameSettings.gravity;

    // check collision between bottom and top window -> make sure player cannot go past game window
    if (bird.yPosition > gameSettings.gameHeight) {
      bird.yPosition = gameSettings.gameHeight;
      bird.velocity = 0;
    } else if (bird.yPosition < 0) {
      bird.yPosition = 0;
      bird.velocity = 0;
    }

    // check collision between player and left pipe pair
    if (allPipes.length > 0){
      if (allPipes[0].xPosition <= bird.xPosition && allPipes[0].xPosition + allPipes[0].width > bird.xPosition){
        // bottom pipe
        if (bird.yPosition + bird.radius > allPipes[0].yPosition) {
          bird.color = 'red';
        // top pipe
        } else if (bird.yPosition - bird.radius < allPipes[1].height) {
          bird.color = 'red';
        }
      }
      else {
        bird.color = 'orange';
      }
    }
  });
};

updateAllPipePositions = (allPipes) => {
  for (let i = 0; i < allPipes.length; i+=2){
    allPipes[i].xPosition += gameSettings.pipeSpeed;
    allPipes[i+1].xPosition += gameSettings.pipeSpeed;
  }

  // check if left pipe pair is out of bounds, if so -> remove them
  if (allPipes.length > 0 && allPipes[0].xPosition <= -gameSettings.pipeWidth) {
    // remove bottom and top pipe
    allPipes.splice(0, 2);
  };
};

// add new pipe every second and a half
const min = Math.ceil(200);
const max = Math.floor(gameSettings.gameHeight - 50);
const pipeGap = 125;
addPipe = setInterval(() => {
  let randomYPosition = (Math.random() * (max - min)) + min;
  // bottom pipe
  let pipeHeight = (gameSettings.gameHeight + gameSettings.birdRadius) - randomYPosition;
  let bottomPipe = new Pipe(gameSettings.pipeWidth, pipeHeight, gameSettings.gameWidth, randomYPosition, gameSettings.pipeSpeed, gameSettings.pipeColor)
  allPipes.push(bottomPipe);

  // top pipe
  let topPipe = new Pipe(gameSettings.pipeWidth, gameSettings.gameHeight - bottomPipe.height - pipeGap, gameSettings.gameWidth, 0, gameSettings.pipeSpeed, gameSettings.pipeColor);
  allPipes.push(topPipe);
}, 1500);

/*
 GAME LOOP 
*/
gameLoop = setInterval(() => {
  updateAllBirdPositions(allBirds);
  updateAllPipePositions(allPipes);
  let updatedGameLogic = {
    type: 'gameLogic',
    action: {
      allBirds,
      allPipes,
    }
  }

  wss.broadcast(JSON.stringify(updatedGameLogic));
}, 20);

// utility broadcast function
wss.broadcast = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};