# Partyfish Prototype

This is our initial prototype for partyfish code setup

## Installation

Navigate to both the `client` and `server` folders and do an npm install

```bash
cd client
npm install

cd server
npm install
```

## Usage

Have the server and client running at the same time to run this project. It is helpful to have two terminals, one to run the server and one to run the client. The client will be on `localhost:3000` and the server will be on `localhost:9000`. Navigate to your web browser (with the server running) and go to `localhost:3000` to access the frontend.

```bash
cd client
npm start

cd server
npm start
```

## Important Client Files
* `src/components/HomePage/index.tsx` - this file is what is displayed when a user first navigates to the game (has Host or Join buttons)
* `src/components/HostPage/index.tsx` - this file is what is shown once a user is confirmed to be a Host and has their own room code
* `src/components/PlayerPage/index.tsx` - this file is shown once a player hits join and successfully enters a room
* `src/services/gameService/index.ts` - this file contains all the Socket.io logic for joining or hosting a room

## Important Server Files
* `src/api/controllers/roomController.ts` - this has all the important server logic for hosting and joining rooms/managing room state
* `src/api/controllers/mainController.ts` - this has just one function and its for the initial socket connection (not that interesting)
* `src/api/controllers/gameController.ts` - this is a legacy file from the TicTacTorial but has some interesting functions to take a look at