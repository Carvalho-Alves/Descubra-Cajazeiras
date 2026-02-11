import React, { useState, useEffect } from 'react';
import CardItem from './CardItem';
import { servicosMock } from '../mocks/eventosMock';
import './ListaItems.css';

const ListaItems = () => {
  const [itens, setItens] = useState([]);

  useEffect(() => {
    // Simulando carregamento de dados
    setItens(servicosMock);
  }, []);

  const handleItemClick = (item) => {
    alert(`Clicou em: ${item.nome}`);
  };

  return (
    <div className="lista-items">
      <h2>Lista de Itens</h2>

      <div className="lista-container">
        {itens.map((item) => (
          <CardItem
            key={item.id}
            titulo={item.nome}
            descricao={item.descricao}
            imagem={item.imagem}   // 👈 AQUI está a mudança
            onClick={() => handleItemClick(item)}
          />
        ))}
      </div>
    </div>
  );
};

export default ListaItems;
