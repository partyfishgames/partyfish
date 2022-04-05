import { Box, List, ListItem, ListItemButton, ListItemText, Paper, ThemeProvider, Typography,createTheme } from "@mui/material";
import { useAppSelector } from "../../hooks";
import { useAppDispatch } from "../../hooks";
import { TrivalryHostPage } from "../Trivalry/HostPage";

import Bubbles from "../../images/bubbles.png";


const selectGameStats = (state: { gameStats: any }) => state.gameStats; // select for game stats

export function GamePage() {

    const cartoonTheme = createTheme({
        typography: {
            fontFamily: [
                'Chicle',
                'cursive',
            ].join(','),
        },
    });

    const islandTheme = createTheme({
        typography: {
            fontFamily: [
                'Syne Mono', 
                'monospace'
            ].join(','),
            fontSize: 22,
            fontWeightRegular:500,
        },
    });

    
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
                        <Paper                     
                            elevation={4}
                            sx={{
                                mx: 2,
                                my: 2,
                                backgroundSize: "cover",
                                backgroundRepeat: "no-repeat",
                                backgroundPosition: "center",
                                backgroundImage: `url(${Bubbles})`,
                            }}
                        >
                            <ThemeProvider theme={cartoonTheme}>
                                <Typography padding={1} component="h1" variant="h4" color="2196f3" gutterBottom>
                                    Choose Game Below
                                </Typography>
                            </ThemeProvider>
                        </Paper>
                </Box>
                <Box sx={{ paddingTop: 1, my: 1, mx: 1 }}>
                <Paper elevation={3} sx={{mx:2,}} style={{ color: "#2196f3", background: "#FFE6AB" }} >
                    <List>
                    <ThemeProvider theme={islandTheme}>
                        <Box sx={{my: 1, mx: 14}}>
                            <Paper elevation={3}  style={{color:"#A6CF98", background: "#AD8B73"}}>
                                <ListItem disablePadding onClick={chooseTrivalry} > 
                                    <ListItemButton>
                                    <ListItemText sx={{textAlign:"center"}} primary="Trivalry" />
                                    </ListItemButton>
                                </ListItem>
                            </Paper>
                        </Box>
                    </ThemeProvider>
                    </List>
                    </Paper>
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