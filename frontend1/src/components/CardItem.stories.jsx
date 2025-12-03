import CardItem from './CardItem';

export default {
  title: 'Components/CardItem',
  component: CardItem,
};

export const Default = {
  args: {
    titulo: 'Título do Card',
    descricao: 'Descrição do item',
    onClick: () => alert('Clicado!'),
  },
};

export const ComImagem = {
  args: {
    titulo: 'Card com Imagem',
    descricao: 'Este card tem uma imagem',
    imagem: 'https://via.placeholder.com/150',
    onClick: () => console.log('Clicado'),
  },
};