import React, { useState } from 'react';
import Button from '../../components/Button/Button';
import { useNavigate } from 'react-router-dom';

function SendText() {
  const navigate = useNavigate();
  const [text, setText] = useState('');

  const handleSend = async () => {
    try {
      const response = await fetch('http://localhost:8000/bills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Resposta do servidor:', data);
      navigate(`/bill-details/${data.id}`);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  return (
    <div className="flex flex-col space-y-2 w-full">
      <textarea
        value={text} // Define o valor do textarea para o estado do texto
        onChange={(e) => setText(e.target.value)} // Atualiza o estado do texto sempre que o valor do textarea muda
        placeholder="Digite seu texto aqui..."
        className="w-full p-2 border rounded h-32 resize-none text-black"
      />
      <Button onClick={handleSend}>Enviar</Button> // Corrigido para usar a função handleSend
    </div>
  );
}

export default SendText;
