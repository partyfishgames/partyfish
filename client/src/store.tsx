import { configureStore } from '@reduxjs/toolkit'
import { gameStatsReducer, playerListsReducer, scoresReducer, playerReducer, answersReducer, questionReducer } from './reducers'

// React-Redux Store to combine the reducers and hold the global state 
export const store = configureStore({
  reducer: {
    gameStats: gameStatsReducer,
    playerLists: playerListsReducer,
    scores: scoresReducer,
    player: playerReducer,
    answers: answersReducer,
    question: questionReducer,
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch 