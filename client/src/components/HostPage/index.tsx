import { Button, Grid } from "@mui/material";
import { useEffect } from "react";
import { useAppSelector } from "../../hooks";
import gameService from "../../services/gameService";
import socketService from "../../services/socketService";
import { useAppDispatch } from "../../hooks";

const selectPlayerList = (state: { playerList: any; }) => state.playerList; // select for player list state 
const selectGameCode = (state: { gameStats: any }) => state.gameStats.gameCode; // select for game stats

export function HostPage() {

    const dispatch = useAppDispatch(); // included in any component that dispatches actions

    // This state variable holds our player list so that whenever
    // we add a new player the page can grab this and change what is displayed
    const playerList = useAppSelector(selectPlayerList); // playerList is subscribed to changes from dispatched actions

    // Grab our game code from the global state
    const gameCode = useAppSelector(selectGameCode);

    // Listen for the player join event from gameService and update our state if one joins
    const handlePlayerJoin = () => {
        if (socketService.socket)
            gameService.onPlayerJoin(socketService.socket, (playerNames) => {
                console.log(playerNames);
                dispatch({type: 'playerList/set', payload: playerNames}); // Dispatch action to change playerList
                dispatch({type: 'gameStats/setNumPlayers', payload: playerNames.length}); // Dispatch action to change playerList
            });
    };

    useEffect(() => {

        // Constantly listen
        handlePlayerJoin();

    });

    return (
        <div style={{ textAlign: "center" }}>
            <h1 style={{ color: "#2196f3" }}>Welcome to PartyFish</h1>

            <Grid container
                direction="row"
                style={{ height: '300px' }}
                justifyContent="center"
                alignItems="center"
            >
                <Grid item xs={5}>
                    <h4>Room Code</h4>
                    <h1>{gameCode}</h1>
                    <h4 style={{ paddingLeft: "15px", paddingRight: "15px" }}>Go to partyfish.io and enter code to join!</h4>
                    <Button variant={playerList.length > 3 ? "contained" : "outlined"} disabled={playerList.length > 3 ? false : true}> 
                        Start Game
                    </Button>
                </Grid>
                <Grid item xs={5}>
                    <h2>Players</h2>
                    {playerList.map((player: string) =>
                        <h4 key={player}>{player}</h4>
                    )}
                </Grid>
            </Grid>
        </div>
    );
}