const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const { TOTAL_IMAGES } = require("./public/sharedConstants");

app.use(express.static("public"));

let imageIndex = 0;
let totalIterations = 0;
let secondsElapsed = 0;
let secondInterval;

const incrementImageIndex = () => {
  imageIndex = (imageIndex + 1) % TOTAL_IMAGES;
  totalIterations += 1;
};

const startSecondTimer = (secondsPerImage) => {
  stopSecondTimer();
  io.emit("score.change", { imageIndex, totalIterations, secondsPerImage });
  incrementImageIndex();
  secondInterval = setInterval(() => {
    secondsElapsed++;
    io.emit("score.tick", { secondsElapsed });
    console.log("secondsElapsed", secondsElapsed);

    if (secondsElapsed % secondsPerImage === 0) {
      console.log(
        `${secondsPerImage}s passed, sending score.change for image ${imageIndex} to all clients`
      );
      incrementImageIndex();
      secondsElapsed = 0;
      io.emit("score.change", { imageIndex, totalIterations, secondsPerImage });
    }
  }, 1000);
};

const stopSecondTimer = () => {
  secondsElapsed = 0;
  totalIterations = 0;
  imageIndex = 0;
  clearInterval(secondInterval);
};

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("score.start", ({ secondsPerImage }) => {
    console.log(
      `received score.start for ${secondsPerImage}s, starting timer and sending initial score.change for image ${imageIndex}`
    );
    startSecondTimer(secondsPerImage);
  });

  socket.on("score.stop", (msg) => {
    console.log("received score.stop, stopping timer");
    stopSecondTimer();
    io.emit("score.stop");
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
