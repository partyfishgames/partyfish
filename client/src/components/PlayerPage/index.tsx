import { useEffect } from "react";

interface IPlayerPageProps { }

export function PlayerPage(props: IPlayerPageProps) {

    useEffect(() => {
        
      }, []);

    return (
        <div style={{ textAlign: "center" }}>
            <h1 style={{ color: "#2196f3" }}>Welcome to PartyFish</h1>

            <h4>Waiting for game to start...</h4>
        </div>
    );
}