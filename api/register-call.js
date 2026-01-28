// /api/register-call.js
export default async function handler(req, res) {
  // 1. FORCE CORS HEADERS (The "Nuclear" Allow-All)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allows salesmoneyball.com
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 2. HANDLE PREFLIGHT IMMEDIATELY
  // If the browser asks "Can I connect?", we say "Yes" (200 OK) and stop.
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 3. YOUR EXISTING LOGIC
  const API_KEY = process.env.RETELL_API_KEY;
  const AGENTS = {
    DEFAULT: process.env.RETELL_AGENT_ID,       
    CRO: process.env.RETELL_AGENT_ID_CRO,       
    MANAGER: process.env.RETELL_AGENT_ID_MANAGER, 
    SDR: process.env.RETELL_AGENT_ID_SDR        
  };

  if (!API_KEY) return res.status(500).json({ error: "Missing API Keys" });

  try {
    const { name, email, phone, access_code } = req.body || {};
    
    // Agent Selection Logic
    let selectedAgentId = AGENTS.DEFAULT;
    const code = access_code ? access_code.toUpperCase().trim() : "";
    
    if (code === 'CRO' && AGENTS.CRO) selectedAgentId = AGENTS.CRO;
    if (code === 'LEADER' && AGENTS.MANAGER) selectedAgentId = AGENTS.MANAGER;
    if (code === 'SNIPER' && AGENTS.SDR) selectedAgentId = AGENTS.SDR;

    // Call Retell
    const response = await fetch("https://api.retellai.com/v2/create-web-call", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        agent_id: selectedAgentId,
        metadata: { "user_name": name, "user_email": email, "user_phone": phone, "code": code },
        retell_llm_dynamic_variables: { "user_name": name || "Candidate" }
      }),
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(err);
    }

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({ error: error.message });
  }
}
