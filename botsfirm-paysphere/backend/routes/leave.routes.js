// leave.routes.js
// Mounts leave endpoints under /api/leave.
// To be implemented in a later phase. Stub router so the server can boot.

const express = require('express');
const router = express.Router();

router.use((req, res) => {
  res.status(501).json({ error: 'Leave endpoints not yet implemented' });
});

module.exports = router;
