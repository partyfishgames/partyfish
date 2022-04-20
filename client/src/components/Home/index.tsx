import { Button, Grid, TextField, Paper, Box, createTheme, ThemeProvider, Typography } from "@mui/material";
import React, { useState } from "react";
import roomService from "../../services/roomService";
import socketService from "../../services/socketService";
import { useAppDispatch } from "../../hooks";

import Bubbles from "../../images/bubbles.png";

export function HomePage() {
    const dispatch = useAppDispatch(); // included in any component that dispatches actions

    const cartoonTheme = createTheme({
        typography: {
            fontFamily: [
                'Chicle',
                'cursive',
            ].join(','),
        },
    });

    // Variables to hold the intermediate entry while the user is typing
    const [playerRoomCode, setPlayerRoomCode] = useState('');
    const [pUsername, setPUsername] = useState('');

    // This function is called when the user types something in the room code textfield
    // and updates the state
    const handleRoomCodeChange = (e: React.ChangeEvent<any>) => {
        if(e.target.value.length <= 4)
            setPlayerRoomCode(e.target.value);
        else{
            e.target.value = e.target.value.substring(0,3);
        }
    }

    // This function is called when the user types something in the username textfield
    // and updates the state with the new value
    const handleUsernameChange = (e: React.ChangeEvent<any>) => {
        setPUsername(e.target.value);
    }

    // This function is called when the user presses the "host" button
    const hostRoom = async (e: React.FormEvent) => {

        // Prevent the page from refreshing
        e.preventDefault();

        // Get our socket and tell the server to host a room by calling our roomService.hostRoom function
        const socket: any = socketService.socket;
        const joined = await roomService.hostRoom(socket).catch((err) => {
            alert(err);
        });

        // Update state variables to display the new host screen
        if (joined) {

            // Update global redux state's room code and set user to 'Host'
            dispatch({ type: 'gameStats/setGameCode', payload: joined });
            dispatch({ type: 'player/setUsername', payload: 'Host' });
        }
    }

    // This function is called when the user presses the "join" button
    const joinRoom = async (e: React.FormEvent) => {

        // Prevent the page from refreshing
        e.preventDefault();

        // Trimming room code and username to prevent spacing issues
        const trimmedUsername = pUsername.trim();
        const trimmedRoom = playerRoomCode.trim().toLowerCase();

        if (trimmedUsername.length === 0) {
            alert("Please enter a username!");
        } else {
            // Get our socket and tell the server to join a room with the current id and our username
            const socket: any = socketService.socket;
            const joined = await roomService.joinRoom(socket, trimmedRoom, trimmedUsername).catch((err) => {
                alert(err);
            });

            if (joined) {

                // Update global redux state's room code and user's name
                dispatch({ type: 'gameStats/setGameCode', payload: joined });
                dispatch({ type: 'player/setUsername', payload: trimmedUsername });
            }
        }
    }

    return (
        <div style={{ textAlign: "center" }}>
            <Box sx={{ mx: 2, my: 2 }}>
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
                        <Typography padding={1} component="h1" variant="h3" color="2196f3" gutterBottom>
                            Welcome to PartyFish
                        </Typography>
                    </ThemeProvider>
                </Paper>
            </Box>
            <Box sx={{mx:10}}>
                <Paper
                    elevation={3}
                    sx={{
                        mx: 2,
                        my: 2,
                        backgroundSize: "cover",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        backgroundImage: `url(${Bubbles})`,
                    }}
                >
                    <Box sx={{ paddingTop: 1, my: 1, mx: 1 }}>
                        <Paper elevation={3} style={{ color: "#2196f3", background: "#FFE6AB" }} sx={{px:1,}} >
                            <h3 >
                                What would you like to do?
                            </h3>
                        </Paper>
                        <Grid
                            container
                            spacing={2}
                            justifyContent="center"
                            alignItems="center"
                            sx={{ml:"-8px"}}
                        >
                            <Grid item md={4}>
                                <Box sx={{ml:"-12px", my: 1}}>
                                    <Paper
                                        elevation={4}
                                        sx={{ px: 1, py: 1,}}
                                        style={{
                                            background: "#FFE6AB",
                                            //height: "250px",
                                            //width: "250px",
                                        }}
                                    >
                                        <form onSubmit={hostRoom}>
                                            <Button
                                                variant="contained"
                                                type="submit"
                                                style={{ color: "#2196f3" }}
                                                sx={{
                                                    backgroundSize: "cover",
                                                    backgroundRepeat: "no-repeat",
                                                    backgroundPosition: "center",
                                                    backgroundImage: `url(${Bubbles})`,
                                                }}
                                            >
                                                Host Room
                                            </Button>
                                        </form >
                                    </Paper>
                                </Box>
                            </Grid>
                            <Grid item md={4}>
                                <Grid
                                    container
                                    spacing={2}
                                    direction="column"
                                    justifyContent="space-around"
                                    alignItems="center"
                                >
                                    <Box sx={{ mx: 1, my: 1 }}>
                                        <Paper
                                            elevation={4}
                                            sx={{ px: 1, py: 1, }}
                                            style={{
                                                background: "#FFE6AB",
                                                //height: "250px",
                                                //width: "250px",
                                            }}
                                        >
                                            <Grid item sx={{ px: 1, py: 1, mt: 2 }}>
                                                <TextField autoComplete="false" spellCheck="false" value={playerRoomCode} onChange={handleRoomCodeChange} id="outlined-basic" label="Room Code" variant="outlined" style={{ background: "#DFF6FF" }} />
                                            </Grid>
                                            <Grid item sx={{px: 1,}}>
                                                <TextField autoComplete="false" spellCheck="false" value={pUsername} onChange={handleUsernameChange} id="outlined-basic" label="Username" variant="outlined" style={{ background: "#DFF6FF" }} />
                                            </Grid>
                                            <Grid item>
                                                <form onSubmit={joinRoom}>
                                                    <Button
                                                        variant="contained"
                                                        type="submit"
                                                        style={{ color: "#2196f3" }}
                                                        sx={{
                                                            mt: 1,
                                                            mb: 2,
                                                            backgroundSize: "cover",
                                                            backgroundRepeat: "no-repeat",
                                                            backgroundPosition: "center",
                                                            backgroundImage: `url(${Bubbles})`,

                                                        }}
                                                    >
                                                        Join Room
                                                    </Button>
                                                </form>
                                            </Grid>
                                        </Paper>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>
            </Box>
        </div>
    );
}
