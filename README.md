# 🔗 NovaLinks - Acortador de Enlaces

Un acortador de URL moderno, rápido y fácil de usar con tema claro/oscuro, generador de QR y estadísticas en tiempo real.

## ✨ Características Principales

### 🎨 Diseño Moderno
- Interfaz intuitiva y responsiva
- Tema claro y oscuro (Dark Mode)
- Animaciones suaves
- Compatible con todos los dispositivos

### 🚀 Funcionalidades
- ✅ Acorta URLs al instante
- 📊 Visualiza estadísticas de visitas
- 🔗 Genera códigos QR para compartir
- 💾 Exporta tus enlaces en CSV
- 🔍 Busca y filtra enlaces fácilmente
- 💤 Organiza tus enlaces en tabs intuitivos

### 🔐 Seguridad
- Validación de URLs
- Almacenamiento seguro en localStorage
- Enlaces expiran automáticamente a los 7 días
- Sin recopilación de datos personales

## 📋 Cómo Usar

### 1. **Acortar un Enlace**
- Dirígete a la pestaña "Crear Enlace"
- Pega tu URL larga en el input
- Haz clic en "Acortar"
- Tu enlace corto se generará al instante

### 2. **Ver Mis Enlaces**
- Ve a la pestaña "Mis Enlaces"
- Aquí encontrarás todos tus enlaces guardados
- Puedes:
  - 📋 Copiar el enlace corto
  - 🔍 Buscar enlaces específicos
  - 🔀 Filtrar por fecha o popularidad
  - 📱 Generar código QR
  - 📤 Exportar como CSV

### 3. **Compartir Enlaces**
- Copia el enlace directamente
- Usa el botón "Compartir" para enviar por redes sociales
- Escanea el código QR con tu teléfono

## 🛠️ Instalación

### Requisitos
- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Conexión a internet

### Pasos
1. Descarga los archivos del proyecto
2. Abre `index.html` en tu navegador
3. ¡Listo! No requiere instalación

### Implementar en Vercel
1. Sube los archivos a un repositorio de GitHub
2. Conecta tu repositorio a Vercel
3. Especifica la carpeta `public` como raíz del proyecto
4. Deploy automático

## 📁 Estructura del Proyecto

```
📦 Acortador de link
├── 📄 vercel.json          # Configuración de Vercel
├── 📄 MEJORAS.md           # Documentación de mejoras
├── 📄 README.md            # Este archivo
└── 📁 public/
    ├── 📄 index.html       # Archivo principal
    ├── 📄 script.js        # Lógica de la aplicación
    ├── 📄 styles.css       # Estilos CSS
    ├── 📄 redirect.html    # Página de redirección
    ├── 📄 robots.txt       # Configuración SEO
    ├── 📄 sitemap.xml      # Mapa del sitio
    └── 📄 favicon.ico      # Icono del sitio
```

## 💻 Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Backend**: Supabase (Base de datos PostgreSQL)
- **Almacenamiento**: LocalStorage (cliente)
- **Iconos**: Font Awesome 6.4.0
- **Fuentes**: Google Fonts (Inter)
- **Hosting**: Vercel
- **QR**: QR Server API

## 🎯 Variables de Entorno

No se requieren variables de entorno. Supabase está configurado directamente en el código:

```javascript
const supabaseUrl = 'https://wnkkhnjywxrozdwcyhvp.supabase.co';
const supabaseKey = 'tu-key-aquí';
```

## 🌙 Preferencias del Usuario

El aplicativo guarda automáticamente:
- **Tema**: Light/Dark (en localStorage)
- **Enlaces**: Se guardan localmente y en Supabase
- **Preferencias**: Se mantienen entre sesiones

## 📊 Filtros Disponibles

- **Todos**: Muestra todos tus enlaces recientes
- **Más Recientes**: Ordenados por fecha (más nuevos primero)
- **Más Visitados**: Ordenados por número de visitas
- **Más Antiguos**: Ordenados por fecha (más viejos primero)

## 🔄 Sincronización

Los enlaces se sincronenizan entre:
- Aplicación web
- Base de datos Supabase
- Almacenamiento local del navegador

La sincronización es automática y ocurre cada vez que accionas un enlace.

## 📱 Responsive Design

- ✅ Desktop (1920px - 1024px)
- ✅ Tablet (768px - 1023px)
- ✅ Móvil (320px - 767px)

## 🎨 Personalizacion

Puedes personalizar los colores editando las variables CSS en `styles.css`:

```css
:root {
  --primary: #6366f1;           /* Color principal */
  --primary-dark: #4f46e5;      /* Color oscuro */
  --primary-light: #818cf8;     /* Color claro */
  --success: #10b981;           /* Éxito */
  --danger: #ef4444;            /* Peligro */
  --warning: #f59e0b;           /* Advertencia */
}
```

## 🚀 Próximas Mejoras Planeadas

- [ ] Autenticación de usuarios
- [ ] URLs personalizadas
- [ ] Protección con contraseña
- [ ] Dashboard de analytics
- [ ] API REST
- [ ] Integración con redes sociales
- [ ] Sincronización en la nube
- [ ] Historial de cambios

## 🤝 Contribuir

¿Tienes ideas para mejorar NovaLinks?

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Nova Innovations**  
📧 Email: novadevelopment.innovations@gmail.com

## 🙏 Agradecimientos

- [Supabase](https://supabase.com) - Backend
- [Font Awesome](https://fontawesome.com) - Iconos
- [Google Fonts](https://fonts.google.com) - Tipografía
- [QR Server](https://qrserver.com) - API de QR

## 📞 Soporte

¿Problemas o preguntas? Contacta a:
📧 novadevelopment.innovations@gmail.com

---

**Versión**: 2.0  
**Última actualización**: 7 de febrero de 2026  
**Estado**: En desarrollo activo ✅

### Cambios Recientes (v2.0)
- ✨ Nuevo diseño moderno con gradientes
- 🌙 Tema oscuro/claro
- 🎯 Sistema de tabs mejorado
- 🔍 Búsqueda y filtrado avanzado
- 📱 Generador de QR
- 💾 Exportación a CSV
- 📊 Estadísticas mejoradas
- 🎨 Animaciones suaves
- ⚡ Mejor rendimiento
- 🔐 Validación mejorada

¡Disfruta haciendo tu web más amigable con enlaces cortos! 🎉
