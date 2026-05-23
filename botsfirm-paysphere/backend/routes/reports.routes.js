// reports.routes.js
// Mounts report endpoints under /api/reports.
// To be implemented in a later phase. Stub router so the server can boot.

const express = require('express');
const router = express.Router();

router.use((req, res) => {
  res.status(501).json({ error: 'Reports endpoints not yet implemented' });
});

module.exports = router;
