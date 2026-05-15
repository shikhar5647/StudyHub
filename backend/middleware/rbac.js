const { roleHasPermission } = require('../config/permissions');

function requireRole(...allowedRoles) {
  const flat = allowedRoles.flat();
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role || !flat.includes(role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${flat.join(' or ')}`,
      });
    }
    next();
  };
}

function requirePermission(permission) {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!roleHasPermission(role, permission)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action',
      });
    }
    next();
  };
}

module.exports = { requireRole, requirePermission };
