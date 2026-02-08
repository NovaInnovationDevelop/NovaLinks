export default function handler(req, res) {
  // No mostrar valores sensibles
  const hasUrl = !!process.env.SUPABASE_URL;
  const hasKey = !!process.env.SUPABASE_SERVICE_KEY;

  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({ SUPABASE_URL: hasUrl, SUPABASE_SERVICE_KEY: hasKey });
}
