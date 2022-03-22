# Partyfish

<a href="https://socket.io/"><img alt="npm" src="https://img.shields.io/npm/v/socket.io?label=socket.io"></a>
<a href="https://reactjs.org/"><img alt="npm" src="https://img.shields.io/npm/v/react?label=react"></a>
<a href="https://github.com/partyfishgames/partyfish/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/partyfishgames/partyfish"></a>
<a href="https://github.com/partyfishgames/partyfish/blob/main/LICENSE"><img alt="GitHub license" src="https://img.shields.io/github/license/partyfishgames/partyfish"></a>
<a href="https://github.com/partyfishgames/partyfish/issues"><img alt="GitHub issues" src="https://img.shields.io/github/issues/partyfishgames/partyfish"></a>

This repo contains the client and server code for our open source game Partyfish which can be played on [our hosted version](partyfish.app).


## Installation

Navigate to both the `client` and `server` folders and do an npm install

```bash
cd client
npm install

cd server
npm install
```

## Client Setup (.env)
To allow the client to connect with the server, you must create a `.env` file to specify where the client must connect to. A `.env.sample` file is provided with the variable

```bash
REACT_APP_PARTYFISH_SERVER=localhost:9000
```
This is setup to interact with the server code locally, as when the server is run it will run locally on port 9000.


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