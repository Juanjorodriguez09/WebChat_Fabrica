const API_URL = (typeof window !== 'undefined' && window.MICOMERCIO_CHAT_CONFIG?.apiUrl)
  || import.meta.env?.VITE_API_URL
  || 'https://auth.micomercio.co';

const API_TOKEN = (typeof window !== 'undefined' && window.MICOMERCIO_CHAT_CONFIG?.apiToken)
  || import.meta.env?.VITE_API_TOKEN
  || '';

function getSessionContext() {
  const cfg = (typeof window !== 'undefined' && window.MICOMERCIO_CHAT_CONFIG) || {};
  return {
    sender_id:      cfg.sender_id      || 'webchat-dev',
    IdEmpresa:      cfg.IdEmpresa      || null,
    IdSucursal:     cfg.IdSucursal     || null,
    IdCaja:         cfg.IdCaja         || null,
    IdUser:         cfg.IdUser         || null,
    nombre_empresa: cfg.nombre_empresa || null,
  };
}

export async function sendMessage({ text, imageBase64, imageMime }) {
  const body = { ...getSessionContext(), text };
  if (imageBase64) {
    body.imageBase64 = imageBase64;
    body.imageMime = imageMime || 'image/jpeg';
  }

  const res = await fetch(`${API_URL}/webchat/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_TOKEN}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}
