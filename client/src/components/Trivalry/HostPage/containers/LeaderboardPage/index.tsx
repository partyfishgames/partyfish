import { Button, Grid, Typography, createTheme, ThemeProvider, Paper, Box } from "@mui/material";
import { useAppDispatch } from "../../../../../hooks";
import gameService from "../../../../../services/gameService";
import socketService from "../../../../../services/socketService";
import { useAppSelector } from "../../../../../hooks";
import { useEffect, useState } from "react";
import { RiSwordLine, RiHeartFill } from "react-icons/ri";
import { FaMedal } from "react-icons/fa";

import FadeIn from 'react-fade-in';

const selectScores = (state: { scores: any }) => state.scores; // select for player scores
const selectQuestion = (state: { question: any }) => state.question; // select for round question
const selectGameStats = (state: { gameStats: any }) => state.gameStats; // select for game stats
const selectPlayersList = (state: { playerLists: any; }) => state.playerLists; // select for player lists state 

export function LeaderboardPage() {

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

    const [attacks, setAttacks] = useState<string[][]>([]); // hold the round's current attacks for display

    // subscribe variables to changes in the global state from dispatched actions
    const playerLists = useAppSelector(selectPlayersList);
    const playerScores = useAppSelector(selectScores); 
    const question = useAppSelector(selectQuestion); 
    const gameStats = useAppSelector(selectGameStats);

    const attackDamage = 50; // each player attack results in reduction of 50 points

    // This function is called when the host starts the next game round
    const newRound = async () => {

        if (attacks.length === playerLists.correctPlayers.length) {
            // all attacks completed

            // Get our socket and tell the server to start a new round
            const socket: any = socketService.socket;
            const joined = await gameService.startRound(socket, 2).catch((err) => {
                alert(err);
            });

            // Update state variables to display the question screen
            if (joined) {
                console.log(joined);
                dispatch({ type: 'question/set', payload: joined }); // Set the round's question
                dispatch({ type: 'gameStats/setRoundInProgress', payload: true }); // Start the round
                dispatch({ type: 'gameStats/setRoundNumber', payload: gameStats.roundNumber + 1}); // Increment round number
                dispatch({ type: 'playerLists/setCorrectPlayers', payload: [] }); // reset the correct players for the new round
                dispatch({ type: 'playerLists/setAttackers', payload: [] }); // reset the correct players for the new round
            }
        } else {
            // not all attacks completed
            alert('All players must select their attacks before the new round can be started. Happy Attacking!');
        }

    }

    // This function is called when the game ends 
    const endGame = async () => {

        // Get our socket and tell the server to end the game
        const socket: any = socketService.socket;
        const result = await gameService.endGame(socket).catch((err) => {
            alert(err);
        });

        // Update state variables to display the end of the game
        if (result) {
            console.log(result);
            dispatch({ type: 'gameStats/setGameOver', payload: true }); // End the game
        }
    }

    // Listen for the player attack event from gameService and update player score
    const handleAttack = () => {
        if (socketService.socket)
            gameService.onAttack(socketService.socket, (attacker, target) => {

                const playerScoresObj = Object();

                let potentialAttackers = playerLists.attackers.filter((player: string) => player !== attacker);
                dispatch({ type: 'playerLists/setAttackers', payload: potentialAttackers}); // waiting for their attacks 

                playerScoresObj[target] = playerScores[target] - attackDamage;
                if (playerScoresObj[target] < 0) {
                    playerScoresObj[target] = 0; //sets the player's score to 0 if less than 0
                }
                dispatch({ type: 'scores/addScore', payload: playerScoresObj });
                setAttacks([...attacks, [attacker, target]]); // set the round's attacks for display

                if (playerScoresObj[target] <= 0) {
                    // player died 
                    let alive = playerLists.alivePlayers.filter((player: string) => player !== target);
                    dispatch({ type: 'playerLists/setAlivePlayers', payload: alive});
                }
            });
    };

    useEffect(() => {

        handleAttack(); // Constantly listen for player attacks on leaderboard

        return () => {
            socketService.socket?.removeAllListeners("attack_received");
        };

    });

    function RoundLeaderboard() {
        return (<div style={{ textAlign: "center" }}>
            <ThemeProvider theme={islandTheme}>
                <Box bgcolor='#D29D2B' sx={{my:3}}>
                    <Box sx={{mx:3, my:3, py:3}}>
                        <Paper elevation={3} sx={{py: 2, px: 2}} style={{background: "#557C55"}}>
                            <Box sx={{mx:14, my:3}}>
                                <Paper elevation={3} sx={{py: 2, px: 2}}>
                                    <Typography component='h3' color="secondary">Round {gameStats.roundNumber}</Typography>
                                </Paper>
                            </Box>
                            <Box sx={{mx:10, my:3}}>
                                <Paper elevation={3} sx={{py: 2, px: 2}} style={{background: '#D29D2B'}}>
                                    <Typography component='h3'color="#557C55">Leaderboard</Typography>
                                </Paper>
                            </Box>
                            <Box sx={{mx:12, my:3}}>
                                <Paper elevation={3} sx={{py: 2, px: 2}} >
                                    <Typography component='h3'color="secondary">Correct Answer: {question[parseInt(question[4])]}</Typography>
                                </Paper>
                            </Box>
                            <Box sx={{mx:10, my:3}}>
                                <Paper elevation={3} sx={{py: 2, px: 2}} style={{background: "#A6CF98"}}>
                                    <Grid container direction="row" justifyContent="center" alignItems="flex-start">
                                        <Grid item md={3} sx={{mx:3}}>
                                            <Box sx={{mx:1, my:1}}>
                                                <Paper elevation={3} sx={{py: 1, px: 3}} style={{background: "#E3CAA5"}}>
                                                    <Typography color="#557C55">Health<RiHeartFill color="#85F4FF" /></Typography>
                                                </Paper>
                                            </Box>
                                            {Object.entries(playerScores).sort((a: any, b: any) => b[1] - a[1]).map((entry, idx) => (
                                                <Typography color="#557C55">{idx + 1}. {entry[0]} {entry[1]}</Typography>
                                            ))}
                                        </Grid>
                                        <Grid item md={3} sx={{mx:3}}>
                                            <Box sx={{mx:1, my:1}}>
                                                <Paper elevation={3} sx={{py: 1, px: 3}} style={{background: "#E3CAA5"}}>
                                                    <Typography color="#557C55">Attacks<RiSwordLine color="#9B0000"/></Typography>
                                                </Paper>
                                            </Box>
                                            {attacks.map(attack => <Typography color="#557C55">{attack[0]} <RiSwordLine color="#9B0000" /> {attack[1]}</Typography>)}
                                        </Grid>
                                        <Grid item md={3} sx={{mx:3}}>
                                            <Box sx={{mx:1, my:1}}>
                                                <Paper elevation={3} sx={{py: 1, px: 3}} style={{background: "#E3CAA5"}}>
                                                    <Typography color="#557C55">Waiting for Attack:</Typography>
                                                </Paper>
                                            </Box>
                                            {playerLists.attackers.map((attacker: string) => <Typography color="#557C55">{attacker}</Typography>)}
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Box>
                            {playerLists.alivePlayers.length > 1 && gameStats.roundNumber < 10 ?
                                <Button onClick={newRound} style={{background:"#D29D2B"}}>
                                    <Typography color="#557C55">
                                        Next Round
                                    </Typography>
                                </Button>
                                :
                                <Button onClick={endGame} style={{background:"#D29D2B"}}>
                                    <Typography color="#557C55">
                                        See Results!
                                    </Typography>
                                </Button>
                            }
                        </Paper>
                    </Box>
                </Box>
            </ThemeProvider>
        </div>)
    }

    // Returns an appropriately sized header for the final placement of each player
    // Only goes down to h4, the top 3 get special header sizes
    function SizedHeaderFromIndex(idx: number, entry: any) {
        if (idx === 1) {
            return (<Box sx={{mb:1}}><Typography variant='h4' color="#AD8B73"><FaMedal color="gold" /> {idx}. {entry[0]} {entry[1]}</Typography></Box>)
        } else if (idx === 2) {
            return (<Box sx={{mb:1}}><Typography variant='h5' color="#AD8B73"><FaMedal color="silver" /> {idx}. {entry[0]} {entry[1]}</Typography></Box>)
        } else if (idx === 3) {
            return (<Box sx={{mb:1}}><Typography variant='h6' color="#AD8B73"><FaMedal color="bronze" /> {idx}. {entry[0]} {entry[1]}</Typography></Box>)
        } else {
            return (<Box sx={{mb:1}}><Typography variant='h6' color="#AD8B73">{idx}. {entry[0]} {entry[1]}</Typography></Box>)
        }
    }

    function FinalResults() {
        return (
            <div>
                <ThemeProvider theme={islandTheme}>
                    <Box bgcolor='#D29D2B' sx={{my:3}}>
                        <Box sx={{mx:3, my:3, py:3}}>
                            <Paper elevation={3} sx={{py: 2, px: 2}} style={{background: "#557C55"}}>
                                <Paper elevation={3} sx={{py: 2, px: 2, mb:2, mx:6}} style={{background: "#85F4FF"}}><Typography variant='h4'color='#D29D2B'>Final Results</Typography></Paper>
                                    <FadeIn delay={500} transitionDuration={1000}>                  
                                            {Object.entries(playerScores).sort((a: any, b: any) =>b[1] - a[1]).map((entry, idx) => (
                                               SizedHeaderFromIndex(idx + 1, entry)
                                            ))}
                                    </FadeIn>
                            </Paper>
                        </Box>
                    </Box>
                </ThemeProvider>
            </div>
        )
    }

    return (
        <div>
            {gameStats.gameOver ? <FinalResults /> : <RoundLeaderboard />}
        </div>
    );
}