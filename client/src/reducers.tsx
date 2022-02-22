// Initial Global States 
const initialGameCode: string = ''
const initialPlayerList: Array<string> = []
const initialScores: any = {}
const initialPlayer: string = ''

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

// Reducer to respond to actions regarding the game code 
export function gameCodeReducer(state = initialGameCode, action: any) {
    switch (action.type) {
        case 'gameCode/set': {
          return action.payload
        }
        default:
            return state
    }
}

// Reducer to respond to actions regarding the player (either player username or 'Host') 
export function playerReducer(state = initialPlayer, action: any) {
    switch (action.type) {
        case 'player/set': {
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