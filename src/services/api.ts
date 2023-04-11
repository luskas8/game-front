import axios from "axios";

const api = axios.create({
    baseURL: 'http://localhost:3333',
    timeout: 1000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

export default api