import './App.css';
import CameraCapture from './components/form/CameraCapture';
import SendText from './components/form/SendText';
import BillDetails from './components/form/BillDetails';
import React, { useState } from 'react';

function App() {
  const [currentScreen, setCurrentScreen] = useState('sendText');
  const [billData, setBillData] = useState(null);

  const handleSendTextSubmit = (data) => {
    setCurrentScreen('billDetails');
    setBillData(data);
  };

  return (
    <div className="App">
      <header className="App-header space-y-4 p-4">
        {currentScreen === 'sendText' && (
          <div className="m-2 w-full">
            <div>
              <CameraCapture />
            </div>
            <span className="text-sm">ou</span>
            <div className="flex flex-col items-center w-full">
              <label htmlFor="send-text" className="text-base m-2">Colar texto abaixo:</label>
              <SendText onSubmit={handleSendTextSubmit} />
            </div>
          </div>
        )}

        {currentScreen === 'billDetails' && (
          <BillDetails items={billData.items} />
        )}
      </header>
    </div>
  );
}

export default App;
