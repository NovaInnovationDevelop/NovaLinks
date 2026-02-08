import { createClient } from '@supabase/supabase-js';

// Las credenciales están en variables de entorno en Vercel
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Faltan variables de entorno: SUPABASE_URL o SUPABASE_SERVICE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { action, code, url, codes } = req.body;

    if (req.method === 'POST') {
      if (action === 'insert') {
        // Insertar un nuevo enlace
        const { error } = await supabase.from('links').insert([{ code, url, visits: 0 }]);
        if (error) throw error;
        return res.status(200).json({ success: true });
      }

      if (action === 'delete') {
        // Eliminar un enlace
        const { error } = await supabase.from('links').delete().eq('code', code);
        if (error) throw error;
        return res.status(200).json({ success: true });
      }

      if (action === 'check') {
        // Verificar si un código ya existe
        const { data, error } = await supabase
          .from('links')
          .select('code')
          .eq('code', code)
          .single();
        if (error && error.code !== 'PGRST116') throw error;
        return res.status(200).json({ exists: !!data });
      }

      if (action === 'getByCode') {
        // Obtener enlace por código
        const { data, error } = await supabase
          .from('links')
          .select('url, visits')
          .eq('code', code)
          .single();
        if (error && error.code !== 'PGRST116') throw error;
        return res.status(200).json(data || null);
      }

      if (action === 'getByCodes') {
        // Obtener múltiples enlaces por códigos
        const { data, error } = await supabase
          .from('links')
          .select('code, visits, url')
          .in('code', codes);
        if (error) throw error;
        return res.status(200).json(data || []);
      }

      if (action === 'incrementVisits') {
        // Incrementar contador de visitas
        const { data: link, error: fetchError } = await supabase
          .from('links')
          .select('visits')
          .eq('code', code)
          .single();
        
        if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
        
        const newVisits = (link?.visits || 0) + 1;
        const { error: updateError } = await supabase
          .from('links')
          .update({ visits: newVisits })
          .eq('code', code);
        
        if (updateError) throw updateError;
        return res.status(200).json({ success: true, visits: newVisits });
      }

      return res.status(400).json({ error: 'Acción no válida' });
    }

    return res.status(405).json({ error: 'Método no permitido' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
