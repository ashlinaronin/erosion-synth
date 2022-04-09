const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static("public"));

let scoreChangeInterval;
const totalImages = 8;
let imageIndex = 0;

const incrementImageIndex = () => {
  imageIndex = (imageIndex + 1) % totalImages;
};

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("score.start", ({ seconds }) => {
    incrementImageIndex();

    console.log(
      `received score.start, starting timer for every ${seconds}s and sending initial score.change for image ${imageIndex}`
    );
    io.emit("score.change", { imageIndex });
    scoreChangeInterval = setInterval(() => {
      console.log(
        `${seconds}s passed, sending score.change for image ${imageIndex} to all clients`
      );
      incrementImageIndex();
      io.emit("score.change", { imageIndex });
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
