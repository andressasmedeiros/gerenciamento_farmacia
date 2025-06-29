import axios from "axios";

export async function getCoordinatesFromAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const apiKey = "SUA_API_KEY_GOOGLE"; // Substitua aqui
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    if (data.status === "OK") {
      const location = data.results[0].geometry.location;
      return { lat: location.lat, lng: location.lng };
    }

    console.error("Geocoding error:", data.status);
    return null;
  } catch (error) {
    console.error("Erro ao buscar coordenadas:", error);
    return null;
  }
}
