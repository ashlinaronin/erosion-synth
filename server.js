const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static("public"));

let scoreChangeInterval;

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("score.start", ({ seconds }) => {
    console.log(
      `received score.start, starting timer for every ${seconds}s and sending initial score.change`
    );
    io.emit("score.change");
    scoreChangeInterval = setInterval(() => {
      console.log(`${seconds}s passed, sending score.change to all clients`);
      io.emit("score.change");
    }, seconds * 1000);
  });

  socket.on("score.stop", (msg) => {
    console.log("received score.stop, stopping timer");
    clearInterval(scoreChangeInterval);
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
