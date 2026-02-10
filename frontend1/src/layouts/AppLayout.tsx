import React from 'react';
import { Container, Image, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import { logout } from '../features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { resolveApiAssetUrl } from '../utils/resolveAssetUrl';

export function AppLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const token = useAppSelector((s) => s.auth.token);
  const user = useAppSelector((s) => s.auth.user);

  const avatarUrl = user?.foto ? resolveApiAssetUrl(user.foto) : null;

  return (
    <div className="min-vh-100 bg-body-tertiary">
      <Navbar bg="primary" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={NavLink} to="/">
            Descubra Cajazeiras
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="main-navbar" />
          <Navbar.Collapse id="main-navbar">
            <Nav className="me-auto">
              <Nav.Link as={NavLink} to="/" end>
                Home
              </Nav.Link>
              <Nav.Link as={NavLink} to="/dashboard">
                Dashboard
              </Nav.Link>
            </Nav>

            <Nav className="ms-auto align-items-lg-center">
              {token && user ? (
                <NavDropdown
                  align="end"
                  title={
                    <span className="d-inline-flex align-items-center gap-2">
                      {avatarUrl ? (
                        <Image
                          src={avatarUrl}
                          alt={`Foto de ${user.nome}`}
                          roundedCircle
                          width={32}
                          height={32}
                        />
                      ) : (
                        <span
                          className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light text-primary"
                          style={{ width: 32, height: 32, fontWeight: 700 }}
                          aria-hidden
                        >
                          {user.nome?.trim()?.slice(0, 1)?.toUpperCase() ?? 'U'}
                        </span>
                      )}
                      <span>{user.nome}</span>
                    </span>
                  }
                >
                  <NavDropdown.Item
                    onClick={() => {
                      dispatch(logout());
                      navigate('/');
                    }}
                  >
                    Sair
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <>
                  <Nav.Link as={NavLink} to="/login">
                    Entrar
                  </Nav.Link>
                  <Nav.Link as={NavLink} to="/register">
                    Criar conta
                  </Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="py-4">
        <Outlet />
      </Container>
    </div>
  );
}
