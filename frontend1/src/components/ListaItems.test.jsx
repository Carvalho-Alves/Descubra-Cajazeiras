import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ListaItems from './ListaItems';

describe('ListaItems', () => {
  test('renderiza a lista de itens', async () => {
    render(<ListaItems />);
    await waitFor(() => {
      expect(screen.getByText('Lista de Itens')).toBeInTheDocument();
    });
    expect(screen.getByText('Hotel Cajazeiras Palace')).toBeInTheDocument();
  });

  test('chama alert ao clicar em item', async () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    render(<ListaItems />);
    await waitFor(() => {
      fireEvent.click(screen.getByText('Hotel Cajazeiras Palace'));
    });
    expect(alertMock).toHaveBeenCalledWith('Clicou em: Hotel Cajazeiras Palace');
    alertMock.mockRestore();
  });
});