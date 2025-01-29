import React, { createContext, useContext, useState } from 'react';

const ItemContext = createContext();

export const ItemProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  return (
    <ItemContext.Provider value={{ items, setItems }}>
      {children}
    </ItemContext.Provider>
  );
};

export const useItems = () => useContext(ItemContext);
