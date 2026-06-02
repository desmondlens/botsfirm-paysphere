/**
 * Botsfirm PaySphere — Leave Routes
 * Leave management handled in admin and client routes.
 * This file handles shared leave type lookups.
 */

const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

// Get leave types for tenant
router.get('/types', verifyToken, async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('leave_types')
      .select('*')
      .eq('tenant_id', req.user.tenant_id)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    res.json({ leave_types: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get leave request by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('leave_requests')
      .select(`
        *,
        employees(full_name, employee_number),
        leave_types(name, code)
      `)
      .eq('id', req.params.id)
      .eq('tenant_id', req.user.tenant_id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Leave request not found' });
    res.json({ request: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel leave request (employee only)
router.put('/:id/cancel', verifyToken, requireRole('employee'), async (req, res) => {
  try {
    const { data: employee } = await req.supabase
      .from('employees')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('tenant_id', req.user.tenant_id)
      .single();

    const { data, error } = await req.supabase
      .from('leave_requests')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .eq('employee_id', employee.id)
      .eq('tenant_id', req.user.tenant_id)
      .eq('status', 'pending')
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Leave request not found or cannot be cancelled' });

    res.json({ request: data, message: 'Leave request cancelled' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;