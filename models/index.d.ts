export interface ServerToClientEvents {
    room_host_success: (id: string) => void,
    room_join_error: ({error: string}) => void,
    room_join_success: () => void,
    on_player_join: (playerNames: string[]) => void,
}

export interface ClientToServerEvents {
    host_room: () => void,
}
  
export interface InterServerEvents {
}

// differentiates between different clients
export enum ClientRole {
    None,
    Host,
    Player,
    Audience,
}

// stores information about socket
export interface SocketData {
    roomId: string;
    role: ClientRole;
    username: string;
}