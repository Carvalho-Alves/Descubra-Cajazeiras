import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ServicoFormModal } from './ServicoFormModal';

describe('ServicoFormModal', () => {
  it('renderiza título de criação', () => {
    render(
      <ServicoFormModal isOpen mode="create" onClose={() => {}} onSubmit={() => {}} />
    );

    expect(screen.getByText('Novo serviço')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
  });

  it('não permite salvar sem nome', async () => {
    const user = userEvent.setup();
    render(
      <ServicoFormModal isOpen mode="create" onClose={() => {}} onSubmit={() => {}} />
    );

    const salvar = screen.getByRole('button', { name: 'Salvar' });
    expect(salvar).toBeDisabled();

    await user.type(screen.getByLabelText('Nome'), '  ');
    expect(salvar).toBeDisabled();
  });

  it('chama onSubmit com payload e fecha (onClose)', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onSubmit = vi.fn(async () => undefined);

    render(<ServicoFormModal isOpen mode="create" onClose={onClose} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Nome'), ' Hotel ');
    fireEvent.change(screen.getByLabelText('Tipo'), { target: { value: 'Hospedagem' } });
    await user.type(screen.getByLabelText(/Categoria/), ' Luxo ');
    await user.type(screen.getByLabelText(/Telefone/), ' 999 ');
    await user.type(screen.getByLabelText(/Instagram/), ' insta ');
    await user.type(screen.getByLabelText('Latitude (opcional)'), '-6.8');
    await user.type(screen.getByLabelText('Longitude (opcional)'), '-38.5');

    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          nome: 'Hotel',
          tipo_servico: 'Hospedagem',
          categoria: 'Luxo',
          telefone: '999',
          instagram: 'insta',
          latitude: -6.8,
          longitude: -38.5
        })
      );
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('prefill em modo edição', () => {
    render(
      <ServicoFormModal
        isOpen
        mode="edit"
        initial={{
          _id: 's1',
          nome: 'Restaurante',
          tipo_servico: 'Alimentação/Lazer',
          categoria: 'Comida',
          descricao: 'Desc',
          contato: { telefone: '1', instagram: '@x' },
          localizacao: { latitude: -1, longitude: -2 }
        } as any}
        onClose={() => {}}
        onSubmit={() => {}}
      />
    );

    expect(screen.getByText('Editar serviço')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Restaurante')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Comida')).toBeInTheDocument();
  });

  it('mostra erro quando onSubmit falha', async () => {
    const user = userEvent.setup();
    render(
      <ServicoFormModal
        isOpen
        mode="create"
        onClose={() => {}}
        onSubmit={async () => {
          throw new Error('Erro');
        }}
      />
    );

    await user.type(screen.getByLabelText('Nome'), 'Hotel');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Erro')).toBeInTheDocument();
  });
});
