import { Navigate } from "react-router-dom";
import { useRole } from "../hooks/useRole";

export default function AdminRoute({ children }) {
  const { isAdmin } = useRole();

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
