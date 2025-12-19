import { createContext, useState } from "react";

const BusListContext = createContext(null);

export function BusListProvider({ children }) {
  const [busList, setBusList] = useState(null);

  return (
    <BusListContext.Provider value={{ busList, setBusList }}>
      {children}
    </BusListContext.Provider>
  );
}

export default BusListContext;
