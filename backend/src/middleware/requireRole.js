// Demo-level authorization: the frontend sends the signed-in role in
// x-user-role. Swap for real session/JWT verification in production.
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const role = req.header('x-user-role');
    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({ error: 'Недостаточно прав для этого действия' });
    }
    next();
  };
}
