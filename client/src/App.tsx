import { useEffect, useState } from "react";
import "./App.css";
import socketService from "./services/socketService";
import { HomePage } from "./components/HomePage";
import { PlayerPage } from "./components/PlayerPage";
import { HostPage } from "./components/HostPage";
import GameContext, { IGameContextProps } from "./gameContext";

function App() {
  const [isInRoom, setInRoom] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [pUsername, setPUsername] = useState('');
  const [isReady, setIsReady] = useState(false);

  const connectSocket = async () => {
    socketService.connect("http://localhost:9000").catch((err) => {
      console.log("Error: ", err);
    });
  }

  useEffect(() => {
    connectSocket()
  }, []);

  const gameContextValue: IGameContextProps = {
    isInRoom,
    setInRoom,
    isHost,
    setIsHost,
    roomCode,
    setRoomCode,
    pUsername,
    setPUsername,
    isReady,
    setIsReady
  }

  return (
    <GameContext.Provider value={gameContextValue}>
      {!isInRoom ? <HomePage /> : 
      isHost ? <HostPage /> : <PlayerPage />}
    </GameContext.Provider>
  );
}

export default App;