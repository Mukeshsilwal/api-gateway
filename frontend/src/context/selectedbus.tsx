import { createContext, useState } from "react";

const SelectedBusContext = createContext([]);

export function SelectedBusProvider({ children }) {
  const [selectedBus, setSelectedBus] = useState(null);

  return (
    <SelectedBusContext.Provider value={{ selectedBus, setSelectedBus }}>
      {children}
    </SelectedBusContext.Provider>
  );
}

export default SelectedBusContext;
