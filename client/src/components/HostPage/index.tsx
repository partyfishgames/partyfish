import { Button, Grid } from "@mui/material";
import { useEffect } from "react";
import { useAppSelector } from "../../hooks";
import roomService from "../../services/roomService";
import gameService from "../../services/gameService";
import socketService from "../../services/socketService";
import { useAppDispatch } from "../../hooks";
import { QuestionPage } from "./containers/QuestionPage/index";
import { LeaderboardPage } from "./containers/LeaderboardPage";

const selectPlayerList = (state: { playerList: any; }) => state.playerList; // select for player list state 
const selectGameStats = (state: { gameStats: any }) => state.gameStats; // select for game stats

export function HostPage() {

    const initialHealth = 250;

    const dispatch = useAppDispatch(); // included in any component that dispatches actions

    const playerList = useAppSelector(selectPlayerList); // playerList is subscribed to changes from dispatched actions
    const gameStats = useAppSelector(selectGameStats); // Grab our game code from the global state

    // Listen for the player join event from roomService and update our state if one joins
    const handlePlayerJoin = () => {
        if (socketService.socket)
            roomService.onPlayerJoin(socketService.socket, (playerNames) => {
                console.log(playerNames);
                dispatch({ type: 'playerList/set', payload: playerNames }); // Dispatch action to change playerList
                dispatch({ type: 'gameStats/setNumPlayers', payload: playerNames.length }); // Dispatch action to change playerList
            });
    };

    // This function is called when the host starts the next game round
    const startGame = async (e: React.FormEvent) => {

        // Prevent the page from refreshing
        e.preventDefault();

        // Get our socket and tell the server to start the round by calling our roomService.startRound function
        const socket: any = socketService.socket;
        const joined = await gameService.startRound(socket, 1).catch((err) => {
            alert(err);
        });

        // Update state variables to display the new host screen
        if (joined) {
            console.log(joined);
            const playerHealthsObj = Object();
            playerList.forEach((username : string) => {
                playerHealthsObj[username] = initialHealth;
            });
            dispatch({ type: 'health/addHealth', payload: playerHealthsObj });
            dispatch({ type: 'question/set', payload: joined }); // Dispatch action to change playerList
            dispatch({ type: 'gameStats/toggleGameStarted', payload: true}); // Dispatch action to change playerList
            dispatch({ type: 'gameStats/toggleRoundInProgress', payload: true}); // Dispatch action to change playerList
        }
    } 

    

    useEffect(() => {

        // Constantly listen for player joining
        handlePlayerJoin();

    });

    function WaitingRoom() {
        return (
            <div>
                <h1 style={{ color: "#2196f3" }}>Let's Play Trivalry!</h1>
                <Grid container
                    direction="row"
                    style={{ height: '300px' }}
                    justifyContent="center"
                    alignItems="center"
                >
                    <Grid item xs={5}>
                        <h4>Room Code</h4>
                        <h1>{gameStats.gameCode}</h1>
                        <h4 style={{ paddingLeft: "15px", paddingRight: "15px" }}>Go to partyfish.io and enter code to join!</h4>
                        <Button onClick={startGame} variant={playerList.length > 1 ? "contained" : "outlined"} disabled={playerList.length > 1 ? false : true}>
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

    return (
        <div style={{ textAlign: "center" }}>
            { gameStats.roundInProgress ? <QuestionPage /> : (!gameStats.gameStarted) ? <WaitingRoom /> : <LeaderboardPage /> }
        </div>
    );
}