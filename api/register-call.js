export default async function handler(req, res) {
  // --- 1. CORS HEADERS (ALLOW SALESMONEYBALL) ---
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allows any domain (simplest fix)
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle the "Preflight" check from the browser
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // --- 2. EXISTING LOGIC ---
  const API_KEY = process.env.RETELL_API_KEY;
  
  const AGENTS = {
    DEFAULT: process.env.RETELL_AGENT_ID,       
    CRO: process.env.RETELL_AGENT_ID_CRO,       
    MANAGER: process.env.RETELL_AGENT_ID_MANAGER, 
    SDR: process.env.RETELL_AGENT_ID_SDR        
  };

  if (!API_KEY || !AGENTS.DEFAULT) {
    return res.status(500).json({ error: "Missing API Keys" });
  }

  try {
    const { name, email, phone, access_code } = req.body || {};

    let selectedAgentId = AGENTS.DEFAULT;
    const code = access_code ? access_code.toUpperCase().trim() : "";

    switch (code) {
      case 'CRO': if (AGENTS.CRO) selectedAgentId = AGENTS.CRO; break;
      case 'LEADER': if (AGENTS.MANAGER) selectedAgentId = AGENTS.MANAGER; break;
      case 'SNIPER': if (AGENTS.SDR) selectedAgentId = AGENTS.SDR; break;
      default: selectedAgentId = AGENTS.DEFAULT; break;
    }

    const response = await fetch("https://api.retellai.com/v2/create-web-call", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        agent_id: selectedAgentId,
        metadata: {
            "user_name": name || "Anonymous",
            "user_email": email || "Not Provided",
            "user_phone": phone || "Not Provided",
            "access_code": code 
        },
        retell_llm_dynamic_variables: {
            "user_name": name || "Candidate"
        }
      }),
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Retell API Error: ${response.status} ${errText}`);
    }

    const data = await response.json();
    res.status(200).json(data);
    
  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({ error: "Failed to connect to Retell AI" });
  }
}
