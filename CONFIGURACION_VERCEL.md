# Configuración de Variables de Entorno para Vercel

## ¿Qué hicimos?

Movimos tus credenciales de Supabase del código frontend a un **backend serverless** en Vercel. Ahora las credenciales están **protegidas en el servidor** y no se muestran en el navegador.

## Pasos a seguir:

### 1. **Obtener la Service Key de Supabase**

1. Ve a [Supabase Console](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **Settings** → **API**
4. Desplázate hasta la sección **"Legacy anon, service_role API keys"**
5. Verás dos claves:
   - Una etiquetada como **"public"** (esto es la anon key - NO la uses)
   - Una etiquetada como **"service_role"** ← **COPIA ESTA**

### 2. **Configurar en Vercel**

1. Ve a tu proyecto en [Vercel](https://vercel.com)
2. **Settings** → **Environment Variables**
3. Añade estas dos variables:
   - **Nombre:** `SUPABASE_URL`
   - **Valor:** `https://wurtrezftedbskpqsnrg.supabase.co`
   
   - **Nombre:** `SUPABASE_SERVICE_KEY`
   - **Valor:** (pega la Service Role Key que copiaste en step 1)

4. Haz redeploy de tu proyecto

### 3. **Para desarrollo local (opcional)**

El archivo `.env.local` ya está creado. Edítalo y añade:
```
SUPABASE_URL=https://wurtrezftedbskpqsnrg.supabase.co
SUPABASE_SERVICE_KEY=<pega_aqui_tu_service_key>
```

Luego puedes probar localmente ejecutando un servidor Node.js que soporte Vercel Functions.

**Importante:** No comitees `.env.local` ni ningún archivo con claves privadas. Si ya subiste una `service_role` a tu repositorio, **rótala** desde Supabase (Settings → API → Legacy keys) y reemplázala en Vercel.

## ¿Qué cambió?

- ✅ `script.js`: Ya no tiene credenciales hardcodeadas
- ✅ `redirect.html`: Ya no importa Supabase directamente
- ✅ Nuevo archivo: `api/supabase.js` (backend serverless)
- ✅ Las credenciales están SOLO en el servidor Vercel

## Funcionalidades que ahora usan la API:

- ✅ Crear enlaces acortados
- ✅ Buscar enlaces existentes
- ✅ Eliminar enlaces
- ✅ Contar visitas
- ✅ Redirigimientos

¡Ahora tus credenciales están seguras! 🔒
