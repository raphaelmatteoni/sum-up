import React, { useState } from 'react';

function BillDetails({ items }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [showModal, setShowModal] = useState(false); // Estado para controlar a visibilidade do modal

  const handleCheckboxChange = (itemId) => {
    const currentIndex = selectedItems.indexOf(itemId);
    const newSelectedItems = [...selectedItems];

    if (currentIndex === -1) {
      newSelectedItems.push(itemId);
    } else {
      newSelectedItems.splice(currentIndex, 1);
    }

    setSelectedItems(newSelectedItems);
  };

  const handleGroupButtonClick = () => {
    setShowModal(true);
  };

  return (
    <div>
      <h1>Detalhes da conta</h1>
      {items.map((item) => (
        <div key={item.id} className="m-2 w-full">
          <div className="m-2">
            <input
              type="checkbox"
              id={`item-${item.id}`}
              className="mr-2"
              checked={selectedItems.includes(item.id)}
              onChange={() => handleCheckboxChange(item.id)}
            />
            <span className="mr-2">{item.name}</span>
            <span>R${item.value}</span>
          </div>
        </div>
      ))}

      {/* Botão Agrupar */}
      <button onClick={handleGroupButtonClick}>Agrupar</button>

      {/* Modal */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Agrupar itens</h2>
            <input type="text" placeholder="Nome do grupo" />
            <button onClick={() => handleGroupProceed()}>Prosseguir</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BillDetails;