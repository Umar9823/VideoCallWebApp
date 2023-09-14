const express = require("express");
const app = express();
const httpServer = require("http").createServer(app); // Use createServer to initialize the HTTP server
const { v4: uuidv4 } = require("uuid");
const { ExpressPeerServer } = require("peer");
const opinions = {
  debug: true,
};

const serverPort = process.env.PORT || 3030;

app.set("view engine", "ejs");

// Initialize ExpressPeerServer with the httpServer
const peerServer = ExpressPeerServer(httpServer, opinions);

app.use("/peerjs", peerServer);

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

const io = require("socket.io")(httpServer, {
  cors: {
    origin: '*'
  }
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId, userName) => {
    socket.join(roomId);
    setTimeout(() => {
      socket.to(roomId).broadcast.emit("user-connected", userId);
    }, 1000);
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message, userName);
    });
  });
});

httpServer.listen(serverPort, () => {
  console.log(`Server is running on port ${serverPort}`);
});
