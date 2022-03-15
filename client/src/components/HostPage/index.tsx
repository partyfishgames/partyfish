import { Box, Button, Grid, createTheme, ThemeProvider, Typography, Paper } from "@mui/material";
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
        }
    );

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
                <ThemeProvider theme={islandTheme}>
                    <Box bgcolor="#C5D8A4">
                        <Box sx={{ mx: 8,  my: 2, pt:2 }}>
                            <Paper elevation={3} sx={{py: 2, px: 30}}>
                            <Typography component="h1" color="secondary">
                                Let's Play Trivalry!
                            </Typography>
                            </Paper>
                        </Box>
                        <Box sx={{mx:10,}}>
                            <Paper elevation={3} sx={{py: 2, px: 2}} style={{background: "#557C55"}}>
                                <Typography color="secondary">Go to partyfish.app to join!</Typography>
                            </Paper>
                        </Box>
                        <Box sx={{mx: 12,my: 2, pb:2 }}>
                            <Paper elevation={3} sx={{py: 2, px: 1}}>
                                <Grid container
                                    direction="row"
                                    style={{ height: '600px' }}
                                    justifyContent="center"
                                    alignItems="center"
                                >   
                                    <Grid item xs={6}>
                                        <Box sx={{mx:5, my:1}} >
                                            <Paper elevation={3} sx={{py: 2, px: 2}} style={{background: "#E3CAA5", height: "350px"}}>
                                                <Typography color="error">Room Code</Typography>
                                                <Box sx={{mx:1, my:14}}>
                                                    <Typography>{gameStats.gameCode}</Typography>
                                                </Box>
                                            </Paper>
                                        </Box>
                                    </Grid>   
                                    <Grid item xs={6}>
                                        <Box sx={{mx:5, my:1}} >
                                            <Paper elevation={3} sx={{py: 2, px: 2}} style={{background: "#E3CAA5", height: "350px"}}>
                                                <Typography color="error">Players</Typography>
                                                {playerList.map((player: string) =>
                                                    <Typography key={player}>{player}</Typography>
                                                )}
                                            </Paper>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Box sx={{mx:24, my:1}}>
                                            <Paper elevation={3} sx={{py: 2, px: 2}} style={{background: "#557C55"}}>
                                                <Button onClick={startGame} variant={playerList.length > 2 ? "contained" : "outlined"} disabled={playerList.length > 2 ? false : true}>
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