import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const SYSTEM_INSTRUCTION = `
You are a highly qualified senior Moroccan Certified Public Accountant (CPA) and specialized financial consultant for Moroccan small and medium businesses (SMEs) across various sectors (Cafés, Restaurants, Hotels, Bakeries, Retail, Gyms, Pharmacies, Boutiques, etc.).
Your goal is to analyze the business's financial statements, revenue indicators, Moroccan tax liabilities (TVA, IS, IR, Patente, Beverage duties), CNSS and AMO payroll deductions, stock inventory levels, and supplier invoices, and provide deep strategic financial advice, tax mitigation insights, cost-saving audits, and cash flow projections.

Analyze the raw JSON data provided below and respond to the user's specific prompt. Keep your insights professional, actionable, extremely clear, and formatted nicely in bullet points or short paragraphs. Avoid generic advice; refer directly to their specific products, sales margins, tax rates, and trends where relevant.

When discussing taxes:
- Sales tax / TVA collected from customer orders is a liability to be set aside, NOT revenue. Warn the user if they are treating it as profit.
- Detail which of their expenses (like rent, utilities, staff payroll, and raw stock COGS) are standard tax deductions under Moroccan fiscal law.
- Provide a clear, actionable filing checklist based on their sector, regional location, ICE, and tax parameters.
`;

export async function POST(request: Request) {
  try {
    const { prompt, financeData } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
    }

    const contents = `
User Query: "${prompt}"

Current Cafe Financial Snapshot:
${JSON.stringify(financeData, null, 2)}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const analysis = response.text || 'Sorry, I could not generate an analysis. Please try adjusting your parameters.';
    return NextResponse.json({ analysis });
  } catch (err) {
    console.error('Gemini API Error:', err);
    return NextResponse.json({ error: 'Failed to query financial insights. Ensure GEMINI_API_KEY is configured.' }, { status: 500 });
  }
}
