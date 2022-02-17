import { ConnectedSocket, MessageBody, OnMessage, SocketController, SocketIO } from "socket-controllers";
import { Server, Socket } from "socket.io";

/* THIS FILE WAS ONLY USED IN TICTACTORIAL NONE OF THIS LOGIC IS USED IN PARTYFISH RIGHT NOW */

@SocketController()
export class GameController {

    // This function takes in a socket and returns what game room ID it is in
    // This is necessary since every socket is in both 1. a unique room by itself and 2. the room that it has joined
    private getSocketGameRoom(socket: Socket): string {

        // Grab all the rooms the socket is in and filter out its personal unique room
        const socketRooms = Array.from(socket.rooms.values()).filter((r) => r!== socket.id);
        const gameRoom = socketRooms && socketRooms[0];
        
        return gameRoom;
    }

    @OnMessage("update_game")
    public async updateGameStatus(@SocketIO() io: Server, @ConnectedSocket() socket: Socket, @MessageBody() message: any) {
        const gameRoom = this.getSocketGameRoom(socket);

        socket.to(gameRoom).emit("on_game_update", message);
    }

    @OnMessage("game_win")
    public async gameWin(@SocketIO() io: Server, @ConnectedSocket() socket: Socket, @MessageBody() message: any) {
        const gameRoom = this.getSocketGameRoom(socket);
        socket.to(gameRoom).emit("on_game_win", message);
    }
}