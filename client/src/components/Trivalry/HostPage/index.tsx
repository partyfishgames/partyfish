import { Box, Button, Grid, createTheme, ThemeProvider, Typography, Paper } from "@mui/material";
import { useEffect } from "react";
import { useAppSelector } from "../../../hooks";
import roomService from "../../../services/roomService";
import gameService from "../../../services/gameService";
import socketService from "../../../services/socketService";
import { useAppDispatch } from "../../../hooks";
import { QuestionPage } from "./containers/QuestionPage/index";
import { LeaderboardPage } from "./containers/LeaderboardPage";

const selectPlayersList = (state: { playerLists: any; }) => state.playerLists; // select for player lists state 
const selectGameStats = (state: { gameStats: any }) => state.gameStats; // select for game stats

export function TrivalryHostPage() {

    const islandTheme = createTheme({
        typography: {
            fontFamily: [
                'Syne Mono', 
                'monospace'
            ].join(','),
            fontSize: 22,
            fontWeightRegular:500,
        },
        palette: {
            primary: {
                main: "#A6CF98", // light green
            },
            secondary: {
                main: "#E3CAA5", // light brown
            }, 
            success: {
                main: "#557C55", // dark green
            },
            error: {
                main: "#D29D2B", // burnt yellow
            },
            background:{
                paper: "#AD8B73", // dark brown
            }
        },
    });
    
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
                dispatch({ type: 'playerLists/setAllPlayers', payload: playerNames }); // Dispatch action to set all players
                dispatch({ type: 'playerLists/setAlivePlayers', payload: playerNames }); // All players start alive
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

        return () => {
            socketService.socket?.removeAllListeners("on_player_join");
        };
    });

    function WaitingRoom() {
        return (
            <div>
                <ThemeProvider theme={islandTheme}>
                    <Box bgcolor="#C5D8A4">
                        <Box sx={{ mx: 4,  my: 2, pt:2 }}>
                            <Paper elevation={3} sx={{py: 2,px:2}}>
                            <Typography component="h1" color="secondary">
                                Let's Play Trivalry!
                            </Typography>
                            </Paper>
                        </Box>
                        <Box sx={{mx:5,}}>
                            <Paper elevation={3} sx={{py: 2, px: 2}} style={{background: "#557C55"}}>
                                <Typography color="secondary">Go to partyfish.app to join!</Typography>
                            </Paper>
                        </Box>
                        <Box sx={{mx: 6,my: 2, pb:2 }}>
                            <Paper elevation={3} sx={{py: 2, px: 1}}>
                                <Grid container
                                    direction="row"
                                    style={{ height: '600px' }}
                                    justifyContent="center"
                                    alignItems="center"
                                >   
                                    <Grid item xs={6}>
                                        <Box sx={{mx:1, my:1}} >
                                            <Paper elevation={3} sx={{py: 2, px: 2}} style={{background: "#E3CAA5", height: "350px"}}>
                                                <Typography color="error">Room Code</Typography>
                                                <Box sx={{mx:1, my:14}}>
                                                    <Typography fontSize = "32">{gameStats.gameCode}</Typography>
                                                </Box>
                                            </Paper>
                                        </Box>
                                    </Grid>   
                                    <Grid item xs={6}>
                                        <Box sx={{mx:1, my:1}} >
                                            <Paper elevation={3} sx={{py: 2, }} style={{background: "#E3CAA5", height: "350px"}}>
                                                <Typography color="error">Players</Typography>
                                                {playerLists.allPlayers.map((player: string) =>
                                                    <Typography key={player}>{player}</Typography>
                                                )}
                                            </Paper>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Box sx={{mx:6, my:1}}>
                                            <Paper elevation={3} sx={{py: 1, px: 1}} style={{background: "#557C55"}}>
                                                <Button onClick={startGame} variant={playerLists.allPlayers.length > 2 ? "contained" : "outlined"} disabled={playerLists.allPlayers.length > 2 ? false : true}>

                                                    <Typography color="error">
                                                        Start Game
                                                    </Typography>
                                                </Button>
                                            </Paper>
                                        </Box>
                                    </Grid> 
                                </Grid>
                            </Paper>
                        </Box>
                    </Box>
                </ThemeProvider>
            </div>
        );
    }

    return (
        <div style={{ textAlign: "center"}}>
            { gameStats.roundInProgress ? <QuestionPage /> : (!gameStats.gameStarted) ? <WaitingRoom /> : <LeaderboardPage /> }
        </div>
    );
}