import { Server, Socket } from "socket.io";

export function generateNewRoomId(): string {
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
export function getActiveRooms(io: Server): Array<string> {
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
export function getSocketGameRoom(socket: Socket): string {
    const socketRooms = Array.from(socket.rooms.values()).filter((r) => r!== socket.id);
    const gameRoom = socketRooms && socketRooms[0];
    
    return gameRoom;
}

// This function takes in the server and a roomId and returns all socket usernames that are in it
export function getSocketsInRoom(io: Server, roomId: string): Array<string> {

    // Get socket ids connected to the room
    const playersInRoom = Array.from(io.sockets.adapter.rooms.get(roomId));

    // Get each sockets username from their id
    const usernames = playersInRoom.map((sid) => io.sockets.sockets.get(sid).data.username);

    // Filter out undefined entries (the host)
    const valid_usernames = usernames.filter((name) => name != undefined);

    return valid_usernames;
}