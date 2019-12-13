const express = require('express');
const server = require('http');
const httpProxy = require('http-proxy');

// proxy setup
const app = express();
const PORT = 5000;
const appServer = server.createServer(app);
const apiProxy = httpProxy.createProxyServer(app);

// proxy error
apiProxy.on("error", (err, req, res) => {
  res.status(500).send("Proxy Down");
});

// frontend proxy
app.all("/*", (req, res) => {
  apiProxy.web(req, res, {
    target: process.env.FRONT_END_HOST || "http://localhost:3000/"
  });
});

// start server
appServer.listen(PORT, () => {
  console.log(`Gateway Listening on port ${PORT}`)
});
