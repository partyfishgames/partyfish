import { Grid } from "@mui/material";
import { useContext, useState, useEffect } from "react";
import gameContext from "../../gameContext";
import { useAppSelector } from "../../hooks";
import gameService from "../../services/gameService";
import socketService from "../../services/socketService";
import { useAppDispatch } from "../../hooks";

interface IHostPageProps { }

const selectPlayerList = (state: { playerList: any; }) => state.playerList; // select for player list state 

export function HostPage(props: IHostPageProps) {

    const dispatch = useAppDispatch(); // included in any component that dispatches actions

    // This state variable holds our player list so that whenever
    // we add a new player the page can grab this and change what is displayed
    const playerList = useAppSelector(selectPlayerList); // playerList is subscribed to changes from dispatched actions

    // Grab our room code we are in from the context
    const { roomCode } = useContext(gameContext);

    // Listen for the player join event from gameService and update our state if one joins
    const handlePlayerJoin = () => {
        if (socketService.socket)
            gameService.onPlayerJoin(socketService.socket, (playerNames) => {
                console.log(playerNames);
                dispatch({type: 'playerList/set', payload: playerNames}); // Dispatch action to change playerList
            });
    };

    useEffect(() => {

        // Constantly listen
        handlePlayerJoin();

    }, []);

    return (
        <div style={{ textAlign: "center" }}>
            <h1 style={{ color: "#2196f3" }}>Welcome to PartyFish</h1>

            <Grid container
                direction="row"
                style={{ height: '300px' }}
                justifyContent="center"
                alignItems="center"
            >
                <Grid item xs={5}>
                    <h4>Room Code</h4>
                    <h1>{roomCode}</h1>
                    <h4 style={{ paddingLeft: "15px", paddingRight: "15px" }}>Go to partyfish.io and enter code to join!</h4>
                </Grid>
                <Grid item xs={5}>
                    <h2>Players</h2>
                    {playerList.map((player: string) =>
                        <h4 key={player}>{player}</h4>
                    )}
                </Grid>
            </Grid>
        </div>
    );
}