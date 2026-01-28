export default async function handler(req, res) {
  // 1. SETUP: Load keys from environment variables
  const API_KEY = process.env.RETELL_API_KEY;
  
  // Agent IDs
  const AGENTS = {
    DEFAULT: process.env.RETELL_AGENT_ID,       // "MONEYBALL" / "AGITATOR" / "VIP"
    CRO: process.env.RETELL_AGENT_ID_CRO,       // "CRO"
    MANAGER: process.env.RETELL_AGENT_ID_MANAGER, // "LEADER"
    SDR: process.env.RETELL_AGENT_ID_SDR        // "SNIPER"
  };

  // Safety check
  if (!API_KEY || !AGENTS.DEFAULT) {
    return res.status(500).json({ error: "Missing API Keys or Default Agent ID" });
  }

  try {
    // 2. PARSE: Unpack data from frontend
    const { name, email, phone, access_code } = req.body || {};

    // 3. LOGIC: Select Agent based on Code
    // Default to the standard agent
    let selectedAgentId = AGENTS.DEFAULT;
    
    // Normalize code to uppercase for safety
    const code = access_code ? access_code.toUpperCase().trim() : "";

    switch (code) {
      case 'CRO':
        if (AGENTS.CRO) selectedAgentId = AGENTS.CRO;
        break;
      case 'LEADER':
        if (AGENTS.MANAGER) selectedAgentId = AGENTS.MANAGER;
        break;
      case 'SNIPER':
        if (AGENTS.SDR) selectedAgentId = AGENTS.SDR;
        break;
      default:
        // 'MONEYBALL', 'VIP', 'SAMI' fall through to DEFAULT
        selectedAgentId = AGENTS.DEFAULT;
        break;
    }

    console.log(`[Backend] Code: ${code} | Switching to Agent: ${selectedAgentId}`);

    // 4. CALL RETELL: Register the call
    const response = await fetch("https://api.retellai.com/v2/create-web-call", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        agent_id: selectedAgentId, 
        
        // Metadata for analytics
        metadata: {
            "user_name": name || "Anonymous",
            "user_email": email || "Not Provided",
            "user_phone": phone || "Not Provided",
            "access_code": code 
        },
        // Dynamic variables for the AI to use
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
