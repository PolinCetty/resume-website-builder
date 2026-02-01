import { requireAuth, supabaseAdmin } from '../lib/auth.js';

async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', req.user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'Profile not found' });
        }
        throw error;
      }

      // Get website count
      const { count: websiteCount } = await supabaseAdmin
        .from('sites')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', req.user.id);

      return res.status(200).json({
        success: true,
        profile: {
          ...data,
          websites_created: websiteCount || 0
        }
      });
    }

    if (req.method === 'PUT') {
      const updates = req.body;

      // Only allow updating certain fields
      const allowedFields = ['full_name', 'avatar_url'];
      const safeUpdates = {};
      for (const field of allowedFields) {
        if (updates[field] !== undefined) {
          safeUpdates[field] = updates[field];
        }
      }

      const { data, error } = await supabaseAdmin
        .from('profiles')
        .update({
          ...safeUpdates,
          updated_at: new Date().toISOString()
        })
        .eq('id', req.user.id)
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({ success: true, profile: data });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Profile operation error:', error);
    res.status(500).json({
      success: false,
      error: 'Operation failed',
      details: error.message
    });
  }
}

export default requireAuth(handler);
