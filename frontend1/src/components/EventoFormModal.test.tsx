import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { EventoFormModal } from './EventoFormModal';

describe('EventoFormModal', () => {
  it('renderiza título de criação', () => {
    render(<EventoFormModal isOpen mode="create" onClose={() => {}} onSubmit={() => {}} />);
    expect(screen.getByText('Novo evento')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
  });

  it('não permite salvar sem campos obrigatórios', async () => {
    render(<EventoFormModal isOpen mode="create" onClose={() => {}} onSubmit={() => {}} />);
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();
  });

  it('chama onSubmit e onClose em sucesso', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onSubmit = vi.fn(async () => undefined);

    render(<EventoFormModal isOpen mode="create" onClose={onClose} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Nome'), 'Evento');
    await user.type(screen.getByLabelText('Data'), '2025-01-01');
    await user.type(screen.getByLabelText('Latitude'), '-6.1');
    await user.type(screen.getByLabelText('Longitude'), '-38.2');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          nome: 'Evento',
          data: '2025-01-01',
          latitude: -6.1,
          longitude: -38.2
        })
      );
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('prefill em modo edição', () => {
    render(
      <EventoFormModal
        isOpen
        mode="edit"
        initial={{
          _id: 'e1',
          nome: 'Show',
          data: '2025-03-10T00:00:00.000Z',
          horario: '19:00',
          localizacao: { latitude: -1, longitude: -2 }
        } as any}
        onClose={() => {}}
        onSubmit={() => {}}
      />
    );

    expect(screen.getByText('Editar evento')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Show')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2025-03-10')).toBeInTheDocument();
  });

  it('mostra erro para latitude/longitude inválidas', async () => {
    const user = userEvent.setup();
    render(
      <EventoFormModal
        isOpen
        mode="create"
        onClose={() => {}}
        onSubmit={async () => undefined}
      />
    );

    await user.type(screen.getByLabelText('Nome'), 'Evento');
    await user.type(screen.getByLabelText('Data'), '2025-01-01');
    await user.type(screen.getByLabelText('Latitude'), 'abc');
    await user.type(screen.getByLabelText('Longitude'), '1');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Latitude/longitude inválidas')).toBeInTheDocument();
  });
});
