// Initial Global Redux States 

const initialGameStats: any = {
    gameCode: '',
    gameType: '',
    numPlayers: 0,
    gameStarted: false,
    roundInProgress: false,
    gameOver: false,
    roundNumber: 0,
}; // holds game statistics 

const initialPlayer: any = {
    username: '',
    roundResult: false,
    score: 250,
}; // holds individual player information

const initialPlayerLists: any = {
    allPlayers: [],
    alivePlayers: [],
    deadPlayers: [],
}; // holds the lists of players 

const initialScores: any = {}; // holds the players' current scores

const initialAnswers: any = {}; // holds the players' answers

const initialQuestion: any = ['NONE']; // holds the round question

// Reducers to update the Global States 

// Reducer to respond to actions regarding the game's logistics 
export function gameStatsReducer(state = initialGameStats, action: any) {
    switch (action.type) {
        case 'gameStats/setGameCode': 
          return { ...state, gameCode: action.payload}
        case 'gameStats/setGameType': 
            return { ...state, gameType: action.payload}
        case 'gameStats/setNumPlayers': 
            return { ...state, numPlayers: action.payload}
        case 'gameStats/setRoundInProgress': 
            return { ...state, roundInProgress: action.payload}
        case 'gameStats/setGameStarted': 
            return { ...state, gameStarted: action.payload}
        case 'gameStats/setGameOver': 
            return { ...state, gameOver: action.payload}
        case 'gameStats/incrementRoundNumber': {
            return {...state, roundNumber: state.roundNumer + 1}
        }
        default:
            return state
    }
}

// Reducer to respond to actions regarding the list of players 
export function playerListsReducer(state = initialPlayerLists, action: any) {
    switch (action.type) {
        case 'playerList/setAllPlayers': {
          return {...state, allPlayers: action.payload}
        }
        case 'playerList/setAlivePlayers': {
            return {...state, alivePlayers: action.payload}
        }
        case 'playerList/removeAlivePlayer': {
            return {...state, alivePlayers: state.alivePlayers.filter((player: string) => player !== action.payload)}
        }
        case 'playerList/addDeadPlayer': {
            return {...state, deadPlayers: [...state.deadPlayers, action.payload]}
        }
        default:
            return state
    }
}

// Reducer to respond to actions regarding the players' scores 
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

// Reducer to respond to actions regarding an individual player
export function playerReducer(state = initialPlayer, action: any) {
    switch (action.type) {
        case 'player/setUsername': {
          return {...state, username: action.payload}
        }
        case 'player/setRoundResult': {
            return {...state, roundResult: action.payload}
        }
        case 'player/increaseScore': {
            return {...state, score: state.score + action.payload}
        }
        case 'player/attackPlayer': {
            return {...state, score: state.score - 50}
        }
        default:
            return state
    }
}

// Reducer to respond to actions regarding the current round question 
export function questionReducer(state = initialQuestion, action: any) {
    switch (action.type) {
        case 'question/set': {
          return action.payload
        }
        default:
            return state
    }
}