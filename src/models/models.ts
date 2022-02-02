export interface ServerToPlayerEvents {
}

export interface ServerToHostEvents {
}

export type ServerToClientEvents = ServerToPlayerEvents & ServerToHostEvents;

export interface PlayerToServerEvents {
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
    room: number;
    role: ClientRole;
}