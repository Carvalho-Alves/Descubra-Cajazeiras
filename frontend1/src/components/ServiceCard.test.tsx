import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ServiceCard } from './ServiceCard';

describe('ServiceCard', () => {
  it('renderiza título e categoria', () => {
    render(<ServiceCard title="Foo" category="Hospedagem" />);
    expect(screen.getByText('Foo')).toBeInTheDocument();
    expect(screen.getByText('Hospedagem')).toBeInTheDocument();
  });

  it('renderiza imagem quando imageUrl é fornecida', () => {
    render(<ServiceCard title="Bar" category="Ponto Turístico" imageUrl="https://example.com/img.png" />);
    expect(screen.getByAltText('Imagem de Bar')).toBeInTheDocument();
  });

  it('mostra avaliação e contagem formatadas', () => {
    render(<ServiceCard title="Baz" category="Alimentação/Lazer" rating={3.5} ratingCount={10} />);
    expect(screen.getByTestId('rating-meta')).toHaveTextContent('3.5 (10)');
    expect(screen.getByLabelText(/Avaliação: 3\.5 de 5/)).toBeInTheDocument();
  });

  it('chama onDetailsClick ao clicar em Detalhes', async () => {
    const user = userEvent.setup();
    const onDetailsClick = vi.fn();

    render(<ServiceCard title="Qux" category="Hospedagem" onDetailsClick={onDetailsClick} />);

    await user.click(screen.getByRole('button', { name: 'Detalhes' }));
    expect(onDetailsClick).toHaveBeenCalledTimes(1);
  });

  it('chama onRateClick ao clicar em Avaliar', async () => {
    const user = userEvent.setup();
    const onRateClick = vi.fn();

    render(<ServiceCard title="Qux" category="Hospedagem" onRateClick={onRateClick} />);

    await user.click(screen.getByRole('button', { name: 'Avaliar' }));
    expect(onRateClick).toHaveBeenCalledTimes(1);
  });
});
