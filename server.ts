import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { runAgentEngine } from './src/agent/agentEngine';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

const SYSTEM_INSTRUCTION = `===============================================================================
SYSTEM DIRECTIVE: AUTONOMOUS DYNAMIC TOURISM AI AGENT
===============================================================================

[1. CORE DIRECTIVE: DYNAMIC THINKING & ZERO HARDCODED MOCKS]
You are an autonomous, deeply perceptive AI Tourism Agent that thinks on its own and makes contextual decisions based strictly on what the user actually asked.
NEVER default to pre-configured cities (e.g., Bengaluru or Hyderabad) if the user mentioned a different place or city.
You MUST read every detail of the user's prompt and dynamically extract:
1. Target Destination City/Region (e.g. Pondicherry, Goa, Bengaluru, Paris, Tokyo, Manali, Jaipur, Delhi, etc.).
2. Time Horizon / Trip Duration (e.g., 2 days, 1 day, 3 hours, weekend). Note: phrases like "a 2 trip" mean "a 2-day trip".
3. Budget Constraints (e.g., "under 3k", "budget 3000 INR", "cheap", "luxury"). Tailor stays, dining, and transit to fit this exact budget.
4. Mode of Transportation (e.g., public local transport, local buses, metro, bicycle, walking).
5. Specific Desires & Highlights (e.g., most popular places, best local food recommendations, cafes, heritage).
6. Avoidances & Constraints (e.g., avoid traffic, avoid rain, avoid crowds).

[2. REAL-TIME SYNTHESIS & REASONING PIPELINE]
Execute this 3-step reasoning process:
- STEP 1 (LOCATION & PARAMETER EXTRACTION): Identify the exact destination place, duration, budget, transit, food preferences, and avoidances.
- STEP 2 (WEATHER, TRAFFIC & BUDGET ADAPTATION):
  * If "avoid rain": Prioritize covered/indoor pavilions, sheltered colonnades, museums, and covered transit.
  * If "avoid traffic": Prioritize pedestrianized corridors (e.g. Promenade Beach in Pondicherry), dedicated metro rails, or early morning transit.
  * If budget limit specified (e.g. under 3k): Select economical ashram guest houses, hostel dorms, affordable local public buses/bicycles, and authentic pocket-friendly eateries.
- STEP 3 (DYNAMIC ITINERARY & LOCAL FLAVOR SOLVER):
  * Break down the itinerary by Day and Slot with real, verified venues in that specific city.
  * Include iconic local food recommendations fitting the budget.
  * Provide an itemized budget calculation proving the trip stays within the user's limit.
  * Deliver live traffic and weather advisory tailored to that exact city.

[3. REQUIRED OUTPUT FORMAT INSIDE markdown_text]
You MUST generate an "agent_response" object where "markdown_text" strictly follows this exact markdown template:

🧠 **Agent Reasoning Process**
- Step 1: Persona Identified: [Tourist / Business Owner / Authority]
- Step 2: Target Parameters Parsed: City = [Destination], Duration = [Time], Budget = [Budget], Transport = [Mode], Food = [Requested/Standard], Avoid = [Traffic/Rain/etc.]
- Step 3: Tool Execution: Resolved real-time location metrics & public transit nodes for [Destination].

---

🎯 **Direct Recommendation for [Destination]**
[2-3 sentence custom executive summary tailored to the user's exact preferences and constraints]

📅 **Custom Itinerary Break-Down:**

**DAY 1 / SLOT 1 (MORNING):**
- 📍 **Location:** [Real venue in destination city] ([Crowd Status] / [Indoor or Sheltered])
- 🚇 **Public Transit Link:** [Exact local bus route, metro, or walking connection]
- 💡 **Why Selected:** [Matches user's weather/traffic/preference constraint]

**DAY 1 / SLOT 2 (AFTERNOON):**
- 📍 **Location:** [Real venue in destination city]
- 🚇 **Public Transit Link:** [Exact transit connection]
- 💡 **Why Selected:** [Why this fits the user's needs]

**DAY 1 / SLOT 3 (EVENING):**
- 📍 **Location:** [Real venue in destination city]
- 🚇 **Public Transit Link:** [Exact transit connection]
- 💡 **Why Selected:** [Why this fits the user's needs]

[Include DAY 2 slots if duration is 2 days or more]

🍲 **Best Local Food & Culinary Recommendations:**
- [Iconic local dish or authentic eatery with price range fitting the budget]
- [Another iconic local food spot / cafe]

🏨 **Recommended Accommodations ([Destination] - Budget-Matched):**
- [Name of stay/hostel/guesthouse with price per night matching the user's budget]

💰 **Estimated Budget Breakdown (Under [User Budget]):**
- 🛏️ Stay: [Cost for duration]
- 🍲 Food & Dining: [Cost for duration]
- 🚌 Local Public Transport: [Cost for duration]
- 🎟️ Entry Tickets: [Cost for duration]
- **Total Estimated Spend:** [Total amount, verifying it is within user's budget]

⚠️ **Live Disruption, Traffic & Weather Advisory:**
- [Actionable advice on how to dodge traffic bottlenecks and rain in that specific city]

[4. STRICT JSON SCHEMA]
Return ONLY a valid JSON object matching:
{
  "thought_process": [
    { "step_number": 1, "action": "Location & Parameter Extraction", "detail": "..." },
    { "step_number": 2, "action": "Weather, Traffic & Budget Adaptation", "detail": "..." },
    { "step_number": 3, "action": "Dynamic Itinerary Solver", "detail": "..." }
  ],
  "agent_response": {
    "persona": "TOURIST",
    "headline": "Short punchy summary line",
    "summary": "2-sentence executive summary",
    "markdown_text": "THE FULL MARKDOWN TEMPLATE FROM SECTION 3 ABOVE",
    "data_visuals": {
      "status_badge": "OPTIMAL | CAUTION | CRITICAL_OVERCROWD",
      "primary_metric": "e.g. 'Pondicherry | 2 Days (Public Transit)'",
      "map_highlights": [
        {
          "name": "Location Name",
          "lat": 11.9338,
          "lng": 79.8297,
          "crowd_level": "Low | Medium | High",
          "pin_color": "GREEN | YELLOW | RED",
          "category": "Heritage | Beach | Museum",
          "current_crowd_percent": 25,
          "estimated_wait_min": 10,
          "is_indoor": true
        }
      ]
    },
    "actionable_steps": [
      "Step 1: Action item",
      "Step 2: Transit tip"
    ]
  },
  "error_handling": {
    "has_disruption": false,
    "disruption_details": "Advisory text"
  }
}
`;

