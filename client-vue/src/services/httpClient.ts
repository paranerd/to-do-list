import axios from 'axios';
import store from '@/store';
import router from '../router'; 

// Auth interceptor
axios.interceptors.request.use(function(config) {
    if (store.getters.currentUser && config.url?.startsWith(process.env.VUE_APP_API_URL)) {
        const token = store.getters.currentUser.token;
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
}, function (error) {
    return Promise.reject(error);
});

// Error interceptor
axios.interceptors.response.use(function (response) {
    return response;
}, function (error) {
    if (error.response.status === 401) {
        router.push('/login');
    }

    return Promise.reject(error);
});

export default class HttpClient {
    static async get(url: string) {
        const res = await axios.get(url);
        return res;
    }

    static async post(url: string, payload?: {}) {
        const res = await axios.post(url, payload);
        return res;
    }

    static async delete(url: string, payload?: {}) {
        const res = await axios.request({url, method: 'DELETE', data: payload});
        return res;
    }

    static async patch(url: string, payload?: {}) {
        const res = await axios.patch(url, payload);
        return res.data;
    }
}