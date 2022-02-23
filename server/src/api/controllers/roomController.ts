import { ConnectedSocket, MessageBody, OnMessage, OnDisconnect, SocketController, SocketIO } from "socket-controllers";
import { Server, Socket } from "socket.io";
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "models";
import { generateNewRoomId, getActiveRooms, getSocketsInRoom } from "../utils/roomUtils";

@SocketController()
export class RoomController {

    // Basic logic to set up a new room to host when the client presses the "Host" button on the homepage
    @OnMessage("host_room")
    public async hostRoom(@SocketIO() io: Server, @ConnectedSocket() socket: Socket<ClientToServerEvents,ServerToClientEvents,InterServerEvents,SocketData>) {

        console.log("Host room request from: ", socket.id);

        const new_room_id = generateNewRoomId();

        console.log("New room generated: ", new_room_id);

        await socket.join(new_room_id);
        socket.emit("room_host_success", new_room_id);
    }

    // Basic logic to join a new game that is being hosted when the user presses the "Join" button on the homepage
    @OnMessage("join_game")
    public async joinGame(@SocketIO() io: Server, @ConnectedSocket() socket: Socket<ClientToServerEvents,ServerToClientEvents,InterServerEvents,SocketData>, @MessageBody() message: any) {
        
        console.log("New user {", message.username, "} joining room: ", message.roomId);
        const activeRooms = getActiveRooms(io);

        if (!activeRooms.includes(message.roomId)) {
            // If room doesn't exist, then return error
            socket.emit("room_join_error", {
                error: "Room does not exist, please try another code."
            });
        } else {
            // If room does exist, join the room
            await socket.join(message.roomId);

            // Set username and roomId to socket (player) and emit that it worked
            socket.data.username = message.username;
            socket.data.roomId = message.roomId;
            socket.emit("room_join_success");

            // Get new list of players in the room (including new one) and send to host
            const playerNames = getSocketsInRoom(io, message.roomId);
            socket.to(message.roomId).emit("on_player_join", playerNames)
        }
    }

    // This signal is called when a user closes or refreshes the page. Basically just tell the host they left and update the player list
    @OnDisconnect()
    public onDisconnection(@ConnectedSocket() socket: Socket, @SocketIO() io: Server) {
        console.log("Socket disconnected: ", socket.id);

        // Get all sockets and people in the room
        const playerNames = getSocketsInRoom(io, socket.data.roomId);
        socket.to(socket.data.roomId).emit("on_player_join", playerNames)
    }
}