import { Button } from "@mui/material";
import { useAppDispatch } from "../../../../hooks";
import gameService from "../../../../services/gameService";
import socketService from "../../../../services/socketService";

export function LeaderboardPage() {

    const dispatch = useAppDispatch(); // included in any component that dispatches actions

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
            dispatch({ type: 'gameStats/toggleGameStarted', payload: true}); // Dispatch action to change playerList
            dispatch({ type: 'gameStats/toggleRoundInProgress', payload: true}); // Dispatch action to change playerList
        }
    } 

    return (
        <div style={{ textAlign: "center" }}>
            <h3>Leaderboard:</h3>
            <Button onClick={newRound}>Next Round</Button>
        </div>
    );
}