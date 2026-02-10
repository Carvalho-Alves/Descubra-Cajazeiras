import React from 'react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LoginPage } from './LoginPage';

let mockState: any;
const dispatchMock = vi.fn();

const navigateMock = vi.fn();
let locationState: any = null;

vi.mock('../hooks/reduxHooks', () => {
  return {
    useAppDispatch: () => dispatchMock,
    useAppSelector: (selector: any) => selector(mockState)
  };
});

const loginUserMock = vi.fn((payload: any) => ({ type: 'auth/loginUser', payload }));

vi.mock('../features/auth/authSlice', () => {
  return {
    loginUser: (payload: any) => loginUserMock(payload)
  };
});

vi.mock('react-router-dom', async () => {
  const actual: any = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useLocation: () => ({ state: locationState })
  };
});

describe('LoginPage', () => {
  beforeEach(() => {
    dispatchMock.mockReset();
    navigateMock.mockReset();
    loginUserMock.mockClear();

    locationState = null;
    mockState = {
      auth: { token: null, status: 'idle', error: null }
    };
  });

  it('renderiza heading e campos', () => {
    render(<LoginPage />);

    expect(screen.getByRole('heading', { name: 'Entrar' })).toBeInTheDocument();
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Criar conta' })).toBeInTheDocument();
  });

  it('navega para /register ao clicar em Criar conta', async () => {
    const user = userEvent.setup();

    render(<LoginPage />);

    await user.click(screen.getByRole('button', { name: 'Criar conta' }));
    expect(navigateMock).toHaveBeenCalledWith('/register');
  });

  it('exibe mensagem de erro quando existir', () => {
    mockState.auth.error = 'Credenciais inválidas';

    render(<LoginPage />);

    expect(screen.getByText('Credenciais inválidas')).toBeInTheDocument();
  });

  it('mostra estado de loading e desabilita o botão', () => {
    mockState.auth.status = 'loading';

    render(<LoginPage />);

    expect(screen.getByRole('button', { name: 'Entrando...' })).toBeDisabled();
  });

  it('dispatcha loginUser com email e senha ao submeter', async () => {
    dispatchMock.mockResolvedValue({ type: 'auth/loginUser/fulfilled' });

    render(<LoginPage />);

    await userEvent.type(screen.getByLabelText('E-mail'), 'a@a.com');
    await userEvent.type(screen.getByLabelText('Senha'), '123');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(loginUserMock).toHaveBeenCalledWith({ email: 'a@a.com', senha: '123' });
    expect(dispatchMock).toHaveBeenCalledTimes(1);
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'auth/loginUser',
      payload: { email: 'a@a.com', senha: '123' }
    });
  });

  it('redireciona quando token existe (usa from do location.state quando presente)', () => {
    locationState = { from: { pathname: '/dashboard' } };
    mockState.auth.token = 'token';

    render(<LoginPage />);

    expect(navigateMock).toHaveBeenCalledWith('/dashboard', { replace: true });
  });
});
