// superadmin.routes.js
// Mounts Super Admin endpoints under /api/super-admin.
// Endpoints: tenants CRUD, trial management, platform-wide audit, billing actions.
// To be implemented in a later phase. Stub router so the server can boot.

const express = require('express');
const router = express.Router();

router.use((req, res) => {
  res.status(501).json({ error: 'Super-admin endpoints not yet implemented' });
});

module.exports = router;
