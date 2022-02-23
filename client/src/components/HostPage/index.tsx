import { Button, Grid } from "@mui/material";
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useEffect, useState } from "react";
import { useAppSelector } from "../../hooks";
import roomService from "../../services/roomService";
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

    const [question, setQuestion] = useState(['None']);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [timerActive, setTimerActive] = useState(false);

    // Listen for the player join event from roomService and update our state if one joins
    const handlePlayerJoin = () => {
        if (socketService.socket)
            roomService.onPlayerJoin(socketService.socket, (playerNames) => {
                console.log(playerNames);
                dispatch({ type: 'playerList/set', payload: playerNames }); // Dispatch action to change playerList
                dispatch({ type: 'gameStats/setNumPlayers', payload: playerNames.length }); // Dispatch action to change playerList
            });
    };

    // This function is called when the user presses the "host" button
    const startGame = async (e: React.FormEvent) => {

        // Prevent the page from refreshing
        e.preventDefault();

        // Get our socket and tell the server to host a room by calling our roomService.hostRoom function
        const socket: any = socketService.socket;
        const joined = await gameService.startRound(socket, 1).catch((err) => {
            alert(err);
        });

        // Update state variables to display the new host screen
        if (joined) {
            console.log(joined);
            setQuestion(joined);
            setTimerActive(true);
            setTimeRemaining(30);
        }
    }

    useEffect(() => {

        // Constantly listen
        handlePlayerJoin();

        let interval = 0;
        if (timerActive) {
            interval = window.setInterval(() => {
                console.log(timeRemaining);
                setTimeRemaining(seconds => seconds - 1);
                if(timeRemaining <= 1) {
                    setTimerActive(false);
                }
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [timerActive, timeRemaining]);

    function LinearProgressWithLabel() {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', margin: '25px' }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress variant="determinate" value={timeRemaining / 30 * 100} />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                    <Typography variant="body2" color="text.secondary">
                        {timeRemaining}
                    </Typography>
                </Box>
            </Box>
        );
    }

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
                        <h1>{gameCode}</h1>
                        <h4 style={{ paddingLeft: "15px", paddingRight: "15px" }}>Go to partyfish.io and enter code to join!</h4>
                        <Button onClick={startGame} variant={playerList.length > 0 ? "contained" : "outlined"} disabled={playerList.length > 0 ? false : true}>
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

    function DisplayQuestion() {
        return (
            <div>
                <h3>{question[0]}</h3>
                <LinearProgressWithLabel />
            </div>
        );
    }

    return (
        <div style={{ textAlign: "center" }}>
            {question[0] === 'None' ? <WaitingRoom /> : <DisplayQuestion />}
        </div>
    );
}