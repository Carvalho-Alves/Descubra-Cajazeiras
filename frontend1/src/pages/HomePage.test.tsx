import React from 'react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mocks = vi.hoisted(() => {
  const dispatchMock = vi.fn();
  const navigateMock = vi.fn();

  const fetchServicos = vi.fn(() => ({ type: 'servicos/fetchAll' }));
  const fetchServicoStats = vi.fn((id: string) => ({ type: 'servicos/fetchStats', payload: id }));

  const fetchEventos = vi.fn(() => ({ type: 'eventos/fetchAll' }));
  const fetchEventoStats = vi.fn((id: string) => ({ type: 'eventos/fetchStats', payload: id }));

  const criarAvaliacaoServico = vi.fn(async () => undefined);
  const criarAvaliacaoEvento = vi.fn(async () => undefined);

  const state = {
    current: {
      auth: { token: 'token' },
      servicos: {
        items: [
          { _id: 's1', nome: 'Hotel A', tipo_servico: 'Hospedagem', categoria: 'Hospedagem' },
          { _id: 's2', nome: 'Restaurante B', tipo_servico: 'Alimentação/Lazer', categoria: 'Alimentação' }
        ],
        status: 'succeeded',
        error: null,
        statsById: {}
      },
      eventos: {
        items: [{ _id: 'e1', nome: 'Evento X', descricao: 'Show', status: 'Ativo' }],
        status: 'succeeded',
        error: null,
        statsById: {}
      }
    }
  };

  return {
    dispatchMock,
    navigateMock,
    fetchServicos,
    fetchServicoStats,
    fetchEventos,
    fetchEventoStats,
    criarAvaliacaoServico,
    criarAvaliacaoEvento,
    state
  };
});

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mocks.navigateMock
  };
});

import { HomePage } from './HomePage';

vi.mock('../hooks/reduxHooks', () => {
  return {
    useAppDispatch: () => mocks.dispatchMock,
    useAppSelector: (selector: any) => selector(mocks.state.current)
  };
});

vi.mock('../features/servicos/servicosSlice', () => {
  return {
    fetchServicos: () => mocks.fetchServicos(),
    fetchServicoStats: (id: string) => mocks.fetchServicoStats(id)
  };
});

vi.mock('../features/eventos/eventosSlice', () => {
  return {
    fetchEventos: () => mocks.fetchEventos(),
    fetchEventoStats: (id: string) => mocks.fetchEventoStats(id)
  };
});

vi.mock('../features/servicos/servicosService', () => {
  return {
    criarAvaliacaoServico: (input: any) => mocks.criarAvaliacaoServico(input)
  };
});

vi.mock('../features/eventos/eventosService', () => {
  return {
    criarAvaliacaoEvento: (input: any) => mocks.criarAvaliacaoEvento(input)
  };
});

vi.mock('../components/ServicesMap', () => {
  return {
    ServicesMap: (props: any) => (
      <div data-testid="services-map">{JSON.stringify({ center: props.center, zoom: props.zoom, count: props.servicos?.length ?? 0 })}</div>
    )
  };
});

vi.mock('../components/EventsMap', () => {
  return {
    EventsMap: (props: any) => (
      <div data-testid="events-map">{JSON.stringify({ center: props.center, zoom: props.zoom, count: props.eventos?.length ?? 0 })}</div>
    )
  };
});

vi.mock('../components/ServiceList', () => {
  return {
    ServiceList: (props: any) => (
      <div>
        <div data-testid="service-count">{props.items?.length ?? 0}</div>
        <button type="button" onClick={() => props.onRate(props.items[0])}>
          rate-first-service
        </button>
      </div>
    )
  };
});

vi.mock('../components/EventList', () => {
  return {
    EventList: (props: any) => <div data-testid="event-count">{props.items?.length ?? 0}</div>
  };
});

vi.mock('../components/ServiceDetailsModal', () => ({ ServiceDetailsModal: () => null }));
vi.mock('../components/EventDetailsModal', () => ({ EventDetailsModal: () => null }));

vi.mock('../components/RatingModal', () => {
  return {
    RatingModal: (props: any) =>
      props.isOpen ? (
        <div data-testid="rating-modal">
          <div>{props.title}</div>
          <button type="button" onClick={() => props.onSubmit({ nota: 5, comentario: 'ok' })}>
            submit-rating
          </button>
        </div>
      ) : null
  };
});

describe('HomePage', () => {
  beforeEach(() => {
    mocks.dispatchMock.mockReset();
    mocks.fetchServicos.mockClear();
    mocks.fetchServicoStats.mockClear();
    mocks.fetchEventos.mockClear();
    mocks.fetchEventoStats.mockClear();
    mocks.criarAvaliacaoServico.mockClear();
    mocks.criarAvaliacaoEvento.mockClear();

    mocks.state.current.auth.token = 'token';
    mocks.state.current.servicos.status = 'succeeded';
    mocks.state.current.eventos.status = 'succeeded';
    mocks.state.current.servicos.error = null;
    mocks.state.current.eventos.error = null;
    mocks.state.current.servicos.statsById = {};
    mocks.state.current.eventos.statsById = {};
  });

  it('dispara fetchServicos/fetchEventos quando status está idle', async () => {
    mocks.state.current.servicos.status = 'idle';
    mocks.state.current.eventos.status = 'idle';

    render(<HomePage />);

    await waitFor(() => {
      expect(mocks.dispatchMock).toHaveBeenCalledWith({ type: 'servicos/fetchAll' });
      expect(mocks.dispatchMock).toHaveBeenCalledWith({ type: 'eventos/fetchAll' });
    });
  });

  it('alternar para Eventos renderiza EventsMap e esconde o filtro de tipo', async () => {
    render(<HomePage />);

    expect(screen.getByTestId('services-map')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Eventos' }));

    expect(screen.getByTestId('events-map')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('filtra serviços por tipo e busca textual (impacta a lista)', async () => {
    render(<HomePage />);

    expect(screen.getByTestId('service-count')).toHaveTextContent('2');

    // Filtra por tipo Hospedagem
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Hospedagem' } });
    expect(screen.getByTestId('service-count')).toHaveTextContent('1');

    // Busca que remove o item
    await userEvent.type(screen.getByPlaceholderText('Buscar por nome/categoria'), 'zzz');
    expect(screen.getByTestId('service-count')).toHaveTextContent('0');
  });

  it('botão de geolocalização chama navigator.geolocation.getCurrentPosition', async () => {
    const getCurrentPosition = vi.fn();
    // @ts-expect-error - stub no ambiente de teste
    navigator.geolocation = { getCurrentPosition };

    render(<HomePage />);

    await userEvent.click(screen.getByRole('button', { name: 'Usar minha localização' }));

    expect(getCurrentPosition).toHaveBeenCalled();
  });

  it('abre avaliação e ao enviar chama criarAvaliacaoServico e refetch de stats', async () => {
    render(<HomePage />);

    await userEvent.click(screen.getByRole('button', { name: 'rate-first-service' }));

    expect(screen.getByTestId('rating-modal')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'submit-rating' }));

    await waitFor(() => {
      expect(mocks.criarAvaliacaoServico).toHaveBeenCalledWith({ servicoId: 's1', nota: 5, comentario: 'ok' });
      expect(mocks.dispatchMock).toHaveBeenCalledWith({ type: 'servicos/fetchStats', payload: 's1' });
    });
  });
});
