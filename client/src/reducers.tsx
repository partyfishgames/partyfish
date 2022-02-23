// Initial Global States 
const initialGameStats: any = {
    gameCode: '',
    gameType: '',
    numPlayers: 0,
}

const initialPlayer: string = ''
const initialPlayerList: Array<string> = []
const initialScores: any = {}

// Reducer to respond to actions regarding the list of players 
export function playerListReducer(state = initialPlayerList, action: any) {
    switch (action.type) {
        case 'playerList/set': {
          return action.payload
        }
        default:
            return state
    }
}

// Reducer to respond to actions regarding the game's logistics 
export function gameStatsReducer(state = initialGameStats, action: any) {
    switch (action.type) {
        case 'gameStats/setGameCode': 
          return { ...state, gameCode: action.payload}
        case 'gameStats/setGameType': 
            return { ...state, gameType: action.payload}
        case 'gameStats/setNumPlayers': 
            return { ...state, numPlayers: action.payload}
        case 'gameStats/setIsHost':
            return { ...state, isHost: action.payload}
        default:
            return state
    }
}

// Reducer to respond to actions regarding the player (either player username or 'Host') 
export function playerReducer(state = initialPlayer, action: any) {
    switch (action.type) {
        case 'player/setUsername': {
          return action.payload
        }
        default:
            return state
    }
}

// Reducer to respond to actions regardinng the players' scores 
export function scoresReducer(state = initialScores, action: any) {
    switch (action.type) {
        case '': {
          return state
        }
        default:
            return state
    }
}