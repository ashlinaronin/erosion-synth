const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static("public"));

let scoreChangeInterval;
const totalImages = 13;
let imageIndex = 0;
let totalIterations = 0;
let secondsElapsed = 0;
let secondInterval;

const incrementImageIndex = () => {
  imageIndex = (imageIndex + 1) % totalImages;
  totalIterations += 1;
};

const startSecondTimer = () => {
  stopSecondTimer();
  secondInterval = setInterval(() => {
    secondsElapsed++;
    io.emit("score.tick", ({ secondsElapsed }));
  }, 1000);
}

const stopSecondTimer = () => {
  secondsElapsed = 0;
  clearInterval(secondInterval);
}

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("score.start", ({ seconds }) => {
    // clear interval in case there is already one going
    totalIterations = 0;
    startSecondTimer();
    clearInterval(scoreChangeInterval);
    incrementImageIndex();

    console.log(
      `received score.start, starting timer for every ${seconds}s and sending initial score.change for image ${imageIndex}`
    );
    io.emit("score.change", { imageIndex, totalIterations, seconds });
    scoreChangeInterval = setInterval(() => {
      console.log(
        `${seconds}s passed, sending score.change for image ${imageIndex} to all clients`
      );
      incrementImageIndex();
      secondsElapsed = 0;
      io.emit("score.change", { imageIndex, totalIterations, seconds });
    }, seconds * 1000);
  });

  socket.on("score.stop", (msg) => {
    console.log("received score.stop, stopping timer");
    clearInterval(scoreChangeInterval);
    totalIterations = 0;
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
