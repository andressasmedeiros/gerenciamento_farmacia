import axios from 'axios';

const ENDPOINT = '/users';
const HOST = process.env.VUE_APP_API_HOST;

class UserService {

    getAuthHeaders() {
        const token = localStorage.getItem('token');
        return {
            Authorization: `Bearer ${token}`
        };
    }

    getUsers() {
        return axios.get(`${HOST}${ENDPOINT}`, {
            headers: this.getAuthHeaders()
        });
    }

    updateUserStatus(userId, status) {
        return axios.patch(`${HOST}${ENDPOINT}/${userId}/status`, { status }, {
            headers: this.getAuthHeaders()
        });
    }

    updateUser(id, data) {
        console.log('Enviando dados para atualizar o usuário:', data);
        return axios.put(`${HOST}${ENDPOINT}/${id}`, data, {
            headers: this.getAuthHeaders()
        }).then(response => {
            console.log('Resposta do backend:', response);
            return response;
        }).catch(error => {
            console.error('Erro ao atualizar usuário:', error);
            throw error; // Lance novamente o erro para ser tratado no frontend
        });
    }

    createUser(user) {
        // Se for FormData, NÃO setar o Content-Type manualmente
        const headers = this.getAuthHeaders() || {};

        // Se for FormData, remove o content-type caso esteja setado
        if (user instanceof FormData) {
            // Deleta o Content-Type se existir
            if (headers['Content-Type']) {
                delete headers['Content-Type'];
            }
        }

        return axios.post(`${HOST}${ENDPOINT}`, user, {
            headers: headers
        });
    }

    getUserById(id) {
        return axios.get(`${HOST}${ENDPOINT}/${id}`, {
            headers: this.getAuthHeaders()
        });
    }


}

export default new UserService();
