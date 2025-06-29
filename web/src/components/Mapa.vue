<template>
    <div id="map" style="height: 100vh;"></div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import BranchService from '@/services/BranchService';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const route = useRoute();
const router = useRouter();

const postRoute = async (map, origemCoords, destinoCoords) => {
    try {
        const response = await BranchService.postRoute(origemCoords, destinoCoords);
        console.log('Resposta da rota:', response.data);  // veja o que vem aqui

        const data = response.data;

        if (!data.features || data.features.length === 0) {
            throw new Error("Resposta inválida da API de rota");
        }

        const routeCoords = data.features[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
        L.polyline(routeCoords, { color: 'blue' }).addTo(map);
        map.fitBounds(routeCoords);

    } catch (error) {
        console.error('Erro ao obter rota:', error);
        alert('Erro ao obter rota no mapa.');
    }
};



onMounted(async () => {
    const origemLat = parseFloat(route.query.origemLat);
    const origemLng = parseFloat(route.query.origemLng);
    const destinoLat = parseFloat(route.query.destinoLat);
    const destinoLng = parseFloat(route.query.destinoLng);

    // Validação básica
    if (
        isNaN(origemLat) || isNaN(origemLng) ||
        isNaN(destinoLat) || isNaN(destinoLng)
    ) {
        alert('Coordenadas inválidas para o mapa.');
        router.back();
        return;
    }

    // Inicializa mapa
    const map = L.map('map').setView([origemLat, origemLng], 13);

    // Camada base OSM
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data © OpenStreetMap contributors',
    }).addTo(map);

    // Marcadores origem/destino
    L.marker([origemLat, origemLng]).addTo(map).bindPopup('Origem').openPopup();
    L.marker([destinoLat, destinoLng]).addTo(map).bindPopup('Destino');

    // Busca e desenha rota
    await postRoute(map, { lat: origemLat, lng: origemLng }, { lat: destinoLat, lng: destinoLng });
});
</script>
