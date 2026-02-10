import type { Meta, StoryObj } from '@storybook/react';
import { RatingModal } from './RatingModal';

const meta: Meta<typeof RatingModal> = {
  title: 'Components/RatingModal',
  component: RatingModal,
  args: {
    isOpen: true,
    title: 'Avaliar serviço',
    onClose: () => undefined,
    onSubmit: async () => undefined
  }
};

export default meta;
type Story = StoryObj<typeof RatingModal>;

export const Default: Story = {};
