import React, { useState } from 'react';

function SendText({ onSubmit }) {
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
      onSubmit(data);
      console.log('Resposta do servidor:', data);
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
      <button
        onClick={handleSend}
        className="bg-blue-500 text-white px-3 py-1 rounded-md text-base hover:bg-blue-700 w-full"
      >
        Enviar
      </button>
    </div>
  );
}

export default SendText;
