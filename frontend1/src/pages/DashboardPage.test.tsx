import React from 'react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import { DashboardPage } from './DashboardPage';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const mocks = vi.hoisted(() => {
  const apiGet = vi.fn();
  const state = {
    current: {
      auth: { user: { nome: 'Aluno' } }
    }
  };
  return { apiGet, state };
});

vi.mock('../services/api', () => {
  return {
    api: {
      get: mocks.apiGet
    }
  };
});

vi.mock('../hooks/reduxHooks', () => {
  return {
    useAppSelector: (selector: any) => selector(mocks.state.current)
  };
});

describe('DashboardPage', () => {
  beforeEach(() => {
    mocks.apiGet.mockReset();
    mocks.state.current = { auth: { user: { nome: 'Aluno' } } };
  });

  it('renderiza o heading e o nome do usuário', async () => {
    mocks.apiGet.mockResolvedValue({ data: { success: true, data: { totalPontos: 1, totalEventos: 2, totalAvaliacoes: 3, mediaGeral: 4.5 } } });

    render(<DashboardPage />);

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByText(/Logado como:/i)).toBeInTheDocument();
    expect(screen.getByText('Aluno')).toBeInTheDocument();

    await waitFor(() => {
      expect(mocks.apiGet).toHaveBeenCalled();
    });
  });

  it('mostra loading enquanto a API está pendente', () => {
    const d = deferred<any>();
    mocks.apiGet.mockReturnValue(d.promise);

    render(<DashboardPage />);

    expect(screen.getByText('Carregando estatísticas...')).toBeInTheDocument();
  });

  it('renderiza os cards quando a API retorna sucesso', async () => {
    mocks.apiGet.mockResolvedValue({
      data: {
        success: true,
        data: { totalPontos: 10, totalEventos: 20, totalAvaliacoes: 30, mediaGeral: 4.2 }
      }
    });

    render(<DashboardPage />);

    expect(await screen.findByText('Pontos', { selector: 'div' })).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Eventos', { selector: 'div' })).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('Avaliações', { selector: 'div' })).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('Média geral', { selector: 'div' })).toBeInTheDocument();
    expect(screen.getByText('4.2')).toBeInTheDocument();
  });

  it('mostra erro quando a API falha', async () => {
    mocks.apiGet.mockRejectedValue(new Error('Falha'));

    render(<DashboardPage />);

    expect(await screen.findByText('Falha')).toBeInTheDocument();
  });

  it('chama a API com o endpoint /estatisticas e usa fallback de usuário', async () => {
    mocks.state.current = { auth: { user: null } };
    mocks.apiGet.mockResolvedValue({ data: { success: true, data: { totalPontos: 0, totalEventos: 0, totalAvaliacoes: 0, mediaGeral: 0 } } });

    render(<DashboardPage />);

    expect(screen.getByText('Usuário')).toBeInTheDocument();

    await waitFor(() => {
      expect(mocks.apiGet).toHaveBeenCalledWith('/estatisticas');
    });
  });
});
