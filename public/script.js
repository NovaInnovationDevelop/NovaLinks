import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://wurtrezftedbskpqsnrg.supabase.co';
const supabaseKey = 'sb_publishable_1iZGz2oc6E_3lTOkQAwh8A_86cgNigR';
const supabase = createClient(supabaseUrl, supabaseKey);

// ============ ELEMENTOS DEL DOM ============
const input = document.getElementById('link');
const button = document.getElementById('acortar');
const resultado = document.getElementById('resultado');
const container = document.getElementById('myLinks');
const themeToggle = document.getElementById('theme-toggle');
const searchInput = document.getElementById('search-input');
const filterSelect = document.getElementById('filter-select');
const exportBtn = document.getElementById('export-btn');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// ============ FUNCIONES DE UTILIDAD ============

// Validar URL
function isValidURL(url) {
  try {
    return /^https?:\/\/.+/.test(url);
  } catch {
    return false;
  }
}

// Generar código corto aleatorio
function generateCode() {
  return Math.random().toString(36).substring(2, 8);
}

// Formatear fechas
function formatDate(timestamp) {
  const d = new Date(timestamp);
  return d.toLocaleDateString('es-ES') + ' ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

// Formatear URL para mostrar
function truncateUrl(url, maxLength = 50) {
  return url.length > maxLength ? url.substring(0, maxLength) + '...' : url;
}

// ============ TEMA OSCURO/CLARO ============

// Cargar preferencia de tema
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark-mode');
    themeToggle.textContent = '☀️';
  }
}

themeToggle.addEventListener('click', () => {
  document.documentElement.classList.toggle('dark-mode');
  const isDark = document.documentElement.classList.contains('dark-mode');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  themeToggle.textContent = isDark ? '☀️' : '🌙';
});

// ============ TABS ============

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    
    // Activar tab btn
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Mostrar contenido
    tabContents.forEach(content => content.style.display = 'none');
    document.getElementById(tab).style.display = 'block';
  });
});

// ============ GUARDAR ENLACE ============

function saveLinkLocal(code, url, customAlias = null) {
  let links = JSON.parse(localStorage.getItem("myLinks")) || [];
  links.push({ 
    code, 
    url, 
    customAlias,
    createdAt: Date.now(),
    expiresAt: Date.now() + 604800000 // 7 días
  });
  localStorage.setItem("myLinks", JSON.stringify(links));
}

// ============ ELIMINAR ENLACE ============

async function deleteLink(code) {
  if (!confirm('¿Estás seguro de que deseas eliminar este enlace?')) return;
  
  try {
    await supabase.from('links').delete().eq('code', code);
    let links = JSON.parse(localStorage.getItem("myLinks")) || [];
    links = links.filter(l => l.code !== code);
    localStorage.setItem("myLinks", JSON.stringify(links));
    renderLinks();
    
    // Notificación
    showNotification('Enlace eliminado correctamente', 'success');
  } catch (err) {
    console.error("Error eliminando enlace:", err);
    showNotification('Error al eliminar enlace', 'error');
  }
}

// ============ RENDERIZAR ENLACES ============

