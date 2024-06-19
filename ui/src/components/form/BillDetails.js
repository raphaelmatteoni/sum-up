import React, { useState } from 'react';

function BillDetails({ items }) {
  const [selectedItems, setSelectedItems] = useState([]);

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
    </div>
  );
}

export default BillDetails;
