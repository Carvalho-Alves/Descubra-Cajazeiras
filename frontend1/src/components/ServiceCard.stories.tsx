import type { Meta, StoryObj } from '@storybook/react';
import { ServiceCard } from './ServiceCard';

const meta: Meta<typeof ServiceCard> = {
  title: 'Components/ServiceCard',
  component: ServiceCard,
  args: {
    title: 'Hospedagem Exemplo',
    category: 'Hospedagem',
    imageUrl: 'https://via.placeholder.com/640x360',
    rating: 4.2,
    ratingCount: 18
  }
};

export default meta;
type Story = StoryObj<typeof ServiceCard>;

export const Default: Story = {};
