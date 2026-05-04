const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

const protect = [
  ClerkExpressRequireAuth({
    // If not authenticated, Clerk will throw an error that we can catch or let express handle
  }),
  (req, res, next) => {
    // Clerk populates req.auth
    if (req.auth && req.auth.userId) {
      req.user = { 
        id: req.auth.userId,
        orgId: req.auth.orgId || null
      };
      next();
    } else {
      res.status(401).json({ message: 'Not authorized, no token' });
    }
  }
];

module.exports = { protect };
