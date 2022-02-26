import { useEffect } from "react";
import "./App.css";
import socketService from "./services/socketService";
import { HomePage } from "./components/HomePage";
import { PlayerPage } from "./components/PlayerPage";
import { HostPage } from "./components/HostPage";
import { useAppSelector } from "./hooks";

const selectPlayer = (state: { player: any }) => state.player;

function App() {

  const player = useAppSelector(selectPlayer);

  const connectSocket = async () => {
    socketService.connect("http://localhost:9000").catch((err) => {
      console.log("Error: ", err);
    });
  }
  
  useEffect(() => {
    connectSocket()
  }, []);

  return (
    <div className="app">
      {player.username === '' ? <HomePage /> : 
      player.username === "Host" ? <HostPage /> : <PlayerPage />}
    </div>
  );
}

export default App;