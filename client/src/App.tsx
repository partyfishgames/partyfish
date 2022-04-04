import { useEffect } from "react";
import "./App.css";
import socketService from "./services/socketService";
import { HomePage } from "./components/Home";
import { PlayerPage } from "./components/Trivalry/PlayerPage/index";
import { useAppSelector } from "./hooks";
import { GamePage } from "./components/Home/game";

const selectPlayer = (state: { player: any }) => state.player;

function App() {

  const player = useAppSelector(selectPlayer);

  const connectSocket = async () => {

    // Grab the host address from the environment
    const host_address = process.env.REACT_APP_PARTYFISH_SERVER as string;

    console.log(host_address);

    socketService.connect(host_address).catch((err) => {
      alert("Could not connect: " + err);
    });
  }
  
  useEffect(() => {
    connectSocket()
  }, []);

  return (
    <div className="app">
      {player.username === '' ? <HomePage /> : 
      player.username === "Host" ? <GamePage /> : <PlayerPage />}
    </div>
  );
}

export default App;