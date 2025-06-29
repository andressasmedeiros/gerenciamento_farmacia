import axios from 'axios';

const ENDPOINT = '/branches';
const HOST = process.env.VUE_APP_API_HOST;

class BranchService {

    getAuthHeaders() {
        const token = localStorage.getItem('token');
        return {
            Authorization: `Bearer ${token}`
        };
    }

    getBranches() {
        return axios.get(`${HOST}${ENDPOINT}`, {
            headers: this.getAuthHeaders()
        });
    }

    getDestinationBranches() {
        return axios.get(`${HOST}${ENDPOINT}/destination`, {
            headers: this.getAuthHeaders()
        });
    }

    getBranchesForMap() {
        return axios.get(`${HOST}${ENDPOINT}/mapa`, {
            headers: this.getAuthHeaders()
        });
    }

    // Novo método para obter rota entre dois pontos via backend
    postRoute(origemCoords, destinoCoords) {
        return axios.post(`${HOST}${ENDPOINT}/rota`, {
            origem: { lat: origemCoords.lat, lng: origemCoords.lng },
            destino: { lat: destinoCoords.lat, lng: destinoCoords.lng }
        }, {
            headers: this.getAuthHeaders()
        });
    }
}

export default new BranchService();
