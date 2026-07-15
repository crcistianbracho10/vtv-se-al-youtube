// api/get-live.js
export default async function handler(req, res) {
  // Permitir que cualquier sitio web consulte esta API (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // ID del canal de VTV Canal 8
  const channelId = "UC1toBK5z40-8rfxKGB1QCwg";
  const url = `https://www.youtube.com/channel/${channelId}/live`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      return res.status(500).json({ error: "No se pudo conectar con YouTube" });
    }

    const html = await response.text();
    
    // Buscamos la etiqueta canónica que contiene el ID del video real activo
    const match = html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([^"]+)"/);

    if (match && match[1]) {
      const videoId = match[1];
      return res.status(200).json({ 
        live: true, 
        videoId: videoId, 
        embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1` 
      });
    } else {
      return res.status(404).json({ live: false, message: "El canal no está transmitiendo en vivo actualmente" });
    }

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
