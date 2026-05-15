export const ROLES = {
  STUDENT: 'student',
  INSTRUCTOR: 'instructor',
  ADMIN: 'admin',
};

export const ROLE_LABELS = {
  student: 'Student',
  instructor: 'Course Instructor',
  admin: 'Administrator',
};

export const ROLE_BADGE_CLASS = {
  student: 'bg-primary',
  instructor: 'bg-success',
  admin: 'bg-danger',
};

export function getUserRole(user) {
  return user?.role || null;
}

export function hasRole(user, ...roles) {
  const role = getUserRole(user);
  return role && roles.flat().includes(role);
}

export function isStudent(user) {
  return hasRole(user, ROLES.STUDENT);
}

export function isInstructor(user) {
  return hasRole(user, ROLES.INSTRUCTOR);
}

export function isAdmin(user) {
  return hasRole(user, ROLES.ADMIN);
}

export function dashboardPathForRole(role) {
  switch (role) {
    case ROLES.INSTRUCTOR:
      return '/instructor';
    case ROLES.ADMIN:
      return '/admin';
    default:
      return '/dashboard';
  }
}
