import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Texte vide" }, { status: 400 });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "Tu es un expert hardware. Réponds UNIQUEMENT en JSON."
          },
          {
            role: "user",
            content: `Analyse ce PC : "${text}". 
            Barème : RTX 3070(280€), 3080(390€), 4070(490€), R5 5600(85€), i5-12400(100€), RAM 16Go(40€), SSD 256Go(25€), 512Go(40€), 1To(65€), Base(120€). 
            Total des pièces - 10% de décote. 
            Format: {"modele": "string", "prix_marche_estime": number, "est_ce_une_comparaison_trompeuse": boolean, "explication": "string"}`
          }
        ],
        temperature: 0,
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();

    // Vérification de sécurité si l'API Groq renvoie une erreur
    if (!data.choices || !data.choices[0]) {
      return NextResponse.json({ error: "Erreur API Groq" }, { status: 500 });
    }

    // Extraction et parsing propre
    const content = JSON.parse(data.choices[0].message.content);
    return NextResponse.json(content);

  } catch (error) {
    console.error("ERREUR SERVEUR:", error);
    return NextResponse.json({ error: "Erreur interne au serveur" }, { status: 500 });
  }
}