import { Button, Grid } from "@mui/material";
import { useEffect } from "react";
import { useAppSelector } from "../../hooks";
import roomService from "../../services/roomService";
import gameService from "../../services/gameService";
import socketService from "../../services/socketService";
import { useAppDispatch } from "../../hooks";
import { QuestionPage } from "./containers/QuestionPage/index";
import { LeaderboardPage } from "./containers/LeaderboardPage";

const selectPlayersList = (state: { playerLists: any; }) => state.playerLists; // select for player lists state 
const selectGameStats = (state: { gameStats: any }) => state.gameStats; // select for game stats

export function HostPage() {

    const dispatch = useAppDispatch(); // included in any component that dispatches actions

    // subscribe variables to changes in the global state from dispatched actions
    const playerLists = useAppSelector(selectPlayersList); 
    const gameStats = useAppSelector(selectGameStats); 

    const initialScore = 250; // every player begins with a score of 250

    // Listen for the player join event from roomService and update state if one joins
    const handlePlayerJoin = () => {
        if (socketService.socket)
            roomService.onPlayerJoin(socketService.socket, (playerNames) => {
                console.log(playerNames);
                dispatch({ type: 'playerList/setAllPlayers', payload: playerNames }); // Dispatch action to set all players
                dispatch({ type: 'playerList/setAlivePlayers', payload: playerNames }); // All players start alive
                dispatch({ type: 'gameStats/setNumPlayers', payload: playerNames.length }); // Dispatch action to set number of players
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

            const playerScoresObj = Object();
            playerLists.allPlayers.forEach((username : string) => {
                playerScoresObj[username] = initialScore;
            });

            dispatch({ type: 'scores/addScore', payload: playerScoresObj }); // Set all players' scores to 250 at the start 
            dispatch({ type: 'question/set', payload: joined }); // Set the round's question
            dispatch({ type: 'gameStats/setGameStarted', payload: true}); // Start the game
            dispatch({ type: 'gameStats/setRoundInProgress', payload: true}); // Start a round
            dispatch({ type: 'gameStats/setRoundNumber', payload: 1}); // Increment round number
            dispatch({ type: 'gameStates/setGameType', payload: 'Trivalry'}); // EVENTUALLY THIS WILL CHANGE WHEN MORE GAMES AVAILABLE
        }
    } 

    useEffect(() => {
        handlePlayerJoin(); // Constantly listen for players joining
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
                        <h4 style={{ paddingLeft: "15px", paddingRight: "15px" }}>Go to partyfish.app and enter code to join!</h4>
                        <Button onClick={startGame} variant={playerLists.allPlayers.length > 2 ? "contained" : "outlined"} disabled={playerLists.allPlayers.length > 2 ? false : true}>
                            Start Game
                        </Button>
                    </Grid>
                    <Grid item xs={5}>
                        <h2>Players</h2>
                        {playerLists.allPlayers.map((player: string) =>
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