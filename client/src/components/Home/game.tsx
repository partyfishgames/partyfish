import { Box, List, ListItem, ListItemButton, ListItemText, Paper, Typography } from "@mui/material";
import { useAppSelector } from "../../hooks";
import { useAppDispatch } from "../../hooks";
import { TrivalryHostPage } from "../Trivalry/HostPage";

const selectGameStats = (state: { gameStats: any }) => state.gameStats; // select for game stats

export function GamePage() {
    
    const dispatch = useAppDispatch(); // included in any component that dispatches actions
    
    const gameStats = useAppSelector(selectGameStats); 

    // This function is called when the host starts the next game round
    const chooseTrivalry = async (e: React.FormEvent) => {
        e.preventDefault(); // Prevent the page from refreshing
        dispatch({ type: 'gameStats/setGameType', payload: 'Trivalry'}); 
    } 

    function GameChoices() {
        return (
            <div style={{ textAlign: "center" }}>
                <Box sx={{ paddingTop: 1, my: 1, mx: 1 }}>
                        <Paper elevation={3} style={{ color: "#2196f3", background: "#FFE6AB" }} sx={{px:1,}} >
                            <h3 >
                                Choose a Game Below
                            </h3>
                        </Paper>
                </Box>
                <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                    <List>
                    <ListItem disablePadding onClick={chooseTrivalry}>
                        <ListItemButton>
                        <ListItemText primary="Trivalry" />
                        </ListItemButton>
                    </ListItem>
                    </List>
                </Box>
            </div>
        );
    }

    return (
        <div style={{ textAlign: "center"}}>
            { gameStats.gameType === 'Trivalry' ? <TrivalryHostPage /> : <GameChoices />}
        </div>
    );
}