import { ConnectedSocket, MessageBody, OnMessage, OnDisconnect, SocketController, SocketIO } from "socket-controllers";
import { Server, Socket } from "socket.io";
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "models";

@SocketController()
export class RoomController {

    // Simple function to generate a 4 letter room id
    private generateNewRoomId(): string {
        const letters = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
        let new_room_id = "";
        let randint = 0

        for(let i=0; i<4; i++) {
            randint = Math.floor(Math.random() * 25);
            new_room_id = new_room_id + letters[randint]
        }

        return new_room_id;
    }

    // This function returns an array containing the ids of all active rooms that can be joined
    private getActiveRooms(@SocketIO() io: Server): Array<string> {
        // Convert map into 2D list:
        // ==> [['4ziBKG9XFS06NdtVAAAH', Set(1)], ['room1', Set(2)], ...]
        const rooms = Array.from(io.sockets.adapter.rooms);

        // Filter rooms whose name exist in set:
        // ==> [['room1', Set(2)], ['room2', Set(2)]]
        const filtered = rooms.filter(room => !room[1].has(room[0]))

        // Return only the room name: 
        // ==> ['room1', 'room2']
        const room_ids = filtered.map(i => i[0]);

        return room_ids;
    }

    // This function takes in a socket and returns what game room ID it is in
    private getSocketGameRoom(@SocketIO() socket: Socket): string {
        const socketRooms = Array.from(socket.rooms.values()).filter((r) => r!== socket.id);
        const gameRoom = socketRooms && socketRooms[0];
        
        return gameRoom;
    }

    // This function takes in the server and a roomId and returns all socket usernames that are in it
    private getSocketsInRoom(io: Server, roomId: string): Array<string> {

        // Get socket ids connected to the room
        const playersInRoom = Array.from(io.sockets.adapter.rooms.get(roomId));

        // Get each sockets username from their id
        const usernames = playersInRoom.map((sid) => io.sockets.sockets.get(sid).data.username);

        // Filter out undefined entries (the host)
        const valid_usernames = usernames.filter((name) => name != undefined);

        return valid_usernames;
    }

    // Basic logic to set up a new room to host when the client presses the "Host" button on the homepage
    @OnMessage("host_room")
    public async hostRoom(@SocketIO() io: Server, @ConnectedSocket() socket: Socket<ClientToServerEvents,ServerToClientEvents,InterServerEvents,SocketData>) {

        console.log("Host room request from: ", socket.id);

        const new_room_id = this.generateNewRoomId();

        console.log("New room generated: ", new_room_id);

        await socket.join(new_room_id);
        socket.emit("room_host_success", new_room_id);
    }

    // Basic logic to join a new game that is being hosted when the user presses the "Join" button on the homepage
    @OnMessage("join_game")
    public async joinGame(@SocketIO() io: Server, @ConnectedSocket() socket: Socket<ClientToServerEvents,ServerToClientEvents,InterServerEvents,SocketData>, @MessageBody() message: any) {
        
        console.log("New user {", message.username, "} joining room: ", message.roomId);
        const activeRooms = this.getActiveRooms(io);

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
            const playerNames = this.getSocketsInRoom(io, message.roomId);
            socket.to(message.roomId).emit("on_player_join", playerNames)
        }
    }

    // This signal is called when a user closes or refreshes the page. Basically just tell the host they left and update the player list
    @OnDisconnect()
    public onDisconnection(@ConnectedSocket() socket: Socket, @SocketIO() io: Server) {
        console.log("Socket disconnected: ", socket.id);

        // Get all sockets and people in the room
        const playerNames = this.getSocketsInRoom(io, socket.data.roomId);
        socket.to(socket.data.roomId).emit("on_player_join", playerNames)
    }
}