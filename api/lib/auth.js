import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function getUserFromRequest(req) {
  if (!supabaseAdmin) {
    return { user: null, error: 'Supabase not configured' };
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return { user: null, error: null };
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error) {
      return { user: null, error: error.message };
    }
    return { user, error: null };
  } catch (err) {
    return { user: null, error: err.message };
  }
}

export function requireAuth(handler) {
  return async (req, res) => {
    const { user, error } = await getUserFromRequest(req);

    if (error) {
      return res.status(401).json({ error: 'Authentication failed', details: error });
    }

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    req.user = user;
    return handler(req, res);
  };
}
