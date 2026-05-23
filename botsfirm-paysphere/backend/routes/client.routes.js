// client.routes.js
// Mounts Client (tenant owner) endpoints under /api/client.
// To be implemented in a later phase. Stub router so the server can boot.

const express = require('express');
const router = express.Router();

router.use((req, res) => {
  res.status(501).json({ error: 'Client endpoints not yet implemented' });
});

module.exports = router;
