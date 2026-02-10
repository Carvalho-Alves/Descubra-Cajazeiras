import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import type { AuthUser, LoginRequest, RegisterRequest } from './authTypes';
import * as authService from './authService';
import { getFromStorage, removeFromStorage, setToStorage } from '../../utils/storage';

const STORAGE_KEY = 'dc_auth';

type PersistedAuth = {
  token: string | null;
  user: AuthUser | null;
};

export type AuthState = {
  token: string | null;
  user: AuthUser | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
};

const persisted = getFromStorage<PersistedAuth>(STORAGE_KEY);

const initialState: AuthState = {
  token: persisted?.token ?? null,
  user: persisted?.user ?? null,
  status: 'idle',
  error: null
};

export const loginUser = createAsyncThunk('auth/login', async (request: LoginRequest) => {
  return await authService.login(request);
});

export const registerUser = createAsyncThunk('auth/register', async (request: RegisterRequest) => {
  await authService.register(request);
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      state.status = 'idle';
      state.error = null;
      removeFromStorage(STORAGE_KEY);
    },
    hydrate(state, action: PayloadAction<PersistedAuth>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      setToStorage(STORAGE_KEY, action.payload);
    }
  },
  extraReducers(builder) {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
        setToStorage(STORAGE_KEY, { token: state.token, user: state.user });
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Falha ao realizar login';
      })
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Falha ao cadastrar';
      });
  }
});

export const { logout, hydrate } = authSlice.actions;
export const authReducer = authSlice.reducer;
