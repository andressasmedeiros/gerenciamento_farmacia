import axios from 'axios';

const ENDPOINT = '/products';
const HOST = process.env.VUE_APP_API_HOST;

const ProductService = {

    getAuthHeaders() {
        const token = localStorage.getItem('token');
        return {
            Authorization: `Bearer ${token}`
        };
    },

    getProducts() {
        return axios.get(`${HOST}${ENDPOINT}`, {
            headers: this.getAuthHeaders()
        })
            .then(response => response.data)
            .catch(error => {
                console.error("Erro ao buscar produtos:", error);
                throw error;
            });
    },

    createProduct(productData) {
        return axios.post(`${HOST}${ENDPOINT}`, productData, {
            headers: this.getAuthHeaders()
        });
    },

    updateProduct(id, data) {
        console.log('Enviando dados para atualizar o produto:', data);
        return axios.put(`${HOST}${ENDPOINT}/${id}`, data, { // Certifique-se de que a URL está correta
            headers: this.getAuthHeaders()
        }).then(response => {
            console.log('Resposta do backend:', response);
            return response;
        }).catch(error => {
            console.error('Erro ao atualizar produto:', error);
            throw error;
        });
    }



};

export default ProductService;
