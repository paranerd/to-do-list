<template>
    <nav class="fixed top-0 w-full h-20 p-6 flex items-center justify-between flex-wrap bg-teal-600 text-white">
        <svg class="text-teal-700 h-8 w-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
        <router-link to="/" class="ml-2 font-semibold text-xl tracking-tight">To-Do-List</router-link>

        <div class="relative ml-auto">
            <!-- Username -->
            <button v-if="state.currentUser" class="relative px-4 z-10 block focus:outline-none inline-flex items-center" @click="menuOpen = !menuOpen">
                {{state.currentUser.username}}
                &#x25BE;
            </button>

            <!-- Login button -->
            <div v-else>
                <a router-link to="/login" class="ml-auto inline-block text-sm px-4 py-2 leading-none border rounded cursor-pointer border-white hover:border-transparent hover:text-teal-600 hover:bg-white"><strong>Login</strong></a>
            </div>

            <!-- Dropdown overlay -->
            <button v-if="menuOpen" @click="menuOpen = false" tabindex="-1" class="fixed inset-0 h-full w-full cursor-default"></button>

            <!-- Dropdown menu -->
            <div v-if="menuOpen" class="absolute right-0 mt-2 w-48 py-2 bg-white rounded-lg text-gray-800 shadow-xl">
                <router-link to="/access-management" class="px-4 py-2 block hover:bg-teal-600 hover:text-white" v-if="auth.getCurrentUser().isAdmin">
                    <span @click="menuOpen = false">Access Management</span>
                </router-link>
                <a href="#" @click="menuOpen = false; logout()" class="px-4 py-2 block hover:bg-teal-600 hover:text-white">Logout</a>
            </div>
        </div>

        <!-- Offline tooltip -->
        <span class="tooltip tooltip-left" v-if="!online">
            <span class='tooltip-text'>You are offline</span>
            <svg class="fill-current text-red-500 ml-2 h-8 w-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" /></svg>
        </span>
    </nav>
</template>

<script lang="ts">
import { defineComponent, inject, reactive, ref } from 'vue';
import { useStore } from "vuex";
import AuthService from '@/services/auth';

export default defineComponent({
    name: 'Navbar',
    setup() {
        const auth: AuthService = reactive(inject('auth', new AuthService()));
        const store = useStore();
        const state = ref(store.state);
        const menuOpen = ref(false);

        return {
            auth,
            state,
            online: true,
            menuOpen
        }
    },
    /*watch: {
        $route(to, from) {
            console.log("navigated");
        }
    },*/
    methods: {
        logout() {
            this.auth.logout();
            this.$router.push({name: 'login'});
        }
    }
});
</script>