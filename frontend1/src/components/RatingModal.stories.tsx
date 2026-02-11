import type { Meta, StoryObj } from '@storybook/react';
import { RatingModal } from './RatingModal';

const meta: Meta<typeof RatingModal> = {
  title: 'Components/RatingModal',
  component: RatingModal,
  args: {
    isOpen: true,
    title: 'Avaliar serviço',
    imageUrl: 'https://i.ibb.co/tMYkbVQ1/hoteljpg.jpg',
    onClose: () => undefined,
    onSubmit: async () => undefined
  }
};

export default meta;
type Story = StoryObj<typeof RatingModal>;

export const Default: Story = {
  args: {
    imageUrl: "https://pontualreparosautomotivos.com.br/site/wp-content/uploads/2024/01/15-1.jpeg"
  }
};
