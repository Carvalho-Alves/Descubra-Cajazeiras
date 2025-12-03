import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CardItem from './CardItem';

describe('CardItem', () => {
  test('renderiza título e descrição', () => {
    render(<CardItem titulo="Teste Título" descricao="Teste Descrição" />);
    expect(screen.getByText('Teste Título')).toBeInTheDocument();
    expect(screen.getByText('Teste Descrição')).toBeInTheDocument();
  });

  test('chama onClick quando clicado', () => {
    const mockOnClick = jest.fn();
    render(<CardItem titulo="Teste" descricao="Desc" onClick={mockOnClick} />);
    fireEvent.click(screen.getByText('Teste'));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});