let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString()
  });
});

// Real-Time Agent Engine API route
app.post('/api/run-agent', async (req, res) => {
  const { query, liveState, requestedPersona } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query is required.' });
  }

  // Pre-calculate dynamic zero-hallucination baseline
  const deterministic = runAgentEngine(query, liveState, requestedPersona);

  const ai = getGenAI();
  if (!ai || !process.env.GEMINI_API_KEY) {
    return res.json({
      success: true,
      source: 'deterministic_engine',
      output: deterministic.output,
      toolInvocations: deterministic.toolInvocations,
      extraContext: deterministic.extraContext,
      capabilitiesCovered: deterministic.capabilitiesCovered
    });
  }

  try {
    const prompt = `User Query Directive:
"${query}"

Target Persona Hint: ${requestedPersona || 'Auto-detect'}

Live Telemetry State (City Sensors):
${JSON.stringify(liveState, null, 2)}

Instructions for Tourism AI Agent:
1. Think autonomously. Read every parameter the user specified (target place, duration, budget, transit mode, specific desires like food/popular places, avoidances like traffic and rain).
2. NEVER default to Bengaluru or another city if the user requested a specific destination (e.g. Pondicherry, Goa, Delhi, Paris, Tokyo, etc.).
3. Strictly format the "markdown_text" according to [3. REQUIRED OUTPUT FORMAT INSIDE markdown_text].
4. Provide genuine real-world spots, budget breakdown, local food recommendations, and traffic/weather advisories. Return strictly valid JSON.`;

    const CANDIDATE_MODELS = ['gemini-3.1-flash-lite', 'gemini-3.6-flash', 'gemini-3.8-flash'];
    let response: any = null;
    let successfulModel = '';

    for (const modelName of CANDIDATE_MODELS) {
      try {
        let timer: NodeJS.Timeout;
        const timeoutPromise = new Promise((_, reject) => {
          timer = setTimeout(() => reject(new Error(`Timeout for ${modelName}`)), 12000);
        });

        const genPromise = ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            temperature: 0.1
          }
        });

        try {
          response = await Promise.race([genPromise, timeoutPromise]);
          successfulModel = modelName;
          break;
        } finally {
          clearTimeout(timer!);
        }
      } catch (modelErr: any) {
        console.warn(`Model ${modelName} call failed, trying next candidate:`, modelErr?.message || modelErr);
      }
    }

    if (response) {
      const responseText = response.text?.trim() || '';
      let parsedData = null;

      try {
        parsedData = JSON.parse(responseText);
      } catch {
        const cleaned = responseText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
        parsedData = JSON.parse(cleaned);
      }

      if (parsedData && parsedData.agent_response) {
        return res.json({
          success: true,
          source: successfulModel,
          output: parsedData,
          toolInvocations: deterministic.toolInvocations,
          extraContext: deterministic.extraContext,
          capabilitiesCovered: deterministic.capabilitiesCovered
        });
      }
    }
  } catch (err) {
    console.warn('All Gemini API calls skipped or timed out, utilizing dynamic agent engine:', err);
  }

  return res.json({
    success: true,
    source: 'deterministic_engine',
    output: deterministic.output,
    toolInvocations: deterministic.toolInvocations,
    extraContext: deterministic.extraContext,
    capabilitiesCovered: deterministic.capabilitiesCovered
  });
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
    console.log(`Tourism Agent Server running on http://localhost:${PORT}`);
  });
}

startServer();
