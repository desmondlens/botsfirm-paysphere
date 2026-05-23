// employee.routes.js
// Mounts Employee endpoints under /api/employee.
// To be implemented in a later phase. Stub router so the server can boot.

const express = require('express');
const router = express.Router();

router.use((req, res) => {
  res.status(501).json({ error: 'Employee endpoints not yet implemented' });
});

module.exports = router;
