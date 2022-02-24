import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useEffect, useState } from "react";
import { useAppSelector } from "../../../../hooks";

const selectAnswers = (state: { answers: any }) => state.answers; // select for player answers
const selectQuestion = (state: { question: string }) => state.question; // select for game stats

export function QuestionPage() {

    const playerAnswers = useAppSelector(selectAnswers); // Grab our player's answers from the global state
    const question = useAppSelector(selectQuestion); // Grab our current round question from the global state

    /* timer functionality for gameplay => begin the timer */
    const [timeRemaining, setTimeRemaining] = useState(30);
    const [timerActive, setTimerActive] = useState(true);

    useEffect(() => {

        let interval = 0;
        if (timerActive) {
            interval = window.setInterval(() => {
                console.log(timeRemaining);
                setTimeRemaining(seconds => seconds - 1);
                if(timeRemaining <= 1) {
                    setTimerActive(false);
                }
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
        
    }, [timerActive, timeRemaining]);

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