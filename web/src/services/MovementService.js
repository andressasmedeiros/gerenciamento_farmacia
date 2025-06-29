import axios from "axios";

const HOST = process.env.VUE_APP_API_HOST;
const ENDPOINT = "/movements";

const MovementService = {
  getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
    };
  },

  createMovement(movementData) {
    const body = {
      destinationBranchId: movementData.destinationBranchId,
      productId: movementData.product.id,
      quantity: movementData.quantity,
      description: movementData.description,
    };
    return axios.post(`${HOST}${ENDPOINT}`, body, {
      headers: this.getAuthHeaders(),
    });
  },

  getMovements() {
    return axios.get(`${HOST}${ENDPOINT}/`, {
      headers: this.getAuthHeaders(),
    });
  },

  getInboundMovements() {
    return axios.get(`${HOST}${ENDPOINT}/inbound`, {
      headers: this.getAuthHeaders(),
    });
  },

  getOutboundMovements() {
    return axios.get(`${HOST}${ENDPOINT}/outbound`, {
      headers: this.getAuthHeaders(),
    });
  },

  getFinishedMovements() {
    return axios.get(`${HOST}${ENDPOINT}/finished`, {
      headers: this.getAuthHeaders(),
    });
  },

  finishMovement(id) {
    return axios.post(
      `${HOST}${ENDPOINT}/${id}/finish`,
      {},
      {
        headers: this.getAuthHeaders(),
      }
    );
  },

  startMovement(id) {
    return axios.patch(
      `${HOST}${ENDPOINT}/${id}/start`,
      {},
      {
        headers: this.getAuthHeaders(),
      }
    );
  },

  endMovement(id) {
    return axios.patch(
      `${HOST}${ENDPOINT}/${id}/end`,
      {},
      {
        headers: this.getAuthHeaders(),
      }
    );
  },
};

export default MovementService;
