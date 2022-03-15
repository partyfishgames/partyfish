import { Button, Grid } from "@mui/material";
import { useAppDispatch } from "../../../../hooks";
import gameService from "../../../../services/gameService";
import socketService from "../../../../services/socketService";
import { useAppSelector } from "../../../../hooks";
import { useEffect, useState } from "react";
import { RiSwordLine, RiHeartFill } from "react-icons/ri";
import { VscGraph } from "react-icons/vsc";
import { FaMedal } from "react-icons/fa";

import FadeIn from 'react-fade-in';

const selectScores = (state: { scores: any }) => state.scores; // select for player scores
const selectQuestion = (state: { question: any }) => state.question; // select for round question
const selectGameStats = (state: { gameStats: any }) => state.gameStats; // select for game stats
const selectPlayersList = (state: { playerLists: any; }) => state.playerLists; // select for player lists state 

export function LeaderboardPage() {

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
                playerScoresObj[target] = playerScores[target] - attackDamage;
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
            <h1>Leaderboard</h1>
            <h3>Correct Answer: {question[parseInt(question[4])]}</h3>
            <Grid container direction="row" justifyContent="center" alignItems="flex-start">
                <Grid item md={3}>
                    <h2>Score<VscGraph /> / Health<RiHeartFill /></h2>
                    {Object.entries(playerScores).sort((a: any, b: any) => b[1] - a[1]).map((entry, idx) => (
                        <h4>{idx + 1}. {entry[0]} {entry[1]}</h4>
                    ))}
                </Grid>
                <Grid item md={3}>
                    <h2>Attacks!</h2>
                    {attacks.map(attack => <h4>{attack[0]} <RiSwordLine /> {attack[1]}</h4>)}
                </Grid>
            </Grid>

            {playerLists.alivePlayers.length > 1 && gameStats.roundNumber < 10 ?
                <Button onClick={newRound}>Next Round</Button>
                :
                <Button onClick={endGame}>See Results!</Button>
            }

        </div>)
    }

    // Returns an appropriately sized header for the final placement of each player
    // Only goes down to h4, the top 3 get special header sizes
    function SizedHeaderFromIndex(idx: number, entry: any) {
        if (idx === 1) {
            return (<h1><FaMedal color="gold" /> {idx}. {entry[0]} {entry[1]}</h1>)
        } else if (idx === 2) {
            return (<h2><FaMedal color="silver" /> {idx}. {entry[0]} {entry[1]}</h2>)
        } else if (idx === 3) {
            return (<h3><FaMedal color="bronze" /> {idx}. {entry[0]} {entry[1]}</h3>)
        } else {
            return (<h4>{idx + 1}. {entry[0]} {entry[1]}</h4>)
        }
    }

    function FinalResults() {
        return (
            <div>
                <h4>Final Results</h4>
                <FadeIn delay={500} transitionDuration={1000}>
                    {Object.entries(playerScores).sort((a: any, b: any) => b[1] - a[1]).map((entry, idx) => (
                        SizedHeaderFromIndex(idx + 1, entry)
                    ))}
                </FadeIn>
            </div>
        )
    }

    return (
        <div>
            {gameStats.gameOver ? <FinalResults /> : <RoundLeaderboard />}
        </div>
    );
}