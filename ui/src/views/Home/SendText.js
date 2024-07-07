import React, { useState } from 'react';
import Button from '../../components/Button/Button';
import { useNavigate } from 'react-router-dom';
import { createBill } from '../../services/api';

function SendText() {
  const navigate = useNavigate();
  const [text, setText] = useState('');

  const handleSend = async () => {
    try {
      const data = await createBill(text);
      console.log('Resposta do servidor:', data);
      navigate(`/bill-details/${data.id}`);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  return (
    <div className="flex flex-col space-y-2 w-full">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Digite seu texto aqui..."
        className="w-full p-2 border rounded h-32 resize-none text-black"
      />
      <Button onClick={handleSend}>Enviar</Button>
    </div>
  );
}

export default SendText;
