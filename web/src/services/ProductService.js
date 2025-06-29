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
    }


};

export default ProductService;
