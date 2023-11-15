import { createContext, useState } from "react";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [userInfo, setUserInfo] = useState({});
  const [isLoading, setIsLoading] = useState(true); // Añadir estado de carga

  return (
    <UserContext.Provider value={{ userInfo, setUserInfo, isLoading, setIsLoading }}>
      {children}
    </UserContext.Provider>
  );
}
