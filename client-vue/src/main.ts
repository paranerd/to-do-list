import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import './assets/main.scss'
import AuthService from '@/services/auth';

const auth = new AuthService();

createApp(App)
    .provide('auth', auth)
    .use(store)
    .use(router)
    .mount('#app');
