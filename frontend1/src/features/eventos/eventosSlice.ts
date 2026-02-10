import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import type { AvaliacaoStats, Evento } from './eventosTypes';
import * as eventosService from './eventosService';

export type EventosState = {
  items: Evento[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  mutationStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  mutationError: string | null;
  statsById: Record<string, AvaliacaoStats | undefined>;
};

const initialState: EventosState = {
  items: [],
  status: 'idle',
  error: null,
  mutationStatus: 'idle',
  mutationError: null,
  statsById: {}
};

export const fetchEventos = createAsyncThunk('eventos/fetchAll', async () => {
  return await eventosService.listarEventos();
});

export const fetchEventoStats = createAsyncThunk('eventos/fetchStats', async (eventoId: string) => {
  const stats = await eventosService.obterStatsEvento(eventoId);
  return { eventoId, stats };
});

export const createEvento = createAsyncThunk('eventos/create', async (input: eventosService.EventoUpsertInput) => {
  return await eventosService.criarEvento(input);
});

export const updateEvento = createAsyncThunk(
  'eventos/update',
  async (payload: { eventoId: string; input: eventosService.EventoUpsertInput }) => {
    return await eventosService.atualizarEvento(payload.eventoId, payload.input);
  }
);

export const deleteEvento = createAsyncThunk('eventos/delete', async (eventoId: string) => {
  await eventosService.deletarEvento(eventoId);
  return { eventoId };
});

const eventosSlice = createSlice({
  name: 'eventos',
  initialState,
  reducers: {
    setStats(state, action: PayloadAction<{ eventoId: string; stats: AvaliacaoStats }>) {
      state.statsById[action.payload.eventoId] = action.payload.stats;
    }
  },
  extraReducers(builder) {
    builder
      .addCase(fetchEventos.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchEventos.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchEventos.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Falha ao carregar eventos';
      })
      .addCase(fetchEventoStats.fulfilled, (state, action) => {
        state.statsById[action.payload.eventoId] = action.payload.stats;
      })

      .addCase(createEvento.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = null;
      })
      .addCase(createEvento.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        state.items.unshift(action.payload);
      })
      .addCase(createEvento.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.error.message ?? 'Falha ao criar evento';
      })

      .addCase(updateEvento.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = null;
      })
      .addCase(updateEvento.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        const evento = action.payload;
        const idx = state.items.findIndex((e) => e._id === evento._id);
        if (idx >= 0) state.items[idx] = evento;
        else state.items.unshift(evento);
      })
      .addCase(updateEvento.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.error.message ?? 'Falha ao atualizar evento';
      })

      .addCase(deleteEvento.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = null;
      })
      .addCase(deleteEvento.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        const { eventoId } = action.payload;
        state.items = state.items.filter((e) => e._id !== eventoId);
        delete state.statsById[eventoId];
      })
      .addCase(deleteEvento.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.error.message ?? 'Falha ao remover evento';
      });
  }
});

export const { setStats } = eventosSlice.actions;
export const eventosReducer = eventosSlice.reducer;
