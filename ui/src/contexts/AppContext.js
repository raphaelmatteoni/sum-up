// src/contexts/AppContext.js
import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [billData, setBillData] = useState(null);

  const handleSendTextSubmit = (data) => {
    setBillData(data);
  };

  return (
    <AppContext.Provider value={{ billData, setBillData, handleSendTextSubmit }}>
      {children}
    </AppContext.Provider>
  );
};
