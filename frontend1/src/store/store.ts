import { configureStore } from '@reduxjs/toolkit';

import { attachAuthInterceptors } from '../services/api';
import { authReducer } from '../features/auth/authSlice';
import { eventosReducer } from '../features/eventos/eventosSlice';
import { servicosReducer } from '../features/servicos/servicosSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    eventos: eventosReducer,
    servicos: servicosReducer
  }
});

attachAuthInterceptors(() => store.getState());

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
