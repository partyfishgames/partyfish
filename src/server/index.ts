import { Server } from "socket.io";
import express from "express";
import { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData, ClientRole } from "../models/models";
import path from "node:path";
const PORT = 3000

const app = express();
app.use(express.static(path.join(__dirname, 'scripts')));
app.use(express.static(path.join(__dirname, 'html')));

const server = app.listen(PORT);
const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server);

// execute when new socket connection is established
io.on("connection", (socket) => {
    console.log("player has connected");
    socket.data.role = ClientRole.None;
});

console.log("server started");