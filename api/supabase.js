// Las credenciales están en variables de entorno
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// No imprimir ni devolver valores sensibles. Si faltan, manejaremos en tiempo de petición.

// ------ Rate limiting (básico, por IP) ------
// Nota: implementación en memoria por instancia (apto para protección básica).
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minuto
const RATE_LIMIT_MAX_REQUESTS = 60; // por ventana
const rateLimitMap = new Map();

// Helper para llamar a la API REST de Supabase
async function supabaseApi(method, table, filter = '', body = null) {
  const url = `${supabaseUrl}/rest/v1/${table}${filter}`;
  
  console.log(`API Call: ${method} ${url}`);
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${supabaseServiceKey}`,
    'apikey': supabaseServiceKey,
    'Prefer': 'return=representation'
  };

  const options = {
    method,
    headers
  };

  if (body) options.body = JSON.stringify(body);

  try {
    const response = await fetch(url, options);
    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (err) {
      data = { raw: text };
    }

    if (!response.ok) {
      console.error(`Error ${response.status}:`, data);
      const message = (data && data.message) ? data.message : (data && data.error) ? JSON.stringify(data) : `Error ${response.status}`;
      throw new Error(message);
    }

    return data;
  } catch (error) {
    console.error('Supabase API Error:', error);
    throw error;
  }
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

  // Rate limiting simple por IP
  try {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded ? String(forwarded).split(',')[0].trim() : (req.socket && req.socket.remoteAddress) || req.connection?.remoteAddress || 'unknown';
    const now = Date.now();
    let entry = rateLimitMap.get(ip);
    if (!entry || now > entry.reset) {
      entry = { count: 1, reset: now + RATE_LIMIT_WINDOW_MS };
      rateLimitMap.set(ip, entry);
    } else {
      entry.count += 1;
      rateLimitMap.set(ip, entry);
    }

    if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
      const retryAfter = Math.ceil((entry.reset - now) / 1000);
      res.setHeader('Retry-After', String(retryAfter));
      return res.status(429).json({ error: 'Too Many Requests' });
    }
  } catch (err) {
    // Si falla el rate limit por cualquier motivo, dejamos pasar la petición (no bloqueo crítico)
    console.warn('Rate limit check failed:', err);
  }

  // Verificar variables de entorno en tiempo de petición (no en build)
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('SUPABASE_URL or SUPABASE_SERVICE_KEY not configured on server');
    return res.status(500).json({ error: 'Internal Server Error' });
  }

  try {
    const { action, code, url, codes } = req.body;
    
    console.log('Acción recibida:', action);
    console.log('Body:', { action, code, url, codes });

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
    // Log completo en servidor, pero devolver mensaje genérico al cliente
    console.error('❌ Error en API:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
