// api/get-live.js
export default async function handler(req, res) {
  // Permitir acceso desde tu frontend (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Content-Type', 'application/json');

  // URL del directo de VTV Canal 8 usando su alias oficial
  const url = 'https://www.youtube.com/@VTV-canal8/live';

  try {
    const response = await fetch(url, {
      headers: {
        // Un User-Agent real y moderno para evitar bloqueos y capturar la versión de escritorio
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'es-ES,es;q=0.9',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      return res.status(500).json({ live: false, error: "No se pudo conectar con YouTube" });
    }

    const html = await response.text();

    // Método 1: Buscar la URL canónica (Suele actualizarse al ID de video real del directo)
    let videoId = null;
    const canonicalMatch = html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([^"]+)"/);
    
    if (canonicalMatch && canonicalMatch[1]) {
      videoId = canonicalMatch[1];
    } else {
      // Método 2: Buscar dentro del JSON de configuración de YouTube si la primera falla
      const videoIdMatch = html.match(/"liveStreamabilityRenderer":\{"videoId":"([^"]+)"/);
      if (videoIdMatch && videoIdMatch[1]) {
        videoId = videoIdMatch[1];
      } else {
        // Método 3: Buscar en las etiquetas de metadatos de video de Twitter/FB de la cabecera
        const ogVideoMatch = html.match(/meta property="og:video:url" content="https:\/\/www\.youtube\.com\/embed\/([^"?]+)/);
        if (ogVideoMatch && ogVideoMatch[1]) {
          videoId = ogVideoMatch[1];
        }
      }
    }

    // Validamos que hayamos obtenido un ID con el formato clásico de 11 caracteres de YouTube
    if (videoId && videoId.length === 11) {
      return res.status(200).json({
        live: true,
        videoId: videoId,
        embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&rel=0`
      });
    } else {
      return res.status(404).json({ 
        live: false, 
        message: "No se detectó transmisión activa en este momento." 
      });
    }

  } catch (error) {
    return res.status(500).json({ live: false, error: error.message });
  }
}
