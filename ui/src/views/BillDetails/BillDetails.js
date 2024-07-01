import { useState } from 'react';
import { createGroup, updateItem, getBill, getGroupsByBillId } from '../../services/api';
import Button from '../../components/Button/Button';
import Modal from '../../components/Modal/Modal';
import Input from '../../components/Input/Input';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';

function BillDetails() {
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [taxRate, setTaxRate] = useState(0);
  const [showTaxModal, setShowTaxModal] = useState(false);


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


  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const groups = await getGroupsByBillId(id);
        setGroups(groups);
      } catch (error) {
        console.error('Erro ao buscar grupos:', error);
      }
    };

    fetchGroups();
  }, [id]);

  const handleCheckboxChange = (itemId) => {
    const item = items.find(item => item.id === itemId);
    const currentIndex = selectedItems.findIndex(selectedItem => selectedItem.id === item.id);
    const newSelectedItems = [...selectedItems];

    if (currentIndex === -1) {
      newSelectedItems.push(item);
    } else {
      newSelectedItems.splice(currentIndex, 1);
    }

    setSelectedItems(newSelectedItems);
  };

  const handleGroupProceed = async () => {
    const groupId = await createGroup(groupName, id);

    selectedItems.forEach(async (item) => {
      await updateItem(item.id, { group_id: groupId });
    });

    const remainingItems = items.filter(item =>!selectedItems.some(selectedItem => selectedItem.id === item.id)); // Compara objetos
    setItems(remainingItems);

    const newGroup = { id: groupId, name: groupName, items: selectedItems };
    setGroups(prevGroups => [...prevGroups, newGroup]);

    setSelectedItems([]);
    setGroupName('');
    setShowModal(false);
  };

  const applyTaxRate = () => {
    const updatedGroups = groups.map(group => {
      const totalValue = group.items.reduce((acc, item) => acc + item.value, 0);
      const totalWithTax = (totalValue * (1 + taxRate / 100)).toFixed(2);
      return {
       ...group,
        totalWithTax,
      };
    });
    setGroups(updatedGroups);
    setShowTaxModal(false);
  };

  const handleGroupButtonClick = () => {
    setShowModal(true);
  };

  return (
    <>
      {items.length > 0 ? (
        <>
          <h1>Detalhes da conta</h1>
          {items.map((item) => (
            <div key={item.id} className="m-2 w-full">
              <div className="m-2">
                <input
                  type="checkbox"
                  id={`item-${item.id}`}
                  className="mr-2"
                  checked={selectedItems.some(selectedItem => selectedItem.id === item.id)}
                  onChange={() => handleCheckboxChange(item.id)}
                />
                <span className="mr-2">{item.name}</span>
                <span>R${item.value}</span>
              </div>
            </div>
          ))}
    
          <Button
            onClick={handleGroupButtonClick}
          >
            Agrupar
          </Button>
        </> 
      ) : null}

      <div className="mt-3 w-full">
        {groups.length > 0 && (
          <h2>Grupos</h2>
        )}

        {groups.map((group) => {
          const totalValue = group.items.reduce((acc, item) => acc + item.value, 0);

          return (
            <div className="mt-3 w-full bg-slate-300 text-black rounded-lg p-2" key={group.id}>
              <h2>{group.name}</h2>
              {group.items.map((item) => (
                <div key={item.id} className="m-2 w-full">
                  <span className="mr-2">{item.name}</span>
                  <span>R${item.value}</span>
                </div>
              ))}
              <div className="m-2 w-full">
                <strong>Total do Grupo: R${group.totalWithTax? group.totalWithTax : totalValue.toFixed(2)}</strong>
              </div>
            </div>
          );
        })}
        
        {items.length === 0 && (
          <Button onClick={() => setShowTaxModal(true)} className="mt-4">Aplicar taxa de serviço</Button>
        )}
      </div>

      {showModal && (
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nome do grupo">
          <Input
            placeholder="Nome do grupo"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
          <div className="flex flex-col items-center mt-6">
            <Button onClick={handleGroupProceed}>Proseguir</Button>
          </div>
        </Modal>
      )}

      {showTaxModal && (
        <Modal isOpen={showTaxModal} onClose={() => setShowTaxModal(false)} title="Definir Taxa">
          <Input
            placeholder="Taxa (%)"
            value={taxRate}
            onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
            type="number"
          />
          <div className="flex flex-col items-center mt-6">
            <Button onClick={() => applyTaxRate()}>Salvar</Button>
          </div>
        </Modal>
      )}

    </>
  );
}

export default BillDetails;