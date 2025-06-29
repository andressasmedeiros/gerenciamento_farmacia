import axios from 'axios';

const ENDPOINT = '/login';
const HOST = process.env.VUE_APP_API_HOST;

class LoginService {

    getAuthHeaders() {
        const token = localStorage.getItem('token');
        return {
            Authorization: `Bearer ${token}`
        };
    }

    login(email, password) {
        const url = `${HOST}${ENDPOINT}`;
        return axios.post(url, { email, password })
            .then(response => {
                const token = response.data.token;
                if (token) {
                    localStorage.setItem('token', token);
                    return Promise.resolve();
                } else {
                    return Promise.reject(new Error('Token não encontrado na resposta.'));
                }
            })
            .catch(error => Promise.reject(error));
    }

    getProfile() {
        const token = localStorage.getItem('token');
        if (!token || token.split('.').length !== 3) {
            return null;
        }
    
        try {
            const [, payloadBase64] = token.split('.');
            const payloadJson = atob(payloadBase64);
            const payload = JSON.parse(payloadJson);
            return payload.profile || null;
        } catch (error) {
            console.error('Erro ao decodificar o token:', error);
            return null;
        }
    }

    tokenExists() {
        const token = localStorage.getItem("token");
        return !!token;
    }

    logout() {
        localStorage.removeItem("token");
    }

    validateToken() {
        const token = localStorage.getItem('token');
        if (!token) {
            return Promise.reject('Token não encontrado');
        }

        return axios.get(`${HOST}${ENDPOINT}/validate`, {
            headers: this.getAuthHeaders()
        })
            .then(() => Promise.resolve())
            .catch(error => Promise.reject(error));
    }

    getMenu() {
        return axios.get(`${HOST}${ENDPOINT}/menu`, {
            headers: this.getAuthHeaders()
        })
    }



}

export default new LoginService();