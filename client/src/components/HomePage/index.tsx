import { Button, Grid, TextField } from "@mui/material";
import React, { useState } from "react";
import roomService from "../../services/roomService";
import socketService from "../../services/socketService";
import { useAppDispatch } from "../../hooks";

export function HomePage() {
    const dispatch = useAppDispatch(); // included in any component that dispatches actions

    // Variables to hold the intermediate entry while the user is typing
    const [ playerRoomCode, setPlayerRoomCode ] = useState('');
    const [ pUsername, setPUsername ] = useState('');

    // This function is called when the user types something in the room code textfield
    // and updates the state
    const handleRoomCodeChange = (e: React.ChangeEvent<any>) => {
        console.log(e.target.value);
        setPlayerRoomCode(e.target.value);
    }

    // This function is called when the user types something in the username textfield
    // and updates the state with the new value
    const handleUsernameChange = (e: React.ChangeEvent<any>) => {
        console.log(e.target.value);
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
            dispatch({type: 'gameStats/setGameCode', payload: joined});
            dispatch({type: 'player/setUsername', payload: 'Host'});
        }
    }

    // This function is called when the user presses the "join" button
    const joinRoom = async (e: React.FormEvent) => {

        // Prevent the page from refreshing
        e.preventDefault();

        // Get our socket and tell the server to join a room with the current id and our username
        const socket: any = socketService.socket;
        const joined = await roomService.joinRoom(socket, playerRoomCode, pUsername).catch((err) => {
            alert(err);
        });

        if (joined) {

            // Update global redux state's room code and user's name
            dispatch({type: 'gameStats/setGameCode', payload: joined});
            dispatch({type: 'player/setUsername', payload: pUsername});
        }
    }

    return (
        <div style={{ textAlign: "center" }}>
            <h1 style={{ color: "#2196f3" }}>Welcome to PartyFish</h1>

            <Grid container
                spacing={2}
                style={{ height: '300px' }}
                justifyContent="center"
                alignItems="center"
            >
                <Grid item xs={3}>
                    <Grid container
                        direction="row"
                        justifyContent="center"
                        alignItems="center">
                        <Grid item>
                            <form onSubmit={hostRoom}>
                                <Button variant="contained" type="submit">Host Room</Button>
                            </form >
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={3}>
                    <Grid container spacing={2} direction="column" justifyContent="space-around" alignItems="center">
                        <Grid item>
                            <TextField value={playerRoomCode} onChange={handleRoomCodeChange} id="outlined-basic" label="Room Code" variant="outlined" />
                        </Grid>
                        <Grid item>
                            <TextField value={pUsername} onChange={handleUsernameChange} id="outlined-basic" label="Username" variant="outlined" />
                        </Grid>
                        <Grid item>
                            <form onSubmit={joinRoom}>
                                <Button variant="contained" type="submit">Join Room</Button>
                            </form>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </div>
    );
}