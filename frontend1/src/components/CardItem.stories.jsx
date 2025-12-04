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
    imagem: "https://revistaunick.com.br/wp-content/uploads/2020/08/turismo-portada.jpg",
    onClick: () => console.log('Clicado'),
  },
};