import { Button, Grid } from "@mui/material";
import { useAppDispatch } from "../../../../hooks";
import gameService from "../../../../services/gameService";
import socketService from "../../../../services/socketService";
import { useAppSelector } from "../../../../hooks";
import { useEffect, useState } from "react";
import { RiSwordLine, RiHeartFill } from "react-icons/ri";
import { VscGraph } from "react-icons/vsc";

const selectScores = (state: { scores: any }) => state.scores; // select for player scores
const selectHealth = (state: { health: any }) => state.health; // select for player healths

export function LeaderboardPage() {

    const attackDamage = 50;

    const dispatch = useAppDispatch(); // included in any component that dispatches actions

    const [attacks, setAttacks] = useState<string[][]>([]);

    const playerScores = useAppSelector(selectScores); // Grab our player's scores from global state
    const playerHealth = useAppSelector(selectHealth);

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

    useEffect(() => {

        // Constantly listen for player attacks on leaderboard
        handleAttack();

        return () => {
            socketService.socket?.removeAllListeners("attack_received");
        };

    });

    return (
        <div style={{ textAlign: "center" }}>
            <h1>Leaderboard</h1>
            <Grid container direction="row" justifyContent="center" alignItems="flex-start">
                <Grid item md={3}>
                    <h2>Score <VscGraph /></h2>
                    {Object.entries(playerScores).sort((a: any, b: any) => b[1] - a[1]).map((entry) => (
                        <h4>{entry[0]} {entry[1]}</h4>
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

            <Button onClick={newRound}>Next Round</Button>
        </div>
    );
}