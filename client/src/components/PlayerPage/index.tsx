import { useEffect, useState } from "react";
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';

import gameService from "../../services/gameService";
import socketService from "../../services/socketService";
import { useAppDispatch, useAppSelector } from "../../hooks";

const selectQuestion = (state: { question: string }) => state.question; // select for question
const selectGameStats = (state: { gameStats: any }) => state.gameStats; // select for game stats
const selectPlayer = (state: {player: any}) => state.player; // select for player 

export function PlayerPage() {

    const dispatch = useAppDispatch(); // included in any component that dispatches actions

    const [isLoading, setIsLoading] = useState(false);
    const [waitingText, setWaitingText] = useState("Waiting for game to start...");

    const question = useAppSelector(selectQuestion); // Grab our current round question from the global state
    const gameStats = useAppSelector(selectGameStats); // Grab our game code from the global state
    const player = useAppSelector(selectPlayer);

    // Listen for the player join event from roomService and update our state if one joins
    const handleNewQuestion = () => {
        if (socketService.socket)
            gameService.onSendQuestion(socketService.socket, (question) => {
                console.log(question);
                dispatch({ type: 'gameStats/toggleGameStarted', payload: true}); // Dispatch action to change playerList
                dispatch({ type: 'question/set', payload: question }); // Dispatch action to change question
                dispatch({ type: 'gameStats/toggleRoundInProgress', payload: true}); // Dispatch action to change playerList
            });
    };

    // Listen for the answer result event
    const handleRoundResult = () => {
        if (socketService.socket)
            gameService.onResult(socketService.socket, (result: boolean) => {
                console.log('round result: ' + result);
                dispatch({ type: 'gameStats/toggleRoundInProgress', payload: false}); 
                dispatch({ type: 'player/setRoundResult', payload: result}); 
            });
    };

    // This function is called when the user presses the "host" button
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

    useEffect(() => {
        handleNewQuestion();
        handleRoundResult();
    }, []);


    function TriviaQuestion() {
        return (
            <Grid container direction="row" alignItems="center" justifyContent="center">
                <Grid item>
                    {isLoading ?
                        <CircularProgress style={{ marginTop: "25px" }} /> :
                        <div>
                            <h3>{question[0]}</h3>
                            <ButtonGroup
                                orientation="vertical"
                                aria-label="vertical outlined button group"
                            >
                                <Button onClick={sendAnswer} id="1" key="1">{question[1]}</Button>
                                <Button onClick={sendAnswer} id="2" key="2">{question[2]}</Button>
                                <Button onClick={sendAnswer} id="3" key="3">{question[3]}</Button>
                            </ButtonGroup>
                        </div>
                    }
                </Grid>
            </Grid>
        )
    }

    return (
        <div style={{ textAlign: "center" }}>
            { !gameStats.gameStarted ? <h3>{waitingText}</h3> :  
                gameStats.roundInProgress && question[0] !== 'NONE' ? <TriviaQuestion /> : 
                !gameStats.roundInProgress && question[0] === 'NONE' ? <h3>You were {player.roundResult ? 'correct.' : 'incorrect.'}</h3> : 
                <h3>{waitingText}</h3>}
        </div>
    );
}