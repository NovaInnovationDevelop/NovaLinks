import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://wnkkhnjywxrozdwcyhvp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indua2tobmp5d3hyb3pkd2N5aHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0OTEzNDEsImV4cCI6MjA3NDA2NzM0MX0.1ZC8xNqvDe8PI0vFT_12xAyn00WI_zM6sbNW2lYoE0E';
const supabase = createClient(supabaseUrl, supabaseKey);

const input = document.getElementById('link');
const button = document.getElementById('acortar');
const resultado = document.getElementById('resultado');
const container = document.getElementById('myLinks');

// 🔹 Guardar enlace en localStorage
function saveLinkLocal(code, url) {
  let links = JSON.parse(localStorage.getItem("myLinks")) || [];
  links.push({ code, url, createdAt: Date.now() });
  localStorage.setItem("myLinks", JSON.stringify(links));
}

// 🔹 Eliminar enlace (Supabase + localStorage)
async function deleteLink(code) {
  try {
    await supabase.from('links').delete().eq('code', code);

    let links = JSON.parse(localStorage.getItem("myLinks")) || [];
    links = links.filter(l => l.code !== code);
    localStorage.setItem("myLinks", JSON.stringify(links));

    renderLinks();
  } catch (err) {
    console.error("Error eliminando enlace:", err);
  }
}

// 🔹 Formatear fechas
function formatDate(timestamp) {
  const d = new Date(timestamp);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
}

// 🔹 Renderizar enlaces de forma optimizada
async function renderLinks() {
  let links = JSON.parse(localStorage.getItem("myLinks")) || [];

  if (!links.length) {
    container.innerHTML = "<p>No tienes enlaces guardados.</p>";
    return;
  }

  container.innerHTML = "";

  // Orden descendente por más reciente
  links.sort((a, b) => b.createdAt - a.createdAt);

  // 🔹 Obtener todos los códigos que existen en Supabase de una sola vez
  const codes = links.map(l => l.code);
  const { data: existingLinks } = await supabase.from('links').select('code, visits').in('code', codes);
  const existingCodes = existingLinks.map(l => l.code);

  const now = Date.now();
  for (let link of links) {
    // Autoeliminar +7 días o si no existe en Supabase
    if (now - link.createdAt > 604800000 || !existingCodes.includes(link.code)) {
      await deleteLink(link.code);
      continue;
    }

    const visitsData = existingLinks.find(l => l.code === link.code);
    const createdAt = formatDate(link.createdAt);
    const expiresAt = formatDate(link.createdAt + 604800000);

    const card = document.createElement("div");
    card.classList.add("link-card");
    card.innerHTML = `
      <div class="link-card-header">
        <button class="delete-btn" onclick="deleteLink('${link.code}')">🗑️</button>
      </div>
      <div class="link-info"><strong>Original:</strong> <a href="${link.url}" target="_blank">${link.url}</a></div>
      <div class="link-info"><strong>Corto:</strong> 
        <a href="${window.location.origin}/${link.code}" target="_blank" id="short-${link.code}">${window.location.origin}/${link.code}</a>
        <button class="copy-btn" data-code="${link.code}">📋 Copiar</button>
      </div>
      <div class="link-info"><strong>Visitas:</strong> ${visitsData ? visitsData.visits : 0}</div>
      <div class="link-info"><strong>Creado:</strong> ${createdAt}</div>
      <div class="link-info"><strong>Expira:</strong> ${expiresAt}</div>
    `;
    container.appendChild(card);
  }

  // 🔹 Funcionalidad copiar en cada tarjeta
  document.querySelectorAll(".copy-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const code = e.currentTarget.dataset.code;
      const shortLink = document.getElementById(`short-${code}`).textContent;
      navigator.clipboard.writeText(shortLink).then(() => {
        btn.textContent = "✅ Copiado";
        setTimeout(() => btn.textContent = "📋 Copiar", 2000);
      });
    });
  });
}

// 🔹 Hacer la función deleteLink global
window.deleteLink = deleteLink;

// 🔹 Crear enlace corto
button.addEventListener('click', async () => {
  const url = input.value.trim();
  if (!url) return alert('Ingresa un enlace válido');

  let code, exists = true;
  while (exists) {
    code = Math.random().toString(36).substring(2, 8);
    const { data } = await supabase.from('links').select('code').eq('code', code).single();
    exists = !!data;
  }

  const { error } = await supabase.from('links').insert([{ code, url, visits: 0 }]);
  if (error) return alert('Error al guardar enlace: ' + error.message);

  // Resultado principal con botón copiar
  const shortUrl = `${window.location.origin}/${code}`;
  resultado.innerHTML = `
    Tu enlace corto: 
    <a href="${shortUrl}" target="_blank">${shortUrl}</a>
    <button class="copy-btn-result">📋 Copiar</button>
    <span class="copied-msg">Copiado!</span>
  `;

  // Funcionalidad copiar
  const copyBtn = resultado.querySelector('.copy-btn-result');
  const copiedMsg = resultado.querySelector('.copied-msg');
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(shortUrl).then(() => {
      copiedMsg.classList.add('show');
      setTimeout(() => copiedMsg.classList.remove('show'), 1500);
    });
  });

  saveLinkLocal(code, url);
  renderLinks();
});

// 🔹 Render inicial
renderLinks();
