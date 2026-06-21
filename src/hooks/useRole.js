import { useAuth } from "../context/AuthContext";
import { isAdmin, isStudent, ROLES } from "../lib/roles";

export function useRole() {
  const { userProfile } = useAuth();
  const role = userProfile?.role || ROLES.STUDENT;

  return {
    role,
    isAdmin: isAdmin(role),
    isStudent: isStudent(role),
  };
}
