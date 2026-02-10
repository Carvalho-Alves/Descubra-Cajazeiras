import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Form, Spinner } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';

import { loginUser } from '../features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';

type LocationState = {
  from?: { pathname?: string };
};

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { token, status, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const isLoading = status === 'loading';

  useEffect(() => {
    if (token) {
      const state = (location.state as LocationState | null) ?? null;
      const redirectTo = state?.from?.pathname ?? '/dashboard';
      navigate(redirectTo, { replace: true });
    }
  }, [token, location.state, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(loginUser({ email, senha }));
  };

  return (
    <Card>
      <Card.Body>
        <Card.Title as="h1" className="h4">
          Entrar
        </Card.Title>

        {error ? <Alert variant="danger">{error}</Alert> : null}

        <Form onSubmit={onSubmit}>
          <Form.Group className="mb-3" controlId="loginEmail">
            <Form.Label>E-mail</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="loginSenha">
            <Form.Label>Senha</Form.Label>
            <Form.Control
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              autoComplete="current-password"
            />
          </Form.Group>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner size="sm" className="me-2" />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </Button>

          <div className="mt-3">
            <Button
              type="button"
              variant="outline-secondary"
              onClick={() => navigate('/register')}
              disabled={isLoading}
            >
              Criar conta
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}
