import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { onConnection, reunions } from "./Websocket/handlerConnection.js";

const normalizePort = (val) => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};
const port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

const errorHandler = (error) => {
  if (error.syscall !== "listen") {
    throw error;
  }
  const address = server.address();
  const bind =
    typeof address === "string" ? "pipe " + address : "port: " + port;
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges.");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use.");
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const server = http.createServer(app);

server.on("error", errorHandler);
server.on("listening", () => {
  const address = server.address();
  const bind = typeof address === "string" ? "pipe " + address : "port " + port;
  console.log("Listening on " + bind);
});

server.listen(port);

const io = new Server(server, {
  cors: {
    origin: `${process.env.ACCESS_CONTROL_ALLOW_ORIGIN}`,
  },
});

io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error("invalid username"));
  }
  socket.username = username;
  next();
});

io.on("connect", (socket) => {
  onConnection(socket, io);

  io.of("/").adapter.on("leave-room", (room, id) => {
    const roomIndex = reunions.findIndex((reu) => reu.nom === room);

    if (reunions[roomIndex])
      reunions[roomIndex].users = io.sockets.adapter.rooms.get(room).size;

    socket.emit("reunions");
    socket.broadcast.emit("reunions");
  });
});
