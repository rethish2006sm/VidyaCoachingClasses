import React, { createContext, useContext, useMemo, useState } from "react";

const AdminSessionContext = createContext(null);

export const AdminSessionProvider = ({ children }) => {
  const [credentials, setCredentials] = useState(null);

  const login = (username, password) => {
    setCredentials({ username, password });
  };

  const logout = () => {
    setCredentials(null);
  };

  const contextValue = useMemo(
    () => ({
      credentials,
      isAdminAuthenticated: Boolean(credentials?.username && credentials?.password),
      login,
      logout,
    }),
    [credentials],
  );

  return (
    <AdminSessionContext.Provider value={contextValue}>
      {children}
    </AdminSessionContext.Provider>
  );
};

export const useAdminSession = () => {
  const context = useContext(AdminSessionContext);
  if (!context) {
    throw new Error("useAdminSession must be used within AdminSessionProvider");
  }
  return context;
};
