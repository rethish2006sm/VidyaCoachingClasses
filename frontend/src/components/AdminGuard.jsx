import React from "react";
import { Navigate } from "react-router-dom";
import { useAdminSession } from "../contexts/AdminSession";

const AdminGuard = ({ children }) => {
  const { isAdminAuthenticated } = useAdminSession();

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default AdminGuard;
