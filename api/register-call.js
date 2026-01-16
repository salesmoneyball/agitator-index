{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww30040\viewh16080\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 export default async function handler(req, res) \{\
  // These pull the keys from Vercel's secure settings (Step 4)\
  const AGENT_ID = process.env.RETELL_AGENT_ID; \
  const API_KEY = process.env.RETELL_API_KEY; \
\
  if (!AGENT_ID || !API_KEY) \{\
    return res.status(500).json(\{ error: "Missing API Keys in Vercel Settings" \});\
  \}\
\
  try \{\
    const response = await fetch("https://api.retellai.com/v2/create-web-call", \{\
      method: "POST",\
      headers: \{\
        "Authorization": `Bearer $\{API_KEY\}`,\
        "Content-Type": "application/json",\
      \},\
      body: JSON.stringify(\{\
        agent_id: AGENT_ID,\
      \}),\
    \});\
\
    const data = await response.json();\
    res.status(200).json(data);\
    \
  \} catch (error) \{\
    res.status(500).json(\{ error: "Failed to connect to Retell AI" \});\
  \}\
\}}
