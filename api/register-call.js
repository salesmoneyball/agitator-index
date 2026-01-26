export default async function handler(req, res) {
  // 1. SETUP: Load keys from environment variables
  const DEFAULT_AGENT_ID = process.env.RETELL_AGENT_ID; 
  const CRO_AGENT_ID = process.env.RETELL_AGENT_ID_CRO; // Make sure to add this to your .env file
  const API_KEY = process.env.RETELL_API_KEY; 

  // Safety check to ensure keys exist
  if (!DEFAULT_AGENT_ID || !API_KEY) {
    return res.status(500).json({ error: "Missing API Keys" });
  }

  try {
    // 2. PARSE: Unpack the data coming from the frontend
    const { name, email, phone, access_code } = req.body || {};

    // 3. LOGIC: Determine which agent to use based on the code
    let selectedAgentId = DEFAULT_AGENT_ID;

    // If the code is 'CRO' (and the CRO agent ID exists), switch agents
    if (access_code === 'CRO' && CRO_AGENT_ID) {
        selectedAgentId = CRO_AGENT_ID;
        console.log(`Switching to CRO Agent: ${CRO_AGENT_ID}`);
    }

    // 4. CALL RETELL: Register the call with the specific agent
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
            "access_method": access_code || "Standard" 
        },
        // Dynamic variables for the AI to use in conversation
        retell_llm_dynamic_variables: {
            "user_name": name || "Candidate"
        }
      }),
    });

    if (!response.ok) {
        throw new Error(`Retell API Error: ${response.statusText}`);
    }

    const data = await response.json();
    res.status(200).json(data);
    
  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({ error: "Failed to connect to Retell AI" });
  }
}
