import { useEffect, useState } from "react";
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';

import gameService from "../../services/gameService";
import socketService from "../../services/socketService";
import { useAppDispatch, useAppSelector } from "../../hooks";

import PepeSad from "../../images/pepesad.png";
import PepeHappy from "../../images/pepehappy.png";

const selectQuestion = (state: { question: string }) => state.question; // select for question
const selectGameStats = (state: { gameStats: any }) => state.gameStats; // select for game stats
const selectPlayer = (state: { player: any }) => state.player; // select for player 

export function PlayerPage() {

    const dispatch = useAppDispatch(); // included in any component that dispatches actions

    const [isLoading, setIsLoading] = useState(false);
    const [waitingText, setWaitingText] = useState("Waiting for game to start...");
    const [usernamesAtRisk, setUsernamesAtRisk] = useState<String[]>([]);
    const [attacked, setAttacked] = useState(false);
    //const [gameOver, setGameOver] = useState(false);

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
                    setUsernamesAtRisk(aliveUsers);
                    dispatch({ type: 'question/set', payload: ['NONE'] });
                    dispatch({ type: 'gameStats/toggleRoundInProgress', payload: false });
                    dispatch({ type: 'player/setRoundResult', payload: result });
                    dispatch({ type: 'player/increaseScore', payload: result });
                });
        };

        // Listen for an attack from another player event
        const handleAttack = () => {
            if (socketService.socket)
                gameService.onAttacked(socketService.socket, (attacker) => {
                    console.log(attacker + 'attacked you');
                    dispatch({ type: 'player/attackPlayer'});
                });
        };

        const handleGameEnd = () => {
            if (socketService.socket)
                gameService.onGameEnd(socketService.socket, () => {
                    console.log('Game is over');
                    //setGameOver(true);
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
        }
    });


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
                        <h3>{randomAnswer(true)}</h3>
                        <h2>Awarded {player.roundResult} points!</h2>
                        <img style={{ height: "80px", width: "auto" }} src={PepeHappy} alt="Happy Pepe"></img>
                        <h3>You have {player.score} pts</h3>
                        <h4>Choose a player to attack:</h4>
                        <ButtonGroup
                            orientation="vertical"
                            aria-label="vertical outlined button group"
                        >
                            {usernamesAtRisk.length > 0 ? !attacked ?
                                usernamesAtRisk.map((username, idx) => (
                                    <Button onClick={() => attackPlayer(username)} key={idx}>{username}</Button>
                                )) : <h4>Waiting for other attacks...</h4>
                                :
                                <h4>Everyone is safe!</h4>
                            }

                        </ButtonGroup>
                    </div>
                    :
                    <div>
                        <h3>{randomAnswer(false)}</h3>
                        <img style={{ height: "80px", width: "auto" }} src={PepeSad} alt="Sad Pepe"></img>
                        <h3>You have {player.score} pts</h3>
                        <h4>Opponents are choosing your fate...</h4>
                    </div>
                }
            </div>
        )
    }

    function GameOver() {
        return (
            <div>
                <h1>Thanks for playing!</h1>
                <img src={PepeHappy} style={{ height: "100px", width: "auto" }} alt="pepefinish"></img>
            </div>
        )
    }

    return (
        <div style={{ textAlign: "center" }}>
            {!gameStats.gameStarted ? <h3>{waitingText}</h3> : (gameStats.gameOver ? <GameOver /> : 
                (player.score === 0 ? <h3>You're dead, lol.</h3> :
                (gameStats.roundInProgress && question[0] !== 'NONE' ? <TriviaQuestion /> :
                    (!gameStats.roundInProgress && question[0] === 'NONE' ? <RoundResult /> :
                        <h3>{waitingText}</h3>))))}
        </div>
    );
}