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
const selectHealth = (state: { health: any }) => state.health; // select for player healths
const selectQuestion = (state: { question: any }) => state.question; // select for game stats

export function LeaderboardPage() {

    const attackDamage = 50;

    const dispatch = useAppDispatch(); // included in any component that dispatches actions

    const [attacks, setAttacks] = useState<string[][]>([]);
    const [gameOver, setGameOver] = useState(false);

    const playerScores = useAppSelector(selectScores); // Grab our player's scores from global state
    const playerHealth = useAppSelector(selectHealth);
    const question = useAppSelector(selectQuestion); // Grab our current round question from the global state

    // This function is called when the host starts the next game round
    const newRound = async () => {

        // Get our socket and tell the server to start a new round
        const socket: any = socketService.socket;
        const joined = await gameService.startRound(socket, 2).catch((err) => {
            alert(err);
        });

        // Update state variables to display the new host screen
        if (joined) {
            console.log(joined);
            dispatch({ type: 'question/set', payload: joined }); // Dispatch action to change playerList
            dispatch({ type: 'gameStats/toggleGameStarted', payload: true }); // Dispatch action to change playerList
            dispatch({ type: 'gameStats/toggleRoundInProgress', payload: true }); // Dispatch action to change playerList
        }
    }

    // This function is called when the host starts the next game round
    const endGame = async () => {

        // Get our socket and tell the server to start a new round
        const socket: any = socketService.socket;
        const result = await gameService.endGame(socket).catch((err) => {
            alert(err);
        });

        // Update state variables to display the new host screen
        if (result) {
            console.log(result);
            setGameOver(true);
        }
    }

    // Listen for the player join event from roomService and update our state if one joins
    const handleAttack = () => {
        if (socketService.socket)
            gameService.onAttack(socketService.socket, (attacker, target) => {

                const playerHealthObj = Object();
                playerHealthObj[target] = playerHealth[target] - attackDamage;
                dispatch({ type: 'health/addHealth', payload: playerHealthObj });

                setAttacks([...attacks, [attacker, target]]);

            });
    };

    const remainingPlayers = () => {
        return Object.entries(playerHealth).filter((a: any) => a[1] > 0);
    }

    useEffect(() => {

        // Constantly listen for player attacks on leaderboard
        handleAttack();

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
                    <h2>Score <VscGraph /></h2>
                    {Object.entries(playerScores).sort((a: any, b: any) => b[1] - a[1]).map((entry, idx) => (
                        <h4>{idx + 1}. {entry[0]} {entry[1]}</h4>
                    ))}
                </Grid>
                <Grid item md={3}>
                    <h2>Health <RiHeartFill /></h2>
                    {Object.entries(playerHealth).sort((a: any, b: any) => b[1] - a[1]).map((entry) => (
                        <h4>{entry[0]} {entry[1]}</h4>
                    ))}
                </Grid>
                <Grid item md={3}>
                    <h2>Attacks!</h2>
                    {attacks.map(attack => <h4>{attack[0]} <RiSwordLine /> {attack[1]}</h4>)}
                </Grid>
            </Grid>

            {remainingPlayers().length > 1 ?
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
            {gameOver ? <FinalResults /> : <RoundLeaderboard />}
        </div>
    );
}