import { Button, Grid, TextField } from "@mui/material";
import React, { useContext, useEffect } from "react";
import gameContext from "../../gameContext";
import gameService from "../../services/gameService";
import socketService from "../../services/socketService";
import { useAppDispatch } from "../../hooks";

interface IHostRoomProps { }

export function HomePage(props: IHostRoomProps) {
    const dispatch = useAppDispatch(); // included in any component that dispatches actions

    // Grab the game context variables and their setter methods
    const { setInRoom, setIsHost, roomCode, setRoomCode, pUsername, setPUsername, } = useContext(gameContext);

    // This function is called when the user types something in the room code textfield
    // and updates the state
    const handleRoomCodeChange = (e: React.ChangeEvent<any>) => {
        console.log(e.target.value);
        setRoomCode(e.target.value);
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

        // Get our socket and tell the server to host a room by calling our gameService.hostRoom function
        const socket: any = socketService.socket;
        const joined = await gameService.hostRoom(socket).catch((err) => {
            alert(err);
        });

        // Update state variables to display the new host screen
        if (joined) {
            setInRoom(true);
            setRoomCode(joined);
            setIsHost(true);

            // Update global redux state's room code and set user to 'Host' 
            dispatch({type: 'gameCode/set', payload: joined});
            dispatch({type: 'player/set', payload: 'Host'});
        }
    }

    // This function is called when the user presses the "join" button
    const joinRoom = async (e: React.FormEvent) => {

        // Prevent the page from refreshing
        e.preventDefault();

        // Get our socket and tell the server to join a room with the current id and our username
        const socket: any = socketService.socket;
        const joined = await gameService.joinRoom(socket, roomCode, pUsername).catch((err) => {
            alert(err);
        });

        if (joined) {
            setInRoom(true);

            // Update global redux state's room code and user's name
            dispatch({type: 'gameCode/set', payload: joined});
            dispatch({type: 'player/set', payload: pUsername});
        }
    }

    useEffect(() => {
        
      }, []);

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
                            <TextField value={roomCode} onChange={handleRoomCodeChange} id="outlined-basic" label="Room Code" variant="outlined" />
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