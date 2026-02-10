import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { RatingModal } from './RatingModal';

describe('RatingModal', () => {
  it('renderiza o título quando aberto', () => {
    render(
      <RatingModal isOpen title="Avaliar" onClose={() => undefined} onSubmit={() => undefined} />
    );

    expect(screen.getByText('Avaliar')).toBeInTheDocument();
    expect(screen.getByLabelText('Nota')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeInTheDocument();
  });

  it('não renderiza conteúdo quando fechado', () => {
    render(
      <RatingModal
        isOpen={false}
        title="Avaliar"
        onClose={() => undefined}
        onSubmit={() => undefined}
      />
    );

    expect(screen.queryByText('Avaliar')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Nota')).not.toBeInTheDocument();
  });

  it('submete com nota padrão 5 e comentário vazio como undefined', async () => {
    const onClose = vi.fn();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(<RatingModal isOpen title="Avaliar" onClose={onClose} onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ nota: 5, comentario: undefined });
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('permite alterar nota e comentário (com trim) antes de enviar', async () => {
    const onClose = vi.fn();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(<RatingModal isOpen title="Avaliar" onClose={onClose} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText('Nota'), { target: { value: '3' } });
    await userEvent.type(screen.getByLabelText('Comentário (opcional)'), '  bom  ');

    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ nota: 3, comentario: 'bom' });
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('mostra erro quando onSubmit lança e não fecha automaticamente', async () => {
    const onClose = vi.fn();
    const onSubmit = vi.fn().mockRejectedValue(new Error('Falha')); // mensagem exibida

    render(<RatingModal isOpen title="Avaliar" onClose={onClose} onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(await screen.findByText('Falha')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});
