import { describe, expect, it, beforeEach, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { RegisterPage } from './RegisterPage';

const mocks = vi.hoisted(() => {
  const dispatchMock = vi.fn();
  const navigateMock = vi.fn();
  const registerUserFn = vi.fn((payload: any) => ({ type: 'auth/registerUser', payload }));
  const registerUserMock: any = Object.assign(registerUserFn, {
    fulfilled: {
      match: (action: any) => action?.type === 'auth/registerUser/fulfilled'
    }
  });

  const state = {
    current: {
      auth: { status: 'idle', error: null as string | null }
    }
  };

  return { dispatchMock, navigateMock, registerUserFn, registerUserMock, state };
});

vi.mock('../hooks/reduxHooks', () => {
  return {
    useAppDispatch: () => mocks.dispatchMock,
    useAppSelector: (selector: any) => selector(mocks.state.current)
  };
});

vi.mock('../features/auth/authSlice', () => {
  return {
    registerUser: mocks.registerUserMock
  };
});

vi.mock('react-router-dom', async () => {
  const actual: any = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mocks.navigateMock
  };
});

describe('RegisterPage', () => {
  beforeEach(() => {
    mocks.dispatchMock.mockReset();
    mocks.navigateMock.mockReset();
    mocks.registerUserFn.mockClear();
    mocks.state.current = {
      auth: { status: 'idle', error: null as string | null }
    };
  });

  it('renderiza heading e campos', () => {
    render(<RegisterPage />);

    expect(screen.getByRole('heading', { name: 'Cadastrar' })).toBeInTheDocument();
    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirmar senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cadastrar' })).toBeInTheDocument();
  });

  it('exibe mensagem de erro quando existir', () => {
    mocks.state.current.auth.error = 'Falha no cadastro';

    render(<RegisterPage />);

    expect(screen.getByText('Falha no cadastro')).toBeInTheDocument();
  });

  it('mostra warning e desabilita submit quando senhas não coincidem', async () => {
    render(<RegisterPage />);

    await userEvent.type(screen.getByLabelText('Senha'), '123');
    await userEvent.type(screen.getByLabelText('Confirmar senha'), '456');

    expect(screen.getByText('As senhas não coincidem.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cadastrar' })).toBeDisabled();
  });

  it('não dispatcha registerUser ao submeter com senhas diferentes', async () => {
    render(<RegisterPage />);

    await userEvent.type(screen.getByLabelText('Nome'), 'João');
    await userEvent.type(screen.getByLabelText('E-mail'), 'j@j.com');
    await userEvent.type(screen.getByLabelText('Senha'), '123');
    await userEvent.type(screen.getByLabelText('Confirmar senha'), '456');

    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));

    expect(mocks.dispatchMock).not.toHaveBeenCalled();
    expect(mocks.registerUserFn).not.toHaveBeenCalled();
  });

  it('dispatcha registerUser com payload (inclui foto) e navega ao login quando fulfilled', async () => {
    mocks.dispatchMock.mockResolvedValue({ type: 'auth/registerUser/fulfilled' });

    render(<RegisterPage />);

    await userEvent.type(screen.getByLabelText('Nome'), 'Maria');
    await userEvent.type(screen.getByLabelText('E-mail'), 'm@m.com');
    await userEvent.type(screen.getByLabelText('Senha'), '123');
    await userEvent.type(screen.getByLabelText('Confirmar senha'), '123');

    const file = new File(['x'], 'avatar.png', { type: 'image/png' });
    const input = screen.getByLabelText('Foto (opcional)') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));

    expect(mocks.registerUserFn).toHaveBeenCalledWith({
      nome: 'Maria',
      email: 'm@m.com',
      senha: '123',
      foto: file
    });

    expect(mocks.dispatchMock).toHaveBeenCalledWith({
      type: 'auth/registerUser',
      payload: { nome: 'Maria', email: 'm@m.com', senha: '123', foto: file }
    });

    expect(mocks.navigateMock).toHaveBeenCalledWith('/login');
  });
});
