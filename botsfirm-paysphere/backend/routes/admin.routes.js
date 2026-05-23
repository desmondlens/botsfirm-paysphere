// admin.routes.js
// Mounts Admin endpoints under /api/admin.
// To be implemented in a later phase. Stub router so the server can boot.

const express = require('express');
const router = express.Router();

router.use((req, res) => {
  res.status(501).json({ error: 'Admin endpoints not yet implemented' });
});

module.exports = router;
