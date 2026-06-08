export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Método no permitido" });
    }

    try {

        const { mensaje } = req.body;

        const respuesta = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: `
Extrae la información del presupuesto y responde SOLO en JSON.

Ejemplo:

{
  "tipo":"simpleTorsion",
  "metros":200,
  "altura":"1.5",
  "color":"verde",
  "puerta":"si",
  "anchoPuerta":4
}
`
                    },
                    {
                        role: "user",
                        content: mensaje
                    }
                ],
                temperature: 0
            })
        });

        const datos = await respuesta.json();

        res.status(200).json({
            respuesta: datos.choices[0].message.content
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            error: "Error IA"
        });

    }
}