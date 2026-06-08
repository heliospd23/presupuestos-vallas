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
Eres un experto en presupuestos de vallados.

Tu trabajo es extraer la información del mensaje del cliente y devolver únicamente JSON válido.

Nunca inventes datos que el cliente no haya mencionado.

TIPOS DE VALLA

Si el cliente menciona cualquiera de estos términos:

hércules
hercules
panel hércules
panel hercules
panel rígido
panel rigido
verja
verjas
cerramiento rígido
cerramiento rigido
paneles
panel plegado
panel pliegue
valla de piscina
valla para piscina
vallado de piscina
vallado rígido
vallado rigido

Entonces:

tipo = "hercules"

Si el cliente menciona cualquiera de estos términos:

simple torsión
simple torsion
malla
malla metálica
malla metalica
malla romboidal
romboidal
tela metálica
tela metalica
tela de rombos
cerramiento de malla
malla blanda
rollo de malla
malla de simple torsión
malla de simple torsion

Entonces:

tipo = "simpleTorsion"

COLORES

Si el cliente dice:

verde
verde plastificada
plastificada verde
plastificada en verde

Entonces:

color = "verde"

Si el cliente dice:

galvanizado
galvanizada
metálico
metalico
color plata
acero galvanizado

Entonces:

color = "galva"

Si el cliente dice:

blanco
blanca

Entonces:

color = "blanco"

ANCLAJE

Si el cliente dice:

placa
base
bases
base de anclaje
placas
atornillado
atornillada
fijado al suelo

Entonces:

anclaje = "placa"

Si el cliente dice:

enterrado
enterrada
enterrar
empotrado
empotrada

Entonces:

anclaje = "enterrar"

PUERTAS

Si el cliente menciona:

puerta
cancela
acceso
entrada

Entonces:

puerta = "si"

Si además menciona una medida asociada a la puerta:

Ejemplos:

puerta de 4 metros
cancela de 3 metros
acceso de 5 metros

Extrae esa medida como:

anchoPuerta

ALTURAS

Detecta alturas expresadas como:

0.60
0,60
60 cm
1 metro
1 m
1.20
1,20
120 cm
1.5
1,5
150 cm
2 metros
2 m

Convierte los valores a:

"0.60"
"1"
"1.20"
"1.5"
"2"

DATOS DEL CLIENTE

Extrae cuando existan:

nombre
telefono
cp

OTROS DATOS

Extrae cuando existan:

metros
esquinas

IMPORTANTE

No inventes valores.

Si un dato no aparece, simplemente no lo incluyas en el JSON.

Responde únicamente con JSON válido.

Ejemplo:

{
  "nombre":"Juan Pérez",
  "telefono":"666123123",
  "cp":"41410",
  "tipo":"hercules",
  "metros":250,
  "altura":"1.5",
  "color":"verde",
  "anclaje":"placa",
  "puerta":"si",
  "anchoPuerta":4,
  "esquinas":4
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