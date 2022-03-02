import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../hooks";
import socketService from '../../../../services/socketService';
import gameService from '../../../../services/gameService';

const selectAnswers = (state: { answers: any }) => state.answers; // select for player answers
const selectScores = (state: { scores: any }) => state.scores; // select for player scores
const selectQuestion = (state: { question: any }) => state.question; // select for game stats
const selectPlayerList = (state: { playerList: any; }) => state.playerList; // select for player list state

export function QuestionPage() {

    const playerScores = useAppSelector(selectScores); // Grab players scores from the global state
    const playerAnswers = useAppSelector(selectAnswers); // Grab our player's answers from the global state
    const question = useAppSelector(selectQuestion); // Grab our current round question from the global state
    const playerList = useAppSelector(selectPlayerList); // playerList is subscribed to changes from dispatched actions
    const dispatch = useAppDispatch(); // included in any component that dispatches actions

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
            dispatch({ type: 'gameStats/toggleRoundInProgress', payload: false }); // end the current round
            console.log(playerAnswers);

            let correctAnswers = Object();
            let score = 0;

            for(const player in playerAnswers) {
                if (playerAnswers[player][0] === parseInt(question[4])) {
                    score = 50 + Math.floor((playerAnswers[player][1] / 30) * 50);
                } else {
                    score = 0;
                }
                correctAnswers[player] = score;

                const previousScore = playerScores[player] || 0;
                const scorePayload = Object();
                scorePayload[player] = score + previousScore;
                dispatch({ type: 'scores/addScore', payload:  scorePayload }); // end the current round
            }

            console.log(correctAnswers);
            console.log(playerScores);

            // Send the player answer results to the server
            const socket: any = socketService.socket;
            const response = await gameService.endRound(socket, correctAnswers).catch((err) => {
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
                if (timeRemaining <= 1 || playerList.length === Object.keys(playerAnswers).length) {
                    // Timer is up or all players answered
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

    }, [timerActive, timeRemaining, playerList.length, playerScores, playerAnswers, question, dispatch]);

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
            <h3>{question[0]}</h3>
            <LinearProgressWithLabel />
            <h3>Answered:</h3>
            {Object.keys(playerAnswers).map((name: any) =>
                <h4>{name}</h4>)
            }
        </div>
    );
}