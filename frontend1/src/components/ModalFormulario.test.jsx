import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ModalFormulario from './ModalFormulario';

describe('ModalFormulario', () => {
  test('não renderiza quando isOpen é false', () => {
    render(<ModalFormulario isOpen={false} />);
    expect(screen.queryByText('Formulário')).not.toBeInTheDocument();
  });

  test('renderiza e permite submissão', async () => {
    const mockOnSubmit = jest.fn();
    const mockOnClose = jest.fn();
    render(<ModalFormulario isOpen={true} onSubmit={mockOnSubmit} onClose={mockOnClose} />);
    expect(screen.getByText('Formulário')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Nome'), { target: { value: 'Teste' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'teste@example.com' } });
    fireEvent.click(screen.getByText('Enviar'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({ nome: 'Teste', email: 'teste@example.com' });
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});