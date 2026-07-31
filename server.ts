import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Server-side Gemini AI Client
const getGenAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in environment secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'HRVL Disease Analytics Backend' });
});

// Epidemiological Report Generation API
app.post('/api/generate-narrative', async (req, res) => {
  try {
    const { totalCases, totalDeaths, activeOutbreaks, complianceRate, zoneStats, topDiseases } = req.body;

    const ai = getGenAIClient();

    const prompt = `
You are the Chief Epidemiologist at the Hirna Regional Veterinary Diagnostic Laboratory (HRVL) in Oromia, Ethiopia.
Generate a comprehensive, publication-ready Epidemiological Narrative Summary & Outbreak Situation Report for East Hararghe (21 woredas) and West Hararghe (15 woredas) based on current laboratory surveillance telemetry:

Current Data Highlights:
- Total Cases: ${totalCases}
- Total Deaths: ${totalDeaths}
- Active Outbreaks: ${activeOutbreaks}
- Overall Woreda Compliance Rate: ${complianceRate}%
- Zone Stats: ${JSON.stringify(zoneStats)}
- Top Diseases & CFR: ${JSON.stringify(topDiseases)}

Provide a structured, authoritative report in valid JSON format matching this schema:
{
  "title": "HRVL Regional Veterinary Surveillance & Epidemiological Report",
  "dateGenerated": "${new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}",
  "executiveSummary": "2-3 paragraphs high-level executive overview of disease dynamics across East & West Hararghe...",
  "outbreakStatusAnalysis": "Detailed epidemiological evaluation of active outbreaks (FMD, PPR, LSD, CBPP, Anthrax), transboundary movement risks, and livestock trade corridor vectors...",
  "speciesVulnerability": "Analysis of species specific morbidity (Cattle, Small Ruminants, Equines, Poultry) and mortality patterns...",
  "zonalComplianceSummary": "Evaluation of woreda reporting rates between East Hararghe and West Hararghe zones, highlighting gaps and zero-reporting performance...",
  "highRiskWoredas": ["Haramaya", "Dadar", "Chiro", "Daro Lebu", "Habro", "Babile"],
  "epidemiologicalRecommendations": [
    "Immediate ring vaccination for high risk livestock in Haramaya and Dadar border kebeles",
    "Establish movement restriction checkpoints along the Chiro-Mieso trade highway",
    "Strengthen zero-reporting compliance in remote pastoral woredas (Kumbi, Meyu Muluke)",
    "Deploy HRVL rapid response mobile lab diagnostic teams for active Anthrax / CBPP confirmation"
  ]
}

Return ONLY raw valid JSON, no markdown code block backticks if possible, or standard json string.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const narrativeText = response.text || '{}';
    let reportObj;
    try {
      reportObj = JSON.parse(narrativeText);
    } catch {
      reportObj = {
        title: 'HRVL Regional Veterinary Surveillance Report',
        dateGenerated: new Date().toLocaleDateString(),
        executiveSummary: narrativeText,
        outbreakStatusAnalysis: 'Detailed outbreak tracking active across East and West Hararghe.',
        speciesVulnerability: 'Cattle and small ruminants represent the primary vulnerable populations.',
        zonalComplianceSummary: `Surveillance compliance stands at ${complianceRate}%.`,
        highRiskWoredas: ['Haramaya', 'Dadar', 'Chiro', 'Daro Lebu'],
        epidemiologicalRecommendations: [
          'Ring vaccination around active outbreak centers',
          'Enforce movement permits along livestock market corridors',
          'Increase zero-reporting compliance monitoring'
        ]
      };
    }

    res.json({ success: true, report: reportObj });
  } catch (error: any) {
    console.error('Error generating narrative report:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate epidemiological report' });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
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
    console.log(`HRVL Dashboard Express server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
