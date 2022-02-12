export interface ServerToPlayerEvents {
}

export interface ServerToHostEvents {
}

export type ServerToClientEvents = ServerToPlayerEvents & ServerToHostEvents;

export interface PlayerToServerEvents {
    "join_game": (username: string, room: string) => void,
}

export interface HostToServerEvents {
}

export type ClientToServerEvents = PlayerToServerEvents & HostToServerEvents;
  
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
    role: ClientRole;
    username: string;
    room: string;
}