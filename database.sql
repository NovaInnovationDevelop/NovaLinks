-- Crear tabla 'links' para NovaLinks en Supabase
CREATE TABLE links (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(10) UNIQUE NOT NULL,
  url TEXT NOT NULL,
  visits INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índice en 'code' para búsquedas rápidas
CREATE INDEX idx_links_code ON links(code);

-- Crear política de seguridad (RLS) para permitir lectura pública
ALTER TABLE links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura pública" ON links
  FOR SELECT USING (true);

CREATE POLICY "Permitir inserción pública" ON links
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir actualización de visitas" ON links
  FOR UPDATE USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir eliminación pública" ON links
  FOR DELETE USING (true);
