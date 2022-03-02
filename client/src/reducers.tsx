// Initial Global Redux States 

const initialGameStats: any = {
    gameCode: '',
    gameType: '',
    numPlayers: 0,
    gameStarted: false,
    roundInProgress: false,
    health: 0,
    points: 0
}

const initialPlayer: any = {
    username: '',
    roundResult: false,
}

const initialPlayerList: Array<string> = []
const initialScores: any = {}
const initialAnswers: any = {}
const initialHealth: any = {}
const initialQuestion: any = ['NONE']

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
        case 'gameStats/toggleRoundInProgress': 
            return { ...state, roundInProgress: action.payload}
        case 'gameStats/toggleGameStarted': 
            return { ...state, gameStarted: action.payload}
        case 'gameStats/setHealth': 
            return { ...state, health: action.payload}
        case 'gameStats/setPoints': 
            return { ...state, points: action.payload}
        default:
            return state
    }
}

// Reducer to respond to actions regarding the player (either player username or 'Host') 
export function playerReducer(state = initialPlayer, action: any) {
    switch (action.type) {
        case 'player/setUsername': {
          return {...state, username: action.payload}
        }
        case 'player/setRoundResult': {
            return {...state, roundResult: action.payload}
        }
        default:
            return state
    }
}

// Reducer to respond to actions regarding the round question 
export function questionReducer(state = initialQuestion, action: any) {
    switch (action.type) {
        case 'question/set': {
          return action.payload
        }
        default:
            return state
    }
}

// Reducer to respond to actions regardinng the players' scores 
export function scoresReducer(state = initialScores, action: any) {
    switch (action.type) {
        case 'scores/addScore': {
            return {
                ...state,
                ...action.payload,
            }
        }
        default:
            return state
    }
}

// Reducer to respond to actions regardinng the players' scores 
export function healthReducer(state = initialHealth, action: any) {
    switch (action.type) {
        case 'health/addHealth': {
            return {
                ...state,
                ...action.payload,
            }
        }
        default:
            return state
    }
}


// Reducer to respond to actions regardinng the players' answers in current round 
export function answersReducer(state = initialAnswers, action: any) {
    switch (action.type) {
        case 'answers/addAnswer': {
          return {
              ...state,
              ...action.payload,
          }
        }
        case 'answers/reset': {
            return initialAnswers
        }
        default:
            return state
    }
}