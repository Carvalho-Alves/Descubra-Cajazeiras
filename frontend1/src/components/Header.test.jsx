import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from './Header';

describe('Header', () => {
  test('renderiza o título corretamente', () => {
    render(<Header titulo="Teste Título" />);
    expect(screen.getByText('Teste Título')).toBeInTheDocument();
  });

  test('renderiza o subtítulo quando fornecido', () => {
    render(<Header titulo="Teste Título" subtitulo="Teste Subtítulo" />);
    expect(screen.getByText('Teste Subtítulo')).toBeInTheDocument();
  });
});