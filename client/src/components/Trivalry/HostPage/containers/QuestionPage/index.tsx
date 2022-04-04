import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {createTheme, ThemeProvider, Paper, Grid } from '@mui/material';
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../../hooks";
import socketService from '../../../../../services/socketService';
import gameService from '../../../../../services/gameService';

const selectAnswers = (state: { answers: any }) => state.answers; // select for player answers
const selectScores = (state: { scores: any }) => state.scores; // select for player scores
const selectQuestion = (state: { question: any }) => state.question; // select for round question
const selectPlayerLists = (state: { playerLists: any; }) => state.playerLists; // select for player lists state
const selectGameStats = (state: { gameStats: any }) => state.gameStats; // select for game stats

export function QuestionPage() {

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
            info: {
                main: "#85F4FF" // cyan blue
            },
            background:{
                paper: "#AD8B73", // dark brown
            }
        },
    });

    const dispatch = useAppDispatch(); // included in any component that dispatches actions

    // subscribe variables to changes in the global state from dispatched actions
    const playerScores = useAppSelector(selectScores); 
    const playerAnswers = useAppSelector(selectAnswers); 
    const question = useAppSelector(selectQuestion); 
    const playerLists = useAppSelector(selectPlayerLists);
    const gameStats = useAppSelector(selectGameStats); 

    // Timer functionality for gameplay => begin the timer 
    const [timeRemaining, setTimeRemaining] = useState(30);
    const [timerActive, setTimerActive] = useState(true);

    useEffect(() => {
        
        // Listen for the player answer event from gameService and update our state if one answers
        const handlePlayerAnswer = () => {
            if (socketService.socket)
                gameService.onUpdateAnswers(socketService.socket, (username, answerId) => {
                    console.log(username + ' answered ' + answerId);
                    const answerPayload = Object();
                    answerPayload[username] = [ answerId, timeRemaining ];
                    dispatch({ type: 'answers/addAnswer', payload: answerPayload }); // Dispatch action to add player answer
                });
        };

        // This function is called when the round is over to emit which players were correct/incorrect
        const endRound = async () => {

            // End round cleanup
            setTimerActive(false);
            dispatch({ type: 'gameStats/setRoundInProgress', payload: false }); // end the current round
            console.log(playerAnswers);

            let correctAnswers = Object();
            let correctPlayers = [];
            let score = 0;

            for(const player in playerAnswers) {
                if (playerAnswers[player][0] === parseInt(question[4])) {
                    score = 50 + Math.floor((playerAnswers[player][1] / 30) * 50);
                    correctPlayers.push(player);
                } else {
                    score = 0;
                }

                correctAnswers[player] = score;

                const previousScore = playerScores[player] || 0;
                const scorePayload = Object();
                scorePayload[player] = score + previousScore;
                dispatch({ type: 'scores/addScore', payload:  scorePayload }); // update player scores 
            }

            dispatch({ type: 'playerLists/setCorrectPlayers', payload: correctPlayers });

            console.log(correctAnswers);
            console.log(correctPlayers);
            console.log(playerScores);
            console.log(playerLists.alivePlayers);

            // Send the player answer results to the server
            const socket: any = socketService.socket;
            const response = await gameService.endRound(socket, correctAnswers, playerLists.alivePlayers).catch((err) => {
                alert(err);
            });

            console.log(response); // To rid unused variable warning

            // set up for new round
            setTimeRemaining(30);
            dispatch({ type: 'answers/reset' }); // Dispatch action to change answer list
        };

        handlePlayerAnswer();

        let interval = 0;
        if (timerActive) {
            interval = window.setInterval(() => {
                console.log(timeRemaining);
                setTimeRemaining(seconds => seconds - 1);
                if (timeRemaining <= 1 || playerLists.alivePlayers.length === Object.keys(playerAnswers).length) {
                    // Timer is up or all alive players answered
                    endRound();
                }
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => {
            clearInterval(interval);
            socketService.socket?.removeAllListeners("update_answer");
        };

    }, [timerActive, timeRemaining, playerLists.alivePlayers, playerScores, playerAnswers, question, dispatch]);

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

    return (
        <div>
            <ThemeProvider theme={islandTheme}>
                <Box bgcolor='#D29D2B' sx={{my:3}}>
                    <Box sx={{mx:3, my:3, py:3}}>
                        <Paper elevation={3} sx={{py: 2, px: 2}} style={{background: "#557C55"}}>
                            <Box sx={{mx:12, my:3}}>
                                 <Paper elevation={3} sx={{py: 2, px: 2}} style={{background: '#D29D2B'}}>
                                    <Typography component='h3'color="#557C55"> Round {gameStats.roundNumber} </Typography>
                                </Paper>
                            </Box>
                            <Box sx={{mx:8, my:3}}>
                                 <Paper elevation={3} sx={{py: 2, px: 2}}>
                                    <Typography component='h3'color="#85F4FF" >{question[0]}</Typography>
                                </Paper>
                            </Box>
                            <Box sx={{mx:4, my:2}}>
                                 <Paper elevation={3} sx={{py: 2, px: 2}} style={{background: "#85F4FF"}}>
                                    <LinearProgressWithLabel />
                                </Paper>
                            </Box>
                            <Box sx={{mx:8, my:1,}}>
                                <Grid container
                                        direction="column"
                                        
                                        justifyContent="center"
                                        alignItems="center"
                                    > 
                                    <Grid item xs={8}>
                                        <Box sx={{mx:1, my:1}} >
                                            <Paper elevation={3} sx={{py: 1,px:1}}>
                                                <Typography component="h3" color="#85F4FF">Answered:</Typography>
                                                {Object.keys(playerAnswers).map((name: any) =>
                                                    <Typography component='h4' color='primary'>{name} </Typography>)
                                                }
                                            </Paper>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={8}>
                                        <Box sx={{ my:1, mx:1}} >
                                            <Paper elevation={3} sx={{py: 1, px:1 }}> 
                                                <Typography component="h3" color="#85F4FF">Hurry up:</Typography>
                                                {playerLists.alivePlayers.filter((player: string) => !Object.keys(playerAnswers).includes(player)).map((player: any) => 
                                                    <Typography component='h4' color='primary'>{player} </Typography>)
                                                }
                                            </Paper>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Paper>
                    </Box>
                </Box>
            </ThemeProvider>
        </div>
    );
}