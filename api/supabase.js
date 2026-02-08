// Las credenciales están en variables de entorno
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Faltan variables de entorno: SUPABASE_URL o SUPABASE_SERVICE_KEY');
}

// Helper para llamar a la API REST de Supabase
async function supabaseApi(method, table, filter = '', body = null) {
  const url = `${supabaseUrl}/rest/v1/${table}${filter}`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${supabaseServiceKey}`,
    'Prefer': 'return=representation'
  };

  const options = {
    method,
    headers
  };

  if (body) options.body = JSON.stringify(body);

  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Error: ${response.status}`);
  }

  return data;
}

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
        await supabaseApi('POST', 'links', '', { code, url, visits: 0 });
        return res.status(200).json({ success: true });
      }

      if (action === 'delete') {
        // Eliminar un enlace
        await supabaseApi('DELETE', 'links', `?code=eq.${code}`);
        return res.status(200).json({ success: true });
      }

      if (action === 'check') {
        // Verificar si un código ya existe
        try {
          const data = await supabaseApi('GET', 'links', `?code=eq.${code}&select=code`);
          return res.status(200).json({ exists: data.length > 0 });
        } catch {
          return res.status(200).json({ exists: false });
        }
      }

      if (action === 'getByCode') {
        // Obtener enlace por código
        try {
          const data = await supabaseApi('GET', 'links', `?code=eq.${code}&select=url,visits`);
          return res.status(200).json(data[0] || null);
        } catch {
          return res.status(200).json(null);
        }
      }

      if (action === 'getByCodes') {
        // Obtener múltiples enlaces
        const codeList = codes.map(c => `code.eq.${c}`).join(',');
        try {
          const data = await supabaseApi('GET', 'links', `?or=(${codeList})&select=code,visits,url`);
          return res.status(200).json(data || []);
        } catch {
          return res.status(200).json([]);
        }
      }

      if (action === 'incrementVisits') {
        // Incrementar visitas
        try {
          const data = await supabaseApi('GET', 'links', `?code=eq.${code}&select=visits`);
          const newVisits = (data[0]?.visits || 0) + 1;
          await supabaseApi('PATCH', 'links', `?code=eq.${code}`, { visits: newVisits });
          return res.status(200).json({ success: true, visits: newVisits });
        } catch (err) {
          return res.status(200).json({ success: true });
        }
      }

      return res.status(400).json({ error: 'Acción no válida' });
    }

    return res.status(405).json({ error: 'Método no permitido' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
