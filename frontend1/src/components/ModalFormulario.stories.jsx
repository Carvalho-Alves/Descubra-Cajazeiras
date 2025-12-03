import ModalFormulario from './ModalFormulario';

export default {
  title: 'Components/ModalFormulario',
  component: ModalFormulario,
};

export const Aberto = {
  args: {
    isOpen: true,
    onClose: () => console.log('Fechar'),
    onSubmit: (data) => console.log('Submit', data),
  },
};

export const Fechado = {
  args: {
    isOpen: false,
    onClose: () => {},
    onSubmit: () => {},
  },
};