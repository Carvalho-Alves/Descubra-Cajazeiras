import React from 'react';
import './CardItem.css';

const CardItem = ({ titulo, descricao, imagem, onClick }) => {
  return (
    <div className="card-item" onClick={onClick}>
      {imagem && <img src={imagem} alt={titulo} className="card-imagem" />}
      <h3 className="card-titulo">{titulo}</h3>
      <p className="card-descricao">{descricao}</p>
    </div>
  );
};

export default CardItem;