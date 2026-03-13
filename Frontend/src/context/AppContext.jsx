import { createContext, useState } from "react";

export const AppContext = createContext({
  user: null,
  setUser: () => {},
  clearUser: () => {}
});

export const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        clearUser: () => setUser(null)
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
