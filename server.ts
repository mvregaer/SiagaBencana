import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

const app = express();
app.use(express.json());
const PORT = 3000;

// XML Parser
const parser = new XMLParser();

// Cache mechanism
const cache = {
  bencana: { data: null as any, timestamp: 0 }
};
const CACHE_TTL = 60 * 1000; // 1 minute

async function fetchBMKGXmls() {
  const urlTerkini = 'https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.xml';
  const urlDirasakan = 'https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.xml';
  
  const [resTerkini, resDirasakan] = await Promise.all([
    axios.get(urlTerkini, { responseType: 'text' }).catch(() => null),
    axios.get(urlDirasakan, { responseType: 'text' }).catch(() => null)
  ]);

  const rawTerkini = resTerkini ? parser.parse(resTerkini.data) : null;
  const rawDirasakan = resDirasakan ? parser.parse(resDirasakan.data) : null;

  return { rawTerkini, rawDirasakan };
}

// Generate Simulasi Data
function getSimulasiData() {
  const now = new Date().toISOString();
  return [
    {
      id: "sim-tsunami-1",
      type: "tsunami",
      title: "Peringatan Tsunami Dini (Simulasi)",
      description: "Peringatan dini tsunami untuk wilayah pesisir selatan Jawa.",
      latitude: -8.5,
      longitude: 110.0,
      location: "Samudera Hindia Selatan Jawa",
      severity: "awas",
      source: "Simulasi BMKG",
      eventTime: now,
      updatedAt: now,
      instruction: "Jauhi pantai dan sungai. Segera evakuasi ke dataran tinggi."
    },
    {
      id: "sim-banjir-1",
      type: "flood",
      title: "Banjir Bandang (Simulasi)",
      description: "Banjir melanda permukiman akibat curah hujan tinggi.",
      latitude: -6.1,
      longitude: 106.8,
      location: "Jakarta Utara",
      severity: "siaga",
      source: "Simulasi BPBD",
      eventTime: now,
      updatedAt: now,
      instruction: "Matikan aliran listrik, evakuasi ke tempat yang lebih tinggi."
    },
    {
      id: "sim-longsor-1",
      type: "landslide",
      title: "Tanah Longsor Menutup Akses (Simulasi)",
      description: "Longsor menutup jalan provinsi menyusul hujan deras berhari-hari.",
      latitude: -7.1,
      longitude: 107.5,
      location: "Kabupaten Bandung",
      severity: "waspada",
      source: "Simulasi BNPB",
      eventTime: now,
      updatedAt: now,
      instruction: "Hindari area tebing dan lereng curam."
    },
    {
      id: "sim-volcano-1",
      type: "volcano",
      title: "Erupsi Gunung Merapi (Simulasi)",
      description: "Terjadi awan panas guguran sejauh 3 km ke arah barat daya.",
      latitude: -7.54,
      longitude: 110.44,
      location: "Jawa Tengah/Yogyakarta",
      severity: "siaga",
      source: "Simulasi PVMBG",
      eventTime: now,
      updatedAt: now,
      instruction: "Tidak melakukan kegiatan di zona bahaya radius 5 km."
    },
    {
      id: "sim-extreme-1",
      type: "extreme_weather",
      title: "Angin Kencang (Simulasi)",
      description: "Peringatan cuaca ekstrem dan angin kencang berkecepatan 40 knot.",
      latitude: -5.1,
      longitude: 119.4,
      location: "Makassar",
      severity: "waspada",
      source: "Simulasi BMKG",
      eventTime: now,
      updatedAt: now,
      instruction: "Waspada pohon tumbang, hindari berteduh di bawah reklame."
    }
  ];
}

async function getNormalizedData() {
  const now = Date.now();
  if (cache.bencana.data && now - cache.bencana.timestamp < CACHE_TTL) {
    return cache.bencana.data;
  }
  
  let normalized = [];
  
  try {
    const { rawTerkini, rawDirasakan } = await fetchBMKGXmls();
    
    let allGempa = [];
    if (rawTerkini?.Infogempa?.gempa) {
       allGempa.push(...(Array.isArray(rawTerkini.Infogempa.gempa) ? rawTerkini.Infogempa.gempa : [rawTerkini.Infogempa.gempa]));
    }
    if (rawDirasakan?.Infogempa?.gempa) {
       allGempa.push(...(Array.isArray(rawDirasakan.Infogempa.gempa) ? rawDirasakan.Infogempa.gempa : [rawDirasakan.Infogempa.gempa]));
    }
    
    // Deduplicate by DateTime
    const uniqueGempa = Array.from(new Map(allGempa.map(g => [g.DateTime, g])).values());

    const parsedGempa = uniqueGempa.map((g: any, index: number) => {
      const coords = g.point?.coordinates || g.Coordinates || "";
      const [latStr, lonStr] = coords.split(',');
      const mag = parseFloat(g.Magnitude || 0);
      let severity = "info";
      if (mag >= 6.0) severity = "awas";
      else if (mag >= 5.0) severity = "siaga";
      else if (mag >= 4.0) severity = "waspada";

      return {
        id: `bmkg-gempa-${g.DateTime || index}`,
        type: "earthquake",
        title: `Gempa M${g.Magnitude} di ${g.Wilayah}`,
        description: `Kedalaman: ${g.Kedalaman}.${g.Potensi ? ' ' + g.Potensi : ''}${g.Dirasakan ? ' Dirasakan: ' + g.Dirasakan : ''}`,
        latitude: parseFloat(latStr || "0"),
        longitude: parseFloat(lonStr || "0"),
        location: g.Wilayah,
        severity: severity,
        source: "BMKG Indonesia",
        eventTime: `${g.Tanggal} ${g.Jam}`,
        updatedAt: new Date().toISOString(),
        instruction: g.Potensi?.toLowerCase().includes('tsunami') && !g.Potensi.toLowerCase().includes('tidak') 
           ? "Segera menjauh dari pantai dan berlindung di dataran tinggi!"
           : "Waspadai gempa susulan. Harap berlindung di tempat yang aman."
      };
    });
    
    // Sort by DateTime descending
    parsedGempa.sort((a, b) => new Date(b.eventTime.split(' ')[0]).getTime() > new Date(a.eventTime.split(' ')[0]).getTime() ? 1 : -1);

    normalized.push(...parsedGempa);
  } catch(e) {
    console.error("Failed to parse BMKG XML", e);
  }

  // Inject simulasi data
  normalized.push(...getSimulasiData());

  cache.bencana = { data: normalized, timestamp: now };
  return normalized;
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/bencana/semua', async (req, res) => {
  try {
    const data = await getNormalizedData();
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch disaster data' });
  }
});

// Legacy route mapping for Dashboard
app.get('/api/bencana/gempa/terkini', async (req, res) => {
  try {
    const { rawTerkini } = await fetchBMKGXmls();
    res.json(rawTerkini || {});
  } catch (error) {
    console.error('Error fetching gempaterkini XML:', error);
    res.status(500).json({ error: 'Failed' });
  }
});

app.post('/api/report-condition', (req, res) => {
  const { lat, lng, timestamp } = req.body;
  // Implement actual logic here, for now we mock
  console.log(`[EMERGENCY REPORT] Received at ${timestamp} from coordinates: ${lat}, ${lng}`);
  res.json({ status: 'success', message: 'Laporan kondisi Anda telah diterima dan diteruskan ke instansi terkait.' });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
