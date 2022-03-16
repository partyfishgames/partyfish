import { useEffect, useState } from "react";
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import {Box, createTheme, ThemeProvider, Typography, Paper } from "@mui/material";

import gameService from "../../services/gameService";
import socketService from "../../services/socketService";
import { useAppDispatch, useAppSelector } from "../../hooks";

import PepeSad from "../../images/pepesad.png";
import PepeHappy from "../../images/pepehappy.png";

const selectQuestion = (state: { question: string }) => state.question; // select for question
const selectGameStats = (state: { gameStats: any }) => state.gameStats; // select for game stats
const selectPlayer = (state: { player: any }) => state.player; // select for player 

export function PlayerPage() {
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
    }
);

    const dispatch = useAppDispatch(); // included in any component that dispatches actions

    const [isLoading, setIsLoading] = useState(false);
    const [waitingText, setWaitingText] = useState("Waiting for game to start...");
    const [usernamesAtRisk, setUsernamesAtRisk] = useState<String[]>([]);
    const [attacked, setAttacked] = useState(false);

    // subscribe variables to changes in the global state from dispatched actions
    const question = useAppSelector(selectQuestion); 
    const gameStats = useAppSelector(selectGameStats); 
    const player = useAppSelector(selectPlayer);

    // This function is called when the player selects an answer
    const sendAnswer = async (e: React.FormEvent) => {

        // Prevent the page from refreshing
        e.preventDefault();

        setIsLoading(true);

        const answerIndex = e.currentTarget.id;
        console.log(answerIndex);

        // Send the answer to the server
        const socket: any = socketService.socket;
        const response = await gameService.sendAnswer(socket, answerIndex).catch((err) => {
            alert(err);
        });

        console.log(response);

        dispatch({ type: 'question/set', payload: ['NONE'] });
        setWaitingText('Waiting for others to answer...');
        setIsLoading(false);
    }

    // This function is called when the player attacks another 
    const attackPlayer = async (target: any) => {

        setIsLoading(true);
        setAttacked(true);

        console.log(target);

        // Send the answer to the server
        const socket: any = socketService.socket;
        const response = await gameService.sendAttack(socket, player.username, target).catch((err) => {
            alert(err);
        });

        console.log(response);

        setWaitingText('Waiting for others to attack...');
        setIsLoading(false);
    }

    useEffect(() => {
        // Listen for the a new question from the host 
        const handleNewQuestion = () => {
            if (socketService.socket)
                gameService.onSendQuestion(socketService.socket, (question) => {
                    console.log(question);
                    setAttacked(false);
                    dispatch({ type: 'gameStats/setGameStarted', payload: true }); // Dispatch action to start game
                    dispatch({ type: 'question/set', payload: question }); // Dispatch action to change question
                    dispatch({ type: 'gameStats/setRoundInProgress', payload: true }); // Dispatch action to start round
                    dispatch({ type: 'gameStats/incrementRoundNumer'}); // Increment the round number
                });
        };

        // Listen for the answer result event
        const handleRoundResult = () => {
            if (socketService.socket)
                gameService.onResult(socketService.socket, (result, aliveUsers) => {
                    console.log('round result: ' + result);
                    console.log('users who can get reduced health:' + aliveUsers)

                    // remove player's own name from list of possible attackers 
                    aliveUsers.forEach((user,index)=>{
                        if (user === player.username) aliveUsers.splice(index,1);
                     });
                    
                    setUsernamesAtRisk(aliveUsers);

                    dispatch({ type: 'question/set', payload: ['NONE'] });
                    dispatch({ type: 'gameStats/setRoundInProgress', payload: false });
                    dispatch({ type: 'player/setRoundResult', payload: result });
                    dispatch({ type: 'player/setScore', payload: player.score + result });
                });
        };

        // Listen for an attack from another player event
        const handleAttack = () => {
            if (socketService.socket)
                gameService.onAttacked(socketService.socket, (attacker) => {
                    console.log(attacker + 'attacked you');
                    dispatch({ type: 'player/attackPlayer', payload: player.score - 50});
                });
        };

        const handleGameEnd = () => {
            if (socketService.socket)
                gameService.onGameEnd(socketService.socket, () => {
                    console.log('Game is over');
                    dispatch({ type: 'gameStats/setGameOver', payload: true }); // End the game
                });
        }

        handleGameEnd();
        handleNewQuestion();
        handleRoundResult();
        handleAttack();

        return () => {
            socketService.socket?.removeAllListeners('send_result');
            socketService.socket?.removeAllListeners('send_question');
            socketService.socket?.removeAllListeners('game_completed');
            socketService.socket?.removeAllListeners('send_attack');
        }
    });


    function TriviaQuestion() {
        return (
            <Grid container direction="row" alignItems="center" justifyContent="center">
                <Grid item>
                    {isLoading ?
                        <CircularProgress style={{ marginTop: "25px" }} /> :
                        <div>
                            <ThemeProvider theme={islandTheme}>
                                <Box bgcolor="#AD8B73" sx={{mx:1,my:1}}>
                                    <Box sx={{my:2,mx:2, pt:2}}>
                                        <Paper elevation={4} sx={{py: 2, px: 2}} style={{background:"#557C55"}}>
                                            <Typography component='h3' color='#85F4FF'>{question[0]}</Typography>
                                        </Paper>
                                    </Box>
                                    <Box >
                                        <ButtonGroup
                                            orientation="vertical"
                                            aria-label="vertical outlined button group"
                                        > 
                                            <Paper elevation={3} sx={{mx:1,my:1,px:1, py:1}} style={{background:"#D29D2B"}} >
                                                <Button style={{background:"#557C55" }} onClick={sendAnswer} id="1" key="1">{question[1]}</Button>
                                            </Paper>
                                            <Paper elevation={3} sx={{mx:1,my:1,px:1, py:1}} style={{background:"#D29D2B"}}>
                                                <Button style={{background:"#557C55" }} onClick={sendAnswer} id="2" key="2">{question[2]}</Button>
                                            </Paper>
                                            <Paper elevation={3} sx={{mx:1,my:1,px:1, py:1}} style={{background:"#D29D2B"}} >
                                                <Button  style={{background:"#557C55" }} onClick={sendAnswer} id="3" key="3">{question[3]}</Button> 
                                            </Paper> 
                                        </ButtonGroup>
                                    </Box>
                                </Box>
                            </ThemeProvider>
                        </div>
                    }
                </Grid>
            </Grid>
        )
    }

    function randomAnswer(isGood: boolean): string {
        const goodAnswers = ['Nice one!', 'Great job!', 'Good answer!', 'You rock!', 'You are an intelligent creature'];
        const badAnswers = ['Tough luck...', 'What were you thinking?', 'Ouch!', 'Absolutely right! And by right I mean wrong'];

        if (isGood) {
            return goodAnswers[Math.floor(Math.random() * (goodAnswers.length))];
        }
        return badAnswers[Math.floor(Math.random() * (badAnswers.length))];
    }

    function RoundResult() {
        return (
            <div>
                {player.roundResult > 0 ?
                    <div>
                        <ThemeProvider theme={islandTheme}>
                            <Box bgcolor="#557C55" sx={{mx:1, my:1,px:2,py:2}}>
                                <Paper elevation={3} sx={{mx:1,my:1,px:1, py:1}}>
                                    <Typography component="h3" color="primary">{randomAnswer(true)}</Typography>
                                    <Paper elevation={3} sx={{mx:10,my:2,px:1, py:1}} style={{background: "#E3CAA5" }}>
                                        <Typography component="h2" color="#557C55">Awarded {player.roundResult} points!</Typography>
                                        <img style={{ height: "80px", width: "auto" }} src={PepeHappy} alt="Happy Pepe"></img>
                                        <Typography component="h2" color="#557C55">You have {player.score} pts</Typography>
                                    </Paper>
                                    <Typography component="h4" color="primary">Choose a player to attack:</Typography>
                                    <ButtonGroup
                                        orientation="vertical"
                                        aria-label="vertical outlined button group"
                                    >
                                        {usernamesAtRisk.length > 0 ? !attacked ?
                                            usernamesAtRisk.map((username, idx) => (
                                                <Button style={{color: "#D29D2B", background:"#557C55" }} onClick={() => attackPlayer(username)} key={idx}>{username}</Button>
                                            )) : 
                                            
                                                <Typography component="h3" color="secondary">Waiting for others...</Typography>
                        
                                            :
                                            <Typography component="h3" color="secondary">Everyone is safe!</Typography>
                                        }

                                    </ButtonGroup>
                                </Paper>
                            </Box>
                        </ThemeProvider>
                    </div>
                    :
                    <div>
                       <ThemeProvider theme={islandTheme}>
                            <Box bgcolor="#557C55" sx={{mx:1, my:1,px:2,py:2}}>
                                <Paper elevation={3} sx={{mx:1,my:1,px:1, py:1}}>
                                    <Typography component="h3" color="#9B0000">{randomAnswer(false)}</Typography>
                                    <Paper elevation={3} sx={{mx:10,my:2,px:1, py:1}} style={{background: "#E3CAA5" }}>
                                        <Typography component="h2" color="#557C55">No points earned :(</Typography>
                                        <img style={{ height: "80px", width: "auto" }} src={PepeSad} alt="Sad Pepe"></img>
                                        <Typography component="h2" color="#557C55">You have {player.score} pts</Typography>
                                    </Paper>
                                    <Typography component="h3" color="#9B0000">Opponents are choosing your fate...</Typography>
                                </Paper>
                            </Box>
                        </ThemeProvider>
                    </div>
                }
            </div>
        )
    }

    function GameOver() {
        return (
            <div>
                <Typography component="h1" color="#557C55">Thanks for playing!</Typography>
                <img src={PepeHappy} style={{ height: "100px", width: "auto" }} alt="pepefinish"></img>
            </div>
        )
    }

    return (
        <div style={{ textAlign: "center" }}>
            <ThemeProvider theme={islandTheme}>
            {!gameStats.gameStarted ? 
            <Box bgcolor="#AD8B73" sx={{mx:1, my:1,px:2,py:2}}>
                <Paper elevation={3} sx={{mx:1,my:1,px:1, py:1}} style={{background:"#D29D2B"}}>
                    <Typography component='h3' color="#557C55">{waitingText}</Typography> 
                </Paper>
            </Box>
            : (gameStats.gameOver ? <GameOver /> : 
                (player.score <= 0 ? <h3>You're dead, lol.</h3> :
                (gameStats.roundInProgress && question[0] !== 'NONE' ? <TriviaQuestion /> :
                    (!gameStats.roundInProgress && question[0] === 'NONE' ? <RoundResult /> :
                    <Box bgcolor="#AD8B73" sx={{mx:1, my:1,px:2,py:2}}>
                        <Paper elevation={3} sx={{mx:1,my:1,px:1, py:1}} style={{background:"#D29D2B"}}>    
                            <Typography component='h3' color="#557C55">{waitingText}</Typography>
                       </Paper>
                     </Box>
                       ))))}
            </ThemeProvider>
        </div>
    );
}