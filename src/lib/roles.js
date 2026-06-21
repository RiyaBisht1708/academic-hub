export const ROLES = {
  STUDENT: "Student",
  ADMIN: "Admin",
};

export const RESOURCE_STATUS = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export function isAdmin(role) {
  return role === ROLES.ADMIN;
}

export function isStudent(role) {
  return role === ROLES.STUDENT;
}

export function canAccessResourceFile(resource, userId, role) {
  if (resource.status === RESOURCE_STATUS.APPROVED) return true;
  if (isAdmin(role)) return true;
  if (resource.uploaderId === userId) return true;
  return false;
}

export function canBookmarkResource(resource, userId, role) {
  return canAccessResourceFile(resource, userId, role);
}
