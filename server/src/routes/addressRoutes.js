const express = require('express');
const router = express.Router();
const axios = require('axios');

// Caché simple en memoria (clave = query, valor = { data, timestamp })
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 3) {
      return res.json({ success: true, data: [] });
    }

    const normalizedQuery = q.trim().toLowerCase();

    // Verificar si ya tenemos esta consulta en caché
    const cached = cache.get(normalizedQuery);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`🟢 Cache hit: "${normalizedQuery}"`);
      return res.json({ success: true, data: cached.data });
    }

    console.log(`🔵 Buscando: "${normalizedQuery}"`);

    // Esperar un poco antes de hacer la petición (respetar límite de 1 req/seg)
    await new Promise(resolve => setTimeout(resolve, 300));

    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q,
        format: 'json',
        countrycodes: 'cl',
        limit: 5,
        addressdetails: 1,
      },
      headers: {
        'User-Agent': 'TechStore/1.0 (ignacio@techstore.cl)',
        'Accept-Language': 'es-CL,es;q=0.9',
      },
      timeout: 5000,
    });

    // Guardar en caché
    cache.set(normalizedQuery, {
      data: response.data,
      timestamp: Date.now(),
    });

    // Limpiar entradas antiguas del caché (cada 10 inserciones)
    if (cache.size > 100) {
      for (const [key, value] of cache.entries()) {
        if (Date.now() - value.timestamp > CACHE_TTL) {
          cache.delete(key);
        }
      }
    }

    res.json({ success: true, data: response.data });
  } catch (err) {
    console.error('Error en búsqueda de direcciones:', err.message);
    
    // Si es un error 429, devolver un array vacío en lugar de 500
    if (err.response?.status === 429) {
      return res.json({ success: true, data: [], message: 'Límite de búsquedas alcanzado. Intenta de nuevo en unos segundos.' });
    }

    res.status(500).json({ success: false, message: 'Error al buscar direcciones' });
  }
});

module.exports = router;