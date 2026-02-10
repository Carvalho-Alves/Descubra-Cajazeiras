import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import type { AvaliacaoStats, Servico } from './servicosTypes';
import * as servicosService from './servicosService';

export type ServicosState = {
  items: Servico[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  mutationStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  mutationError: string | null;
  statsById: Record<string, AvaliacaoStats | undefined>;
  detailsStatusById: Record<string, 'idle' | 'loading' | 'succeeded' | 'failed' | undefined>;
  detailsErrorById: Record<string, string | undefined>;
};

const initialState: ServicosState = {
  items: [],
  status: 'idle',
  error: null,
  mutationStatus: 'idle',
  mutationError: null,
  statsById: {},
  detailsStatusById: {},
  detailsErrorById: {}
};

export const fetchServicos = createAsyncThunk('servicos/fetchAll', async () => {
  return await servicosService.listarServicos();
});

export const fetchServicoStats = createAsyncThunk('servicos/fetchStats', async (servicoId: string) => {
  const stats = await servicosService.obterStatsServico(servicoId);
  return { servicoId, stats };
});

export const fetchServicoById = createAsyncThunk('servicos/fetchById', async (servicoId: string) => {
  return await servicosService.obterServico(servicoId);
});

export const createServico = createAsyncThunk('servicos/create', async (input: servicosService.ServicoUpsertInput) => {
  return await servicosService.criarServico(input);
});

export const updateServico = createAsyncThunk(
  'servicos/update',
  async (payload: { servicoId: string; input: servicosService.ServicoUpsertInput }) => {
    return await servicosService.atualizarServico(payload.servicoId, payload.input);
  }
);

export const deleteServico = createAsyncThunk('servicos/delete', async (servicoId: string) => {
  await servicosService.deletarServico(servicoId);
  return { servicoId };
});

const servicosSlice = createSlice({
  name: 'servicos',
  initialState,
  reducers: {
    setStats(state, action: PayloadAction<{ servicoId: string; stats: AvaliacaoStats }>) {
      state.statsById[action.payload.servicoId] = action.payload.stats;
    }
  },
  extraReducers(builder) {
    builder
      .addCase(fetchServicos.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchServicos.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchServicos.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Falha ao carregar serviços';
      })
      .addCase(fetchServicoStats.fulfilled, (state, action) => {
        state.statsById[action.payload.servicoId] = action.payload.stats;
      })
      .addCase(fetchServicoById.pending, (state, action) => {
        const id = action.meta.arg;
        state.detailsStatusById[id] = 'loading';
        state.detailsErrorById[id] = undefined;
      })
      .addCase(fetchServicoById.fulfilled, (state, action) => {
        const servico = action.payload;
        const id = servico._id;
        const idx = state.items.findIndex((s) => s._id === id);
        if (idx >= 0) state.items[idx] = servico;
        else state.items.push(servico);
        state.detailsStatusById[id] = 'succeeded';
        state.detailsErrorById[id] = undefined;
      })
      .addCase(fetchServicoById.rejected, (state, action) => {
        const id = action.meta.arg;
        state.detailsStatusById[id] = 'failed';
        state.detailsErrorById[id] = action.error.message ?? 'Falha ao carregar detalhes do serviço';
      })

      .addCase(createServico.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = null;
      })
      .addCase(createServico.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        const servico = action.payload;
        state.items.unshift(servico);
      })
      .addCase(createServico.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.error.message ?? 'Falha ao criar serviço';
      })

      .addCase(updateServico.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = null;
      })
      .addCase(updateServico.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        const servico = action.payload;
        const idx = state.items.findIndex((s) => s._id === servico._id);
        if (idx >= 0) state.items[idx] = servico;
        else state.items.unshift(servico);
      })
      .addCase(updateServico.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.error.message ?? 'Falha ao atualizar serviço';
      })

      .addCase(deleteServico.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = null;
      })
      .addCase(deleteServico.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        const { servicoId } = action.payload;
        state.items = state.items.filter((s) => s._id !== servicoId);
        delete state.statsById[servicoId];
        delete state.detailsStatusById[servicoId];
        delete state.detailsErrorById[servicoId];
      })
      .addCase(deleteServico.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.error.message ?? 'Falha ao remover serviço';
      });
  }
});

export const { setStats } = servicosSlice.actions;
export const servicosReducer = servicosSlice.reducer;
