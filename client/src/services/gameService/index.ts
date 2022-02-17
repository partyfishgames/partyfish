import { Socket } from "socket.io-client";
class GameService {

    // This function is called from our homePage to tell the server to host a new room and send us the code
    public async hostRoom(socket: Socket): Promise<string> {
        return new Promise((rs, rj) => {
            socket.emit("host_room");
            socket.on("room_host_success", (message) => rs(message));
            socket.on("room_host_error", ({ error }) => rj(error));
        })
    }

    // This function tells the server to join a room with roomId and our username and returns if it worked or not
    public async joinRoom(socket: Socket, roomId: string, username: string): Promise<boolean> {
        return new Promise((rs, rj) => {
            socket.emit("join_game", { roomId, username });
            socket.on("room_join_success", () => rs(true));
            socket.on("room_join_error", ({ error }) => rj(error));
        })
    }

    // This function allows us to listen for new players joining and sends the list of players in the room if that changes
    public async onPlayerJoin(socket: Socket, listener: (message: any) => void) {
        socket.on("on_player_join", (message) => listener(message));
    }
}

export default new GameService();