import express, { Request, Response } from 'express';
import cors from 'cors';
import fetch from 'node-fetch'; 
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/rota', async (req: Request, res: Response) => {
  const { origem, destino } = req.body;

  if (!origem || !destino) {
    return res.status(400).json({ error: 'Origem e destino são obrigatórios' });
  }

  try {
    const response = await fetch('https://api.openrouteservice.org/v2/directions/driving-car/geojson', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.ORS_API_KEY || '',
      },
      body: JSON.stringify({
        coordinates: [
          [parseFloat(origem.lng), parseFloat(origem.lat)],
          [parseFloat(destino.lng), parseFloat(destino.lat)],
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text });
    }

    const data = await response.json();
    return res.json(data);

  } catch (error) {
    console.error('Erro no backend ao chamar ORS:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
