import { ConnectedSocket, MessageBody, OnMessage, SocketController, SocketIO } from "socket-controllers";
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "models";
import { Server, Socket } from "socket.io";
import { getSocketGameRoom } from "../utils/roomUtils";

import { newQuestion } from "../utils/questionUtil";

@SocketController()
export class GameController {

    // Basic logic to start round and select a new question
    @OnMessage("start_round")
    public async startRound(@SocketIO() io: Server, @ConnectedSocket() socket: Socket<ClientToServerEvents,ServerToClientEvents,InterServerEvents,SocketData>, roundId: number) {

        console.log("Starting round ", roundId, "!");

        // TODO: Error checking 
        // 1. Ensure enough players
        // 2. Ensure not too many players
        // 3. .. etc
        
        /* comment due to unreachable code warning
        if (false) {
            socket.to(socket.id).emit("start_game_error", {error: "Describe the error..."});
        } 
        */

        // Test question for now, this will be replaced by a database access call
        // TODO: Implement database question gathering
        // Current format is [question, ans1, ans2, ans3, correct_answer_index]

        const backupQuestions = [
            ['What nationality is Cristiano Ronaldo?', 'Portugese', 'French', 'Spanish', '1'],
            ['In Minnesota, it is illegal to tease what type of animal?', 'Squirrels', 'Beavers', 'Skunks', '3'],
            ['How long is New Zealand’s Ninety Mile Beach?', '90 miles', '55 miles', '87 miles', '2'],
            ['What fictional character is believed to be real by more than 25% of Americans?', 'James Bond', 'Sherlock Holmes', 'Harry Potter', '2']
        ];
        let random_index = Math.floor(Math.random() * backupQuestions.length);

        let question = await newQuestion();
        if(question.length <= 1) {
            question = backupQuestions[random_index];
        }

        // Get game room to broadcast question to
        const gameRoom = getSocketGameRoom(socket);

        // io.in(gameRoom) instead of socket.to(gameRoom) because we want to make
        // sure the host hears the new question too
        io.in(gameRoom).emit("send_question", question);
    }

    // Basic logic to start round and select a new question
    @OnMessage("send_answer")
    public async receiveAnswer(@SocketIO() io: Server, @ConnectedSocket() socket: Socket<ClientToServerEvents,ServerToClientEvents,InterServerEvents,SocketData>, @MessageBody() answer_id: string) {

        console.log('Received an answer from ', socket.data.username);
        console.log('They selected ', answer_id);

        // Get game room to broadcast question to
        const gameRoom = getSocketGameRoom(socket);

        socket.emit("answer_received");
        socket.to(gameRoom).emit("update_answer", socket.data.username, parseInt(answer_id));
    }

    // This function sends out the result of the round to each player (correct/incorrect)
    @OnMessage("round_over")
    public async roundOver(@SocketIO() io: Server, @ConnectedSocket() socket: Socket, @MessageBody() playerAnswers: any) {
        const roomId = getSocketGameRoom(socket);

        // Get socket ids connected to the room
        const playersInRoom = Array.from(io.sockets.adapter.rooms.get(roomId));

        console.log(playerAnswers);

        // This is probably terrible logic but check if users are correct and send them the appropriate response
        // Loops through players in the room and if their username was correct, send them a correct response

        // TODO: only returns true (that the player is always correct) even if the player is incorrect
        let username : any;

        let incorrectUsers = playersInRoom.map((id) => io.sockets.sockets.get(id).data.username).filter((player) => playerAnswers[player] <= 0);

        // add players who did not answer to the incorrect list
        for (let player of playersInRoom) {
            let username = io.sockets.sockets.get(player).data.username;
            console.log(Object.keys(playerAnswers))
            if (!Object.keys(playerAnswers).some((x: string) => x === username) && username !== undefined) {
                console.log(username + ' did not answer')
                incorrectUsers.push(username);
            }
        } 

        playersInRoom.forEach((player) => {

            username = io.sockets.sockets.get(player).data.username;

            if(Object.keys(playerAnswers).includes(username)) {
                // Answer was received, so send if it was correct or not
                socket.to(player).emit("send_result", playerAnswers[username], incorrectUsers);
            } else {
                // No answer was received from them
                socket.to(player).emit("send_result", 0);
            }
        });
    }

    // This function receives an attack from player and forwards it to the host
    @OnMessage("attack_player")
    public async attackPlayer(@SocketIO() io: Server, @ConnectedSocket() socket: Socket, @MessageBody() message: string[]) {
        const gameRoom = getSocketGameRoom(socket);

        // Get socket ids connected to the room
        const playersInRoom = Array.from(io.sockets.adapter.rooms.get(gameRoom));

        // Send attack to player
        for (let player of playersInRoom) {
            let username = io.sockets.sockets.get(player).data.username;
            if (username === message[1]) {
                socket.to(player).emit("send_attack", message[0]);
            }
        }

        console.log(message[0] + ' attacked ' + message[1]);
        io.in(gameRoom).emit("attack_received", message[0], message[1]);
    }

    @OnMessage("game_over")
    public async gameOver(@SocketIO() io: Server, @ConnectedSocket() socket: Socket) {
        const gameRoom = getSocketGameRoom(socket);
        console.log("Host has signaled the game is over");
        io.in(gameRoom).emit("game_completed");
    }
}