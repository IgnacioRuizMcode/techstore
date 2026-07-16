const axios = require('axios');
const cheerio = require('cheerio');

// ─── Configuración de couriers ─────────────────
const carriers = {
  chilexpress: {
    name: 'Chilexpress',
    url: 'https://www.chilexpress.cl/seguimiento',
    scrape: async (trackingNumber) => {
      const response = await axios.get(`https://www.chilexpress.cl/seguimiento?tracking=${trackingNumber}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      const $ = cheerio.load(response.data);
      const status = $('.tracking-status').text().trim();
      const history = [];
      $('.tracking-history-item').each((i, el) => {
        history.push({
          date: $(el).find('.date').text().trim(),
          status: $(el).find('.status').text().trim()
        });
      });
      return { status, history, delivered: status.toLowerCase().includes('entregad') };
    }
  },
  starken: {
    name: 'Starken',
    url: 'https://www.starken.cl/seguimiento',
    scrape: async (trackingNumber) => {
      const response = await axios.get(`https://www.starken.cl/seguimiento/${trackingNumber}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      const $ = cheerio.load(response.data);
      const status = $('.tracking-status').text().trim();
      return { status, history: [], delivered: false };
    }
  },
  correos_chile: {
    name: 'Correos Chile',
    url: 'https://www.correos.cl/seguimiento',
    scrape: async (trackingNumber) => {
      const response = await axios.get(`https://www.correos.cl/seguimiento?tracking=${trackingNumber}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      const $ = cheerio.load(response.data);
      const status = $('.tracking-status').text().trim();
      return { status, history: [], delivered: false };
    }
  }
};

// ─── API oficial Chilexpress (registro gratuito) ─
const CHILEXPRESS_API_URL = 'https://api.wschilexpress.com/v1';

async function trackChilexpressAPI(trackingNumber) {
  const response = await axios.get(`${CHILEXPRESS_API_URL}/tracking/${trackingNumber}`, {
    headers: { 'Authorization': `Bearer ${process.env.CHILEXPRESS_API_KEY}` }
  });
  return response.data;
}

// ─── Servicio unificado ─────────────────────────
class TrackingService {
  async getTrackingInfo(trackingNumber, carrier) {
    try {
      const result = await carriers[carrier].scrape(trackingNumber);
      return {
        success: true,
        carrier: carriers[carrier].name,
        trackingNumber,
        status: result.status,
        history: result.history,
        delivered: result.delivered,
        trackedAt: new Date()
      };
    } catch (err) {
      console.error(`Error tracking ${carrier} ${trackingNumber}:`, err.message);
      return { success: false, error: err.message };
    }
  }

  async autoTrack(order) {
    const { trackingNumber, trackingCompany } = order;
    if (!trackingNumber || !carriers[trackingCompany]) return null;
    return this.getTrackingInfo(trackingNumber, trackingCompany);
  }
}

module.exports = new TrackingService();