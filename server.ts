import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Set up larger limit for financial JSON payload
app.use(express.json({ limit: '10mb' }));

// Set up Gemini AI Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Financial Analyzer API Endpoint using Gemini 3.5 Flash
app.post('/api/analyze', async (req, res) => {
  try {
    const { prompt, financeData } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    const systemInstruction = `
You are a highly qualified senior Moroccan Certified Public Accountant (CPA) and specialized financial consultant for Moroccan small and medium businesses (SMEs) across various sectors (Cafés, Restaurants, Hotels, Bakeries, Retail, Gyms, Pharmacies, Boutiques, etc.).
Your goal is to analyze the business's financial statements, revenue indicators, Moroccan tax liabilities (TVA, IS, IR, Patente, Beverage duties), CNSS and AMO payroll deductions, stock inventory levels, and supplier invoices, and provide deep strategic financial advice, tax mitigation insights, cost-saving audits, and cash flow projections.

Analyze the raw JSON data provided below and respond to the user's specific prompt. Keep your insights professional, actionable, extremely clear, and formatted nicely in bullet points or short paragraphs. Avoid generic advice; refer directly to their specific products, sales margins, tax rates, and trends where relevant.

When discussing taxes:
- Sales tax / TVA collected from customer orders is a liability to be set aside, NOT revenue. Warn the user if they are treating it as profit.
- Detail which of their expenses (like rent, utilities, staff payroll, and raw stock COGS) are standard tax deductions under Moroccan fiscal law.
- Provide a clear, actionable filing checklist based on their sector, regional location, ICE, and tax parameters.
`;

    const contents = `
User Query: "${prompt}"

Current Cafe Financial Snapshot:
${JSON.stringify(financeData, null, 2)}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const analysis = response.text || 'Sorry, I could not generate an analysis. Please try adjusting your parameters.';
    res.json({ analysis });
  } catch (err: any) {
    console.error('Gemini API Error:', err);
    res.status(500).json({ error: 'Failed to query financial insights. Ensure GEMINI_API_KEY is configured.' });
  }
});

async function startServer() {
  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite loaded in development mode.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // For Express v4, wildcard is '*'
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Serving production static build from:', distPath);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express server listening on http://localhost:${PORT}`);
  });
}

startServer();
export default app;
