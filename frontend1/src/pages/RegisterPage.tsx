import React, { useState } from 'react';
import { Alert, Button, Card, Form, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import { registerUser } from '../features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';

export function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error } = useAppSelector((state) => state.auth);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [foto, setFoto] = useState<File | null>(null);

  const isLoading = status === 'loading';

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (senha !== confirmarSenha) return;

    const action = await dispatch(registerUser({ nome, email, senha, foto: foto ?? undefined }));
    if (registerUser.fulfilled.match(action)) {
      navigate('/login');
    }
  };

  const senhaInvalida = senha.length > 0 && confirmarSenha.length > 0 && senha !== confirmarSenha;

  return (
    <Card>
      <Card.Body>
        <Card.Title as="h1" className="h4">
          Cadastrar
        </Card.Title>

        {error ? <Alert variant="danger">{error}</Alert> : null}
        {senhaInvalida ? <Alert variant="warning">As senhas não coincidem.</Alert> : null}

        <Form onSubmit={onSubmit}>
          <Form.Group className="mb-3" controlId="registerNome">
            <Form.Label>Nome</Form.Label>
            <Form.Control value={nome} onChange={(e) => setNome(e.target.value)} required />
          </Form.Group>

          <Form.Group className="mb-3" controlId="registerEmail">
            <Form.Label>E-mail</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="registerSenha">
            <Form.Label>Senha</Form.Label>
            <Form.Control
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              autoComplete="new-password"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="registerConfirmarSenha">
            <Form.Label>Confirmar senha</Form.Label>
            <Form.Control
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
              autoComplete="new-password"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="registerFoto">
            <Form.Label>Foto (opcional)</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={(e) => {
                const input = e.target as unknown as HTMLInputElement;
                setFoto(input.files?.[0] ?? null);
              }}
            />
          </Form.Group>

          <Button type="submit" disabled={isLoading || senhaInvalida}>
            {isLoading ? (
              <>
                <Spinner size="sm" className="me-2" />
                Cadastrando...
              </>
            ) : (
              'Cadastrar'
            )}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}

