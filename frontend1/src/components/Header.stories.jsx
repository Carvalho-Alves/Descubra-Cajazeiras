import Header from './Header';

export default {
  title: 'Components/Header',
  component: Header,
};

export const Default = {
  args: {
    titulo: 'Título Padrão',
    subtitulo: 'Subtítulo opcional',
  },
};

export const SemSubtitulo = {
  args: {
    titulo: 'Apenas Título',
  },
};