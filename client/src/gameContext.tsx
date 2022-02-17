import React from "react";

export interface IGameContextProps {
    isInRoom: boolean;
    setInRoom: (inRoom: boolean) => void;
    isHost: boolean;
    setIsHost: (isHost: boolean) => void;
    roomCode: string;
    setRoomCode: (rCode: string) => void;
    pUsername: string;
    setPUsername: (pUser: string) => void;
    isReady: boolean;
    setIsReady: (isR: boolean) => void;
};

const defaultState: IGameContextProps = {
    isInRoom: false,
    setInRoom: () => {},
    isHost: false,
    setIsHost: () => {},
    roomCode: '',
    setRoomCode: () => {},
    pUsername: 'player_one',
    setPUsername: () => {},
    isReady: false,
    setIsReady: () => {},
};

export default React.createContext(defaultState);