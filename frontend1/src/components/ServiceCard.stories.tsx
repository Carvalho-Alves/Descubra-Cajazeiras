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

export const Default: Story = {
  args: {
    imageUrl: "https://q-xx.bstatic.com/xdata/images/hotel/max1024x768/299879929.jpg?k=e1d6f0950cf7b091b2376f3fae5c59c82b778662b68d9bde46c0d11d49ec6082&o="
  }
};
