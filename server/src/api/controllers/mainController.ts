import { ConnectedSocket, OnConnect, SocketController, SocketIO } from "socket-controllers";
import { Server, Socket } from "socket.io";

/* This file simply alerts the server that a socket has joined and reports its socket id */

@SocketController()
export class MainController {

    @OnConnect()
    public onConnection(@ConnectedSocket() socket: Socket, @SocketIO() _: Server) {
        console.log("New Socket connected: ", socket.id);

        socket.on("custom_event", (data: any) => {
            console.log("Data: ", data);
        })
    }

}