async function renderLinks() {
  let links = JSON.parse(localStorage.getItem("myLinks")) || [];

  if (!links.length) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-link"></i>
        <p>No tienes enlaces guardados aún.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = "";

  // Aplicar filtros
  const searchTerm = searchInput.value.toLowerCase();
  const filterType = filterSelect.value;
  
  links = links.filter(l => l.url.toLowerCase().includes(searchTerm));
  
  // Ordenar según filtro
  if (filterType === 'recent') {
    links.sort((a, b) => b.createdAt - a.createdAt);
  } else if (filterType === 'oldest') {
    links.sort((a, b) => a.createdAt - b.createdAt);
  } else if (filterType === 'popular') {
    links.sort((a, b) => (b.visits || 0) - (a.visits || 0));
  } else { // all = recent
    links.sort((a, b) => b.createdAt - a.createdAt);
  }

  // Obtener datos de Supabase
  const codes = links.map(l => l.code);
  if (codes.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-search"></i>
        <p>No hay resultados para tu búsqueda.</p>
      </div>
    `;
    return;
  }

  const { data: existingLinks } = await supabase.from('links').select('code, visits').in('code', codes);
  const existingCodes = existingLinks ? existingLinks.map(l => l.code) : [];

  const now = Date.now();
  for (let link of links) {
    // Autoeliminar si expiró o no existe en BD
    if (now > link.expiresAt || !existingCodes.includes(link.code)) {
      await deleteLink(link.code);
      continue;
    }

    const visitsData = existingLinks.find(l => l.code === link.code);
    const visits = visitsData ? visitsData.visits : 0;
    const createdAt = formatDate(link.createdAt);
    const expiresAt = formatDate(link.expiresAt);
    const shortUrl = `${window.location.origin}/${link.code}`;
    const timeLeft = Math.ceil((link.expiresAt - now) / (1000 * 60 * 60));

    const card = document.createElement("div");
    card.classList.add("link-card");
    card.innerHTML = `
      <div class="link-card-header">
        <div class="link-card-title">
          <i class="fas fa-check-circle"></i>
          ${link.customAlias ? 'Personalizado' : 'Automático'}
        </div>
        <button class="delete-btn" onclick="deleteLink('${link.code}')">
          <i class="fas fa-trash"></i> Eliminar
        </button>
      </div>

      <div class="link-info">
        <strong>Original:</strong>
        <a href="${link.url}" target="_blank" title="${link.url}">
          ${truncateUrl(link.url)}
        </a>
      </div>

      <div class="link-info">
        <strong>Corto:</strong>
        <a href="${shortUrl}" target="_blank" id="short-${link.code}">
          ${shortUrl}
        </a>
      </div>

      <div class="link-stats">
        <div class="stat-item">
          <div class="stat-number">${visits}</div>
          <div class="stat-label">Visitas</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">${timeLeft}h</div>
          <div class="stat-label">Expira en</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">${createdAt.split(' ')[0]}</div>
          <div class="stat-label">Creado</div>
        </div>
      </div>

      <div class="link-actions">
        <button class="copy-btn" data-code="${link.code}">
          <i class="fas fa-copy"></i> Copiar
        </button>
        <button class="qr-btn" onclick="generateQR('${link.code}', '${shortUrl}')">
          <i class="fas fa-qrcode"></i> QR
        </button>
        <button class="share-btn" id="share-${link.code}">
          <i class="fas fa-share"></i> Compartir
        </button>
      </div>
    `;
    container.appendChild(card);
  }

  // Funcionalidad copiar
  document.querySelectorAll(".copy-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const code = e.currentTarget.dataset.code;
      const shortLink = document.getElementById(`short-${code}`).textContent;
      navigator.clipboard.writeText(shortLink).then(() => {
        showNotification('Enlace copiado al portapapeles', 'success');
        btn.innerHTML = '<i class="fas fa-check"></i> Copiado';
        setTimeout(() => btn.innerHTML = '<i class="fas fa-copy"></i> Copiar', 2000);
      });
    });
  });

  // Funcionalidad compartir
  document.querySelectorAll(".share-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const code = e.currentTarget.id.replace('share-', '');
      const shortLink = document.getElementById(`short-${code}`).textContent;
      if (navigator.share) {
        navigator.share({
          title: 'NovaLinks',
          text: 'Te comparto este enlace acortado',
          url: shortLink
        }).catch(err => console.log('Error sharing:', err));
      } else {
        navigator.clipboard.writeText(shortLink);
        showNotification('Enlace copiado para compartir', 'success');
      }
    });
  });
}

// Hacer la función deleteLink global
window.deleteLink = deleteLink;

// ============ GENERAR QR ============

async function generateQR(code, shortUrl) {
  const qrModal = document.getElementById('qr-modal');
  const qrImg = document.getElementById('qr-img');
  
  // URL para preview en PNG
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&format=png&data=${encodeURIComponent(shortUrl)}`;
  
  qrImg.src = qrApiUrl;
  qrImg.dataset.url = shortUrl;
  qrImg.dataset.code = code;
  qrModal.style.display = 'block';
}

window.generateQR = generateQR;

async function downloadQR(format = 'png') {
  const qrImg = document.getElementById('qr-img');
  const shortUrl = qrImg.dataset.url;
  const code = qrImg.dataset.code;
  
  if (!shortUrl) {
    showNotification('Error: No hay datos de QR', 'error');
    return;
  }

  try {
    // Usar la API de qrserver con el formato especificado
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&format=${format}&data=${encodeURIComponent(shortUrl)}`;
    
    // Descargar el archivo
    const response = await fetch(qrApiUrl);
    const blob = await response.blob();
    
    // Crear URL de descarga
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `qr-${code}.${format}`;
    
    // Descargar
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    
    showNotification(`QR descargado en formato ${format.toUpperCase()}`, 'success');
  } catch (err) {
    console.error('Error descargando QR:', err);
    showNotification('Error al descargar el QR', 'error');
  }
}

window.downloadQR = downloadQR;

// ============ CREAR ENLACE ============

button.addEventListener('click', async () => {
  const url = input.value.trim();
  if (!url) {
    showNotification('Ingresa un enlace válido', 'error');
    return;
  }
  if (!isValidURL(url)) {
    showNotification('Por favor ingresa una URL válida (https://...)', 'error');
    return;
  }

  try {
    let code, exists = true;
    while (exists) {
      code = generateCode();
      const { data } = await supabase.from('links').select('code').eq('code', code).single();
      exists = !!data;
    }

    const { error } = await supabase.from('links').insert([{ code, url, visits: 0 }]);
    if (error) throw new Error(error.message);

    const shortUrl = `${window.location.origin}/${code}`;
    resultado.innerHTML = `
      <div style="margin-top: 20px; padding: 20px; background: linear-gradient(135deg, #f0f9ff 0%, #f5f3ff 100%); border-left: 4px solid #6366f1; border-radius: 12px;">
        <p style="margin-bottom: 12px; font-weight: 600; color: #4f46e5;">
          ✅ ¡Enlace creado exitosamente!
        </p>
        <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
          <a href="${shortUrl}" target="_blank" style="color: #6366f1; text-decoration: none; font-weight: 600; word-break: break-all;">
            ${shortUrl}
          </a>
          <button class="copy-btn-result">📋 Copiar</button>
          <button onclick="generateQR('${code}', '${shortUrl}')" style="background: #f59e0b; color: #fff; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600;">📱 QR</button>
        </div>
        <span class="copied-msg"></span>
      </div>
    `;

    const copyBtn = resultado.querySelector('.copy-btn-result');
    const copiedMsg = resultado.querySelector('.copied-msg');
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(shortUrl).then(() => {
        copiedMsg.classList.add('show');
        copiedMsg.textContent = '✓ Copiado!';
        setTimeout(() => copiedMsg.classList.remove('show'), 1500);
      });
    });

    saveLinkLocal(code, url);
    input.value = '';
    renderLinks();
    showNotification('Enlace acortado correctamente', 'success');
  } catch (err) {
    console.error("Error:", err);
    showNotification('Error al acortar el enlace', 'error');
  }
});

// ============ BÚSQUEDA Y FILTRADO ============

searchInput.addEventListener('input', renderLinks);
filterSelect.addEventListener('change', renderLinks);

// ============ EXPORTAR ENLACES ============

exportBtn.addEventListener('click', () => {
  let links = JSON.parse(localStorage.getItem("myLinks")) || [];
  if (!links.length) {
    showNotification('No hay enlaces para exportar', 'warning');
    return;
  }

  const csv = [
    ['Código', 'URL Original', 'Enlace Corto', 'Creado', 'Expira'].join(','),
    ...links.map(l => [
      l.code,
      `"${l.url}"`,
      `${window.location.origin}/${l.code}`,
      new Date(l.createdAt).toLocaleString(),
      new Date(l.expiresAt).toLocaleString()
    ].join(','))
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mis-enlaces.csv';
  a.click();
  window.URL.revokeObjectURL(url);
  showNotification('Enlaces exportados en CSV', 'success');
});

// ============ NOTIFICACIONES ============

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 16px 20px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    font-weight: 600;
    z-index: 999;
    animation: slideIn 0.3s ease-out;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Agregar animaciones
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(400px); opacity: 0; }
  }
`;
document.head.appendChild(style);

// ============ MODALES ============

const privacyLink = document.getElementById('privacy-link');
const termsLink = document.getElementById('terms-link');
const privacyModal = document.getElementById('privacy-modal');
const termsModal = document.getElementById('terms-modal');
const qrModal = document.getElementById('qr-modal');
const closePrivacy = document.getElementById('close-privacy');
const closeTerms = document.getElementById('close-terms');
const closeQR = document.getElementById('close-qr');

privacyLink.addEventListener('click', e => { e.preventDefault(); privacyModal.style.display = 'block'; });
termsLink.addEventListener('click', e => { e.preventDefault(); termsModal.style.display = 'block'; });

closePrivacy.addEventListener('click', () => privacyModal.style.display = 'none');
closeTerms.addEventListener('click', () => termsModal.style.display = 'none');
closeQR.addEventListener('click', () => qrModal.style.display = 'none');

window.addEventListener('click', e => {
  if(e.target == privacyModal) privacyModal.style.display = 'none';
  if(e.target == termsModal) termsModal.style.display = 'none';
  if(e.target == qrModal) qrModal.style.display = 'none';
});

// ============ INICIALIZACIÓN ============

initTheme();
renderLinks();
