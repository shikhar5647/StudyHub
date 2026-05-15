/**
 * Role-based permissions for StudyHub API.
 * Keys are permission identifiers; values are roles allowed to perform them.
 */
const PERMISSIONS = {
  'course:read:published': ['student', 'instructor', 'admin'],
  'course:read:own': ['instructor', 'admin'],
  'course:read:all': ['admin'],
  'course:create': ['instructor', 'admin'],
  'course:update:own': ['instructor', 'admin'],
  'course:update:any': ['admin'],
  'course:delete:own': ['instructor', 'admin'],
  'course:delete:any': ['admin'],
  'course:enroll': ['student'],
  'user:read:self': ['student', 'instructor', 'admin'],
  'user:update:role': ['admin'],
  'user:list': ['admin'],
  'storage:upload': ['instructor', 'admin'],
  'storage:manage': ['instructor', 'admin'],
};

const ROLE_LABELS = {
  student: 'Student',
  instructor: 'Course Instructor',
  admin: 'Administrator',
};

const SIGNUP_ROLES = ['student', 'instructor'];

function roleHasPermission(role, permission) {
  const allowed = PERMISSIONS[permission];
  return Boolean(role && allowed && allowed.includes(role));
}

module.exports = {
  PERMISSIONS,
  ROLE_LABELS,
  SIGNUP_ROLES,
  roleHasPermission,
};
