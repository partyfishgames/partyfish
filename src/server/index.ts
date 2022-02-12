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

    socket.data.room = "ABCD";
    socket.join("ABCD");
    socket.data.username = "gamergordles";

    socket.on("join_game", (username, room) => {
        socket.data.username = username;
        socket.data.role = ClientRole.Player;
    });

    const rooms = io.of('/').adapter.sids.get(socket.id);
    console.log(rooms);

    const playersInRoom = io.of('/').adapter.rooms.get(socket.data.room as string);
    console.log(Array.from(playersInRoom as Set<string>).map((sid) => io.sockets.sockets.get(sid)?.data.username));
});




console.log("server started");