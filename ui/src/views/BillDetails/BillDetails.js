import React, { useState } from 'react';
import { createGroup, updateItem, getBill } from '../../services/api';
import Button from '../../components/Button/Button';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';

function BillDetails() {
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [groupName, setGroupName] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const bill = await getBill(id);
        setItems(bill.items);
      } catch (error) {
        console.error('Erro ao buscar itens:', error);
      }
    };

    fetchItems();
  }, [id]);

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

  const handleGroupProceed = async () => {
    const groupId = await createGroup(groupName, id);

    selectedItems.forEach(async (itemId) => {
      await updateItem(itemId, { group_id: groupId });
    });

    const remainingItems = items.filter(item =>!selectedItems.includes(item.id));
    setItems(remainingItems);
    setGroupName('');
    setShowModal(false);
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
      <Button
        onClick={handleGroupButtonClick}
      >
        Agrupar
      </Button>

      {/* Modal */}
      {showModal && (
        <div className="modal flex items-center justify-center fixed z-40 inset-0 h-full p-10">
          <button type="button" className="modal-backdrop cursor-default w-full h-full fixed inset-0 bg-gray-700 bg-opacity-25" tabIndex="-1"></button>
          <div className="modal-window w-10/12 overflow-hidden relative bg-slate-200 shadow-lg rounded-xl border border-gray-400 p-10">

          <h3 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">Nome do grupo</h3>
          <button
            className="absolute top-0 right-0 mt-4 mr-4 text-gray-800 hover:text-gray-700 focus:outline-none hover:text-red-500"
            onClick={() => setShowModal(false)}
          >
            X
          </button>

          <input
            className="mt-6 shadow appearance-none border border-gray-300 text-gray-600 placeholder-gray-400
          rounded w-full py-2 px-3 bg-white focus:outline-none focus:ring-0 focus:border-blue-500
          leading-6 transition-colors duration-200 ease-in-out"
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Nome do grupo" />

          <div className="flex flex-col items-center">
            <Button 
              onClick={handleGroupProceed}
            >
              Prosseguir
            </Button>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BillDetails;