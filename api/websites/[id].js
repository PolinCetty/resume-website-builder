import { requireAuth, supabaseAdmin } from '../lib/auth.js';

async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Website ID required' });
  }

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabaseAdmin
        .from('sites')
        .select('*')
        .eq('id', id)
        .eq('user_id', req.user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'Website not found' });
        }
        throw error;
      }

      return res.status(200).json({ success: true, website: data });
    }

    if (req.method === 'PUT') {
      const updates = req.body;

      const { data, error } = await supabaseAdmin
        .from('sites')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', req.user.id)
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({ success: true, website: data });
    }

    if (req.method === 'DELETE') {
      const { error } = await supabaseAdmin
        .from('sites')
        .delete()
        .eq('id', id)
        .eq('user_id', req.user.id);

      if (error) throw error;

      return res.status(200).json({ success: true, message: 'Website deleted' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Website operation error:', error);
    res.status(500).json({
      success: false,
      error: 'Operation failed',
      details: error.message
    });
  }
}

export default requireAuth(handler);
