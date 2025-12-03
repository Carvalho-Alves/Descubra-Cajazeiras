import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from './Footer';

describe('Footer', () => {
  test('renderiza o texto corretamente', () => {
    render(<Footer texto="Teste Texto" />);
    expect(screen.getByText('Teste Texto')).toBeInTheDocument();
  });

  test('não renderiza nada se texto não fornecido', () => {
    render(<Footer />);
    expect(screen.queryByText(/./)).not.toBeInTheDocument();
  });
});