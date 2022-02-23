export interface ServerToClientEvents {

    // Room Logic
    room_host_success: (id: string) => void,
    room_join_error: ({error: string}) => void,
    room_join_success: () => void,
    on_player_join: (playerNames: string[]) => void,

    // Round logic
    send_question: (question: string[]) => void,
    start_game_error: ({error: string}) => void,
    update_answer: (id: string, answerId: number) => void,
    send_result: (isCorrect: boolean) => void,
}

export interface ClientToServerEvents {

    // Room Logic
    host_room: () => void,

    // Round Logic
    start_round: () => void,
    send_answer: (answer_id: string) => void,
    correct_ids: (playerNames: string[]) => void
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