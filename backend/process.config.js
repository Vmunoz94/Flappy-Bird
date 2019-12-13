module.exports = {
  apps: [{
      name: 'gateway',
      script: './gateway.js',
      watch: true,
    },
    {
      name: 'gameLogic',
      script: './api/gameLogic.js',
      watch: true,
    },
  ],
};