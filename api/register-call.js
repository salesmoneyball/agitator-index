export default async function handler(req, res) {
  const AGENT_ID = process.env.RETELL_AGENT_ID; 
  const API_KEY = process.env.RETELL_API_KEY; 

  if (!AGENT_ID || !API_KEY) {
    return res.status(500).json({ error: "Missing API Keys in Vercel Settings" });
  }

  try {
    const response = await fetch("https://api.retellai.com/v2/create-web-call", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        agent_id: AGENT_ID,
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
