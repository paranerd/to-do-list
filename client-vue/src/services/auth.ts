import axios from 'axios';
import store from '@/store';
import User from '@/models/user';

export default class AuthService {
    currentUser: User|null;

    constructor() {
        this.currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;

        store.commit('setUser', this.currentUser);
    }

    async login(username: string, password: string) {
        try {
            const res = await axios.post(process.env.VUE_APP_API_URL + '/user/login', {username, password});
            localStorage.setItem('user', JSON.stringify(res.data));
            this.currentUser = res.data;

            store.commit('setUser', this.currentUser);
        } catch (err) {
            console.error(err);
            throw new Error(err);
        }
    }

    /**
     * Logout
     */
    logout() {
        localStorage.removeItem('user');
        this.currentUser = null;
        store.commit('setUser', null);
    }

    isLoggedIn(): boolean {
        return localStorage.getItem('user') !== null;
    }

    /**
     * Get current user
     */
    getCurrentUser(): User|null {
        return this.currentUser;
    }
}