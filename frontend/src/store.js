// src/store.js
import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { userLoginReducer } from './redux/reducers/userReducers';

const rootReducer = combineReducers({
  userLogin: userLoginReducer,
});

const store = configureStore({
  reducer: rootReducer,
  
  devTools: true,
});

export default store;
